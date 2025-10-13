/**
 * Database Seeding Script
 * Populates the database with sample data for testing and demonstration
 */

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
    console.log('🌱 Starting database seeding...');
    
    // Create database connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Clear existing data (in correct order to avoid foreign key constraints)
    console.log('🧹 Clearing existing data...');
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
      [1, 'Downtown Hotel Branch', 'New York', '(555) 123-4567', 'branch1@hotel.com'],
      [2, 'Airport Hotel Branch', 'Los Angeles', '(555) 234-5678', 'branch2@hotel.com'],
      [3, 'Beach Resort Branch', 'Miami', '(555) 345-6789', 'branch3@hotel.com']
    ];
    
    for (const branch of branches) {
      await connection.execute(
        'INSERT INTO hotelBranch (BranchID, Address, City, Phone, Email) VALUES (?, ?, ?, ?, ?)',
        branch
      );
    }

    // 2. Insert Designations
    console.log('💼 Seeding designations...');
    const designations = [
      [1, 'Admin', 75000.00],
      [2, 'Staff', 45000.00]
    ];
    
    for (const designation of designations) {
      await connection.execute(
        'INSERT INTO designation (DesignationID, Designation, Salary) VALUES (?, ?, ?)',
        designation
      );
    }

    // 3. Insert Room Types
    console.log('🛏️ Seeding room types...');
    const roomTypes = [
      [1, 'Standard Single', 1, 89.99, 'Single bed, private bathroom, Wi-Fi, TV'],
      [2, 'Standard Double', 2, 129.99, 'Double bed, private bathroom, Wi-Fi, TV, mini-fridge'],
      [3, 'Deluxe Suite', 4, 249.99, 'King bed, living area, private bathroom, Wi-Fi, TV, mini-bar, balcony'],
      [4, 'Presidential Suite', 6, 499.99, 'Master bedroom, separate living room, kitchenette, jacuzzi, private terrace'],
      [5, 'Family Room', 4, 179.99, 'Two double beds, private bathroom, Wi-Fi, TV, mini-fridge, sofa bed']
    ];
    
    for (const roomType of roomTypes) {
      await connection.execute(
        'INSERT INTO roomType (RoomTypeID, TypeName, Capacity, DailyRate, Amenities) VALUES (?, ?, ?, ?, ?)',
        roomType
      );
    }

    // 4. Insert Service Catalogue
    console.log('🛎️ Seeding services...');
    const services = [
      [1, 'Room Service - Breakfast', 25.99],
      [2, 'Room Service - Lunch', 35.99],
      [3, 'Room Service - Dinner', 45.99],
      [4, 'Laundry Service', 15.99],
      [5, 'Spa Treatment', 89.99],
      [6, 'Airport Transfer', 49.99],
      [7, 'City Tour', 79.99],
      [8, 'Wi-Fi Premium', 9.99],
      [9, 'Late Checkout', 29.99],
      [10, 'Extra Towels', 5.99]
    ];
    
    for (const service of services) {
      await connection.execute(
        'INSERT INTO serviceCatalogue (ServiceID, ServiceName, Price) VALUES (?, ?, ?)',
        service
      );
    }

    // 5. Insert Staff (1 admin per branch + additional staff)
    console.log('👥 Seeding staff members...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const staff = [
      // Branch 1 (New York)
      [1, hashedPassword, 1, 1, 'John Admin', 'A123456789', 'admin@branch1.com', '(555) 111-0001'],
      [2, hashedPassword, 1, 2, 'Sarah Johnson', 'S123456789', 'sarah@branch1.com', '(555) 111-0002'],
      [3, hashedPassword, 1, 2, 'Mike Wilson', 'M123456789', 'mike@branch1.com', '(555) 111-0003'],
      
      // Branch 2 (Los Angeles)  
      [4, hashedPassword, 2, 1, 'Lisa Admin', 'L123456789', 'admin@branch2.com', '(555) 222-0001'],
      [5, hashedPassword, 2, 2, 'David Brown', 'D123456789', 'david@branch2.com', '(555) 222-0002'],
      [6, hashedPassword, 2, 2, 'Emma Davis', 'E123456789', 'emma@branch2.com', '(555) 222-0003'],
      
      // Branch 3 (Miami)
      [7, hashedPassword, 3, 1, 'Carlos Admin', 'C123456789', 'admin@branch3.com', '(555) 333-0001'],
      [8, hashedPassword, 3, 2, 'Maria Garcia', 'MG123456789', 'maria@branch3.com', '(555) 333-0002'],
      [9, hashedPassword, 3, 2, 'James Lee', 'J123456789', 'james@branch3.com', '(555) 333-0003']
    ];
    
    for (const staffMember of staff) {
      await connection.execute(
        'INSERT INTO staff (StaffID, HashedPassword, BranchID, DesignationID, Name, NIC, Email, Phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        staffMember
      );
    }

    // 6. Insert Rooms (10 rooms per branch)
    console.log('🏠 Seeding rooms...');
    let roomId = 1;
    for (let branchId = 1; branchId <= 3; branchId++) {
      // 2 rooms of each type per branch
      for (let roomTypeId = 1; roomTypeId <= 5; roomTypeId++) {
        for (let i = 1; i <= 2; i++) {
          const roomNumber = `${roomTypeId}0${i}`;
          await connection.execute(
            'INSERT INTO room (RoomID, BranchID, RoomTypeID, RoomNumber, Status) VALUES (?, ?, ?, ?, ?)',
            [roomId++, branchId, roomTypeId, roomNumber, 'available']
          );
        }
      }
    }

    // 7. Insert Sample Guests
    console.log('👤 Seeding guests...');
    const guests = [
      [1, 'Alice Smith', 'alice.smith@email.com', '(555) 401-0001'],
      [2, 'Bob Johnson', 'bob.johnson@email.com', '(555) 401-0002'],
      [3, 'Carol Williams', 'carol.williams@email.com', '(555) 401-0003'],
      [4, 'Daniel Brown', 'daniel.brown@email.com', '(555) 401-0004'],
      [5, 'Eva Davis', 'eva.davis@email.com', '(555) 401-0005'],
      [6, 'Frank Miller', 'frank.miller@email.com', '(555) 401-0006'],
      [7, 'Grace Wilson', 'grace.wilson@email.com', '(555) 401-0007'],
      [8, 'Henry Taylor', 'henry.taylor@email.com', '(555) 401-0008'],
      [9, 'Ivy Anderson', 'ivy.anderson@email.com', '(555) 401-0009'],
      [10, 'Jack Thomas', 'jack.thomas@email.com', '(555) 401-0010']
    ];
    
    for (const guest of guests) {
      await connection.execute(
        'INSERT INTO guest (GuestID, Name, Email, Phone) VALUES (?, ?, ?, ?)',
        guest
      );
    }

    // 8. Insert Sample Bookings
    console.log('📅 Seeding bookings...');
    const bookings = [
      [1, 1, '2024-03-15 14:00:00', '2024-03-18 11:00:00', 'confirmed'],
      [2, 2, '2024-03-16 15:00:00', '2024-03-20 11:00:00', 'checked-in'],
      [3, 3, '2024-03-17 14:00:00', '2024-03-19 11:00:00', 'confirmed'],
      [4, 4, '2024-03-18 16:00:00', '2024-03-22 11:00:00', 'confirmed'],
      [5, 5, '2024-03-19 14:00:00', '2024-03-21 11:00:00', 'confirmed']
    ];
    
    for (const booking of bookings) {
      await connection.execute(
        'INSERT INTO booking (BookingID, GuestID, CheckInDate, CheckOutDate, BookingStatus) VALUES (?, ?, ?, ?, ?)',
        booking
      );
    }

    // 9. Insert Booking Rooms (assign rooms to bookings)
    console.log('🔗 Seeding booking-room assignments...');
    const bookingRooms = [
      [1, 1, 1],  // Booking 1 -> Room 1
      [2, 2, 11], // Booking 2 -> Room 11 (Branch 2)
      [3, 3, 21], // Booking 3 -> Room 21 (Branch 3)
      [4, 4, 2],  // Booking 4 -> Room 2
      [5, 5, 12]  // Booking 5 -> Room 12
    ];
    
    // Update room status to occupied for assigned rooms
    for (const bookingRoom of bookingRooms) {
      await connection.execute(
        'INSERT INTO bookingRooms (BookingRoomID, BookingID, RoomID) VALUES (?, ?, ?)',
        bookingRoom
      );
      
      await connection.execute(
        'UPDATE room SET Status = ? WHERE RoomID = ?',
        ['occupied', bookingRoom[2]]
      );
    }

    // 10. Insert Sample Service Usage
    console.log('🍽️ Seeding service usage...');
    const serviceUsages = [
      [1, 1, 1, '2024-03-16', 2, 25.99], // Breakfast for booking 1
      [2, 1, 4, '2024-03-16', 1, 15.99], // Laundry for booking 1
      [3, 2, 2, '2024-03-17', 1, 35.99], // Lunch for booking 2
      [4, 2, 5, '2024-03-17', 1, 89.99], // Spa for booking 2
      [5, 3, 1, '2024-03-18', 1, 25.99]  // Breakfast for booking 3
    ];
    
    for (const usage of serviceUsages) {
      await connection.execute(
        'INSERT INTO serviceUsage (UsageID, BookingID, ServiceID, UsageDate, Quantity, PriceAtUsage) VALUES (?, ?, ?, ?, ?, ?)',
        usage
      );
    }

    // 11. Insert Sample Bills
    console.log('💰 Seeding bills...');
    const bills = [
      [1, 1, 269.97, 41.98, 0.00, 31.20, 343.15], // Booking 1: 3 nights * 89.99 + services
      [2, 2, 519.96, 125.98, 0.00, 64.59, 709.53], // Booking 2: 4 nights * 129.99 + services
      [3, 3, 499.98, 25.99, 0.00, 52.60, 578.57]   // Booking 3: 2 nights * 249.99 + services
    ];
    
    for (const bill of bills) {
      await connection.execute(
        'INSERT INTO bill (BillID, BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        bill
      );
    }

    // 12. Insert Sample Payments (using BookingID since table has that structure)
    console.log('💳 Seeding payments...');
    const payments = [
      [1, 1, 1, 343.15, 'credit_card', '2024-03-18 10:30:00', 'completed'],
      [2, 2, 4, 709.53, 'cash', '2024-03-17 09:15:00', 'completed'],
      [3, 3, 7, 578.57, 'credit_card', '2024-03-19 11:45:00', 'pending']
    ];
    
    for (const payment of payments) {
      await connection.execute(
        'INSERT INTO payment (PaymentID, BookingID, StaffID, Amount, PaymentMethod, PaymentDate, PaymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
        payment
      );
    }

    // 13. Insert Sample Audit Logs
    console.log('📋 Seeding audit logs...');
    const auditLogs = [
      [1, 1, 'booking', '2024-03-15 13:45:00', 'CREATE - BookingID: 1'],
      [2, 4, 'booking', '2024-03-16 14:30:00', 'CREATE - BookingID: 2'],
      [3, 7, 'booking', '2024-03-17 15:20:00', 'CREATE - BookingID: 3'],
      [4, 1, 'staff', '2024-03-15 10:00:00', 'CREATE - StaffID: 2'],
      [5, 4, 'guest', '2024-03-16 09:30:00', 'CREATE - GuestID: 5']
    ];
    
    for (const audit of auditLogs) {
      await connection.execute(
        'INSERT INTO AuditLog (AuditID, StaffID, TableName, ChangedAt, Operation) VALUES (?, ?, ?, ?, ?)',
        audit
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Seeded Data Summary:');
    console.log('   • 3 Hotel Branches (New York, Los Angeles, Miami)');
    console.log('   • 4 Designations (Admin, Staff, Manager, Receptionist)');
    console.log('   • 5 Room Types (Standard Single, Double, Deluxe Suite, Presidential Suite, Family Room)');
    console.log('   • 30 Rooms (10 per branch)');
    console.log('   • 9 Staff Members (3 per branch: 1 Admin + 2 Staff)');
    console.log('   • 10 Services (Room service, Laundry, Spa, etc.)');
    console.log('   • 10 Sample Guests');
    console.log('   • 5 Sample Bookings with rooms assigned');
    console.log('   • Sample service usage, bills, and payments');
    console.log('');
    console.log('🔑 Demo Login Credentials:');
    console.log('   Admin (Branch 1): admin@branch1.com / password123');
    console.log('   Admin (Branch 2): admin@branch2.com / password123');
    console.log('   Admin (Branch 3): admin@branch3.com / password123');
    console.log('   Staff (Branch 1): sarah@branch1.com / password123');
    console.log('   Staff (Branch 2): david@branch2.com / password123');
    console.log('   Staff (Branch 3): maria@branch3.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
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
      console.log('🎉 Seeding process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };