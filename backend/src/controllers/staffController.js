/**
 * Staff Controller  
 * Handles staff operations: guest management, booking management, billing, etc.
 */

const { findMany, findOne, insertRecord, updateRecord, deleteRecord } = require('../config/db');
const { 
  formatResponse, 
  logAudit, 
  isValidEmail, 
  isValidPhone, 
  datesOverlap, 
  calculateDays,
  calculateBillTotal 
} = require('../utils/helpers');

// Common SQL queries
const QUERIES = {
  BOOKING_CONFLICT: `
    SELECT COUNT(*) as conflicts
    FROM booking b
    JOIN bookingRooms br ON b.BookingID = br.BookingID
    WHERE br.RoomID = ? 
    AND b.BookingStatus IN ('booked', 'checked-in')
    AND b.CheckOutDate > ? 
    AND b.CheckInDate < ?
  `,
  ROOM_DETAILS_BY_BOOKING: `
    SELECT r.RoomID, r.RoomNumber, rt.TypeName, rt.DailyRate
    FROM bookingRooms br
    JOIN room r ON br.RoomID = r.RoomID
    JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE br.BookingID = ?
  `,
  BOOKING_WITH_GUEST: `
    SELECT b.*, g.Name as GuestName
    FROM booking b
    JOIN guest g ON b.GuestID = g.GuestID
    JOIN bookingRooms br ON b.BookingID = br.BookingID
    JOIN room r ON br.RoomID = r.RoomID
    WHERE b.BookingID = ? AND r.BranchID = ?
    LIMIT 1
  `
};

// Get available rooms for booking (check date conflicts)
const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomTypeId } = req.query;
    const branchId = req.user.BranchID;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json(formatResponse(false, 'Check-in and check-out dates are required', null, 400));
    }

    // Base query to get rooms (don't filter by status - we'll check booking conflicts instead)
    let query = `
      SELECT r.RoomID, r.RoomNumber, r.Status, r.BranchID,
             rt.RoomTypeID, rt.TypeName, rt.Capacity, rt.DailyRate, rt.Amenities
      FROM room r
      JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.BranchID = ?
    `;
    const params = [branchId];

    // Add room type filter if provided
    if (roomTypeId) {
      query += ' AND rt.RoomTypeID = ?';
      params.push(roomTypeId);
    }

    // Get all rooms first
    const roomsResult = await findMany(query, params);
    if (!roomsResult.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve rooms', null, 500));
    }

    // Filter out rooms with conflicting bookings
    const availableRooms = [];
    
    for (const room of roomsResult.data) {
      const conflictResult = await findOne(QUERIES.BOOKING_CONFLICT, [
        room.RoomID, 
        checkInDate,
        checkOutDate
      ]);
      
      if (conflictResult.success && conflictResult.data.conflicts === 0) {
        availableRooms.push(room);
      }
    }

    res.json(formatResponse(true, 'Available rooms retrieved successfully', availableRooms));

  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve available rooms', null, 500));
  }
};

// Create new guest
const createGuest = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Input validation
    if (!name || !email || !phone) {
      return res.status(400).json(formatResponse(false, 'Name, email, and phone are required', null, 400));
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(formatResponse(false, 'Invalid email format', null, 400));
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json(formatResponse(false, 'Invalid phone format', null, 400));
    }

    const query = 'INSERT INTO guest (Name, Email, Phone) VALUES (?, ?, ?)';
    const result = await insertRecord(query, [name, email, phone]);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'guest', `CREATE - GuestID: ${result.insertId}`);

    res.status(201).json(formatResponse(true, 'Guest created successfully', { guestId: result.insertId }));

  } catch (error) {
    console.error('Create guest error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create guest', null, 500));
  }
};

