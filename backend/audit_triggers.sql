-- run this file only after running seed.js

-- =============================================
-- AUDIT TRIGGERS FOR HOTEL MANAGEMENT SYSTEM
-- =============================================
-- This file contains database triggers to automatically log
-- data changes to the AuditLog table without application code.
--
-- Usage: Run this file after setting up the main schema.
-- Command: SOURCE audit_triggers.sql; (from MySQL CLI)
--
-- Tables monitored:
-- - staff (INSERT, UPDATE, DELETE)
-- - guest (INSERT, UPDATE, DELETE)
-- - booking (INSERT, UPDATE, DELETE)
-- - payment (INSERT, UPDATE, DELETE)
-- - serviceUsage (INSERT, UPDATE, DELETE)
-- - room (UPDATE - status changes)
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS staff_after_insert;
DROP TRIGGER IF EXISTS staff_after_update;
DROP TRIGGER IF EXISTS staff_after_delete;
DROP TRIGGER IF EXISTS guest_after_insert;
DROP TRIGGER IF EXISTS guest_after_update;
DROP TRIGGER IF EXISTS guest_after_delete;
DROP TRIGGER IF EXISTS booking_after_insert;
DROP TRIGGER IF EXISTS booking_after_update;
DROP TRIGGER IF EXISTS booking_after_delete;
DROP TRIGGER IF EXISTS payment_after_insert;
DROP TRIGGER IF EXISTS payment_after_update;
DROP TRIGGER IF EXISTS payment_after_delete;
DROP TRIGGER IF EXISTS serviceUsage_after_insert;
DROP TRIGGER IF EXISTS serviceUsage_after_update;
DROP TRIGGER IF EXISTS serviceUsage_after_delete;
DROP TRIGGER IF EXISTS room_after_update;
DROP TRIGGER IF EXISTS bill_after_insert;
DROP TRIGGER IF EXISTS bill_before_update;

-- =============================================
-- STAFF TABLE TRIGGERS
-- =============================================

DELIMITER $$

CREATE TRIGGER staff_after_insert
AFTER INSERT ON staff
FOR EACH ROW
BEGIN
    -- Use a system user ID (0) or the new staff's own ID for self-registration
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'staff', CONCAT('CREATE - StaffID: ', NEW.StaffID), NOW());
END$$

CREATE TRIGGER staff_after_update
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    -- Log which staff member was updated
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'staff', CONCAT('UPDATE - StaffID: ', NEW.StaffID), NOW());
END$$

CREATE TRIGGER staff_after_delete
AFTER DELETE ON staff
FOR EACH ROW
BEGIN
    -- Use a system user ID (0) since the deleted staff can't log their own deletion
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'staff', CONCAT('DELETE - StaffID: ', OLD.StaffID), NOW());
END$$

-- =============================================
-- GUEST TABLE TRIGGERS
-- =============================================

CREATE TRIGGER guest_after_insert
AFTER INSERT ON guest
FOR EACH ROW
BEGIN
    -- Log guest creation using session variable for StaffID
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'guest', CONCAT('CREATE - GuestID: ', NEW.GuestID), NOW());
END$$

CREATE TRIGGER guest_after_update
AFTER UPDATE ON guest
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'guest', CONCAT('UPDATE - GuestID: ', NEW.GuestID), NOW());
END$$

CREATE TRIGGER guest_after_delete
AFTER DELETE ON guest
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'guest', CONCAT('DELETE - GuestID: ', OLD.GuestID), NOW());
END$$

-- =============================================
-- BOOKINGROOMS TABLE TRIGGERS
-- =============================================

CREATE TRIGGER trg_room_occupied
AFTER INSERT ON bookingRooms
FOR EACH ROW
BEGIN
    UPDATE room
    SET Status = 'occupied'
    WHERE RoomID = NEW.RoomID;
END; $$

-- =============================================
-- BOOKING TABLE TRIGGERS
-- =============================================

CREATE TRIGGER booking_after_insert
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'booking', CONCAT('CREATE - BookingID: ', NEW.BookingID), NOW());
END$$

CREATE TRIGGER booking_after_update
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    -- Detect the type of update based on status change
    DECLARE operation_type VARCHAR(255);
    
    IF OLD.BookingStatus != NEW.BookingStatus THEN
        CASE NEW.BookingStatus
            WHEN 'checked-in' THEN
                SET operation_type = CONCAT('CHECK-IN - BookingID: ', NEW.BookingID);
            WHEN 'checked-out' THEN
                SET operation_type = CONCAT('CHECK-OUT - BookingID: ', NEW.BookingID);
            WHEN 'cancelled' THEN
                SET operation_type = CONCAT('CANCEL - BookingID: ', NEW.BookingID);
            ELSE
                SET operation_type = CONCAT('UPDATE - BookingID: ', NEW.BookingID, ' - Status: ', NEW.BookingStatus);
        END CASE;
    ELSE
        SET operation_type = CONCAT('UPDATE - BookingID: ', NEW.BookingID);
    END IF;
    
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'booking', operation_type, NOW());
END$$

