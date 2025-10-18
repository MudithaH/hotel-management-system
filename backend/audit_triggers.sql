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
DROP TRIGGER IF EXISTS serviceUsage_after_insert;
DROP TRIGGER IF EXISTS serviceUsage_after_update;
DROP TRIGGER IF EXISTS serviceUsage_after_delete;
DROP TRIGGER IF EXISTS room_after_update;

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
    VALUES (NEW.StaffID, 'staff', CONCAT('CREATE - StaffID: ', NEW.StaffID), NOW());
END$$

CREATE TRIGGER staff_after_update
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    -- Log which staff member was updated
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (NEW.StaffID, 'staff', CONCAT('UPDATE - StaffID: ', NEW.StaffID), NOW());
END$$

CREATE TRIGGER staff_after_delete
AFTER DELETE ON staff
FOR EACH ROW
BEGIN
    -- Use a system user ID (0) since the deleted staff can't log their own deletion
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (0, 'staff', CONCAT('DELETE - StaffID: ', OLD.StaffID), NOW());
END$$

-- =============================================
-- GUEST TABLE TRIGGERS
-- =============================================

CREATE TRIGGER guest_after_insert
AFTER INSERT ON guest
FOR EACH ROW
BEGIN
    -- Log guest creation (StaffID should be set by application context if needed)
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'guest', CONCAT('CREATE - GuestID: ', NEW.GuestID), NOW());
END$$

CREATE TRIGGER guest_after_update
AFTER UPDATE ON guest
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'guest', CONCAT('UPDATE - GuestID: ', NEW.GuestID), NOW());
END$$

CREATE TRIGGER guest_after_delete
AFTER DELETE ON guest
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'guest', CONCAT('DELETE - GuestID: ', OLD.GuestID), NOW());
END$$

-- =============================================
-- BOOKING TABLE TRIGGERS
-- =============================================

CREATE TRIGGER booking_after_insert
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'booking', CONCAT('CREATE - BookingID: ', NEW.BookingID), NOW());
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
    VALUES (1, 'booking', operation_type, NOW());
END$$

CREATE TRIGGER booking_after_delete
AFTER DELETE ON booking
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'booking', CONCAT('DELETE - BookingID: ', OLD.BookingID), NOW());
END$$

-- =============================================
-- PAYMENT TABLE TRIGGERS
-- =============================================

CREATE TRIGGER payment_after_insert
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'payment', CONCAT('CREATE - PaymentID: ', NEW.PaymentID, ' - Amount: ', NEW.Amount), NOW());
END$$

-- =============================================
-- SERVICE USAGE TABLE TRIGGERS
-- =============================================

CREATE TRIGGER serviceUsage_after_insert
AFTER INSERT ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'serviceUsage', CONCAT('CREATE - UsageID: ', NEW.UsageID, ' - BookingID: ', NEW.BookingID), NOW());
END$$

CREATE TRIGGER serviceUsage_after_update
AFTER UPDATE ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'serviceUsage', CONCAT('UPDATE - UsageID: ', NEW.UsageID), NOW());
END$$

CREATE TRIGGER serviceUsage_after_delete
AFTER DELETE ON serviceUsage
FOR EACH ROW
BEGIN
    INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
    VALUES (1, 'serviceUsage', CONCAT('DELETE - UsageID: ', OLD.UsageID), NOW());
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
        VALUES (1, 'room', CONCAT('UPDATE - RoomID: ', NEW.RoomID, ' - Status changed from ', OLD.Status, ' to ', NEW.Status), NOW());
    END IF;
END$$

DELIMITER ;

-- =============================================
-- NOTES:
-- =============================================
-- 1. All triggers use StaffID = 1 as a placeholder. In a production system,
--    you might want to use a session variable or application-level context
--    to track which staff member made the change.
--
-- 2. To set the StaffID dynamically, you can use MySQL session variables:
--    SET @current_staff_id = 123;
--    Then reference @current_staff_id in triggers instead of hardcoded 1.
--
-- 3. The staff table triggers use special handling:
--    - INSERT: Uses NEW.StaffID (self-registration)
--    - UPDATE: Uses NEW.StaffID (assumes staff updates themselves)
--    - DELETE: Uses 0 (system user, since staff can't log own deletion)
--
-- 4. For bill generation, no trigger is created since bills are calculated
--    values and the payment trigger already logs financial transactions.
--
-- 5. To improve StaffID tracking, consider creating a stored procedure wrapper:
--    CREATE PROCEDURE SetCurrentStaff(IN staff_id INT)
--    BEGIN
--        SET @current_staff_id = staff_id;
--    END;
--    
--    Then call it from your application before database operations:
--    CALL SetCurrentStaff(123);
--
-- 6. You can query the audit log with:
--    SELECT * FROM AuditLog ORDER BY ChangedAt DESC LIMIT 100;
-- =============================================