// Get all guests
const getGuests = async (req, res) => {
  try {
    const query = 'SELECT * FROM guest ORDER BY Name';
    const result = await findMany(query);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve guests', null, 500));
    }

    res.json(formatResponse(true, 'Guests retrieved successfully', result.data));

  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve guests', null, 500));
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { guestId, checkInDate, checkOutDate, roomIds } = req.body;
    const branchId = req.user.BranchID;

    // Input validation
    if (!guestId || !checkInDate || !checkOutDate || !roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json(formatResponse(false, 'Guest ID, dates, and room IDs are required', null, 400));
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      return res.status(400).json(formatResponse(false, 'Check-out date must be after check-in date', null, 400));
    }

    // Verify all rooms are available and belong to the same branch
    for (const roomId of roomIds) {
      // Check room exists and belongs to branch
      const roomQuery = 'SELECT RoomID, Status FROM room WHERE RoomID = ? AND BranchID = ?';
      const roomResult = await findOne(roomQuery, [roomId, branchId]);
      
      if (!roomResult.success || !roomResult.data) {
        return res.status(400).json(formatResponse(false, `Room ${roomId} not found in your branch`, null, 400));
      }

      // Check for booking conflicts
      const conflictResult = await findOne(QUERIES.BOOKING_CONFLICT, [
        roomId, 
        checkInDate,
        checkOutDate
      ]);
      
      if (conflictResult.success && conflictResult.data.conflicts > 0) {
        return res.status(400).json(formatResponse(false, `Room ${roomId} is not available for the selected dates`, null, 400));
      }
    }

    // Create booking
    const bookingQuery = `
      INSERT INTO booking (GuestID, CheckInDate, CheckOutDate, BookingStatus)
      VALUES (?, ?, ?, 'booked')
    `;
    
    const bookingResult = await insertRecord(bookingQuery, [guestId, checkInDate, checkOutDate]);
    
    if (!bookingResult.success) {
      return res.status(400).json(formatResponse(false, bookingResult.error, null, 400));
    }

    const bookingId = bookingResult.insertId;

    // Add rooms to booking
    for (const roomId of roomIds) {
      const bookingRoomQuery = 'INSERT INTO bookingRooms (BookingID, RoomID) VALUES (?, ?)';
      await insertRecord(bookingRoomQuery, [bookingId, roomId]);
      
      // Update room status to occupied
      await updateRecord('UPDATE room SET Status = ? WHERE RoomID = ?', ['occupied', roomId]);
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'booking', `CREATE - BookingID: ${bookingId}`);

    res.status(201).json(formatResponse(true, 'Booking created successfully', { bookingId }));

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create booking', null, 500));
  }
};

// Get bookings for staff's branch
const getBookings = async (req, res) => {
  try {
    const branchId = req.user.BranchID;

    const query = `
      SELECT DISTINCT b.BookingID, b.CheckInDate, b.CheckOutDate, b.BookingStatus,
             g.GuestID, g.Name as GuestName, g.Email as GuestEmail, g.Phone as GuestPhone
      FROM booking b
      JOIN guest g ON b.GuestID = g.GuestID
      JOIN bookingRooms br ON b.BookingID = br.BookingID
      JOIN room r ON br.RoomID = r.RoomID
      WHERE r.BranchID = ?
      ORDER BY b.CheckInDate DESC
    `;

    const result = await findMany(query, [branchId]);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve bookings', null, 500));
    }

    // Get room details for each booking
    for (let booking of result.data) {
      const roomsResult = await findMany(QUERIES.ROOM_DETAILS_BY_BOOKING, [booking.BookingID]);
      booking.rooms = roomsResult.success ? roomsResult.data : [];
    }

    res.json(formatResponse(true, 'Bookings retrieved successfully', result.data));

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve bookings', null, 500));
  }
};

// Get services catalog
const getServices = async (req, res) => {
  try {
    const query = 'SELECT * FROM serviceCatalogue ORDER BY ServiceName';
    const result = await findMany(query);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve services', null, 500));
    }

    res.json(formatResponse(true, 'Services retrieved successfully', result.data));

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve services', null, 500));
  }
};

// Add service usage to booking
const addServiceUsage = async (req, res) => {
  try {
    const { bookingId, serviceId, quantity, usageDate } = req.body;

    if (!bookingId || !serviceId || !quantity) {
      return res.status(400).json(formatResponse(false, 'Booking ID, service ID, and quantity are required', null, 400));
    }

    // Validate booking exists and is checked-in
    const bookingQuery = 'SELECT BookingStatus FROM booking WHERE BookingID = ?';
    const bookingResult = await findOne(bookingQuery, [bookingId]);

    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json(formatResponse(false, 'Booking not found', null, 404));
    }

    if (bookingResult.data.BookingStatus !== 'checked-in') {
      return res.status(400).json(formatResponse(false, 'Services can only be added to checked-in bookings', null, 400));
    }

    // Get service details for price
    const serviceQuery = 'SELECT Price FROM serviceCatalogue WHERE ServiceID = ?';
    const serviceResult = await findOne(serviceQuery, [serviceId]);

    if (!serviceResult.success || !serviceResult.data) {
      return res.status(404).json(formatResponse(false, 'Service not found', null, 404));
    }

    const priceAtUsage = serviceResult.data.Price;
    const finalUsageDate = usageDate || new Date().toISOString().split('T')[0];

    // Coerce numeric values
    const qty = parseInt(quantity) || 0;
    const priceNum = parseFloat(serviceResult.data.Price) || 0;

    const query = `
      INSERT INTO serviceUsage (BookingID, ServiceID, UsageDate, Quantity, PriceAtUsage)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await insertRecord(query, [bookingId, serviceId, finalUsageDate, qty, priceNum]);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'serviceUsage', `CREATE - UsageID: ${result.insertId}`);

    // If a bill already exists for this booking, update its ServiceCharges and TotalAmount
    try {
      const existingBillQuery = 'SELECT BillID, RoomCharges, Discount, Tax FROM bill WHERE BookingID = ?';
      const existingBill = await findOne(existingBillQuery, [bookingId]);
      if (existingBill.success && existingBill.data) {
        const billRecord = existingBill.data;

        const servicesSumQuery = 'SELECT COALESCE(SUM(Quantity * PriceAtUsage), 0) as totalServiceCharges FROM serviceUsage WHERE BookingID = ?';
        const servicesSumResult = await findOne(servicesSumQuery, [bookingId]);
        const totalServiceCharges = parseFloat(servicesSumResult.data?.totalServiceCharges) || 0;

        // Recalculate total amount (keep Tax as stored in bill, adjust ServiceCharges)
        const roomCharges = parseFloat(billRecord.RoomCharges) || 0;
        const discount = parseFloat(billRecord.Discount) || 0;
        const tax = parseFloat(billRecord.Tax) || 0;
        const newTotal = parseFloat((roomCharges + totalServiceCharges - discount + tax).toFixed(2));

        await updateRecord('UPDATE bill SET ServiceCharges = ?, TotalAmount = ? WHERE BillID = ?', [totalServiceCharges, newTotal, billRecord.BillID]);
      }
    } catch (err) {
      console.error('Failed to update bill after adding service usage:', err);
    }

    res.status(201).json(formatResponse(true, 'Service usage added successfully', { usageId: result.insertId }));

  } catch (error) {
    console.error('Add service usage error:', error);
    res.status(500).json(formatResponse(false, 'Failed to add service usage', null, 500));
  }
};

// Get service usage details for a booking
const getServiceUsage = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const query = `
      SELECT su.UsageID, su.UsageDate, su.Quantity, su.PriceAtUsage,
             sc.ServiceName,
             (su.Quantity * su.PriceAtUsage) as TotalCost
      FROM serviceUsage su
      JOIN serviceCatalogue sc ON su.ServiceID = sc.ServiceID
      WHERE su.BookingID = ?
      ORDER BY su.UsageDate DESC, su.UsageID DESC
    `;

    const result = await findMany(query, [bookingId]);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    const serviceDetails = result.data || [];
    const totalServiceCost = serviceDetails.reduce((sum, service) => sum + parseFloat(service.TotalCost), 0);

    res.json(formatResponse(true, 'Service usage retrieved successfully', {
      services: serviceDetails,
      totalServiceCost: totalServiceCost
    }));

  } catch (error) {
    console.error('Get service usage error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve service usage', null, 500));
  }
};

// Generate bill for booking
const generateBill = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { discount = 0, taxRate = 0.1 } = req.body;

    // Get booking details
    const bookingQuery = `
      SELECT b.*, g.Name as GuestName
      FROM booking b
      JOIN guest g ON b.GuestID = g.GuestID
      WHERE b.BookingID = ?
    `;
    
    const bookingResult = await findOne(bookingQuery, [bookingId]);
    
    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json(formatResponse(false, 'Booking not found', null, 404));
    }

    const booking = bookingResult.data;

    // Validation: booking must be 'checked-out' to generate bill
    if (booking.BookingStatus !== 'checked-out') {
      return res.status(400).json(formatResponse(false, 'Bills can only be generated for checked-out bookings', null, 400));
    }

    // Calculate room charges
    const roomsQuery = `
      SELECT rt.DailyRate
      FROM bookingRooms br
      JOIN room r ON br.RoomID = r.RoomID
      JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE br.BookingID = ?
    `;
    
    const roomsResult = await findMany(roomsQuery, [bookingId]);
    const days = calculateDays(booking.CheckInDate, booking.CheckOutDate);
    
    let roomCharges = 0;
    if (roomsResult.success) {
      roomCharges = roomsResult.data.reduce((total, room) => total + (room.DailyRate * days), 0);
    }

    // Calculate service charges
    const servicesQuery = `
      SELECT COALESCE(SUM(Quantity * PriceAtUsage), 0) as totalServiceCharges
      FROM serviceUsage
      WHERE BookingID = ?
    `;
    
    const servicesResult = await findOne(servicesQuery, [bookingId]);
    const serviceCharges = parseFloat(servicesResult.data?.totalServiceCharges) || 0;

    // Calculate totals with proper number handling
    const discountAmount = parseFloat(discount) || 0;
    const taxRateValue = parseFloat(taxRate) || 0;
    
    const roomChargesNum = parseFloat(roomCharges) || 0;
    const serviceChargesNum = parseFloat(serviceCharges) || 0;
    
    const subtotal = roomChargesNum + serviceChargesNum - discountAmount;
    const tax = subtotal * taxRateValue;
    const totalAmount = subtotal + tax;



    // Check if bill already exists
    const existingBillQuery = 'SELECT BillID FROM bill WHERE BookingID = ?';
    const existingBill = await findOne(existingBillQuery, [bookingId]);

    let billResult;
    if (existingBill.success && existingBill.data) {
      // Update existing bill
      const updateQuery = `
        UPDATE bill SET RoomCharges = ?, ServiceCharges = ?, Discount = ?, Tax = ?, TotalAmount = ?
        WHERE BookingID = ?
      `;
      billResult = await updateRecord(updateQuery, [
        roomChargesNum.toFixed(2), 
        serviceChargesNum.toFixed(2), 
        discountAmount.toFixed(2), 
        tax.toFixed(2), 
        totalAmount.toFixed(2), 
        bookingId
      ]);
    } else {
      // Create new bill
      const insertQuery = `
        INSERT INTO bill (BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      billResult = await insertRecord(insertQuery, [
        bookingId, 
        roomChargesNum.toFixed(2), 
        serviceChargesNum.toFixed(2), 
        discountAmount.toFixed(2), 
        tax.toFixed(2), 
        totalAmount.toFixed(2)
      ]);
    }

    if (!billResult.success) {
      return res.status(400).json(formatResponse(false, billResult.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'bill', `GENERATE - BookingID: ${bookingId}`);

    const billData = {
      bookingId,
      guestName: booking.GuestName,
      checkInDate: booking.CheckInDate,
      checkOutDate: booking.CheckOutDate,
      days,
      roomCharges: roomChargesNum.toFixed(2),
      serviceCharges: serviceChargesNum.toFixed(2),
      discount: discountAmount.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    };

    res.json(formatResponse(true, 'Bill generated successfully', billData));

  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json(formatResponse(false, 'Failed to generate bill', null, 500));
  }
};

// Get all bills for staff's branch
const getBills = async (req, res) => {
  try {
    const branchId = req.user.BranchID;

    const query = `
      SELECT b.BillID, b.BookingID, b.RoomCharges, b.ServiceCharges, b.Discount, 
             b.Tax, b.TotalAmount, bk.CheckOutDate as BillDate,
             g.Name as GuestName, g.Email as GuestEmail,
             COALESCE(SUM(p.Amount), 0) as PaidAmount,
             (b.TotalAmount - COALESCE(SUM(p.Amount), 0)) AS RemainingAmount,
             CASE 
               WHEN COALESCE(SUM(p.Amount), 0) >= b.TotalAmount THEN 'paid'
               WHEN COALESCE(SUM(p.Amount), 0) > 0 THEN 'partially_paid'
               ELSE 'pending'
             END as PaymentStatus
      FROM bill b
      JOIN booking bk ON b.BookingID = bk.BookingID
      JOIN guest g ON bk.GuestID = g.GuestID
      JOIN bookingRooms br ON bk.BookingID = br.BookingID
      JOIN room r ON br.RoomID = r.RoomID
      LEFT JOIN payment p ON b.BillID = p.BillID AND p.PaymentStatus = 'completed'  
      WHERE r.BranchID = ?
      GROUP BY b.BillID
      ORDER BY bk.CheckOutDate DESC
    `;

    const result = await findMany(query, [branchId]);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve bills', null, 500));
    }

    res.json(formatResponse(true, 'Bills retrieved successfully', result.data));

  } catch (error) {
    console.error('Get bills error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve bills', null, 500));
  }
};

// Check-in booking
const checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.StaffID;
    const branchId = req.user.BranchID;

    // Get booking details
    const bookingResult = await findOne(QUERIES.BOOKING_WITH_GUEST, [bookingId, branchId]);
    
    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json(formatResponse(false, 'Booking not found in your branch', null, 404));
    }

    const booking = bookingResult.data;

    // Validation: booking must be 'booked' status
    if (booking.BookingStatus !== 'booked') {
      return res.status(400).json(formatResponse(false, `Cannot check-in booking with status: ${booking.BookingStatus}`, null, 400));
    }

    // Validation: check-in date validation (can check-in on or after CheckInDate)
    const today = new Date();
    const checkInDate = new Date(booking.CheckInDate);
    if (today < checkInDate.setHours(0, 0, 0, 0)) {
      return res.status(400).json(formatResponse(false, 'Cannot check-in before the scheduled check-in date', null, 400));
    }

    // Update booking status to checked-in
    const updateQuery = 'UPDATE booking SET BookingStatus = ? WHERE BookingID = ?';
    const updateResult = await updateRecord(updateQuery, ['checked-in', bookingId]);

    if (!updateResult.success) {
      return res.status(400).json(formatResponse(false, updateResult.error, null, 400));
    }

    // Log audit trail
    await logAudit(staffId, 'booking', `CHECK-IN - BookingID: ${bookingId}`);

    res.json(formatResponse(true, 'Booking checked-in successfully', { 
      bookingId, 
      guestName: booking.GuestName,
      status: 'checked-in'
    }));

  } catch (error) {
    console.error('Check-in booking error:', error);
    res.status(500).json(formatResponse(false, 'Failed to check-in booking', null, 500));
  }
};