CREATE TRIGGER booking_after_delete
AFTER DELETE ON booking
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'booking', CONCAT('DELETE - BookingID: ', OLD.BookingID), NOW());
END$$

-- =============================================
-- PAYMENT TABLE TRIGGERS
-- =============================================

CREATE TRIGGER payment_after_insert
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'payment', CONCAT('CREATE - PaymentID: ', NEW.PaymentID, ' - Amount: ', NEW.Amount), NOW());
END$$

CREATE TRIGGER payment_after_update
AFTER UPDATE ON payment
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'payment', CONCAT('UPDATE - PaymentID: ', NEW.PaymentID, ' - Amount: ', NEW.Amount), NOW());
END$$

CREATE TRIGGER payment_after_delete
AFTER DELETE ON payment
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'payment', CONCAT('DELETE - PaymentID: ', OLD.PaymentID, ' - Amount: ', OLD.Amount), NOW());
END$$

-- =============================================
-- SERVICE USAGE TABLE TRIGGERS
-- =============================================

CREATE TRIGGER serviceUsage_after_insert
AFTER INSERT ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'serviceUsage', CONCAT('CREATE - UsageID: ', NEW.UsageID, ' - BookingID: ', NEW.BookingID), NOW());
END$$

CREATE TRIGGER serviceUsage_after_update
AFTER UPDATE ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'serviceUsage', CONCAT('UPDATE - UsageID: ', NEW.UsageID), NOW());
END$$

CREATE TRIGGER serviceUsage_after_delete
AFTER DELETE ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'serviceUsage', CONCAT('DELETE - UsageID: ', OLD.UsageID), NOW());
END$$

-- =============================================
-- ROOM TABLE TRIGGERS
-- =============================================

CREATE TRIGGER room_after_update
AFTER UPDATE ON room
FOR EACH ROW
BEGIN
    -- Only log status changes for rooms
    IF OLD.Status != NEW.Status THEN
        INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
        VALUES (@current_staff_id, 'room', CONCAT('UPDATE - RoomID: ', NEW.RoomID, ' - Status changed from ', OLD.Status, ' to ', NEW.Status), NOW());
    END IF;
END$$

-- =============================================
-- BILL TABLE TRIGGERS
-- =============================================

-- Trigger to calculate initial room charges when booking is checked in
CREATE TRIGGER bill_after_checki
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE v_days INT;
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_service_charges DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_bill_exists INT;
    
    -- Only proceed if status changed to 'checked-in'
    IF NEW.BookingStatus = 'checked-in' AND OLD.BookingStatus != 'checked-in' THEN
        
        -- Check if bill already exists
        SELECT COUNT(*) INTO v_bill_exists
        FROM bill
        WHERE BookingID = NEW.BookingID;
        
        -- Calculate number of days
        SET v_days = DATEDIFF(NEW.CheckOutDate, NEW.CheckInDate);
        
        -- Calculate room charges (sum of all rooms' daily rates * number of days)
        SELECT COALESCE(SUM(rt.DailyRate * v_days), 0) INTO v_room_charges
        FROM bookingRooms br
        JOIN room r ON br.RoomID = r.RoomID
        JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
        WHERE br.BookingID = NEW.BookingID;
        
        -- Calculate service charges
        SELECT COALESCE(SUM(Quantity * PriceAtUsage), 0) INTO v_service_charges
        FROM serviceUsage
        WHERE BookingID = NEW.BookingID;
        
        -- Calculate total (no discount or tax applied automatically)
        SET v_total_amount = v_room_charges + v_service_charges;
        
        -- Insert or update bill
        IF v_bill_exists > 0 THEN
            UPDATE bill 
            SET RoomCharges = v_room_charges,
                ServiceCharges = v_service_charges,
                TotalAmount = v_total_amount,
                BillStatus = 'pending'
            WHERE BookingID = NEW.BookingID;
        ELSE
            INSERT INTO bill (BookingID, RoomCharges, ServiceCharges, Discount, Tax, TotalAmount, BillStatus)
            VALUES (NEW.BookingID, v_room_charges, v_service_charges, 0.00, 0.00, v_total_amount, 'pending');
        END IF;
    END IF;
END$$

-- Trigger to update bill total amount when service usage is added
CREATE TRIGGER bill_update_after_service_usage
AFTER INSERT ON serviceUsage
FOR EACH ROW
BEGIN
    DECLARE v_service_charges DECIMAL(10,2);
    DECLARE v_room_charges DECIMAL(10,2);
    DECLARE v_discount DECIMAL(10,2);
    DECLARE v_tax DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    
    -- Check if bill exists for this booking
    IF EXISTS (SELECT 1 FROM bill WHERE BookingID = NEW.BookingID) THEN
        
        -- Get current bill values
        SELECT RoomCharges, Discount, Tax INTO v_room_charges, v_discount, v_tax
        FROM bill
        WHERE BookingID = NEW.BookingID;
        
        -- Calculate new service charges
        SELECT COALESCE(SUM(Quantity * PriceAtUsage), 0) INTO v_service_charges
        FROM serviceUsage
        WHERE BookingID = NEW.BookingID;
        
        -- Calculate new total amount
        SET v_total_amount = v_room_charges + v_service_charges - v_discount + v_tax;
        
        -- Update bill
        UPDATE bill
        SET ServiceCharges = v_service_charges,
            TotalAmount = v_total_amount
        WHERE BookingID = NEW.BookingID;
    END IF;
END$$

-- Trigger to update bill total amount when payment is made
CREATE TRIGGER bill_update_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    
    -- Get total amount from bill
    SELECT TotalAmount INTO v_total_amount
    FROM bill
    WHERE BillID = NEW.BillID;
    
    -- Calculate total paid
    SELECT COALESCE(SUM(Amount), 0) INTO v_total_paid
    FROM payment
    WHERE BillID = NEW.BillID
    AND PaymentStatus = 'completed';
    
    -- Update bill status based on payment
    IF v_total_paid >= v_total_amount THEN
        UPDATE bill
        SET BillStatus = 'completed'
        WHERE BillID = NEW.BillID;
    ELSE
        UPDATE bill
        SET BillStatus = 'partially_paid'
        WHERE BillID = NEW.BillID;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- NOTES:
-- =============================================
-- 1. All triggers use @current_staff_id session variable to dynamically track
--    which staff member made the change. The application sets this variable
--    automatically via the authentication middleware.
--    To set from application: SET @current_staff_id = 123;
--
-- 2. The StaffID in AuditLog is nullable (as of the foreign key fix).
--    - This allows @current_staff_id to be NULL for system operations
--    - This allows staff deletion while preserving audit history (ON DELETE SET NULL)
--    - Query audit logs with LEFT JOIN to handle deleted staff
--
-- 3. The staff table triggers use special handling:
--    - INSERT: Uses NEW.StaffID (self-registration)
--    - UPDATE: Uses NEW.StaffID (assumes staff updates themselves)
--    - DELETE: Uses 0 (system user, since staff can't log own deletion)
--
-- 4. BILL CALCULATION TRIGGERS:
--    - bill_after_checkin: Automatically creates/updates bill when booking status changes to 'checked-in'
--      * Calculates room charges: (CheckOutDate - CheckInDate) × DailyRate for all rooms
--      * Includes all service usage charges
--      * Sets initial total amount (without discount/tax)
--    
--    - bill_update_after_service_usage: Updates bill when services are added
--      * Recalculates service charges total
--      * Updates bill total amount automatically
--    
--    - bill_update_after_payment: Updates bill status based on payments
--      * Compares total paid vs total amount
--      * Sets bill status to 'completed' when fully paid
--      * Sets bill status to 'partially_paid' when partially paid
--
-- 5. To use the session variable in your application, execute before operations:
--    SET @current_staff_id = <logged_in_staff_id>;
--    
--    Example in Node.js:
--    await connection.query('SET @current_staff_id = ?', [req.user.staffId]);
--    await connection.query('INSERT INTO guest ...');
--
-- 6. You can query the audit log with:
--    SELECT 
--      al.*,
--      COALESCE(s.Name, '[Deleted Staff]') as StaffName
--    FROM AuditLog al
--    LEFT JOIN staff s ON al.StaffID = s.StaffID
--    ORDER BY al.ChangedAt DESC LIMIT 100;
--
-- 7. BILLING WORKFLOW:
--    a) Guest checks in (BookingStatus: 'confirmed' → 'checked-in')
--    b) Services can be added during stay (triggers update bill if exists)
--    c) Guest checks out (BookingStatus: 'checked-in' → 'checked-out')
--       - bill_after_checkout trigger automatically:
--         * Calculates room charges based on stay duration
--         * Adds service charges
--         * Creates/updates bill record
--    d) Staff can manually adjust discount/tax if needed
--    e) Payment is processed (triggers update bill status)
-- =============================================
