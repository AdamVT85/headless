/**
 * VINTAGE TRAVEL - VILLA PAGE INTEGRATION TESTS
 *
 * Tests the HYBRID architecture:
 * - Assert 1 (SEO): Sanity content renders immediately
 * - Assert 2 (Live Data): SFCC availability loads asynchronously
 * - Assert 3 (Race Condition): Conflict dates trigger error
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VillaPage from '@/app/villas/[slug]/page';
import BookingWidget from '@/components/BookingWidget';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Villa Page - Hybrid Data Integration', () => {
  describe('Villa Bella Vista (villa-conflict-123)', () => {
    const mockParams = Promise.resolve({ slug: 'villa-bella-vista' });

    // ===== ASSERT 1: SEO DATA (SANITY) RENDERS IMMEDIATELY =====

    it('should render villa title from Sanity immediately (SEO)', async () => {
      const { container } = render(await VillaPage({ params: mockParams }));

      // Title should be in the document immediately (server-rendered from Sanity)
      const title = screen.getByTestId('villa-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Villa Bella Vista');
    });

    it('should render villa metadata from Sanity', async () => {
      render(await VillaPage({ params: mockParams }));

      // Region should be visible
      expect(screen.getByText(/Amalfi Coast, Italy/i)).toBeInTheDocument();

      // Stats should be visible
      expect(screen.getByText('10')).toBeInTheDocument(); // maxGuests
      expect(screen.getByText('5')).toBeInTheDocument(); // bedrooms
      expect(screen.getByText('4')).toBeInTheDocument(); // bathrooms
    });

    it('should render villa description from Sanity', async () => {
      render(await VillaPage({ params: mockParams }));

      expect(
        screen.getByText(/Experience unparalleled luxury at Villa Bella Vista/i)
      ).toBeInTheDocument();
    });

    it('should render amenities from Sanity', async () => {
      render(await VillaPage({ params: mockParams }));

      expect(screen.getByText('Infinity Pool')).toBeInTheDocument();
      expect(screen.getByText('Sea Views')).toBeInTheDocument();
      expect(screen.getByText('WiFi')).toBeInTheDocument();
    });
  });

  // ===== ASSERT 2: LIVE DATA (SFCC) LOADS ASYNCHRONOUSLY =====

  describe('BookingWidget - Live SFCC Availability', () => {
    it('should show loading state initially', () => {
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      expect(screen.getByText(/Loading availability.../i)).toBeInTheDocument();
    });

    it('should display price from SFCC after loading', async () => {
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      // Wait for the price to appear (async fetch from SFCC)
      const priceDisplay = await waitFor(
        () => screen.getByTestId('price-display'),
        { timeout: 3000 }
      );

      expect(priceDisplay).toBeInTheDocument();
      expect(priceDisplay.textContent).toMatch(/£\d{1,3}(,\d{3})*/); // Matches currency format
    });

    it('should display availability data from SFCC', async () => {
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      // Wait for availability data to load
      await waitFor(
        () => {
          expect(screen.getByText(/already booked/i)).toBeInTheDocument();
          expect(screen.getByText(/Book Your Stay/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check that at least some dates are shown
      const container = screen.getByText(/already booked/i).parentElement;
      expect(container).toBeInTheDocument();
    });

    it('should render booking buttons after loading', async () => {
      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      await waitFor(
        () => {
          expect(screen.getByTestId('book-available-btn')).toBeInTheDocument();
          expect(screen.getByTestId('book-conflict-btn')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // ===== ASSERT 3: RACE CONDITION ERROR HANDLING =====

  describe('Race Condition - Conflict Date Booking', () => {
    it('should show error when attempting to book conflict dates', async () => {
      const user = userEvent.setup();

      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      // Wait for widget to load
      const conflictButton = await waitFor(
        () => screen.getByTestId('book-conflict-btn'),
        { timeout: 3000 }
      );

      // Click the conflict date button (June 1-7, 2026)
      await user.click(conflictButton);

      // Wait for the error message to appear
      const errorMessage = await waitFor(
        () => screen.getByTestId('booking-error'),
        { timeout: 3000 }
      );

      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toContain('just booked by another guest');
    });

    it('should successfully book available dates', async () => {
      const user = userEvent.setup();

      render(
        <BookingWidget sfccId="villa-conflict-123" villaTitle="Villa Bella Vista" />
      );

      // Wait for widget to load
      const availableButton = await waitFor(
        () => screen.getByTestId('book-available-btn'),
        { timeout: 3000 }
      );

      // Click the available date button (June 15-20, 2026)
      await user.click(availableButton);

      // Wait for success message
      const successMessage = await waitFor(
        () => screen.getByTestId('booking-success'),
        { timeout: 3000 }
      );

      expect(successMessage).toBeInTheDocument();
      expect(successMessage.textContent).toContain('Reservation successful');
    });
  });

  // ===== NORMAL VILLA (NO CONFLICTS) =====

  describe('Casa del Sol (villa-normal-456)', () => {
    const mockParams = Promise.resolve({ slug: 'casa-del-sol' });

    it('should render Casa del Sol title from Sanity', async () => {
      render(await VillaPage({ params: mockParams }));

      const title = screen.getByTestId('villa-title');
      expect(title).toHaveTextContent('Casa del Sol');
    });

    it('should successfully book any dates for normal villa', async () => {
      const user = userEvent.setup();

      render(
        <BookingWidget sfccId="villa-normal-456" villaTitle="Casa del Sol" />
      );

      // Wait and click available button
      const availableButton = await waitFor(
        () => screen.getByTestId('book-available-btn'),
        { timeout: 3000 }
      );

      await user.click(availableButton);

      // Should succeed
      const successMessage = await waitFor(
        () => screen.getByTestId('booking-success'),
        { timeout: 3000 }
      );

      expect(successMessage).toBeInTheDocument();
    });
  });

  // ===== EDGE CASES =====

  describe('Edge Cases', () => {
    it('should handle non-existent villa slug', async () => {
      const mockParams = Promise.resolve({ slug: 'non-existent-villa' });
      const { notFound } = require('next/navigation');

      // Call the page component (notFound() will be called internally)
      try {
        await VillaPage({ params: mockParams });
      } catch (error) {
        // notFound() throws an error in Next.js, which is expected
      }

      expect(notFound).toHaveBeenCalled();
    });

    it('should display loading skeleton before availability loads', () => {
      render(
        <BookingWidget sfccId="any-villa" villaTitle="Any Villa" />
      );

      // Should show animated loading state
      const container = screen.getByText(/Loading availability.../i).parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  // ===== METADATA GENERATION =====

  describe('SEO Metadata Generation', () => {
    it('should generate correct metadata for villa', async () => {
      const mockParams = Promise.resolve({ slug: 'villa-bella-vista' });

      // Import the generateMetadata function
      const { generateMetadata } = await import('@/app/villas/[slug]/page');

      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.title).toContain('Villa Bella Vista');
      expect(metadata.description).toBeTruthy();
      expect(metadata.openGraph?.title).toBe('Villa Bella Vista');
      expect(metadata.openGraph?.images).toBeTruthy();
    });
  });
});
