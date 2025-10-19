# Payment Validation for Checkout

## Overview
This feature prevents guests from checking out without fully paying their bills. It provides both frontend visual indicators and backend validation to ensure no revenue loss.

## Problem Solved
**Before**: Staff could check out guests even with unpaid bills, leading to:
- Revenue loss
- Accounting discrepancies
- Manual tracking of unpaid bills
- Difficult debt collection

**After**: System enforces full payment before checkout
- ✅ Checkout button disabled until bill paid
- ⚠️ Clear warning shows remaining amount
- 🛡️ Backend validation prevents bypass
- 📊 Real-time payment status updates

## Implementation Details

### Frontend Changes (`BookingOperations.jsx`)

#### 1. Bill Status Data
The `getBookings` API now returns:
```javascript
{
  BookingID: 123,
  BookingStatus: 'checked-in',
  BillID: 456,
  BillStatus: 'partial',  // 'pending', 'partial', or 'paid'
  TotalAmount: 400.00,
  TotalPaid: 200.00,
  RemainingAmount: 200.00
}
```

#### 2. Checkout Button Logic
```javascript
// Check if bill exists and is fully paid
const hasBill = booking.BillID != null;
const billPaid = booking.BillStatus === 'paid';
const canCheckout = isCheckedIn && (!hasBill || billPaid);

// Button is enabled only if:
// - Status is 'checked-in' AND
// - (No bill exists OR bill is fully paid)
```

#### 3. Visual Indicators
- **Unpaid bill**: 
  - 🔴 Checkout button: Gray and disabled
  - ⚠️ Warning message: "Bill not fully paid: $XX.XX remaining"
  - 💡 Tooltip: Shows remaining amount on hover
- **Paid bill**:
  - 🟢 Checkout button: Blue and enabled
  - No warning messages

### Backend Changes (`staffController.js`)

#### 1. Enhanced `getBookings` Endpoint
```javascript
// JOIN with bill table to get bill status
LEFT JOIN bill ON b.BookingID = bill.BookingID

// Calculate total paid from completed payments
SELECT COALESCE(SUM(Amount), 0) as TotalPaid
FROM payment
WHERE BillID = ? AND PaymentStatus = 'completed'

// Calculate remaining amount
RemainingAmount = TotalAmount - TotalPaid
```

#### 2. Payment Validation in `checkOutBooking`
```javascript
// Before allowing checkout, check payment status
const billQuery = `
  SELECT bill.BillID, bill.BillStatus, bill.TotalAmount,
         COALESCE(SUM(payment.Amount), 0) as TotalPaid
  FROM bill
  LEFT JOIN payment ON bill.BillID = payment.BillID 
    AND payment.PaymentStatus = 'completed'
  WHERE bill.BookingID = ?
  GROUP BY bill.BillID, bill.BillStatus, bill.TotalAmount
`;

// Reject if not fully paid
if (totalPaid < totalAmount) {
  return res.status(400).json({
    success: false,
    message: `Cannot check-out: Bill not fully paid. Remaining amount: $${remaining.toFixed(2)}`,
    data: {
      billStatus: 'partial',
      totalAmount: '400.00',
      totalPaid: '200.00',
      remainingAmount: '200.00'
    }
  });
}
```

## User Flow

### Staff Perspective

```
┌─────────────────────────────────────────────────┐
│ Booking Operations Dashboard                     │
├─────────────────────────────────────────────────┤
│                                                   │
│ Booking #123 - John Doe                          │
│ Status: ✅ Checked In                            │
│ Room: 101 (Deluxe Suite)                         │
│                                                   │
│ ⚠️ Bill not fully paid: $200.00 remaining        │
│                                                   │
│ [🟢 Check In] [⚪ Check Out]                     │
│    Disabled      Disabled                        │
│                                                   │
│ Actions Required:                                 │
│ 1. Process remaining payment                     │
│ 2. Then checkout will be enabled                 │
└─────────────────────────────────────────────────┘
```

### Step-by-Step Checkout Process

1. **Guest Ready to Leave**
   - Staff opens Booking Operations
   - Finds guest's booking (status: checked-in)

