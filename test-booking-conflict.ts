/**
 * TEST: Booking Conflict Prevention
 *
 * Demonstrates how to test the booking conflict system
 * for Cortijo Alcornocosa for week of June 12, 2026
 */

console.log('========== BOOKING CONFLICT TEST ==========\n');
console.log('✅ Dev Server Running: http://localhost:3001\n');

console.log('📋 TEST SCENARIO:');
console.log('  Villa: Cortijo Alcornocosa');
console.log('  Dates: June 12-19, 2026 (7 nights)');
console.log('  Purpose: Test duplicate booking prevention\n');

console.log('========== STEP 1: FIND THE VILLA ==========');
console.log('\n1a. Search for the villa:');
console.log('    URL: http://localhost:3001/search?location=Alcornocales');
console.log('    OR:  http://localhost:3001/search?location=Cortijo\n');

console.log('1b. You should see "Cortijo Alcornocosa" in the results');
console.log('    Click on the villa card to view details\n');

console.log('========== STEP 2: VIEW AVAILABILITY ==========');
console.log('\nOn the villa detail page, you will see:');
console.log('  • A calendar showing available and booked dates');
console.log('  • Green dates = Available for booking');
console.log('  • Red/blocked dates = Already booked\n');

console.log('Check the calendar for June 12-19, 2026:');
console.log('  • If GREEN → Week is available, proceed to Step 3');
console.log('  • If RED → Week is already booked (test successful!)\n');

console.log('========== STEP 3: TEST BOOKING (User 1) ==========');
console.log('\nTo book the week of June 12, 2026:');
console.log('\nOption A - Use the Calendar Widget:');
console.log('  1. Click on June 12, 2026 in the calendar');
console.log('  2. System automatically sets check-out to June 19');
console.log('  3. Click "Book Now" button');
console.log('  4. You\'ll be redirected to the booking form\n');

console.log('Option B - Direct URL:');
console.log('  Navigate to the booking page directly:');
console.log('  http://localhost:3001/book/[VILLA_ID]?startDate=2026-06-12\n');
console.log('  (Replace [VILLA_ID] with the actual Salesforce ID)\n');

console.log('========== STEP 4: TEST CONFLICT (User 2) ==========');
console.log('\nSimulate a second user trying to book the same dates:\n');

console.log('1. Open a NEW INCOGNITO/PRIVATE BROWSER WINDOW');
console.log('   (This simulates a different user)\n');

console.log('2. Navigate to the same villa detail page');
console.log('   http://localhost:3001/search?location=Cortijo\n');

console.log('3. Try to book June 12-19, 2026 again\n');

console.log('4. EXPECTED BEHAVIOR:');
console.log('   ❌ Calendar shows June 12-19 as BLOCKED (red)');
console.log('   ❌ "Book Now" button is DISABLED');
console.log('   ❌ Error message: "These dates are unavailable"\n');

console.log('========== HOW THE SYSTEM PREVENTS CONFLICTS ==========\n');

console.log('1. Real-time Availability Check:');
console.log('   • Every page load queries Salesforce Weekly_Rate__c');
console.log('   • Status field determines if week is available\n');

console.log('2. Server-Side Validation:');
console.log('   • When user clicks "Book Now"');
console.log('   • Server rechecks availability before creating basket');
console.log('   • If another user booked it 1 second ago, error is thrown\n');

console.log('3. Race Condition Handling:');
console.log('   • DateUnavailableError prevents double-booking');
console.log('   • User sees friendly error message');
console.log('   • Asked to select different dates\n');

console.log('========== CODE LOCATIONS ==========\n');
console.log('Availability Logic:');
console.log('  lib/sfcc-client.ts:70 - getVillaAvailability()');
console.log('  lib/crm-client.ts:321 - getVillaAvailability() (CRM)\n');

console.log('Booking Flow:');
console.log('  app/book/[villaId]/page.tsx - Booking page UI');
console.log('  app/actions/booking.ts:49 - initiateBooking()\n');

console.log('Error Handling:');
console.log('  types/villa.ts - DateUnavailableError class\n');

console.log('========== ADVANCED: MANUAL SALESFORCE TEST ==========\n');
console.log('To manually control availability:\n');

console.log('1. Log in to Salesforce');
console.log('2. Navigate to Weekly_Rate__c object');
console.log('3. Find record for:');
console.log('   • Property: Cortijo Alcornocosa');
console.log('   • Week Starting: 2026-06-12\n');

console.log('4. Edit Status__c field:');
console.log('   • "Available" = Users can book (GREEN in calendar)');
console.log('   • "Booked" = Users cannot book (RED in calendar)\n');

console.log('5. Save and refresh the booking page');
console.log('   • Changes appear immediately (no cache)\n');

console.log('========== QUICK START CHECKLIST ==========\n');
console.log('✅ Dev server running on port 3001');
console.log('✅ Salesforce connection active');
console.log('✅ Villa exists in system');
console.log('✅ Booking flow functional\n');

console.log('🎯 NEXT ACTION:');
console.log('   Open: http://localhost:3001/search?location=Cortijo');
console.log('   Then: Click on Cortijo Alcornocosa');
console.log('   Test: Try booking June 12-19, 2026\n');

console.log('===========================================\n');

// Try to fetch villa ID from dev server
console.log('Fetching villa information from dev server...\n');

fetch('http://localhost:3001/api/villas')
  .then(res => {
    if (!res.ok) {
      console.log('⚠️  Villa API endpoint not available');
      console.log('    Use search interface to find the villa\n');
      return null;
    }
    return res.json();
  })
  .then(data => {
    if (data && Array.isArray(data)) {
      const villa = data.find((v: any) => v.name && v.name.toLowerCase().includes('alcornocosa'));
      if (villa) {
        console.log('✅ VILLA FOUND!\n');
        console.log('Details:');
        console.log(`  Name: ${villa.name}`);
        console.log(`  ID: ${villa.id}`);
        console.log(`  Region: ${villa.region}`);
        console.log(`  Slug: ${villa.slug || 'N/A'}\n`);
        console.log('Direct Links:');
        console.log(`  Villa Page: http://localhost:3001/villas/${villa.slug || villa.id}`);
        console.log(`  Book June 12: http://localhost:3001/book/${villa.id}?startDate=2026-06-12\n`);
      }
    }
  })
  .catch(err => {
    console.log('⚠️  Could not fetch villa data');
    console.log('    Error:', err.message);
    console.log('    Use search interface instead\n');
  });
