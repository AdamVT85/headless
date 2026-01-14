/**
 * VINTAGE TRAVEL - AVAILABILITY & RACE CONDITION TESTS
 *
 * Test the critical business logic:
 * - Live availability fetching (never cached)
 * - Race condition handling (409 conflict)
 * - DateUnavailableError when booking conflicts occur
 */

import {
  getVillaAvailability,
  addToBasket,
  checkVillaExists,
} from '@/lib/sfcc-client';
import {
  DateUnavailableError,
  BookingRequest,
  AvailabilityStatus,
} from '@/types/villa';

describe('SFCC Client - Villa Availability', () => {
  // ===== TEST A: NORMAL VILLA AVAILABILITY =====

  describe('Normal Villa (No Conflicts)', () => {
    const normalVillaSku = 'villa-normal-456';
    const startDate = new Date('2026-07-01');
    const endDate = new Date('2026-07-07');

    it('should fetch availability for a normal villa', async () => {
      const availability = await getVillaAvailability(
        normalVillaSku,
        startDate,
        endDate
      );

      expect(availability).toBeDefined();
      expect(availability.sku).toBe(normalVillaSku);
      expect(availability.pricePerWeek).toBeGreaterThan(0);
      expect(availability.calendar).toBeDefined();
      expect(availability.calendar.length).toBeGreaterThan(0);
      expect(availability.lastUpdated).toBeInstanceOf(Date);
    });

    it('should return available status for all dates in normal villa', async () => {
      const availability = await getVillaAvailability(
        normalVillaSku,
        startDate,
        endDate
      );

      availability.calendar.forEach(date => {
        expect(date.status).toBe('available');
        expect(date.pricePerNight).toBeGreaterThan(0);
      });
    });

    it('should successfully add normal villa to basket', async () => {
      const request: BookingRequest = {
        sku: normalVillaSku,
        startDate,
        endDate,
        guests: 4,
      };

      const response = await addToBasket(request);

      expect(response.success).toBe(true);
      expect(response.basketId).toBeDefined();
      expect(response.basketId).toMatch(/^basket-/);
      expect(response.error).toBeUndefined();
    });

    it('should generate correct calendar date range', async () => {
      const availability = await getVillaAvailability(
        normalVillaSku,
        startDate,
        endDate
      );

      const expectedDates = [
        '2026-07-01',
        '2026-07-02',
        '2026-07-03',
        '2026-07-04',
        '2026-07-05',
        '2026-07-06',
        '2026-07-07',
      ];

      const actualDates = availability.calendar.map(d => d.date);
      expect(actualDates).toEqual(expectedDates);
    });
  });

  // ===== TEST B: CONFLICT VILLA (THE RACE CONDITION) =====

  describe('Conflict Villa - Race Condition Handling', () => {
    const conflictVillaSku = 'villa-conflict-123';
    const conflictStartDate = new Date('2026-06-01');
    const conflictEndDate = new Date('2026-06-07');

    it('should fetch availability for conflict villa', async () => {
      const availability = await getVillaAvailability(
        conflictVillaSku,
        conflictStartDate,
        conflictEndDate
      );

      expect(availability).toBeDefined();
      expect(availability.sku).toBe(conflictVillaSku);
      expect(availability.calendar).toBeDefined();
    });

    it('should return BOOKED status for conflict dates (June 1-7, 2026)', async () => {
      const availability = await getVillaAvailability(
        conflictVillaSku,
        conflictStartDate,
        conflictEndDate
      );

      // All dates should be booked
      availability.calendar.forEach(date => {
        expect(date.status).toBe('booked');
        expect(date.date).toMatch(/^2026-06-(0[1-7])$/);
      });
    });

    it('should throw DateUnavailableError when trying to book conflict dates', async () => {
      const request: BookingRequest = {
        sku: conflictVillaSku,
        startDate: conflictStartDate,
        endDate: conflictEndDate,
        guests: 2,
      };

      await expect(addToBasket(request)).rejects.toThrow(DateUnavailableError);
    });

    it('should throw DateUnavailableError with correct properties', async () => {
      const request: BookingRequest = {
        sku: conflictVillaSku,
        startDate: conflictStartDate,
        endDate: conflictEndDate,
      };

      try {
        await addToBasket(request);
        fail('Expected DateUnavailableError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(DateUnavailableError);

        if (error instanceof DateUnavailableError) {
          expect(error.sku).toBe(conflictVillaSku);
          expect(error.startDate).toEqual(conflictStartDate);
          expect(error.endDate).toEqual(conflictEndDate);
          expect(error.message).toContain('Someone just booked this date');
          expect(error.name).toBe('DateUnavailableError');
        }
      }
    });

    it('should return available dates for conflict villa OUTSIDE conflict period', async () => {
      const safeStartDate = new Date('2026-06-15');
      const safeEndDate = new Date('2026-06-20');

      const availability = await getVillaAvailability(
        conflictVillaSku,
        safeStartDate,
        safeEndDate
      );

      availability.calendar.forEach(date => {
        expect(date.status).toBe('available');
        expect(date.pricePerNight).toBeGreaterThan(0);
      });
    });

    it('should successfully book conflict villa OUTSIDE conflict period', async () => {
      const request: BookingRequest = {
        sku: conflictVillaSku,
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-20'),
      };

      const response = await addToBasket(request);

      expect(response.success).toBe(true);
      expect(response.basketId).toBeDefined();
    });
  });

  // ===== ADDITIONAL EDGE CASES =====

  describe('Edge Cases & Race Condition Scenarios', () => {
    it('should handle partial overlap with conflict period', async () => {
      const conflictVillaSku = 'villa-conflict-123';
      const partialStart = new Date('2026-05-30'); // Before conflict
      const partialEnd = new Date('2026-06-03'); // Overlaps with conflict

      const availability = await getVillaAvailability(
        conflictVillaSku,
        partialStart,
        partialEnd
      );

      // Some dates should be available, some booked
      const bookedDates = availability.calendar.filter(d => d.status === 'booked');
      const availableDates = availability.calendar.filter(d => d.status === 'available');

      expect(bookedDates.length).toBeGreaterThan(0);
      expect(availableDates.length).toBeGreaterThan(0);

      // Should still throw error when trying to book (has booked dates)
      const request: BookingRequest = {
        sku: conflictVillaSku,
        startDate: partialStart,
        endDate: partialEnd,
      };

      await expect(addToBasket(request)).rejects.toThrow(DateUnavailableError);
    });

    it('should simulate network delays (real API behavior)', async () => {
      const start = Date.now();
      await getVillaAvailability('villa-test', new Date(), new Date());
      const duration = Date.now() - start;

      // Should have some delay to simulate network
      expect(duration).toBeGreaterThanOrEqual(100);
    });

    it('should return fresh data on each call (no caching)', async () => {
      const sku = 'villa-test-caching';
      const start = new Date('2026-08-01');
      const end = new Date('2026-08-07');

      const result1 = await getVillaAvailability(sku, start, end);
      const result2 = await getVillaAvailability(sku, start, end);

      // Timestamps should be different (proving no cache)
      expect(result1.lastUpdated.getTime()).not.toBe(result2.lastUpdated.getTime());
    });
  });

  // ===== VILLA EXISTENCE CHECKS =====

  describe('Villa Existence', () => {
    it('should confirm villa exists', async () => {
      const exists = await checkVillaExists('villa-any-sku');
      expect(exists).toBe(true);
    });
  });
});
