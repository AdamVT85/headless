/**
 * VINTAGE TRAVEL - SEARCH & FILTERING TESTS
 *
 * Tests the critical date overlap filtering logic:
 * - Scenario A: Attribute filtering (minSleeps, region)
 * - Scenario B: Date range filtering (THE CRITICAL TEST)
 * - Ensures villa-conflict-123 is excluded when dates overlap with bookings
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from '@/app/search/page';
import { searchVillas, getAvailableVillasForDates } from '@/lib/algolia-client';
import { hasDateOverlap, isVillaAvailable } from '@/lib/mock-db';

// Mock the Server Action to use the real searchVillas function
jest.mock('@/app/actions/search', () => {
  const actual = jest.requireActual('@/lib/algolia-client');
  return {
    performSearch: async (query: string, filters: any) => {
      return actual.searchVillas(query, filters);
    },
  };
});

describe('Search & Filtering', () => {
  // ===== UNIT TESTS: DATE OVERLAP LOGIC =====

  describe('Date Overlap Logic (Core Function)', () => {
    it('should detect overlap when requested range contains booked dates', () => {
      const bookedDates = ['2026-06-01', '2026-06-02', '2026-06-03'];
      const requestStart = '2026-06-01';
      const requestEnd = '2026-06-05';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(true);
    });

    it('should detect overlap when requested range partially overlaps', () => {
      const bookedDates = ['2026-06-05', '2026-06-06', '2026-06-07'];
      const requestStart = '2026-06-03';
      const requestEnd = '2026-06-06'; // Overlaps with June 5-6

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(true);
    });

    it('should NOT detect overlap when ranges do not touch', () => {
      const bookedDates = ['2026-06-01', '2026-06-02', '2026-06-03'];
      const requestStart = '2026-06-10';
      const requestEnd = '2026-06-15';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(false);
    });

    it('should handle empty booked dates (all dates available)', () => {
      const bookedDates: string[] = [];
      const requestStart = '2026-06-01';
      const requestEnd = '2026-06-10';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(false);
    });

    it('should handle exact date match', () => {
      const bookedDates = ['2026-06-05'];
      const requestStart = '2026-06-05';
      const requestEnd = '2026-06-05';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(true);
    });

    it('should handle edge case: requested range ends on booked date', () => {
      const bookedDates = ['2026-06-07'];
      const requestStart = '2026-06-01';
      const requestEnd = '2026-06-07';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(true);
    });

    it('should handle edge case: requested range starts on booked date', () => {
      const bookedDates = ['2026-06-01'];
      const requestStart = '2026-06-01';
      const requestEnd = '2026-06-07';

      expect(hasDateOverlap(bookedDates, requestStart, requestEnd)).toBe(true);
    });
  });

  // ===== SCENARIO A: ATTRIBUTE FILTERING =====

  describe('Scenario A: Attribute Filtering', () => {
    it('should filter villas by minSleeps (exclude small villas)', async () => {
      const response = await searchVillas('', { minSleeps: 10 });

      // Should only include villas with maxGuests >= 10
      response.results.forEach((result) => {
        expect(result.villa.maxGuests).toBeGreaterThanOrEqual(10);
      });

      // Check specific villas
      const villaIds = response.results.map((r) => r.villa.sfccId);

      // Should include: villa-conflict-123 (10 guests), villa-large-101 (16 guests)
      expect(villaIds).toContain('villa-conflict-123');
      expect(villaIds).toContain('villa-large-101');

      // Should NOT include: villa-normal-456 (6 guests), villa-small-789 (4 guests)
      expect(villaIds).not.toContain('villa-normal-456');
      expect(villaIds).not.toContain('villa-small-789');
    });

    it('should filter villas by region', async () => {
      const response = await searchVillas('', { region: 'Italy' });

      // All results should be in Italy
      response.results.forEach((result) => {
        expect(result.villa.region).toContain('Italy');
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // Should include Italian villas
      expect(villaIds).toContain('villa-conflict-123'); // Amalfi Coast, Italy
      expect(villaIds).toContain('villa-partial-202'); // Amalfi Coast, Italy

      // Should NOT include non-Italian villas
      expect(villaIds).not.toContain('villa-normal-456'); // Spain
      expect(villaIds).not.toContain('villa-small-789'); // France
    });

    it('should combine multiple attribute filters', async () => {
      const response = await searchVillas('', {
        minSleeps: 8,
        region: 'Italy',
      });

      response.results.forEach((result) => {
        expect(result.villa.maxGuests).toBeGreaterThanOrEqual(8);
        expect(result.villa.region).toContain('Italy');
      });
    });
  });

  // ===== SCENARIO B: DATE RANGE FILTERING (THE CRITICAL TEST) =====

  describe('Scenario B: Date Range Filtering (CRITICAL)', () => {
    it('should exclude villa-conflict-123 when searching for June 1-7 2026 (booked dates)', async () => {
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-06-01',
          end: '2026-06-07',
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // CRITICAL: villa-conflict-123 is booked June 1-7, should NOT appear
      expect(villaIds).not.toContain('villa-conflict-123');

      // Other villas without conflicts should still appear
      expect(villaIds).toContain('villa-normal-456'); // No bookings
      expect(villaIds).toContain('villa-small-789'); // No bookings
      expect(villaIds).toContain('villa-large-101'); // No bookings

      // villa-partial-202 is booked June 10-16, should appear (no overlap)
      expect(villaIds).toContain('villa-partial-202');
    });

    it('should INCLUDE villa-conflict-123 when searching for August (no conflicts)', async () => {
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-08-01',
          end: '2026-08-07',
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // August is clear, villa-conflict-123 should appear
      expect(villaIds).toContain('villa-conflict-123');

      // All other villas should also appear
      expect(villaIds).toContain('villa-normal-456');
      expect(villaIds).toContain('villa-small-789');
      expect(villaIds).toContain('villa-large-101');
      expect(villaIds).toContain('villa-partial-202');
    });

    it('should exclude villa-partial-202 when searching for June 10-16 2026', async () => {
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-06-10',
          end: '2026-06-16',
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // villa-partial-202 is booked June 10-16, should NOT appear
      expect(villaIds).not.toContain('villa-partial-202');

      // villa-conflict-123 is only booked June 1-7, should appear (no overlap)
      expect(villaIds).toContain('villa-conflict-123');

      // Other villas should appear
      expect(villaIds).toContain('villa-normal-456');
      expect(villaIds).toContain('villa-small-789');
      expect(villaIds).toContain('villa-large-101');
    });

    it('should handle partial overlap (exclude villas with ANY date conflict)', async () => {
      // Request June 5-9 (overlaps with conflict villa's June 1-7 booking)
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-06-05',
          end: '2026-06-09',
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // Even partial overlap should exclude the villa
      expect(villaIds).not.toContain('villa-conflict-123');
    });

    it('should handle edge case: search range matches booking exactly', async () => {
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-06-01',
          end: '2026-06-07',
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      expect(villaIds).not.toContain('villa-conflict-123');
    });

    it('should handle single-day search overlapping with booking', async () => {
      const response = await searchVillas('', {
        dateRange: {
          start: '2026-06-03',
          end: '2026-06-03', // Single day in the middle of booking
        },
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      expect(villaIds).not.toContain('villa-conflict-123');
    });

    it('should use convenience function getAvailableVillasForDates', async () => {
      const villas = await getAvailableVillasForDates('2026-06-01', '2026-06-07');
      const villaIds = villas.map((v) => v.sfccId);

      expect(villaIds).not.toContain('villa-conflict-123');
      expect(villaIds).toContain('villa-normal-456');
    });
  });

  // ===== COMBINED FILTERS =====

  describe('Combined Filters (Attributes + Dates)', () => {
    it('should apply both attribute and date filters together', async () => {
      const response = await searchVillas('', {
        minSleeps: 8,
        dateRange: {
          start: '2026-06-01',
          end: '2026-06-07',
        },
      });

      response.results.forEach((result) => {
        // Must have 8+ guests
        expect(result.villa.maxGuests).toBeGreaterThanOrEqual(8);
      });

      const villaIds = response.results.map((r) => r.villa.sfccId);

      // villa-conflict-123 has 10 guests BUT is booked, should NOT appear
      expect(villaIds).not.toContain('villa-conflict-123');

      // villa-large-101 has 16 guests and is available, should appear
      expect(villaIds).toContain('villa-large-101');

      // villa-partial-202 has 8 guests and is available (booked different dates)
      expect(villaIds).toContain('villa-partial-202');
    });
  });

  // ===== SEARCH PAGE INTEGRATION TESTS =====

  describe('SearchPage Component Integration', () => {
    it('should render search page with filters', async () => {
      render(<SearchPage />);

      // Wait for initial search to complete
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Check that filter controls are present
      expect(screen.getByTestId('min-sleeps-select')).toBeInTheDocument();
      expect(screen.getByTestId('region-select')).toBeInTheDocument();
      expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
    });

    it('should filter by minSleeps when user changes dropdown', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for initial results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Change minSleeps to 10+
      const sleepsSelect = screen.getByTestId('min-sleeps-select');
      await user.selectOptions(sleepsSelect, '10');

      // Wait for filtered results
      await waitFor(() => {
        const results = screen.getByTestId('search-results');
        expect(results).toBeInTheDocument();

        // Should show villa-conflict-123 (10 guests) and villa-large-101 (16 guests)
        expect(screen.getByTestId('villa-card-villa-conflict-123')).toBeInTheDocument();
        expect(screen.getByTestId('villa-card-villa-large-101')).toBeInTheDocument();

        // Should NOT show smaller villas
        expect(screen.queryByTestId('villa-card-villa-small-789')).not.toBeInTheDocument();
      });
    });

    it('should filter by date range and exclude booked villas (CRITICAL TEST)', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      // Wait for initial results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Set date range to June 1-7 2026 (conflict dates)
      const startDateInput = screen.getByTestId('start-date-input');
      const endDateInput = screen.getByTestId('end-date-input');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2026-06-01');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2026-06-07');

      // Wait for filtered results
      await waitFor(
        () => {
          // villa-conflict-123 should NOT appear (it's booked these dates)
          expect(screen.queryByTestId('villa-card-villa-conflict-123')).not.toBeInTheDocument();

          // Other villas should still appear
          expect(screen.getByTestId('villa-card-villa-normal-456')).toBeInTheDocument();
          expect(screen.getByTestId('villa-card-villa-small-789')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should show conflict villa when dates are changed to August', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Set dates to August (no conflicts)
      const startDateInput = screen.getByTestId('start-date-input');
      const endDateInput = screen.getByTestId('end-date-input');

      await user.clear(startDateInput);
      await user.type(startDateInput, '2026-08-01');
      await user.clear(endDateInput);
      await user.type(endDateInput, '2026-08-07');

      // Wait for filtered results
      await waitFor(
        () => {
          // Now villa-conflict-123 SHOULD appear (no conflict in August)
          expect(screen.getByTestId('villa-card-villa-conflict-123')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should clear all filters when clear button is clicked', async () => {
      const user = userEvent.setup();
      render(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });

      // Set some filters
      const sleepsSelect = screen.getByTestId('min-sleeps-select');
      await user.selectOptions(sleepsSelect, '10');

      // Click clear filters
      const clearButton = screen.getByTestId('clear-filters-btn');
      await user.click(clearButton);

      // Wait for filters to reset
      await waitFor(() => {
        expect((sleepsSelect as HTMLSelectElement).value).toBe('');
      });
    });

    it('should display results count', async () => {
      render(<SearchPage />);

      await waitFor(() => {
        const resultsCount = screen.getByTestId('results-count');
        expect(resultsCount).toBeInTheDocument();
        expect(resultsCount.textContent).toMatch(/\d+ villas? found/);
      });
    });
  });

  // ===== VILLA AVAILABILITY HELPER =====

  describe('Villa Availability Helper', () => {
    it('should correctly identify available villas', () => {
      const villa = {
        bookedDates: ['2026-06-01', '2026-06-02', '2026-06-03'],
      } as any;

      expect(isVillaAvailable(villa, '2026-06-01', '2026-06-03')).toBe(false);
      expect(isVillaAvailable(villa, '2026-06-10', '2026-06-15')).toBe(true);
      expect(isVillaAvailable(villa, '2026-05-30', '2026-06-02')).toBe(false);
    });
  });
});
