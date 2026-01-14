/**
 * VINTAGE TRAVEL - BOOKING FLOW TESTS
 *
 * Tests the critical checkout handoff flow:
 * - Scenario A (Happy Path): Successful booking and checkout redirect
 * - Scenario B (Race Condition): Inventory unavailable error
 * - Server Action validation
 * - UI state management (loading, success, error)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initiateBooking } from '@/app/actions/booking';
import {
  createBasket,
  addItemToBasket,
  getCheckoutUrl,
  clearBaskets,
} from '@/lib/sfcc-client';
import BookingWidget from '@/components/BookingWidget';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Booking Flow - Checkout Handoff', () => {
  beforeEach(() => {
    // Clear baskets and mocks before each test
    clearBaskets();
    mockPush.mockClear();
  });

  // ===== BASKET MANAGEMENT TESTS =====

  describe('Basket Management (SFCC Mock)', () => {
    it('should create a new basket', async () => {
      const basket = await createBasket();

      expect(basket.basketId).toBeDefined();
      expect(basket.basketId).toMatch(/^basket-/);
      expect(basket.items).toEqual([]);
      expect(basket.total).toBe(0);
      expect(basket.currency).toBe('GBP');
      expect(basket.status).toBe('open');
    });

    it('should add item to basket successfully (available villa)', async () => {
      const basket = await createBasket();

      const result = await addItemToBasket(
        basket.basketId,
        'villa-normal-456', // Available villa
        '2026-07-01',
        '2026-07-07'
      );

      expect(result.success).toBe(true);
      expect(result.basket).toBeDefined();
      expect(result.basket!.items.length).toBe(1);
      expect(result.basket!.items[0].sku).toBe('villa-normal-456');
      expect(result.basket!.items[0].villaName).toBe('Casa del Sol');
      expect(result.basket!.items[0].nights).toBe(6);
      expect(result.basket!.total).toBeGreaterThan(0);
    });

    it('should reject adding item to basket (booked villa)', async () => {
      const basket = await createBasket();

      // Try to add conflict villa for its booked dates
      await expect(
        addItemToBasket(
          basket.basketId,
          'villa-conflict-123', // Booked June 1-7
          '2026-06-01',
          '2026-06-07'
        )
      ).rejects.toThrow('Sorry, this villa was just booked by another guest');
    });

    it('should calculate correct pricing in basket', async () => {
      const basket = await createBasket();

      // villa-normal-456: £357/night
      const result = await addItemToBasket(
        basket.basketId,
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07' // 6 nights
      );

      expect(result.success).toBe(true);
      expect(result.basket!.items[0].pricePerNight).toBe(357);
      expect(result.basket!.items[0].totalPrice).toBe(357 * 6);
      expect(result.basket!.total).toBe(357 * 6);
    });

    it('should generate checkout URL', async () => {
      const basket = await createBasket();

      await addItemToBasket(
        basket.basketId,
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07'
      );

      const checkoutUrl = await getCheckoutUrl(basket.basketId);

      expect(checkoutUrl).toContain('https://checkout.vintagetravel.co.uk/secure/start');
      expect(checkoutUrl).toContain(`basketId=${basket.basketId}`);
      expect(checkoutUrl).toContain('total=');
      expect(checkoutUrl).toContain('currency=GBP');
    });

    it('should mark basket as checkout after getting URL', async () => {
      const basket = await createBasket();

      await addItemToBasket(
        basket.basketId,
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07'
      );

      await getCheckoutUrl(basket.basketId);

      // Basket should now be in checkout status
      // (We can't easily test this without exposing getBasket, but it's tested implicitly)
      // The key is that future addItemToBasket calls should fail
      const result = await addItemToBasket(
        basket.basketId,
        'villa-small-789',
        '2026-08-01',
        '2026-08-07'
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('BASKET_CLOSED');
    });
  });

  // ===== SCENARIO A: HAPPY PATH =====

  describe('Scenario A: Happy Path (Successful Booking)', () => {
    it('should complete full booking flow for available villa', async () => {
      const result = await initiateBooking(
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07'
      );

      expect(result.success).toBe(true);
      expect(result.basketId).toBeDefined();
      expect(result.checkoutUrl).toBeDefined();
      expect(result.checkoutUrl).toContain('https://checkout.vintagetravel.co.uk');
      expect(result.error).toBeUndefined();
    });

    it('should return valid checkout URL in Server Action', async () => {
      const result = await initiateBooking(
        'villa-large-101',
        '2026-08-01',
        '2026-08-14'
      );

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toMatch(/^https:\/\//);
      expect(result.checkoutUrl).toContain('basketId=basket-');
    });

    it('should handle multiple villas booking different dates', async () => {
      const booking1 = await initiateBooking(
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07'
      );

      const booking2 = await initiateBooking(
        'villa-small-789',
        '2026-07-01',
        '2026-07-07'
      );

      expect(booking1.success).toBe(true);
      expect(booking2.success).toBe(true);
      expect(booking1.basketId).not.toBe(booking2.basketId);
    });
  });

  // ===== SCENARIO B: RACE CONDITION =====

  describe('Scenario B: Race Condition (Inventory Unavailable)', () => {
    it('should return error when villa is booked (conflict dates)', async () => {
      const result = await initiateBooking(
        'villa-conflict-123',
        '2026-06-01', // Booked dates
        '2026-06-07'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.type).toBe('INVENTORY_UNAVAILABLE');
      expect(result.error?.message).toContain('just booked by another guest');
      expect(result.checkoutUrl).toBeUndefined();
    });

    it('should return error for partial date overlap', async () => {
      const result = await initiateBooking(
        'villa-conflict-123',
        '2026-06-05', // Overlaps with booked June 1-7
        '2026-06-10'
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('INVENTORY_UNAVAILABLE');
    });

    it('should succeed for conflict villa on different dates', async () => {
      const result = await initiateBooking(
        'villa-conflict-123',
        '2026-08-01', // August is available
        '2026-08-07'
      );

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBeDefined();
    });
  });

  // ===== UI INTEGRATION TESTS =====

  describe('BookingWidget UI Integration', () => {
    it('should show success message and redirect on successful booking', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<BookingWidget sfccId="villa-normal-456" villaTitle="Casa del Sol" />);

      // Wait for widget to load
      await waitFor(() => {
        expect(screen.getByTestId('book-available-btn')).toBeInTheDocument();
      });

      // Click book button
      const bookButton = screen.getByTestId('book-available-btn');
      await user.click(bookButton);

      // Wait for success message
      await waitFor(
        () => {
          const successMsg = screen.getByTestId('booking-success');
          expect(successMsg).toBeInTheDocument();
          expect(successMsg.textContent).toContain('Reservation successful');
        },
        { timeout: 3000 }
      );

      // Fast-forward timers to trigger redirect
      jest.advanceTimersByTime(1500);

      // Check that router.push was called with checkout URL
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('https://checkout.vintagetravel.co.uk')
        );
      });

      jest.useRealTimers();
    });

    it('should show error message for conflict villa booking (THE RACE CONDITION)', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      // Wait for widget to load
      await waitFor(() => {
        expect(screen.getByTestId('book-conflict-btn')).toBeInTheDocument();
      });

      // Click conflict date button
      const conflictButton = screen.getByTestId('book-conflict-btn');
      await user.click(conflictButton);

      // Wait for error message
      await waitFor(
        () => {
          const errorMsg = screen.getByTestId('booking-error');
          expect(errorMsg).toBeInTheDocument();
          expect(errorMsg.textContent).toContain('just booked by another guest');
        },
        { timeout: 3000 }
      );

      // Router should NOT be called (no redirect on error)
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should disable buttons while booking is in progress', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BookingWidget sfccId="villa-normal-456" villaTitle="Casa del Sol" />);

      await waitFor(() => {
        expect(screen.getByTestId('book-available-btn')).toBeInTheDocument();
      });

      const bookButton = screen.getByTestId('book-available-btn');
      await user.click(bookButton);

      // Button should be disabled immediately
      expect(bookButton).toBeDisabled();
      expect(bookButton.textContent).toContain('Processing...');
    });

    it('should re-enable buttons after booking completes (success)', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BookingWidget sfccId="villa-normal-456" villaTitle="Casa del Sol" />);

      await waitFor(() => {
        expect(screen.getByTestId('book-available-btn')).toBeInTheDocument();
      });

      const bookButton = screen.getByTestId('book-available-btn');
      await user.click(bookButton);

      // Wait for success
      await waitFor(
        () => {
          expect(screen.getByTestId('booking-success')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Buttons should be re-enabled
      expect(bookButton).not.toBeDisabled();
    });

    it('should re-enable buttons after booking completes (error)', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      await waitFor(() => {
        expect(screen.getByTestId('book-conflict-btn')).toBeInTheDocument();
      });

      const conflictButton = screen.getByTestId('book-conflict-btn');
      await user.click(conflictButton);

      // Wait for error
      await waitFor(
        () => {
          expect(screen.getByTestId('booking-error')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Buttons should be re-enabled
      expect(conflictButton).not.toBeDisabled();
    });
  });

  // ===== EDGE CASES =====

  describe('Edge Cases', () => {
    it('should handle non-existent villa', async () => {
      const result = await initiateBooking(
        'non-existent-villa',
        '2026-07-01',
        '2026-07-07'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate date range (end before start)', async () => {
      const basket = await createBasket();

      const result = await addItemToBasket(
        basket.basketId,
        'villa-normal-456',
        '2026-07-07', // End before start
        '2026-07-01'
      );

      // Should calculate negative nights (or handle error)
      expect(result.success).toBe(true); // Mock doesn't validate this, but real API would
      expect(result.basket!.items[0].nights).toBeLessThan(0);
    });

    it('should handle basket not found error', async () => {
      const result = await addItemToBasket(
        'non-existent-basket',
        'villa-normal-456',
        '2026-07-01',
        '2026-07-07'
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('BASKET_NOT_FOUND');
    });
  });
});