// Check-out booking
const checkOutBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.StaffID;
    const branchId = req.user.BranchID;

    // Get booking details
    const bookingResult = await findOne(QUERIES.BOOKING_WITH_GUEST, [bookingId, branchId]);
    
    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json(formatResponse(false, 'Booking not found in your branch', null, 404));
    }

    const booking = bookingResult.data;

    // Validation: booking must be 'checked-in' status
    if (booking.BookingStatus !== 'checked-in') {
      return res.status(400).json(formatResponse(false, `Cannot check-out booking with status: ${booking.BookingStatus}`, null, 400));
    }

    // Update booking status to checked-out
    const updateQuery = 'UPDATE booking SET BookingStatus = ? WHERE BookingID = ?';
    const updateResult = await updateRecord(updateQuery, ['checked-out', bookingId]);

    if (!updateResult.success) {
      return res.status(400).json(formatResponse(false, updateResult.error, null, 400));
    }

    // Log audit trail
    await logAudit(staffId, 'booking', `CHECK-OUT - BookingID: ${bookingId}`);

    res.json(formatResponse(true, 'Booking checked-out successfully', { 
      bookingId, 
      guestName: booking.GuestName,
      status: 'checked-out'
    }));

  } catch (error) {
    console.error('Check-out booking error:', error);
    res.status(500).json(formatResponse(false, 'Failed to check-out booking', null, 500));
  }
};

