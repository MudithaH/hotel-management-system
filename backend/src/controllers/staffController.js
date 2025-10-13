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
  calculateRoomCharges,
  calculateBillTotal 
} = require('../utils/helpers');

// Get available rooms for booking (check date conflicts)
const getAvailableRooms = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, roomTypeId } = req.query;
    const branchId = req.user.BranchID;

    if (!checkInDate || !checkOutDate) {
      return res.status(400).json(formatResponse(false, 'Check-in and check-out dates are required', null, 400));
    }

    // Base query to get rooms
    let query = `
      SELECT r.RoomID, r.RoomNumber, r.Status, r.BranchID,
             rt.RoomTypeID, rt.TypeName, rt.Capacity, rt.DailyRate, rt.Amenities
      FROM room r
      JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.BranchID = ? AND r.Status = 'available'
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
      const conflictQuery = `
        SELECT COUNT(*) as conflicts
        FROM booking b
        JOIN bookingRooms br ON b.BookingID = br.BookingID
        WHERE br.RoomID = ? 
        AND b.BookingStatus IN ('confirmed', 'checked-in')
        AND (
          (b.CheckInDate <= ? AND b.CheckOutDate > ?) OR
          (b.CheckInDate < ? AND b.CheckOutDate >= ?) OR
          (b.CheckInDate >= ? AND b.CheckOutDate <= ?)
        )
      `;
      
      const conflictResult = await findOne(conflictQuery, [
        room.RoomID, 
        checkOutDate, checkInDate,  // Overlap condition 1
        checkOutDate, checkInDate,  // Overlap condition 2  
        checkInDate, checkOutDate   // Overlap condition 3
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
      const conflictQuery = `
        SELECT COUNT(*) as conflicts
        FROM booking b
        JOIN bookingRooms br ON b.BookingID = br.BookingID
        WHERE br.RoomID = ? 
        AND b.BookingStatus IN ('confirmed', 'checked-in')
        AND (
          (b.CheckInDate <= ? AND b.CheckOutDate > ?) OR
          (b.CheckInDate < ? AND b.CheckOutDate >= ?) OR
          (b.CheckInDate >= ? AND b.CheckOutDate <= ?)
        )
      `;
      
      const conflictResult = await findOne(conflictQuery, [
        roomId, 
        checkOutDate, checkInDate,
        checkOutDate, checkInDate,
        checkInDate, checkOutDate
      ]);
      
      if (conflictResult.success && conflictResult.data.conflicts > 0) {
        return res.status(400).json(formatResponse(false, `Room ${roomId} is not available for the selected dates`, null, 400));
      }
    }

    // Create booking
    const bookingQuery = `
      INSERT INTO booking (GuestID, CheckInDate, CheckOutDate, BookingStatus)
      VALUES (?, ?, ?, 'confirmed')
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
      const roomsQuery = `
        SELECT r.RoomID, r.RoomNumber, rt.TypeName, rt.DailyRate
        FROM bookingRooms br
        JOIN room r ON br.RoomID = r.RoomID
        JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
        WHERE br.BookingID = ?
      `;
      
      const roomsResult = await findMany(roomsQuery, [booking.BookingID]);
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

    // Get service details for price
    const serviceQuery = 'SELECT Price FROM serviceCatalogue WHERE ServiceID = ?';
    const serviceResult = await findOne(serviceQuery, [serviceId]);

    if (!serviceResult.success || !serviceResult.data) {
      return res.status(404).json(formatResponse(false, 'Service not found', null, 404));
    }

    const priceAtUsage = serviceResult.data.Price;
    const finalUsageDate = usageDate || new Date().toISOString().split('T')[0];

    const query = `
      INSERT INTO serviceUsage (BookingID, ServiceID, UsageDate, Quantity, PriceAtUsage)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await insertRecord(query, [bookingId, serviceId, finalUsageDate, quantity, priceAtUsage]);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'serviceUsage', `CREATE - UsageID: ${result.insertId}`);

    res.status(201).json(formatResponse(true, 'Service usage added successfully', { usageId: result.insertId }));

  } catch (error) {
    console.error('Add service usage error:', error);
    res.status(500).json(formatResponse(false, 'Failed to add service usage', null, 500));
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
      SELECT SUM(Quantity * PriceAtUsage) as totalServiceCharges
      FROM serviceUsage
      WHERE BookingID = ?
    `;
    
    const servicesResult = await findOne(servicesQuery, [bookingId]);
    const serviceCharges = servicesResult.data?.totalServiceCharges || 0;

    // Calculate totals
    const subtotal = roomCharges + serviceCharges - discount;
    const tax = subtotal * taxRate;
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
      billResult = await updateRecord(updateQuery, [roomCharges, serviceCharges, discount, tax, totalAmount, bookingId]);
    } else {
      // Create new bill
      const insertQuery = `
        INSERT INTO bill (BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount, BillDate, PaymentStatus)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), 'pending')
      `;
      billResult = await insertRecord(insertQuery, [bookingId, roomCharges, serviceCharges, discount, tax, totalAmount]);
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
      roomCharges,
      serviceCharges,
      discount,
      tax,
      totalAmount
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
             b.Tax, b.TotalAmount, b.BillDate, b.PaymentStatus,
             g.Name as GuestName, g.Email as GuestEmail
      FROM bill b
      JOIN booking bk ON b.BookingID = bk.BookingID
      JOIN guest g ON bk.GuestID = g.GuestID
      JOIN bookingRooms br ON bk.BookingID = br.BookingID
      JOIN room r ON br.RoomID = r.RoomID
      WHERE r.BranchID = ?
      GROUP BY b.BillID
      ORDER BY b.BillDate DESC
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

// Process payment for a bill
const processPayment = async (req, res) => {
  try {
    const { billId, paymentMethod, amount, paymentDate } = req.body;

    // Input validation
    if (!billId || !paymentMethod || !amount) {
      return res.status(400).json(formatResponse(false, 'Bill ID, payment method, and amount are required', null, 400));
    }

    // Get bill details
    const billQuery = 'SELECT * FROM bill WHERE BillID = ?';
    const billResult = await findOne(billQuery, [billId]);

    if (!billResult.success || !billResult.data) {
      return res.status(404).json(formatResponse(false, 'Bill not found', null, 404));
    }

    const bill = billResult.data;

    // Validate payment amount
    if (amount > bill.TotalAmount) {
      return res.status(400).json(formatResponse(false, 'Payment amount cannot exceed bill total', null, 400));
    }

    // Insert payment record
    const paymentInsertQuery = `
      INSERT INTO payment (BillID, PaymentMethod, Amount, PaymentDate)
      VALUES (?, ?, ?, ?)
    `;

    const finalPaymentDate = paymentDate || new Date().toISOString().split('T')[0];
    const paymentResult = await insertRecord(paymentInsertQuery, [billId, paymentMethod, amount, finalPaymentDate]);

    if (!paymentResult.success) {
      return res.status(400).json(formatResponse(false, paymentResult.error, null, 400));
    }

    // Update bill payment status if fully paid
    if (amount >= bill.TotalAmount) {
      const updateBillQuery = 'UPDATE bill SET PaymentStatus = ? WHERE BillID = ?';
      await updateRecord(updateBillQuery, ['paid', billId]);
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'payment', `CREATE - PaymentID: ${paymentResult.insertId}`);

    res.status(201).json(formatResponse(true, 'Payment processed successfully', { 
      paymentId: paymentResult.insertId,
      billStatus: amount >= bill.TotalAmount ? 'paid' : 'partially_paid'
    }));

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json(formatResponse(false, 'Failed to process payment', null, 500));
  }
};

module.exports = {
  getAvailableRooms,
  createGuest,
  getGuests,
  createBooking,
  getBookings,
  getServices,
  addServiceUsage,
  generateBill,
  getBills,
  processPayment
};