/**
 * BOOKING FLOW CLIENT COMPONENT
 * Multi-step form with state management
 * Steps: 1. Summary → 2. Guest Details → 3. Confirmation
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Check, Calendar, Users, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MockVilla } from '@/lib/mock-db';

interface BookingFlowProps {
  villa: MockVilla;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  numWeeks: number;
}

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  numberOfGuests: number;
  specialRequests: string;
}

type BookingStep = 'summary' | 'details' | 'confirmation';

export default function BookingFlow({ villa, checkInDate, checkOutDate, totalPrice, numWeeks }: BookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('summary');
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    numberOfGuests: 2,
    specialRequests: '',
  });

  // Calculate number of nights
  const nights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  // Booking data from props
  const bookingData = {
    checkIn: checkInDate,
    checkOut: checkOutDate,
    nights,
    weeks: numWeeks,
    guests: guestDetails.numberOfGuests,
  };

  // Price is now passed from server (calculated from actual weekly rates)

  const handleGuestDetailsChange = (field: keyof GuestDetails, value: string | number) => {
    setGuestDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToDetails = () => {
    setCurrentStep('details');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send data to an API
    console.log('Booking submitted:', { villa, bookingData, guestDetails });
    setCurrentStep('confirmation');
  };

  return (
    <main className="min-h-screen bg-clay">
      {/* Progress Stepper */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {/* Step 1: Summary */}
            <StepIndicator
              number={1}
              label="Summary"
              active={currentStep === 'summary'}
              completed={currentStep === 'details' || currentStep === 'confirmation'}
            />
            <div className="h-px w-16 bg-stone-300" />
            {/* Step 2: Details */}
            <StepIndicator
              number={2}
              label="Details"
              active={currentStep === 'details'}
              completed={currentStep === 'confirmation'}
            />
            <div className="h-px w-16 bg-stone-300" />
            {/* Step 3: Confirmation */}
            <StepIndicator
              number={3}
              label="Confirmation"
              active={currentStep === 'confirmation'}
              completed={false}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-6 py-12">
        {currentStep === 'summary' && (
          <SummaryStep
            villa={villa}
            bookingData={bookingData}
            totalPrice={totalPrice}
            onContinue={handleContinueToDetails}
          />
        )}

        {currentStep === 'details' && (
          <DetailsStep
            villa={villa}
            bookingData={bookingData}
            totalPrice={totalPrice}
            guestDetails={guestDetails}
            onChange={handleGuestDetailsChange}
            onSubmit={handleSubmitBooking}
            onBack={() => setCurrentStep('summary')}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationStep
            villa={villa}
            bookingData={bookingData}
            guestDetails={guestDetails}
          />
        )}
      </div>
    </main>
  );
}

/**
 * STEP INDICATOR COMPONENT
 */
function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors',
          active && 'bg-terracotta text-white',
          completed && 'bg-palm text-white',
          !active && !completed && 'bg-stone-200 text-stone-500'
        )}
      >
        {completed ? <Check className="h-6 w-6" /> : number}
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          active && 'text-olive',
          !active && 'text-stone-500'
        )}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * STEP 1: BOOKING SUMMARY
 */
