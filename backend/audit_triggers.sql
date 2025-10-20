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
DROP TRIGGER IF EXISTS bill_after_checkin;
DROP TRIGGER IF EXISTS bill_update_after_service_usage;
DROP TRIGGER IF EXISTS bill_update_after_payment;

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

-- Trigger to set room status to 'available' when booking is checked out
CREATE TRIGGER trg_room_available_on_checkout
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.BookingStatus = 'checked-out' AND OLD.BookingStatus != 'checked-out' THEN
        UPDATE room r
        JOIN bookingRooms br ON r.RoomID = br.RoomID
        SET r.Status = 'available'
        WHERE br.BookingID = NEW.BookingID;
    END IF;
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
CREATE TRIGGER bill_after_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.BookingStatus = 'checked-in' AND OLD.BookingStatus != 'checked-in' THEN
        CALL update_bill_totals(NEW.BookingID);
        -- Audit log for bill generation after check-in
        DECLARE v_bill_id INT;
        SELECT BillID INTO v_bill_id FROM bill WHERE BookingID = NEW.BookingID;
        IF v_bill_id IS NOT NULL THEN
            INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
            VALUES (@current_staff_id, 'bill', CONCAT('GENERATE AFTER CHECKIN - BillID: ', v_bill_id, ' - BookingID: ', NEW.BookingID), NOW());
        END IF;
    END IF;
END$$;


-- Trigger to update bill total amount when service usage is added
CREATE TRIGGER bill_update_after_service_usage
AFTER INSERT ON serviceUsage
FOR EACH ROW
BEGIN
    CALL update_bill_totals(NEW.BookingID);
    -- Audit log for bill update after service usage
    DECLARE v_bill_id INT;
    SELECT BillID INTO v_bill_id FROM bill WHERE BookingID = NEW.BookingID;
    IF v_bill_id IS NOT NULL THEN
        INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
        VALUES (@current_staff_id, 'bill', CONCAT('UPDATE BILL AFTER SERVICE USAGE - BillID: ', v_bill_id, ' - BookingID: ', NEW.BookingID, ' - UsageID: ', NEW.UsageID), NOW());
    END IF;
END;
$$

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
    -- Audit log for bill update after payment
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (@current_staff_id, 'bill', CONCAT('UPDATE BILL AFTER PAYMENT - BillID: ', NEW.BillID, ' - PaymentID: ', NEW.PaymentID, ' - Amount: ', NEW.Amount), NOW());
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
--    - bill_after_checkout: Automatically creates/updates bill when booking status changes to 'checked-out'
--      * Calculates room charges: (CheckOutDate - CheckInDate) × DailyRate for all rooms
--      * Includes all service usage charges at time of checkout
--      * Sets initial total amount (with 0 discount and 0 tax)
--      * Sets bill status to 'pending'
--      * Logs bill generation to AuditLog (not logged elsewhere)
--    
--    - bill_update_after_service_usage: Updates bill when services are added (after bill exists)
--      * Recalculates total service charges for the booking
--      * Updates bill total amount = RoomCharges + ServiceCharges - Discount + Tax
--      * Only fires if bill already exists for the booking
--      * Logs bill update to AuditLog (not logged elsewhere)
--    
--    - bill_update_after_payment: Updates bill status based on payments
--      * Compares total completed payments vs bill total amount
--      * Sets bill status to 'completed' when fully paid (TotalPaid >= TotalAmount)
--      * Sets bill status to 'partially_paid' when partially paid (TotalPaid < TotalAmount)
--      * NOTE: Payment insertion is already logged by payment_after_insert trigger
--      * Does NOT log to AuditLog to avoid duplicate entries
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
--    b) Services can be added during stay (if bill exists, triggers update it)
--    c) Guest checks out (BookingStatus: 'checked-in' → 'checked-out')
--       - bill_after_checkout trigger AUTOMATICALLY:
--         * Calculates room charges: days × daily rate for all rooms
--         * Adds all service usage charges
--         * Creates or updates bill record with status 'pending'
--         * Sets Discount = 0.00, Tax = 0.00 (staff can update manually if needed)
--    d) Staff can manually adjust discount/tax in bill table if needed
--    e) Payment is processed → bill_update_after_payment trigger AUTOMATICALLY:
--         * Updates bill status to 'completed' or 'partially_paid'
--    f) Application marks rooms as 'available' when bill is fully paid and booking is checked-out
-- =============================================