// Process payment for a bill
const processPayment = async (req, res) => {
  try {
    const { billId, paymentMethod, amount, paymentDate } = req.body;
    const staffId = req.user.StaffID;

    // Input validation
    if (!billId || !paymentMethod || !amount) {
      return res.status(400).json(formatResponse(false, 'Bill ID, payment method, and amount are required', null, 400));
    }

    // Get bill details and booking ID
    const billQuery = 'SELECT * FROM bill WHERE BillID = ?';
    const billResult = await findOne(billQuery, [billId]);

    if (!billResult.success || !billResult.data) {
      return res.status(404).json(formatResponse(false, 'Bill not found', null, 404));
    }

    const bill = billResult.data;
    const bookingId = bill.BookingID;

    // Use integer cents to avoid floating point precision issues
    const toCents = (v) => {
      const n = parseFloat(v);
      if (!Number.isFinite(n)) return 0;
      return Math.round(n * 100);
    };

    // Calculate current paid amount to validate against remaining balance (in cents)
    const paymentsQueryBefore = 'SELECT COALESCE(SUM(Amount), 0) as totalPaid FROM payment WHERE BillID = ? AND PaymentStatus = "completed"';
    const paymentsResultBefore = await findOne(paymentsQueryBefore, [billId]);
    const paidSoFarBeforeCents = toCents(paymentsResultBefore.data?.totalPaid || 0);
    const totalAmountCents = toCents(bill.TotalAmount);
    const remainingBeforeCents = Math.max(0, totalAmountCents - paidSoFarBeforeCents);

    const amountCents = toCents(amount);

    // Validate payment amount against remaining balance (compare cents)
    if (amountCents > remainingBeforeCents) {
      return res.status(400).json(formatResponse(false, 'Payment amount cannot exceed remaining balance', null, 400));
    }

    // Insert payment record (using BillID as per current table structure)
    const paymentInsertQuery = `
      INSERT INTO payment (BillID, PaymentMethod, Amount, PaymentDate, PaymentStatus)
      VALUES (?, ?, ?, ?, ?)
    `;

    const finalPaymentDate = paymentDate || (new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]);
    // Insert using amount as decimal with two fixed decimals
    const amountToInsert = (amountCents / 100).toFixed(2);
    const paymentResult = await insertRecord(paymentInsertQuery, [billId, paymentMethod, amountToInsert, finalPaymentDate, 'completed']);

    if (!paymentResult.success) {
      return res.status(400).json(formatResponse(false, paymentResult.error, null, 400));
    }

  // Calculate total payments to determine status (after this payment)
    const paymentsQuery = 'SELECT COALESCE(SUM(Amount), 0) as totalPaid FROM payment WHERE BillID = ? AND PaymentStatus = "completed"';
    const paymentsResult = await findOne(paymentsQuery, [billId]);
    const totalPaidCents = toCents(paymentsResult.data?.totalPaid || 0);

    let billStatus;
    if (totalPaidCents >= totalAmountCents) {
      billStatus = 'paid';
    } else if (totalPaidCents > 0) {
      billStatus = 'partially_paid';
    } else {
      billStatus = 'pending';
    }

    //Update bill status
    const updateBillStatusQuery = `
      UPDATE bill 
      SET BillStatus = ?
      WHERE BillID = ?
    `;
    await updateRecord(updateBillStatusQuery, [billStatus, billId]);

    // If bill is fully paid, mark rooms as available only if booking is checked-out
    if (billStatus === 'paid') {
      try {
        // First check if booking is checked-out
        const bookingStatusQuery = 'SELECT BookingStatus FROM booking WHERE BookingID = ?';
        const bookingStatusResult = await findOne(bookingStatusQuery, [bookingId]);
        
        if (bookingStatusResult.success && bookingStatusResult.data?.BookingStatus === 'checked-out') {
          const updateRoomsQuery = `
            UPDATE room r
            JOIN bookingRooms br ON r.RoomID = br.RoomID
            SET r.Status = 'available'
            WHERE br.BookingID = ?
          `;
          if (!bookingId) {
            console.warn('processPayment: bookingId missing, cannot update room availability for BillID:', billId);
          } else {
            const updateResult = await updateRecord(updateRoomsQuery, [bookingId]);
            if (!updateResult.success) {
              console.error('processPayment: failed to update rooms for booking', bookingId, updateResult.error);
            } else if (updateResult.affectedRows === 0) {
              console.warn('processPayment: updateRooms affected 0 rows for booking', bookingId);
            } else {
              // Log audit for room availability change
              await logAudit(req.user.StaffID, 'room', `UPDATE - BookingID: ${bookingId} - Rooms set to available after payment`);
            }
          }
        } else {
          console.log('processPayment: Booking not checked-out, rooms remain occupied until checkout');
        }
      } catch (err) {
        console.error('Failed to update room availability after payment:', err);
      }
    }
    // Log audit trail
    await logAudit(req.user.StaffID, 'payment', `CREATE - PaymentID: ${paymentResult.insertId}`);

    // Prepare numeric responses rounded to 2 decimals
    const totalPaid = (totalPaidCents / 100);
    const remainingAmount = Math.max(0, (totalAmountCents - totalPaidCents) / 100);

    res.status(201).json(formatResponse(true, 'Payment processed successfully', { 
      paymentId: paymentResult.insertId,
      billStatus: billStatus,
      totalPaid: Number(totalPaid.toFixed(2)),
      remainingAmount: Number(remainingAmount.toFixed(2))
    }));

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json(formatResponse(false, 'Failed to process payment', null, 500));
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user.StaffID;
    const branchId = req.user.BranchID;

    // Get booking details
    const bookingResult = await findOne(QUERIES.BOOKING_WITH_GUEST, [bookingId, branchId]);
    
    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json(formatResponse(false, 'Booking not found in your branch', null, 404));
    }

    const booking = bookingResult.data;

    // Validation: cannot cancel checked-out bookings
    if (booking.BookingStatus === 'checked-out') {
      return res.status(400).json(formatResponse(false, 'Cannot cancel a checked-out booking', null, 400));
    }

    // Validation: cannot cancel cancelled bookings
    if (booking.BookingStatus === 'cancelled') {
      return res.status(400).json(formatResponse(false, 'Booking is already cancelled', null, 400));
    }

    // Update booking status to cancelled
    const updateQuery = 'UPDATE booking SET BookingStatus = ? WHERE BookingID = ?';
    const updateResult = await updateRecord(updateQuery, ['cancelled', bookingId]);

    if (!updateResult.success) {
      return res.status(400).json(formatResponse(false, updateResult.error, null, 400));
    }

    // Update room status back to available
    const updateRoomsQuery = `
      UPDATE room r
      JOIN bookingRooms br ON r.RoomID = br.RoomID
      SET r.Status = 'available'
      WHERE br.BookingID = ?
    `;
    
    const roomUpdateResult = await updateRecord(updateRoomsQuery, [bookingId]);
    
    if (!roomUpdateResult.success) {
      console.error('Failed to update room status:', roomUpdateResult.error);
    }

    // Log audit trail
    await logAudit(staffId, 'booking', `CANCEL - BookingID: ${bookingId}`);

    res.json(formatResponse(true, 'Booking cancelled successfully', { 
      bookingId, 
      guestName: booking.GuestName,
      status: 'cancelled'
    }));

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json(formatResponse(false, 'Failed to cancel booking', null, 500));
  }
};

module.exports = {
  getAvailableRooms,
  createGuest,
  getGuests,
  createBooking,
  getBookings,
  checkInBooking,
  checkOutBooking,
  getServices,
  addServiceUsage,
  getServiceUsage,
  generateBill,
  getBills,
  processPayment,
  cancelBooking
};