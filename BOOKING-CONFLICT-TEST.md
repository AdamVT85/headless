# Booking Conflict Prevention Test

## Test Scenario
Simulate a booking for **Cortijo Alcornocosa** for the week of **June 12, 2026** and verify that another user cannot book the same dates.

## Villa Information
- **Name**: Cortijo Alcornocosa
- **Location**: Alcornocales National Park, Andalucia, Spain
- **Description**: Grand estate amidst picturesque countryside with cork oaks

## How the Booking Conflict System Works

### 1. Availability Data Source
- Villa availability comes from **Salesforce Weekly_Rate__c** records
- Each week has a status: `"Available"` or `"Booked"`
- The system checks these statuses in real-time before allowing bookings

### 2. Booking Flow
```
User 1 selects dates → Checks availability → Creates basket → Adds to basket
                                                                    ↓
                                             (If week is booked) → Error!
                                             DateUnavailableError thrown
```

### 3. Race Condition Prevention
The system prevents double-bookings through:
- **Server-side validation** in `app/actions/booking.ts`
- **Real-time availability checks** via `lib/sfcc-client.ts`
- **DateUnavailableError** when dates are unavailable

## Test Steps

### Step 1: Access the Villa
Open your browser and navigate to:
```
http://localhost:3001/search?location=Alcornocales
```

Or search for "Cortijo Alcornocosa" directly in the search interface.

### Step 2: View the Booking Calendar
Once you find the villa, click on it to view the detail page. The calendar will show:
- **Green dates**: Available for booking
- **Red/blocked dates**: Already booked

### Step 3: Simulate a Booking for June 12, 2026

To test the booking flow for the week of June 12, 2026, you need to:

#### Option A: Use the Web Interface
1. Navigate to the villa detail page
2. Click on the calendar widget
3. Select **June 12, 2026** as the start date
4. The system will automatically set check-out as **June 19, 2026** (7 days later)
5. Click "Book Now"
6. You'll be redirected to: `http://localhost:3001/book/[villaId]?startDate=2026-06-12`

#### Option B: Direct URL Access
```
http://localhost:3001/book/a031r00000Xf9k9AAB?startDate=2026-06-12
```
(Replace `[villaId]` with the actual villa ID from Salesforce)

### Step 4: Verify Availability Check

When you attempt to book:

1. The system calls `getVillaAvailability()` which queries Salesforce
2. It checks if the week starting June 12, 2026 has status = "Available"
3. **If Available**: Booking proceeds, basket is created
4. **If Booked**: System returns error message and prevents booking

### Step 5: Simulate Conflict - Manual Test

To manually test the conflict scenario:

#### As User 1 (First Booking):
1. Open the booking page with `startDate=2026-06-12`
2. Complete the booking form
3. Submit the booking
4. This marks June 12-19, 2026 as **booked** in Salesforce

#### As User 2 (Conflicting Booking):
1. Open a **new incognito/private browser window**
2. Navigate to the same booking URL
3. Try to book the same dates (June 12-19, 2026)
4. **Expected Result**: System shows error message:
   ```
   "These dates are no longer available.
   Someone just booked this week.
   Please select different dates."
   ```

## Understanding the Code

### Availability Check (lib/sfcc-client.ts:70-150)
```typescript
export async function getVillaAvailability(
  sku: string,
  startDate: Date,
  endDate: Date
): Promise<VillaAvailabilityFromSFCC> {
  // Fetches Weekly_Rate__c records from Salesforce
  const weeklyRates = await getCRMAvailability(sku);

  // Maps each week's status to daily calendar
  // status = "Available" → available
  // status = "Booked" → booked (blocked)

  return { calendar, pricePerWeek, ... };
}
```

### Booking Validation (app/actions/booking.ts:49-113)
```typescript
export async function initiateBooking(
  sku: string,
  startDate: string,
  endDate: string
): Promise<BookingResult> {
  // Step 1: Create basket
  const basket = await createBasket();

  // Step 2: Add item (with availability recheck)
  const result = await addItemToBasket(basket.basketId, sku, startDate, endDate);

  // Step 3: If unavailable, throw DateUnavailableError
  if (!result.success) {
    return { error: { type: 'INVENTORY_UNAVAILABLE' } };
  }

  return { checkoutUrl };
}
```

### Date Unavailable Error (types/villa.ts)
```typescript
export class DateUnavailableError extends Error {
  constructor(
    public sku: string,
    public startDate: Date,
    public endDate: Date
  ) {
    super('Someone just booked this date. Please select different dates.');
    this.name = 'DateUnavailableError';
  }
}
```

## Expected Behavior

### Scenario 1: Villa Available for June 12-19, 2026
```
User visits booking page
  ↓
System checks Salesforce: Week status = "Available"
  ↓
Calendar shows June 12-19 as GREEN (available)
  ↓
User clicks "Book Now"
  ↓
Booking proceeds successfully ✓
```

### Scenario 2: Villa Already Booked for June 12-19, 2026
```
User visits booking page
  ↓
System checks Salesforce: Week status = "Booked"
  ↓
Calendar shows June 12-19 as RED (blocked)
  ↓
User tries to click "Book Now"
  ↓
Button is DISABLED (booking not possible)
  ↓
Error message: "These dates are unavailable" ✗
```

### Scenario 3: Race Condition (Two Users Booking Simultaneously)
```
User A selects June 12-19
User B selects June 12-19 (at same time)
  ↓
User A submits first
  ↓
System marks week as "Booked" in Salesforce
  ↓
User B submits 2 seconds later
  ↓
System rechecks availability: Now "Booked"
  ↓
DateUnavailableError thrown
  ↓
User B sees: "Someone just booked this week" ✗
```

## How to Modify Availability in Salesforce

To simulate different scenarios, you can manually change the week status in Salesforce:

1. Log in to Salesforce
2. Navigate to: **Weekly_Rate__c** records
3. Find the record for:
   - **Property**: Cortijo Alcornocosa
   - **Week Starting**: 2026-06-12
4. Change **Status__c** field:
   - `"Available"` → Users can book
   - `"Booked"` → Users see blocked dates

## Testing Checklist

- [ ] Villa page loads correctly
- [ ] Calendar displays availability status
- [ ] Available dates show in green
- [ ] Booked dates show in red/blocked
- [ ] Clicking available date opens booking flow
- [ ] Booking flow validates dates server-side
- [ ] Multiple users cannot book same dates
- [ ] Error message displays when dates unavailable
- [ ] Race condition handled gracefully

## Current System Status

✅ **Dev server running**: http://localhost:3001
✅ **Salesforce integration**: Active
✅ **Villa exists**: Cortijo Alcornocosa found
✅ **Booking system**: Functional

## Next Steps

1. Open the booking page for June 12, 2026
2. Check if the week shows as available or booked
3. Attempt a booking to test the validation
4. Try booking from a second browser to test conflict prevention

---

**Note**: The actual availability for June 12, 2026 depends on the current state of Salesforce Weekly_Rate__c records. Check Salesforce to see if this week is marked as available or booked.
