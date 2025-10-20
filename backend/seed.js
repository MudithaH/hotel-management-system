//Populates the database with sample data for testing and demonstration


const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hotel_management',
};

async function seedDatabase() {
  let connection;
  
  try {
    console.log('Starting database seeding...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    // Clear existing data (in correct order to avoid foreign key constraints)
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM payment');
    await connection.execute('DELETE FROM bill');
    await connection.execute('DELETE FROM serviceUsage');

    await connection.execute('DELETE FROM AuditLog');
    await connection.execute('DELETE FROM bookingRooms');
    await connection.execute('DELETE FROM booking');
    await connection.execute('DELETE FROM room');
    await connection.execute('DELETE FROM staff');
    await connection.execute('DELETE FROM guest');
    await connection.execute('DELETE FROM serviceCatalogue');
    await connection.execute('DELETE FROM roomType');
    await connection.execute('DELETE FROM designation');
    await connection.execute('DELETE FROM hotelBranch');

    // Reset AUTO_INCREMENT
    await connection.execute('ALTER TABLE hotelBranch AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE designation AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE roomType AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE serviceCatalogue AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE guest AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE staff AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE room AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE booking AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE bookingRooms AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE AuditLog AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE bill AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE payment AUTO_INCREMENT = 1');
    await connection.execute('ALTER TABLE serviceUsage AUTO_INCREMENT = 1');


    // 1. Insert Hotel Branches (3 branches as specified)
    console.log('🏢 Seeding hotel branches...');
    const branches = [
      ['No. 123, Galle Road, Colombo 03', 'Colombo', '+94 11 234 5678', 'colombo@skynest.lk'],
      ['No. 456, Dalada Veediya, Kandy', 'Kandy', '+94 81 222 3456', 'kandy@skynest.lk'],
      ['No. 789, Beach Road, Galle Fort', 'Galle', '+94 91 223 4567', 'galle@skynest.lk']
    ];
    
    for (const branch of branches) {
      await connection.execute(
        'INSERT INTO hotelBranch (Address, City, Phone, Email) VALUES (?, ?, ?, ?)',
        branch
      );
    }

    // 2. Insert Designations
    console.log('Seeding designations...');
    const designations = [
      ['Admin', 150000.00],
      ['Staff', 85000.00]
    ];
    
    for (const designation of designations) {
      await connection.execute(
        'INSERT INTO designation (Designation, Salary) VALUES (?, ?)',
        designation
      );
    }

    // 3. Insert Room Types
    console.log('🛏️ Seeding room types...');
    const roomTypes = [
      ['Standard Single', 1, 12500.00, 'Single bed, air conditioning, private bathroom, Wi-Fi, TV, tea/coffee maker'],
      ['Standard Double', 2, 18500.00, 'Double bed, air conditioning, private bathroom, Wi-Fi, TV, mini-fridge, balcony'],
      ['Deluxe Suite', 4, 35000.00, 'King bed, living area, air conditioning, private bathroom, Wi-Fi, TV, mini-bar, ocean/mountain view'],
      ['Presidential Suite', 6, 70000.00, 'Master bedroom, separate living room, kitchenette, jacuzzi, private terrace, butler service, panoramic views'],
      ['Family Room', 4, 28000.00, 'Two double beds, air conditioning, private bathroom, Wi-Fi, TV, mini-fridge, children\'s play area']
    ];
    
    for (const roomType of roomTypes) {
      await connection.execute(
        'INSERT INTO roomType (TypeName, Capacity, DailyRate, Amenities) VALUES (?, ?, ?, ?)',
        roomType
      );
    }

    // 4. Insert Service Catalogue
    console.log('Seeding services...');
    const services = [
      ['Room Service - Sri Lankan Breakfast', 2500.00],
      ['Room Service - Rice & Curry', 3500.00],
      ['Room Service - Seafood Dinner', 4500.00],
      ['Laundry Service', 1500.00],
      ['Ayurvedic Spa Treatment', 8500.00],
      ['Airport Transfer (Colombo)', 4000.00],
      ['City Tour - Cultural Triangle', 12000.00],
      ['Wi-Fi Premium', 1000.00],
      ['Late Checkout', 3500.00],
      ['Extra Towels & Bedding', 500.00],
      ['Traditional Dance Show', 3000.00],
      ['Cooking Class - Sri Lankan Cuisine', 6500.00]
    ];
    
    for (const service of services) {
      await connection.execute(
        'INSERT INTO serviceCatalogue (ServiceName, Price) VALUES (?, ?)',
        service
      );
    }

    // 5. Insert Staff (1 admin per branch + additional staff)
    console.log('Seeding staff members...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const staff = [
      // Branch 1 (Colombo)
      [hashedPassword, 1, 1, 'Nuwan Perera', '952345678V', 'admin@colombo.skynest.lk', '+94 77 234 5678'],
      [hashedPassword, 1, 2, 'Sanduni Fernando', '963456789V', 'sanduni@colombo.skynest.lk', '+94 71 345 6789'],
      [hashedPassword, 1, 2, 'Kavindu Silva', '974567890V', 'kavindu@colombo.skynest.lk', '+94 76 456 7890'],
      
      // Branch 2 (Kandy)  
      [hashedPassword, 2, 1, 'Chamari Wickramasinghe', '955678901V', 'admin@kandy.skynest.lk', '+94 77 567 8901'],
      [hashedPassword, 2, 2, 'Tharindu Rajapaksha', '966789012V', 'tharindu@kandy.skynest.lk', '+94 71 678 9012'],
      [hashedPassword, 2, 2, 'Nisha Gamage', '977890123V', 'nisha@kandy.skynest.lk', '+94 76 789 0123'],
      
      // Branch 3 (Galle)
      [hashedPassword, 3, 1, 'Ruwan De Silva', '958901234V', 'admin@galle.skynest.lk', '+94 77 890 1234'],
      [hashedPassword, 3, 2, 'Dilini Jayawardena', '969012345V', 'dilini@galle.skynest.lk', '+94 71 901 2345'],
      [hashedPassword, 3, 2, 'Ashen Mendis', '970123456V', 'ashen@galle.skynest.lk', '+94 76 012 3456']
    ];
    
    for (const staffMember of staff) {
      await connection.execute(
        'INSERT INTO staff (HashedPassword, BranchID, DesignationID, Name, NIC, Email, Phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
        staffMember
      );
    }

    // 6. Insert Rooms (10 rooms per branch)
    console.log('Seeding rooms...');
    for (let branchId = 1; branchId <= 3; branchId++) {
      // 2 rooms of each type per branch
      for (let roomTypeId = 1; roomTypeId <= 5; roomTypeId++) {
        for (let i = 1; i <= 2; i++) {
          const roomNumber = `${roomTypeId}0${i}`;
          await connection.execute(
            'INSERT INTO room (BranchID, RoomTypeID, RoomNumber, Status) VALUES (?, ?, ?, ?)',
            [branchId, roomTypeId, roomNumber, 'available']
          );
        }
      }
    }

    // 7. Insert Sample Guests
    console.log('Seeding guests...');
    const guests = [
      ['Anil Jayasuriya', 'anil.j@gmail.com', '+94 77 123 4567'],
      ['Priya Herath', 'priya.herath@yahoo.com', '+94 71 234 5678'],
      ['Kasun Bandara', 'kasun.b@outlook.com', '+94 76 345 6789'],
      ['Nimali Dias', 'nimali.dias@gmail.com', '+94 77 456 7890'],
      ['Roshan Gunasekara', 'roshan.g@hotmail.com', '+94 71 567 8901'],
      ['Hasini Wijesinghe', 'hasini.w@gmail.com', '+94 76 678 9012'],
      ['Lakshan Kumara', 'lakshan.k@yahoo.com', '+94 77 789 0123'],
      ['Hiruni Amarasinghe', 'hiruni.a@gmail.com', '+94 71 890 1234'],
      ['Chanaka Rajapakse', 'chanaka.r@outlook.com', '+94 76 901 2345'],
      ['Thilini Fernando', 'thilini.f@gmail.com', '+94 77 012 3456']
    ];
    
    for (const guest of guests) {
      await connection.execute(
        'INSERT INTO guest (Name, Email, Phone) VALUES (?, ?, ?)',
        guest
      );
    }

    // 8. Insert Sample Bookings
    console.log('Seeding bookings...');
    const bookings = [
      [1, '2025-10-10 14:00:00', '2025-10-13 11:00:00', 'checked-out'],
      [2, '2025-10-15 15:00:00', '2025-10-19 11:00:00', 'checked-in'],
      [3, '2025-10-16 14:00:00', '2025-10-18 11:00:00', 'checked-in'],
      [4, '2025-10-20 16:00:00', '2025-10-24 11:00:00', 'confirmed'],
      [5, '2025-10-12 14:00:00', '2025-10-14 11:00:00', 'checked-out']
    ];
    
    for (const booking of bookings) {
      await connection.execute(
        'INSERT INTO booking (GuestID, CheckInDate, CheckOutDate, BookingStatus) VALUES (?, ?, ?, ?)',
        booking
      );
    }

    // 9. Insert Booking Rooms (assign rooms to bookings)
    console.log('Seeding booking-room assignments...');
    const bookingRooms = [
      [1, 1],  // Booking 1 -> Room 1
      [2, 11], // Booking 2 -> Room 11 (Branch 2)
      [3, 21], // Booking 3 -> Room 21 (Branch 3)
      [4, 2],  // Booking 4 -> Room 2
      [5, 12]  // Booking 5 -> Room 12
    ];
    
    // Update room status to occupied for assigned rooms
    for (const bookingRoom of bookingRooms) {
      await connection.execute(
        'INSERT INTO bookingRooms (BookingID, RoomID) VALUES (?, ?)',
        bookingRoom
      );
      
      await connection.execute(
        'UPDATE room SET Status = ? WHERE RoomID = ?',
        ['occupied', bookingRoom[1]]
      );
    }

    // 10. Insert Sample Service Usage
    console.log('Seeding service usage...');
    const serviceUsages = [
      [1, 1, '2025-10-11', 3, 2500.00], // Sri Lankan Breakfast for booking 1
      [1, 4, '2025-10-11', 2, 1500.00], // Laundry for booking 1
      [2, 2, '2025-10-16', 2, 3500.00], // Rice & Curry for booking 2
      [2, 5, '2025-10-16', 1, 8500.00], // Ayurvedic Spa for booking 2
      [3, 1, '2025-10-17', 2, 2500.00], // Breakfast for booking 3
      [3, 11, '2025-10-17', 2, 3000.00] // Traditional Dance Show for booking 3
    ];
    
    for (const usage of serviceUsages) {
      await connection.execute(
        'INSERT INTO serviceUsage (BookingID, ServiceID, UsageDate, Quantity, PriceAtUsage) VALUES (?, ?, ?, ?, ?)',
        usage
      );
    }

    // 11. Insert Sample Bills
    console.log('Seeding bills...');
    const bills = [
      [1, 37500.00, 10500.00, 0.00, 1920.00, 49920.00], // Booking 1 (3 days Standard Double)
      [2, 74000.00, 19000.00, 5000.00, 3520.00, 91520.00], // Booking 2 (4 days Standard Double with discount)
      [3, 25000.00, 11000.00, 0.00, 1440.00, 37440.00]   // Booking 3 (2 days Standard Single)
    ];
    
    for (const bill of bills) {
      await connection.execute(
        'INSERT INTO bill (BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount, BillStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [...bill, 'pending']        
      );
    }

    // 12. Insert Sample Payments
    console.log('💳 Seeding payments...');
    const payments = [
      [1, 49920.00, 'credit_card', '2025-10-13', 'completed'], // Full payment for Bill 1
      [2, 50000.00, 'cash', '2025-10-19', 'completed'],        // Partial payment for Bill 2
      [2, 41520.00, 'credit_card', '2025-10-19', 'completed'], // Remaining payment for Bill 2
      [3, 37440.00, 'debit_card', '2025-10-18', 'completed']   // Full payment for Bill 3
    ];
    
    for (const payment of payments) {
      await connection.execute(
        'INSERT INTO payment (BillID, Amount, PaymentMethod, PaymentDate, PaymentStatus) VALUES (?, ?, ?, ?, ?)',
        payment
      );
    }

    // 13. Insert Sample Audit Logs
    console.log('Seeding audit logs...');
    const auditLogs = [
      [1, 'booking', '2025-10-10 13:45:00', 'CREATE - BookingID: 1'],
      [4, 'booking', '2025-10-15 14:30:00', 'CREATE - BookingID: 2'],
      [7, 'booking', '2025-10-16 15:20:00', 'CREATE - BookingID: 3'],
      [1, 'staff', '2025-10-01 10:00:00', 'CREATE - StaffID: 2'],
      [4, 'guest', '2025-10-12 09:30:00', 'CREATE - GuestID: 5']
    ];
    
    for (const audit of auditLogs) {
      await connection.execute(
        'INSERT INTO AuditLog (StaffID, TableName, ChangedAt, Operation) VALUES (?, ?, ?, ?)',
        audit
      );
    }

    console.log('Database seeding completed successfully!');
    console.log('');
    console.log('Seeded Data Summary:');
    console.log('   • 3 Sky Nest Hotel Branches (Colombo, Kandy, Galle)');
    console.log('   • 2 Designations (Admin: LKR 150,000, Staff: LKR 85,000)');
    console.log('   • 5 Room Types (LKR 12,500 - 70,000 per night)');
    console.log('   • 30 Rooms (10 per branch)');
    console.log('   • 9 Staff Members (3 per branch: 1 Admin + 2 Staff)');
    console.log('   • 12 Services (Sri Lankan breakfast, Ayurvedic spa, cultural tours, etc.)');
    console.log('   • 10 Sample Guests');
    console.log('   • 5 Sample Bookings with rooms assigned');
    console.log('   • Sample service usage, bills, and payments (in LKR)');
    console.log('');
    console.log('Demo Login Credentials:');
    console.log('   Admin (Colombo): admin@colombo.skynest.lk / password123');
    console.log('   Admin (Kandy): admin@kandy.skynest.lk / password123');
    console.log('   Admin (Galle): admin@galle.skynest.lk / password123');
    console.log('   Staff (Colombo): sanduni@colombo.skynest.lk / password123');
    console.log('   Staff (Kandy): tharindu@kandy.skynest.lk / password123');
    console.log('   Staff (Galle): dilini@galle.skynest.lk / password123');

  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };