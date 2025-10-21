USE hotel_management;
-- run this file only after running seed.js
ALTER TABLE AuditLog MODIFY COLUMN Operation VARCHAR(500) NOT NULL;


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
DROP TRIGGER IF EXISTS trg_room_occupied;
DROP TRIGGER IF EXISTS trg_room_available_on_checkout;
DROP TRIGGER IF EXISTS bill_after_checkin;
DROP TRIGGER IF EXISTS bill_update_after_service_usage;
DROP TRIGGER IF EXISTS bill_update_after_payment;


-- STAFF TABLE TRIGGERS


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


-- GUEST TABLE TRIGGERS


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


-- BOOKINGROOMS TABLE TRIGGERS


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


-- BOOKING TABLE TRIGGERS


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


-- PAYMENT TABLE TRIGGERS


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


-- SERVICE USAGE TABLE TRIGGERS


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


-- ROOM TABLE TRIGGERS


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


-- BILL TABLE TRIGGERS


-- Trigger to calculate initial room charges when booking is checked in
CREATE TRIGGER bill_after_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE v_bill_id INT;
    DECLARE v_has_rooms INT DEFAULT 0;
    IF NEW.BookingStatus = 'checked-in' AND OLD.BookingStatus != 'checked-in' THEN
        -- Only calculate/update bill if booking has rooms attached
        SELECT COUNT(*) INTO v_has_rooms FROM bookingRooms WHERE BookingID = NEW.BookingID;
        IF v_has_rooms > 0 THEN
            CALL update_bill_totals(NEW.BookingID);
            -- Audit log for bill generation after check-in
            SELECT BillID INTO v_bill_id FROM bill WHERE BookingID = NEW.BookingID;
            IF v_bill_id IS NOT NULL THEN
                INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
                VALUES (@current_staff_id, 'bill', CONCAT('GENERATE AFTER CHECKIN - BillID: ', v_bill_id, ' - BookingID: ', NEW.BookingID), NOW());
            END IF;
        END IF;
    END IF;
END$$


-- Trigger to update bill total amount when service usage is added
CREATE TRIGGER bill_update_after_service_usage
AFTER INSERT ON serviceUsage
FOR EACH ROW
BEGIN
    DECLARE v_bill_id INT;
    CALL update_bill_totals(NEW.BookingID);
    -- Audit log for bill update after service usage
    SELECT BillID INTO v_bill_id FROM bill WHERE BookingID = NEW.BookingID;
    IF v_bill_id IS NOT NULL THEN
        INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
        VALUES (
            @current_staff_id,
            'bill',
            CONCAT('SERVICE USAGE - BillID:', v_bill_id, ' BookID:', NEW.BookingID, ' UsageID:', NEW.UsageID),
            NOW()
        );
    END IF;
END$$

-- Trigger to update bill total amount when payment is made
DELIMITER $$

CREATE TRIGGER bill_update_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    DECLARE v_total_paid DECIMAL(10,2);
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_new_status VARCHAR(20);

    -- Get total amount from bill
    SELECT TotalAmount INTO v_total_amount
    FROM bill
    WHERE BillID = NEW.BillID;

    IF v_total_amount IS NOT NULL THEN
        -- Calculate total paid (only completed payments)
        SELECT COALESCE(SUM(Amount), 0) INTO v_total_paid
        FROM payment
        WHERE BillID = NEW.BillID
          AND PaymentStatus = 'completed';

        -- Determine new status
        IF v_total_paid >= v_total_amount THEN
            SET v_new_status = 'paid';
        ELSEIF v_total_paid < v_total_amount THEN
            SET v_new_status = 'partially_paid';
        END IF;

        -- Update bill
        UPDATE bill
        SET BillStatus = v_new_status
        WHERE BillID = NEW.BillID;

        -- Optional: Log the update
        INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
        VALUES (
            @current_staff_id,
            'bill',
            CONCAT('PAYMENT APPLIED - BillID:', NEW.BillID, 
                   ' PayID:', NEW.PaymentID, 
                   ' Amt:', NEW.Amount, 
                   ' Status:', v_new_status),
            NOW()
        );
    END IF;
END$$

DELIMITER ;
