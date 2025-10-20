# Early Checkout - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Quick Reference Guide for Staff](#quick-reference-guide-for-staff)
3. [Technical Implementation](#technical-implementation)
4. [API Documentation](#api-documentation)
5. [Testing Scenarios](#testing-scenarios)
6. [Troubleshooting](#troubleshooting)

---

# Overview

## What is Early Checkout?
When a guest wants to leave before their originally booked checkout date, the system automatically adjusts the bill to charge only for the days they actually stayed.

## Problem Statement
- Guest books a room for 5 days (e.g., Jan 1 - Jan 6)
- Guest checks in on Jan 1
- Initial bill is calculated for full 5 days
- Guest decides to checkout early on Jan 3 (only 2 days stayed)
- **Challenge**: Bill should only charge for 2 days, not 5 days

## Key Features
✅ **No database schema changes** - Uses existing tables  
✅ **Real-time recalculation** - Bill is recalculated during checkout process  
✅ **Actual stay calculation** - Uses check-in timestamp to current timestamp  
✅ **Service charges preserved** - Only room charges are adjusted; services remain as-is  
✅ **Minimum 1 day charge** - Even same-day checkouts are charged for at least 1 day  
✅ **Payment validation** - Prevents checkout until bill is fully paid  
✅ **Automatic refund detection** - Alerts staff when guest overpaid  

---

# Quick Reference Guide for Staff

## Step-by-Step Process

### Step 1: Guest Requests Early Checkout
Guest informs staff they want to checkout early (e.g., booked for 5 days but leaving after 2 days).

### Step 2: Navigate to Booking Operations
1. Login as staff member
2. Go to **Booking Operations** page
3. Find the guest's booking (use search if needed)
4. Booking should have status: **checked-in** (green badge)

### Step 3: Click Check Out Button
1. Locate the guest's row in the table
2. In the "Actions" column, click the **blue "Check Out" button**
3. Button is always enabled for checked-in guests (even if bill unpaid)

### Step 4: System Recalculates Bill
**Automatically happens in backend:**
- Calculates actual days stayed (check-in date to current date)
- Multiplies actual days × daily room rate
- Adds service charges (spa, room service, etc.)
- Updates bill with new total
- Checks if existing payments cover the new total

### Step 5: Two Possible Outcomes

#### ✅ Scenario A: Bill Already Paid (or Overpaid)
- Checkout succeeds immediately
- Success notification shows:
  - Originally booked days vs actually stayed days
  - Adjusted bill amount
  - **Refund alert** if guest overpaid
- Booking status changes to: **checked-out**
- Room becomes available automatically

#### ❌ Scenario B: Bill Not Fully Paid
- Checkout is blocked
- Error popup displays:
  - Total amount due
  - Amount already paid
  - Remaining amount to collect
  - **"Make the Payment"** button (navigates to billing)
  - **"Cancel"** button (dismisses popup)
- Booking remains: **checked-in**

### Step 6: If Bill Unpaid - Collect Payment
1. Click **"Make the Payment"** button in the error popup
2. System navigates to **Billing Management** page
3. Find the guest's bill (or it may auto-filter)
4. Click "Process Payment"
5. Enter payment details:
   - Amount: (remaining amount or more)
   - Payment method: Cash/Card/Online
6. Click "Process Payment" to save

### Step 7: Return to Booking Operations
1. Navigate back to **Booking Operations**
2. Find the same guest booking
3. Click **Check Out** button again
4. ✅ Checkout should now succeed!

---

## Real-World Examples

### Example 1: Same-Day Early Checkout
**Scenario:**
- Guest books room for 3 days (Jan 1-4) at 10,000 LKR/day
- Checks in Jan 1 at 10:00 AM
- Wants to checkout Jan 1 at 8:00 PM (same day)

**Calculation:**
```
Original Bill: 3 days × 10,000 = 30,000 LKR
Actual Bill:   1 day  × 10,000 = 10,000 LKR (minimum)
Guest Paid:                      10,000 LKR
```

**Result:**
- System charges minimum 1 day (10,000 LKR)
- Checkout succeeds
- Potential refund: 20,000 LKR (2 unused days)

### Example 2: Mid-Stay Early Checkout with Refund
**Scenario:**
- Guest books room for 7 days (Jan 1-8) at 15,000 LKR/day
- Checks in Jan 1
- Paid full amount upfront: 105,000 LKR
- Wants to checkout Jan 4 (3 days stayed, 4 days unused)

**Calculation:**
```
Original Bill:     7 days × 15,000 = 105,000 LKR
Guest Paid:                         105,000 LKR
Recalculated Bill: 3 days × 15,000 =  45,000 LKR
Overpaid Amount:                     60,000 LKR
```

**Result:**
- Checkout succeeds (already paid enough)
- Toast shows: "⚠️ REFUND DUE: LKR 60,000 - Please process refund to guest"
- Staff must process refund separately

### Example 3: Early Checkout Still Requires Payment
**Scenario:**
- Guest books room for 5 days (Jan 1-6) at 10,000 LKR/day
- Checks in Jan 1
- Guest paid: 15,000 LKR (partial payment)
- Wants to checkout Jan 3 (2 days stayed)

**Calculation:**
```
Original Bill:     5 days × 10,000 = 50,000 LKR
Already Paid:                        15,000 LKR
Recalculated Bill: 2 days × 10,000 = 20,000 LKR
Still Owes:                           5,000 LKR
```

**Result:**
- Checkout blocked
- Error popup shows: "Remaining: LKR 5,000"
- Staff collects 5,000 LKR
- Retry checkout → Success

### Example 4: Early Checkout with Services
**Scenario:**
- Guest books room for 4 days at 12,000 LKR/day = 48,000 LKR
- Checks in Jan 1
- Uses spa (2,000 LKR) and room service (1,500 LKR) = 3,500 LKR
- Wants to checkout Jan 2 (1 day stayed)
- Guest paid: 0 LKR

**Calculation:**
```
Room Charges:  1 day × 12,000 = 12,000 LKR
Service Usage: (actual usage) =  3,500 LKR
                              ────────────
Total Bill:                    15,500 LKR
Payment:                            0 LKR
                              ────────────
Remaining:                     15,500 LKR
```

**Result:**
- Checkout blocked (unpaid)
- Staff collects 15,500 LKR
- Checkout succeeds
- **Note:** Service charges are NOT prorated - guest pays for actual usage

---

## Important Notes

### ✅ What Happens Automatically
- ✅ Bill recalculates based on actual days stayed
- ✅ Room charges adjusted (days × rate)
- ✅ Service charges remain unchanged (actual usage)
- ✅ Payment validation against new total
- ✅ Room status changes to "available" on successful checkout
- ✅ Refund detection and alert when overpaid
- ✅ Booking status updates to "checked-out"

### ⚠️ What Staff Must Do Manually
- ⚠️ Collect remaining payment if bill unpaid
- ⚠️ Process refund if guest overpaid
- ⚠️ Update payment records in system
- ⚠️ Retry checkout after payment collected
- ⚠️ Handle refund through payment gateway/cash

### 📋 Minimum Charges
- **Minimum stay:** 1 day (even if checkout same day)
- **Check-in time:** Recorded when guest checks in
- **Check-out time:** Current timestamp when staff clicks checkout
- **Day calculation:** CEIL((checkout time - checkin time) / 24 hours)

### 💰 Payment Rules
- Bill must be **fully paid** before checkout
- Partial payments not sufficient
- Overpayments allowed (refund process separate)
- Payment validation happens in backend (cannot be bypassed)

### 🔄 Refund Process
If guest overpaid:
1. Checkout succeeds (payment sufficient)
2. Success toast shows refund amount prominently
3. Calculate refund amount: `totalPaid - finalBill`
4. Process refund through payment system
5. Document refund in payment records

---

# Technical Implementation

## System Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EARLY CHECKOUT FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. Guest Request Checkout
         │
         ▼
2. System Retrieves Booking Details
   ├─ CheckInDate (from booking table)
   ├─ CheckOutDate (originally booked)
   └─ Current timestamp (actual checkout time)
         │
         ▼
3. Calculate Actual Days Stayed
   ├─ actualDaysStayed = CEIL((NOW - CheckInDate) / 24 hours)
   ├─ bookedDays = DATEDIFF(CheckOutDate, CheckInDate)
   └─ isEarlyCheckout = actualDaysStayed < bookedDays
         │
         ▼
4. Recalculate Room Charges
   ├─ Query all rooms assigned to booking
   ├─ For each room: DailyRate × actualDaysStayed
   └─ actualRoomCharges = SUM(all room charges)
         │
         ▼
5. Get Service Charges (No Change)
   └─ Query actual service usage from serviceUsage table
         │
         ▼
6. Update Bill
   ├─ RoomCharges = actualRoomCharges
   ├─ ServiceCharges = (unchanged)
   ├─ Apply existing Discount and Tax
   └─ TotalAmount = RoomCharges + ServiceCharges - Discount + Tax
         │
         ▼
7. Verify Payment Status
   ├─ Calculate total paid from payment table
   └─ If totalPaid < TotalAmount → Block checkout (show remaining)
         │
         ▼
8. Calculate Refund (if overpaid)
   ├─ refundAmount = totalPaid - finalTotalAmount
   └─ If refundAmount > 0 → Alert staff to process refund
         │
         ▼
9. Complete Checkout
   └─ Update BookingStatus to 'checked-out'
```

## Backend Implementation (staffController.js)

### Checkout Process Steps:

#### 1. Retrieve Booking
```javascript
const booking = await findOne(QUERIES.BOOKING_WITH_GUEST, [bookingId, branchId]);
```

#### 2. Calculate Actual Days
```javascript
const actualCheckInDate = new Date(booking.CheckInDate);
const actualCheckOutDate = new Date(); // NOW
const actualDaysStayed = Math.max(1, Math.ceil((actualCheckOutDate - actualCheckInDate) / (1000 * 60 * 60 * 24)));
const bookedDays = calculateDays(booking.CheckInDate, booking.CheckOutDate);
const isEarlyCheckout = actualDaysStayed < bookedDays;
```

#### 3. Recalculate Room Charges
```sql
SELECT rt.DailyRate
FROM bookingRooms br
JOIN room r ON br.RoomID = r.RoomID
JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
WHERE br.BookingID = ?
```
   
```javascript
actualRoomCharges = rooms.reduce((sum, room) => 
  sum + (parseFloat(room.DailyRate) * actualDaysStayed), 0);
```

#### 4. Get Service Charges
```sql
SELECT COALESCE(SUM(Quantity * PriceAtUsage), 0) as totalServiceCharges
FROM serviceUsage
WHERE BookingID = ?
```

#### 5. Update or Create Bill
```sql
-- If bill exists:
UPDATE bill 
SET RoomCharges = ?, 
    ServiceCharges = ?, 
    TotalAmount = ?,
    BillStatus = 'pending'
WHERE BookingID = ?

-- If bill doesn't exist:
INSERT INTO bill (BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount, BillStatus)
VALUES (?, ?, ?, ?, ?, ?, 'pending')
```

#### 6. Payment Verification
```sql
SELECT COALESCE(SUM(Amount), 0) as TotalPaid
FROM payment
WHERE BillID = (SELECT BillID FROM bill WHERE BookingID = ?)
AND PaymentStatus = 'completed'
```

```javascript
if (totalPaid < finalTotalAmount) {
  return res.status(400).json({
    success: false,
    message: `Cannot check-out: Bill not fully paid. Remaining amount: LKR ${remaining.toFixed(2)}`,
    data: {
      isEarlyCheckout,
      bookedDays,
      actualDaysStayed,
      totalAmount: finalTotalAmount.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      remainingAmount: remaining.toFixed(2)
    }
  });
}
```

#### 7. Calculate Refund
```javascript
const refundAmount = totalPaid > finalTotalAmount ? totalPaid - finalTotalAmount : 0;
```

#### 8. Complete Checkout
```javascript
await updateRecord('UPDATE booking SET BookingStatus = ? WHERE BookingID = ?', 
  ['checked-out', bookingId]);

res.json({
  success: true,
  message: isEarlyCheckout 
    ? `Early checkout processed successfully. Bill adjusted for ${actualDaysStayed} days (originally booked for ${bookedDays} days)` 
    : 'Booking checked-out successfully',
  data: {
    bookingId,
    guestName: booking.GuestName,
    status: 'checked-out',
    isEarlyCheckout,
    bookedDays,
    actualDaysStayed,
    actualRoomCharges: actualRoomCharges.toFixed(2),
    serviceCharges: serviceCharges.toFixed(2),
    finalTotalAmount: finalTotalAmount.toFixed(2),
    totalPaid: totalPaid.toFixed(2),
    refundAmount: refundAmount > 0 ? refundAmount.toFixed(2) : null
  }
});
```

## Frontend Implementation (BookingOperations.jsx)

### Key Features:

#### 1. Always Enable Check Out Button
```javascript
// Check Out Button - enabled for ALL checked-in bookings (early checkout allowed)
<button
  onClick={() => handleCheckOut(booking.BookingID, booking.GuestName)}
  disabled={!isCheckedIn || isProcessing}
  className={`px-3 py-2 rounded-lg text-sm flex items-center space-x-1 ${
    isCheckedIn && !isProcessing
      ? 'bg-blue-500 text-white hover:bg-blue-600'
      : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
  }`}
>
  {isProcessing && isCheckedIn ? (
    <Loader className="h-4 w-4 animate-spin" />
  ) : (
    <LogOut className="h-4 w-4" />
  )}
  <span>Check Out</span>
</button>
```

#### 2. Handle Checkout with Refund Detection
```javascript
const handleCheckOut = async (bookingId, guestName) => {
  try {
    setProcessingId(bookingId);
    const response = await staffAPI.checkOutBooking(bookingId);
    const data = response.data?.data;
    
    if (data?.isEarlyCheckout) {
      const refundAmount = data.refundAmount ? parseFloat(data.refundAmount) : 0;
      
      if (refundAmount > 0) {
        // Guest overpaid - show refund alert
        toast.success(
          `Early Checkout Completed!\n\n` +
          `Guest: ${guestName}\n` +
          `Originally booked: ${data.bookedDays} days\n` +
          `Actually stayed: ${data.actualDaysStayed} days\n` +
          `Adjusted bill: LKR ${data.finalTotalAmount}\n\n` +
          `⚠️ REFUND DUE: LKR ${refundAmount.toFixed(2)}\n` +
          `Please process refund to guest.`,
          { duration: 8000 }
        );
      } else {
        // Normal early checkout
        toast.success(
          `Early Checkout Completed!\n\n` +
          `Guest: ${guestName}\n` +
          `Originally booked: ${data.bookedDays} days\n` +
          `Actually stayed: ${data.actualDaysStayed} days\n` +
          `Final bill: LKR ${data.finalTotalAmount}`,
          { duration: 6000 }
        );
      }
    } else {
      toast.success(`${guestName} checked out successfully`);
    }
    
    await fetchBookings();
  } catch (error) {
    // Handle payment error with custom popup
    const errorData = error.response?.data?.data;
    
    if (errorData?.remainingAmount) {
      // Create backdrop blur
      const backdrop = document.createElement('div');
      backdrop.id = 'checkout-error-backdrop';
      backdrop.className = 'fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40';
      document.body.appendChild(backdrop);
      
      // Show custom error toast with navigation buttons
      toast.custom(
        (t) => (
          <div className="bg-white shadow-2xl rounded-lg p-5 w-full max-w-md border border-gray-300">
            <div className="flex flex-col space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base text-gray-900">
                    Checkout Failed - Payment Required
                  </div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="text-gray-700">Cannot check-out: Bill not fully paid.</div>
                <div className="font-semibold text-red-700">
                  Remaining amount: LKR {errorData.remainingAmount}
                </div>
              </div>
              <div className="text-sm bg-gray-50 p-3 rounded space-y-1 border border-gray-200">
                <div className="font-medium text-gray-700">Bill Details:</div>
                <div className="text-gray-600">Total Amount: LKR {errorData.totalAmount}</div>
                <div className="text-gray-600">Already Paid: LKR {errorData.totalPaid}</div>
                <div className="font-semibold text-gray-900">
                  Remaining: LKR {errorData.remainingAmount}
                </div>
                {errorData.isEarlyCheckout && (
                  <div className="text-orange-600 italic mt-1">
                    Early checkout: {errorData.actualDaysStayed} of {errorData.bookedDays} days
                  </div>
                )}
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => {
                    const backdropEl = document.getElementById('checkout-error-backdrop');
                    if (backdropEl) backdropEl.remove();
                    toast.dismiss(t.id);
                    window.location.href = '/staff/billing';
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Make the Payment
                </button>
                <button
                  onClick={() => {
                    const backdropEl = document.getElementById('checkout-error-backdrop');
                    if (backdropEl) backdropEl.remove();
                    toast.dismiss(t.id);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ),
        { 
          duration: Infinity,
          position: 'top-left',
          style: {
            marginTop: '80px',
            marginLeft: '20px',
            zIndex: 50
          }
        }
      );
    }
  } finally {
    setProcessingId(null);
  }
};
```

## Database Tables Used (No Modifications)

### Tables Involved:
1. **booking** - Retrieves CheckInDate, CheckOutDate, BookingStatus
2. **bookingRooms** - Links booking to rooms
3. **room** - Gets room details
4. **roomType** - Gets DailyRate for calculation
5. **serviceUsage** - Gets actual service charges
6. **bill** - Updates with recalculated amounts
7. **payment** - Verifies payment status

### No Schema Changes Required ✅
- Uses existing timestamp in CheckInDate
- Calculates against current time (NOW())
- Updates only the bill amounts (no new columns)

---

# API Documentation

## Endpoints

### Check Out Booking
**Endpoint:** `PUT /api/staff/bookings/:bookingId/checkout`

**Request:**
```javascript
PUT /api/staff/bookings/123/checkout
Headers: {
  Authorization: Bearer <token>
}
```

**Success Response (Early Checkout with Refund):**
```json
{
  "success": true,
  "message": "Early checkout processed successfully. Bill adjusted for 2 days (originally booked for 5 days)",
  "data": {
    "bookingId": 123,
    "guestName": "John Doe",
    "status": "checked-out",
    "isEarlyCheckout": true,
    "bookedDays": 5,
    "actualDaysStayed": 2,
    "actualRoomCharges": "20000.00",
    "serviceCharges": "3500.00",
    "finalTotalAmount": "23500.00",
    "totalPaid": "50000.00",
    "refundAmount": "26500.00"
  }
}
```

**Success Response (Normal Checkout):**
```json
{
  "success": true,
  "message": "Booking checked-out successfully",
  "data": {
    "bookingId": 123,
    "guestName": "Jane Smith",
    "status": "checked-out",
    "isEarlyCheckout": false,
    "bookedDays": 3,
    "actualDaysStayed": 3,
    "actualRoomCharges": "30000.00",
    "serviceCharges": "5000.00",
    "finalTotalAmount": "35000.00",
    "totalPaid": "35000.00",
    "refundAmount": null
  }
}
```

**Error Response (Unpaid Bill):**
```json
{
  "success": false,
  "message": "Cannot check-out: Bill not fully paid. Remaining amount: LKR 5000.00",
  "data": {
    "isEarlyCheckout": true,
    "bookedDays": 5,
    "actualDaysStayed": 2,
    "originalRoomCharges": "50000.00",
    "actualRoomCharges": "20000.00",
    "serviceCharges": "3500.00",
    "discount": "0.00",
    "tax": "1175.00",
    "totalAmount": "24675.00",
    "totalPaid": "19675.00",
    "remainingAmount": "5000.00"
  },
  "statusCode": 400
}
```

---

# Testing Scenarios

## Test Case 1: Early Checkout Detection
```
Input:
  - BookingID: 1
  - CheckInDate: 2025-01-01 10:00:00
  - CheckOutDate: 2025-01-06 12:00:00 (5 days booked)
  - Current Date: 2025-01-03 14:00:00

Expected Output:
  - isEarlyCheckout: true
  - actualDaysStayed: 3 (CEIL((03 14:00 - 01 10:00) / 24h) = CEIL(2.17) = 3)
  - bookedDays: 5
  - Bill recalculated for 3 days only
```

## Test Case 2: Minimum 1 Day Charge
```
Input:
  - CheckInDate: 2025-01-01 10:00:00
  - Current Time: 2025-01-01 20:00:00 (same day, 10 hours later)

Expected Output:
  - actualDaysStayed: 1 (Math.max(1, CEIL(10h/24h)) = Math.max(1, 1) = 1)
  - Guest charged for 1 full day minimum
```

## Test Case 3: Payment Sufficient (Overpaid)
```
Input:
  - Original bill: LKR 50,000 (5 days × 10,000)
  - Payment made: LKR 50,000
  - Actual stay: 2 days
  - Recalculated bill: LKR 20,000

Expected Output:
  - Checkout succeeds
  - refundAmount: 30,000
  - Toast shows: "⚠️ REFUND DUE: LKR 30,000.00"
  - Staff must process refund separately
```

## Test Case 4: Payment Insufficient
```
Input:
  - Original bill: LKR 50,000 (5 days × 10,000)
  - Payment made: LKR 15,000
  - Actual stay: 2 days
  - Recalculated bill: LKR 20,000

Expected Output:
  - Checkout blocked
  - Error popup displays
  - remainingAmount: 5,000
  - "Make the Payment" button navigates to billing
```

## Test Case 5: Multiple Rooms
```
Input:
  - Room 1: LKR 10,000/day
  - Room 2: LKR 15,000/day
  - Booked: 5 days
  - Stayed: 2 days
  - Total paid: LKR 125,000

Expected Output:
  - Room 1 charges: 10,000 × 2 = 20,000
  - Room 2 charges: 15,000 × 2 = 30,000
  - Total room charges: 50,000
  - Checkout succeeds
  - Refund: 75,000
```

## Test Case 6: Services During Early Checkout
```
Input:
  - Room rate: 12,000/day
  - Booked: 4 days = 48,000
  - Stayed: 1 day
  - Services: Spa (2,000) + Room Service (1,500) = 3,500
  - Payment: 0

Expected Output:
  - Room charges: 12,000 × 1 = 12,000
  - Service charges: 3,500 (unchanged)
  - Total: 15,500
  - Checkout blocked (unpaid)
  - remainingAmount: 15,500
```

---

# Troubleshooting

## Common Issues

### Problem: "Check Out button is disabled"
**Cause:** Booking status is not "checked-in"  
**Solution:**
- Check booking status in the Status column
- Booking must be checked-in first before checkout
- Use "Check In" button if status is "confirmed"

### Problem: "Cannot check-out: Bill not fully paid"
**Cause:** Recalculated bill exceeds existing payments  
**Solution:** 
1. Note the remaining amount from the error popup
2. Click "Make the Payment" button
3. System navigates to Billing Management
4. Process payment for remaining amount
5. Return to Booking Operations
6. Click "Check Out" again

### Problem: "Guest paid full amount but checkout still fails"
**Cause:** Early checkout bill + services exceeds original payment  
**Solution:** 
1. Review the bill details in error popup
2. Check service charges (spa, room service, etc.)
3. Verify all services are correct
4. Collect additional payment for services
5. Retry checkout

### Problem: "How to issue refund for overpayment?"
**Cause:** Guest paid for 5 days but only stayed 2 days  
**Solution:** 
1. Checkout will succeed (payment sufficient)
2. Success toast shows: "⚠️ REFUND DUE: LKR X.XX"
3. Calculate refund: totalPaid - finalBill
4. Process refund through payment gateway or cash
5. Document refund in payment records

### Problem: "Backdrop blur doesn't dismiss"
**Cause:** JavaScript error or browser incompatibility  
**Solution:**
1. Click "Cancel" or "Make the Payment" button
2. If stuck, refresh the page (F5)
3. Backdrop should auto-remove when buttons clicked
4. Check browser console for errors

### Problem: "Error popup positioned incorrectly"
**Cause:** Screen size or zoom level issues  
**Solution:**
- Popup is designed for top-left alignment
- Try adjusting browser zoom (Ctrl + 0 for 100%)
- Popup should appear with marginTop: 80px, marginLeft: 20px

### Problem: "Checkout succeeds but room still showing occupied"
**Cause:** Database trigger not firing or caching issue  
**Solution:**
1. Refresh the page
2. Check room status in Room Management
3. Verify booking status is "checked-out"
4. Check database triggers are active
5. Contact administrator if persists

## System Behavior Notes

### Frontend (Staff Interface)
- ✅ Check Out button: **Always enabled** for checked-in bookings
- ✅ Error popup: Shows detailed bill breakdown with navigation buttons
- ✅ Backdrop blur: Applied when error popup appears
- ✅ Success toast: Shows refund alert if guest overpaid
- ✅ Auto-refresh: Booking list refreshes after successful checkout

### Backend (Server Logic)
- ✅ Calculates actual days stayed: `CEIL((NOW - CheckInDate) / 24h)`
- ✅ Minimum 1 day charge enforced
- ✅ Recalculates room charges: `actualDays × DailyRate`
- ✅ Keeps service charges unchanged (actual usage)
- ✅ Validates payment: `totalPaid >= recalculatedTotal`
- ✅ Blocks checkout if insufficient payment
- ✅ Detects and returns refund amount if overpaid
- ✅ Updates booking status on success
- ✅ Releases room automatically

### Database
- ✅ Booking status: `checked-in` → `checked-out`
- ✅ Bill amounts: Updated with actual charges
- ✅ Room status: `occupied` → `available` (via trigger)
- ✅ Audit log: Records checkout operation
- ✅ Payment records: Unchanged (already in database)

---

## Quick Checklist

Before processing early checkout:

- [ ] Guest has requested early checkout
- [ ] Booking status is "checked-in"
- [ ] Note original checkout date
- [ ] Check current bill status (paid/unpaid)
- [ ] Calculate expected days stayed
- [ ] Estimate new bill amount
- [ ] Have payment method ready (if unpaid)
- [ ] Click "Check Out" button
- [ ] If blocked, click "Make the Payment"
- [ ] Process payment in Billing Management
- [ ] Return and retry checkout
- [ ] If overpaid, note refund amount from toast
- [ ] Process refund if applicable
- [ ] Confirm room is available again

---

## Benefits Summary

1. ✅ **No Schema Changes** - Works with existing database structure
2. ✅ **Fair Billing** - Guests only pay for actual stay
3. ✅ **Automatic Calculation** - No manual intervention needed
4. ✅ **Transparent** - Clear breakdown shown in notifications
5. ✅ **Payment Protection** - Prevents checkout until paid
6. ✅ **Refund Detection** - Alerts staff when guest overpaid
7. ✅ **Audit Trail** - Bill history preserved in database
8. ✅ **User-Friendly** - Intuitive popup with navigation buttons
9. ✅ **Backdrop Blur** - Focuses attention on important payment info
10. ✅ **Single Notification** - No duplicate error messages

---

## Support & Questions

**For technical issues:**
- Check browser console for errors (F12)
- Verify network connection
- Refresh page and retry (F5)
- Check that services are running (Docker)
- Contact system administrator

**For billing questions:**
- Review complete bill breakdown in error popup
- Check payment history in Billing Management
- Verify service charges are correct
- Consult supervisor for refund approval
- Document all refunds properly

**For guest concerns:**
- Explain early checkout savings clearly
- Show bill breakdown in popup
- Process refund promptly if applicable
- Provide receipt with adjusted amounts
- Be transparent about charges

---

## Deployment

### Apply Changes:

```bash
# 1. Rebuild services
docker-compose up -d --build

# 2. Verify containers are running
docker-compose ps

# 3. Check logs if issues
docker-compose logs -f backend
docker-compose logs -f frontend

# 4. Test checkout functionality
```

### Verification Steps:

1. **Backend API Test:**
```bash
curl -X PUT http://localhost:5000/api/staff/bookings/123/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

2. **Frontend Test:**
- Login as staff member
- Navigate to Booking Operations
- Find a checked-in booking
- Click "Check Out" button
- Verify appropriate response (success toast or error popup)

3. **Database Verification:**
```sql
-- Check booking status updated
SELECT BookingID, BookingStatus FROM booking WHERE BookingID = 123;

-- Check bill amounts updated
SELECT * FROM bill WHERE BookingID = 123;

-- Check room status released
SELECT r.Status FROM room r
JOIN bookingRooms br ON r.RoomID = br.RoomID
WHERE br.BookingID = 123;
```

---

## Future Enhancements (Optional)

1. **Automated Refund Processing** - Integrate with payment gateway for automatic refunds
2. **Late Checkout Fee** - Charge extra for checkout after scheduled time
3. **Cancellation Policy** - Integrate early checkout with cancellation fees
4. **Email Notification** - Send adjusted bill and refund details to guest
5. **Report Generation** - Track early checkout patterns and revenue impact
6. **SMS Alerts** - Notify guests about refund status
7. **Receipt Generation** - Auto-generate PDF receipt with adjusted amounts
8. **Analytics Dashboard** - Visualize early checkout trends

---

**Last Updated:** October 20, 2025  
**Version:** 2.0 (Consolidated)  
**Status:** ✅ Production Ready  
**Documentation Type:** Complete Technical & User Guide