2. **Check Payment Status**
   - If bill unpaid: Warning shown, checkout disabled
   - If bill paid: Checkout button enabled

3. **Process Payment** (if needed)
   - Staff goes to Billing Management
   - Processes full or partial payment
   - Returns to Booking Operations
   - Refreshes the list

4. **Verify Payment Updated**
   - System shows updated payment status
   - Warning disappears if fully paid
   - Checkout button becomes enabled

5. **Complete Checkout**
   - Staff clicks "Check Out" button
   - Backend validates payment one final time
   - If valid: Checkout succeeds
   - If invalid: Error message shown

## API Responses

### Success Response (Paid)
```json
{
  "success": true,
  "message": "Booking checked-out successfully",
  "data": {
    "bookingId": 123,
    "guestName": "John Doe",
    "status": "checked-out"
  }
}
```

### Error Response (Unpaid)
```json
{
  "success": false,
  "message": "Cannot check-out: Bill not fully paid. Remaining amount: $200.00",
  "data": {
    "billStatus": "partial",
    "totalAmount": "400.00",
    "totalPaid": "200.00",
    "remainingAmount": "200.00"
  },
  "statusCode": 400
}
```

## Database Queries

### Check Payment Status
```sql
-- Get bill and payment information
SELECT 
  bill.BillID,
  bill.BillStatus,
  bill.TotalAmount,
  COALESCE(SUM(payment.Amount), 0) as TotalPaid,
  (bill.TotalAmount - COALESCE(SUM(payment.Amount), 0)) as RemainingAmount
FROM bill
LEFT JOIN payment ON bill.BillID = payment.BillID 
  AND payment.PaymentStatus = 'completed'
WHERE bill.BookingID = 123
GROUP BY bill.BillID, bill.BillStatus, bill.TotalAmount;
```

### Result Examples

**Unpaid Bill:**
```
BillID | BillStatus | TotalAmount | TotalPaid | RemainingAmount
-------|------------|-------------|-----------|----------------
456    | pending    | 400.00      | 0.00      | 400.00
```

**Partially Paid:**
```
BillID | BillStatus | TotalAmount | TotalPaid | RemainingAmount
-------|------------|-------------|-----------|----------------
456    | partial    | 400.00      | 200.00    | 200.00
```

**Fully Paid:**
```
BillID | BillStatus | TotalAmount | TotalPaid | RemainingAmount
-------|------------|-------------|-----------|----------------
456    | paid       | 400.00      | 400.00    | 0.00
```

## Security Considerations

### Double Protection
1. **Frontend Validation**: Prevents accidental clicks
2. **Backend Validation**: Prevents malicious bypass

### Cannot Be Bypassed
- Disabling JavaScript won't help (backend validates)
- API calls without authentication rejected
- Direct database updates trigger audit logs
- Staff permissions enforced at middleware level

### Audit Trail
All checkout attempts logged:
```sql
SELECT * FROM AuditLog 
WHERE TableName = 'booking' 
  AND Operation LIKE 'CHECK-OUT%'
ORDER BY ChangedAt DESC;
```

## Edge Cases Handled

### 1. No Bill Exists Yet
```javascript
// If guest hasn't been charged anything yet, allow checkout
if (!hasBill) {
  canCheckout = true;  // Enabled
}
```

### 2. Bill Created But Zero Amount
```javascript
// If total amount is $0.00, consider it paid
if (totalAmount === 0) {
  billPaid = true;  // Enabled
}
```

### 3. Overpayment
```javascript
// If paid more than required, still allow checkout
if (totalPaid >= totalAmount) {
  billPaid = true;  // Enabled
}
```

### 4. Multiple Partial Payments
```javascript
// Sum all completed payments
SELECT SUM(Amount) FROM payment 
WHERE BillID = ? AND PaymentStatus = 'completed'
```

### 5. Refunds
```javascript
// Refunds are negative amounts
// Subtracted from total paid automatically
```

## Testing Scenarios