function SummaryStep({
  villa,
  bookingData,
  totalPrice,
  onContinue,
}: {
  villa: MockVilla;
  bookingData: any;
  totalPrice: number;
  onContinue: () => void;
}) {
  const imageUrl = villa.heroImageUrl || '/placeholder-villa.svg';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href={`/villas/${villa.slug}`}
        className="inline-flex items-center gap-2 text-terracotta hover:text-olive transition-colors mb-6"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-semibold">Back to villa</span>
      </Link>

      <h1 className="font-serif font-light text-4xl md:text-5xl text-olive mb-8">
        Booking Summary
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Villa Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-sm border border-stone-200 overflow-hidden">
            <div className="relative aspect-[3/2]">
              <Image src={imageUrl} alt={villa.title} fill className="object-cover" />
            </div>
            <div className="p-6">
              <h2 className="font-serif text-2xl font-light text-olive mb-2">
                {villa.title}
              </h2>
              <p className="text-stone-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {villa.region}
              </p>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-sm border border-stone-200 p-6 space-y-4">
            <h3 className="font-serif text-xl font-medium text-olive">
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-stone-500 mb-1">Check-in</p>
                <p className="font-semibold text-olive flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {bookingData.checkIn.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Check-out</p>
                <p className="font-semibold text-olive flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {bookingData.checkOut.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-stone-500 mb-1">Guests</p>
              <p className="font-semibold text-olive flex items-center gap-2">
                <Users className="h-4 w-4" />
                {bookingData.guests} {bookingData.guests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-sm border border-stone-200 p-6 space-y-4 sticky top-4">
            <h3 className="font-serif text-xl font-medium text-olive">
              Price Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-stone-700">
                <span>
                  {bookingData.weeks} {bookingData.weeks === 1 ? 'week' : 'weeks'} accommodation
                </span>
                <span className="font-semibold">
                  {totalPrice > 0 ? `£${totalPrice.toLocaleString()}` : 'TBD'}
                </span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span>Service fee</span>
                <span className="font-semibold">Included</span>
              </div>
            </div>
            <div className="border-t border-stone-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-olive">Total</span>
                <span className="text-3xl font-serif font-light text-terracotta">
                  {totalPrice > 0 ? `£${totalPrice.toLocaleString()}` : 'TBD'}
                </span>
              </div>
            </div>
            <button
              onClick={onContinue}
              className="w-full bg-terracotta text-white py-4 rounded-sm font-semibold hover:bg-olive transition-colors"
            >
              Continue to Guest Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * STEP 2: GUEST DETAILS FORM
 */
function DetailsStep({
  villa,
  bookingData,
  totalPrice,
  guestDetails,
  onChange,
  onSubmit,
  onBack,
}: {
  villa: MockVilla;
  bookingData: any;
  totalPrice: number;
  guestDetails: GuestDetails;
  onChange: (field: keyof GuestDetails, value: string | number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-terracotta hover:text-olive transition-colors mb-6"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="font-semibold">Back to summary</span>
      </button>

      <h1 className="font-serif font-light text-4xl md:text-5xl text-olive mb-8">
        Guest Details
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} className="bg-white rounded-sm border border-stone-200 p-8 space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="font-serif text-xl font-medium text-olive mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    required
                    value={guestDetails.firstName}
                    onChange={(e) => onChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-stone-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    required
                    value={guestDetails.lastName}
                    onChange={(e) => onChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={guestDetails.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={guestDetails.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-serif text-xl font-medium text-olive mb-4">
                Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-stone-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    value={guestDetails.address}
                    onChange={(e) => onChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-stone-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={guestDetails.city}
                      onChange={(e) => onChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-stone-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      required
                      value={guestDetails.postalCode}
                      onChange={(e) => onChange('postalCode', e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-stone-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    id="country"
                    required
                    value={guestDetails.country}
                    onChange={(e) => onChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>
            </div>

            {/* Party Details */}
            <div>
              <h3 className="font-serif text-xl font-medium text-olive mb-4">
                Party Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="numberOfGuests" className="block text-sm font-medium text-stone-700 mb-2">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    id="numberOfGuests"
                    required
                    min="1"
                    max={villa.maxGuests || 10}
                    value={guestDetails.numberOfGuests}
                    onChange={(e) => onChange('numberOfGuests', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Maximum {villa.maxGuests || 10} guests
                  </p>
                </div>
                <div>
                  <label htmlFor="specialRequests" className="block text-sm font-medium text-stone-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    id="specialRequests"
                    rows={4}
                    value={guestDetails.specialRequests}
                    onChange={(e) => onChange('specialRequests', e.target.value)}
                    placeholder="Any special requirements or requests..."
                    className="w-full px-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-terracotta text-white py-4 rounded-sm font-semibold hover:bg-olive transition-colors"
            >
              Complete Booking
            </button>
          </form>
        </div>

        {/* Price Summary (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-sm border border-stone-200 p-6 space-y-4 sticky top-4">
            <h3 className="font-serif text-xl font-medium text-olive">
              Booking Summary
            </h3>
            <div className="text-sm text-stone-700 space-y-2">
              <p className="font-semibold">{villa.title}</p>
              <p>
                {bookingData.checkIn.toLocaleDateString()} -{' '}
                {bookingData.checkOut.toLocaleDateString()}
              </p>
              <p>{bookingData.weeks} {bookingData.weeks === 1 ? 'week' : 'weeks'}</p>
            </div>
            <div className="border-t border-stone-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-olive">Total</span>
                <span className="text-2xl font-serif font-light text-terracotta">
                  {totalPrice > 0 ? `£${totalPrice.toLocaleString()}` : 'TBD'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * STEP 3: CONFIRMATION
 */
function ConfirmationStep({
  villa,
  bookingData,
  guestDetails,
}: {
  villa: MockVilla;
  bookingData: any;
  guestDetails: GuestDetails;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white rounded-sm border border-stone-200 p-12">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-palm rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-white" />
        </div>

        <h1 className="font-serif font-light text-4xl md:text-5xl text-olive mb-4">
          Booking Confirmed!
        </h1>

        <p className="text-lg text-stone-700 mb-8">
          Your booking request has been received. We'll send a confirmation email to{' '}
          <span className="font-semibold text-olive">{guestDetails.email}</span> shortly.
        </p>

        {/* Booking Details */}
        <div className="bg-clay rounded-sm p-6 text-left mb-8">
          <h2 className="font-serif text-xl font-medium text-olive mb-4">
            Booking Details
          </h2>
          <div className="space-y-2 text-stone-700">
            <p>
              <span className="font-semibold">Villa:</span> {villa.title}
            </p>
            <p>
              <span className="font-semibold">Check-in:</span>{' '}
              {bookingData.checkIn.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p>
              <span className="font-semibold">Check-out:</span>{' '}
              {bookingData.checkOut.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p>
              <span className="font-semibold">Guests:</span> {guestDetails.numberOfGuests}
            </p>
            <p>
              <span className="font-semibold">Guest Name:</span> {guestDetails.firstName}{' '}
              {guestDetails.lastName}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-terracotta text-white px-8 py-4 rounded-sm font-semibold hover:bg-olive transition-colors"
          >
            Return to Homepage
          </Link>
          <Link
            href={`/villas/${villa.slug}`}
            className="bg-white text-olive border-2 border-olive px-8 py-4 rounded-sm font-semibold hover:bg-clay transition-colors"
          >
            View Villa Details
          </Link>
        </div>
      </div>
    </div>
  );
}