### Test Case 1: Unpaid Bill Blocks Checkout
```
Given: Booking with status 'checked-in'
And: Bill exists with $400 total
And: No payments made
When: Staff views Booking Operations
Then: Checkout button is disabled
And: Warning shows "Bill not fully paid: $400.00 remaining"
When: Staff attempts API call to checkout
Then: Response is 400 Bad Request
And: Message is "Cannot check-out: Bill not fully paid"
```

### Test Case 2: Partial Payment Blocks Checkout
```
Given: Booking with status 'checked-in'
And: Bill exists with $400 total
And: Payment of $200 made
When: Staff views Booking Operations
Then: Checkout button is disabled
And: Warning shows "Bill not fully paid: $200.00 remaining"
```

### Test Case 3: Full Payment Allows Checkout
```
Given: Booking with status 'checked-in'
And: Bill exists with $400 total
And: Payments totaling $400 made
When: Staff views Booking Operations
Then: Checkout button is enabled
And: No warning message shown
When: Staff clicks checkout
Then: Checkout succeeds
And: Status becomes 'checked-out'
```

### Test Case 4: No Bill Allows Checkout
```
Given: Booking with status 'checked-in'
And: No bill exists
When: Staff views Booking Operations
Then: Checkout button is enabled
When: Staff clicks checkout
Then: Checkout succeeds
And: Bill is auto-generated by trigger
```

## Configuration

No configuration needed - works out of the box!

### Optional: Adjust Tolerance
If you want to allow small discrepancies (e.g., due to rounding):

```javascript
// In checkOutBooking function
const PAYMENT_TOLERANCE = 0.01;  // Allow $0.01 difference

if (totalPaid < totalAmount - PAYMENT_TOLERANCE) {
  // Reject checkout
}
```

## Troubleshooting

### Problem: Checkout button stays disabled after payment
**Solution**: Refresh the booking list
```javascript
// Frontend - refresh after payment
await fetchBookings();
```

### Problem: Backend allows checkout but frontend shows disabled
**Solution**: Check bill status calculation
```javascript
// Ensure payments have PaymentStatus = 'completed'
UPDATE payment SET PaymentStatus = 'completed' WHERE PaymentID = ?;
```

### Problem: Warning message shows wrong amount
**Solution**: Verify decimal precision
```javascript
// Use toFixed(2) for consistent display
remainingAmount.toFixed(2)
```

## Benefits

### For Hotel
- ✅ **Zero revenue loss** from unpaid bills
- ✅ **Automated enforcement** - no manual checking
- ✅ **Clear audit trail** of all transactions
- ✅ **Improved cash flow** - payment before checkout

### For Staff
- ✅ **Clear visual indicators** - no confusion
- ✅ **Cannot make mistakes** - system prevents errors
- ✅ **Less manual tracking** - system handles it
- ✅ **Faster checkout process** - pay first, then checkout

### For Guests
- ✅ **Transparent billing** - see what they owe
- ✅ **No surprises** - must pay before leaving
- ✅ **Receipt available** - payment confirmed
- ✅ **Fair process** - consistent for everyone

## Future Enhancements

1. **Partial Checkout**: Allow checkout with payment plan agreement
2. **Manager Override**: Special permission to checkout with unpaid bill
3. **Credit Accounts**: Corporate guests with credit terms
4. **Deposit System**: Require deposit on check-in, settle on checkout
5. **Email Reminders**: Notify guests of unpaid bills
6. **SMS Notifications**: Alert staff of checkout attempts with unpaid bills

## Related Files

- `backend/src/controllers/staffController.js` - Payment validation logic
- `frontend/src/pages/staff/BookingOperations.jsx` - UI with disabled button
- `BILL_AUTOMATION.md` - Overall billing system documentation

## Support

If checkout is blocked incorrectly:
1. Check bill status: `SELECT * FROM bill WHERE BookingID = ?`
2. Check payments: `SELECT * FROM payment WHERE BillID = ?`
3. Verify payment status: Should be 'completed', not 'pending'
4. Recalculate totals: `SUM(Amount)` should equal `TotalAmount`
5. Check audit log: `SELECT * FROM AuditLog WHERE TableName = 'payment'`
