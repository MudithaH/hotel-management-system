-- Hotel Management System - Complete Database Setup
-- Modified for Aiven
-- This file contains only the stored procedures that are actually used by the backend

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS GetRoomOccupancyReport;
DROP PROCEDURE IF EXISTS GetGuestBillingSummary;
DROP PROCEDURE IF EXISTS GetServiceUsageReport;
DROP PROCEDURE IF EXISTS GetMonthlyRevenueReport;
DROP PROCEDURE IF EXISTS GetTopServicesReport;

-- =============================================
-- REPORT STORED PROCEDURES
-- =============================================

DELIMITER //
CREATE PROCEDURE GetRoomOccupancyReport(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_branch_id INT
)
BEGIN
    SELECT 
        hb.BranchID,
        hb.City as BranchCity,
        hb.Address as BranchAddress,
        r.RoomID,
        r.RoomNumber,
        rt.TypeName as RoomType,
        rt.Capacity,
        rt.DailyRate,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM booking bk
                JOIN bookingRooms br ON bk.BookingID = br.BookingID
                WHERE br.RoomID = r.RoomID
                AND bk.BookingStatus IN ('confirmed', 'checked-in')
                AND bk.CheckInDate <= p_end_date
                AND bk.CheckOutDate >= p_start_date
            ) THEN 'Occupied'
            ELSE 'Available'
        END as OccupancyStatus,
        (
            SELECT COUNT(DISTINCT bk.BookingID)
            FROM booking bk
            JOIN bookingRooms br ON bk.BookingID = br.BookingID
            WHERE br.RoomID = r.RoomID
            AND bk.BookingStatus IN ('confirmed', 'checked-in', 'checked-out')
            AND bk.CheckInDate <= p_end_date
            AND bk.CheckOutDate >= p_start_date
        ) as BookingsInPeriod,
        (
            SELECT COALESCE(SUM(DATEDIFF(
                LEAST(bk.CheckOutDate, p_end_date),
                GREATEST(bk.CheckInDate, p_start_date)
            )), 0)
            FROM booking bk
            JOIN bookingRooms br ON bk.BookingID = br.BookingID
            WHERE br.RoomID = r.RoomID
            AND bk.BookingStatus IN ('confirmed', 'checked-in', 'checked-out')
            AND bk.CheckInDate <= p_end_date
            AND bk.CheckOutDate >= p_start_date
        ) as OccupiedDays,
        DATEDIFF(p_end_date, p_start_date) + 1 as TotalDaysInPeriod
    FROM room r
    JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
    JOIN hotelBranch hb ON r.BranchID = hb.BranchID
    WHERE (p_branch_id IS NULL OR r.BranchID = p_branch_id)
    ORDER BY hb.City, r.RoomNumber;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetGuestBillingSummary(
    IN p_branch_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        g.GuestID,
        g.Name as GuestName,
        g.Email,
        g.Phone,
        COUNT(DISTINCT bk.BookingID) as TotalBookings,
        SUM(b.RoomCharges) as TotalRoomCharges,
        SUM(b.ServiceCharges) as TotalServiceCharges,
        SUM(b.TotalAmount) as TotalBillAmount,
        SUM(COALESCE(p.TotalPaid, 0)) as TotalPaidAmount,
        SUM(b.TotalAmount) - SUM(COALESCE(p.TotalPaid, 0)) as UnpaidBalance,
        CASE 
            WHEN SUM(b.TotalAmount) - SUM(COALESCE(p.TotalPaid, 0)) > 0 THEN 'Outstanding'
            ELSE 'Paid'
        END as PaymentStatus,
        MAX(b.BillDate) as LastBillDate
    FROM guest g
    JOIN booking bk ON g.GuestID = bk.GuestID
    JOIN bookingRooms br ON bk.BookingID = br.BookingID
    JOIN room r ON br.RoomID = r.RoomID
    JOIN bill b ON bk.BookingID = b.BookingID
    LEFT JOIN (
        SELECT 
            BillID, 
            SUM(Amount) as TotalPaid
        FROM payment 
        WHERE PaymentStatus = 'completed'
        GROUP BY BillID
    ) p ON b.BillID = p.BillID
    WHERE (p_branch_id IS NULL OR r.BranchID = p_branch_id)
    AND (p_start_date IS NULL OR b.BillDate >= p_start_date)
    AND (p_end_date IS NULL OR b.BillDate <= p_end_date)
    GROUP BY g.GuestID, g.Name, g.Email, g.Phone
    ORDER BY UnpaidBalance DESC, g.Name;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetServiceUsageReport(
    IN p_branch_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        hb.City as BranchCity,
        r.RoomNumber,
        rt.TypeName as RoomType,
        sc.ServiceName,
        sc.Price as ServiceBasePrice,
        COUNT(su.UsageID) as UsageCount,
        SUM(su.Quantity) as TotalQuantity,
        AVG(su.PriceAtUsage) as AveragePrice,
        SUM(su.Quantity * su.PriceAtUsage) as TotalRevenue,
        MIN(su.UsageDate) as FirstUsage,
        MAX(su.UsageDate) as LastUsage
    FROM serviceUsage su
    JOIN serviceCatalogue sc ON su.ServiceID = sc.ServiceID
    JOIN booking bk ON su.BookingID = bk.BookingID
    JOIN bookingRooms br ON bk.BookingID = br.BookingID
    JOIN room r ON br.RoomID = r.RoomID
    JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
    JOIN hotelBranch hb ON r.BranchID = hb.BranchID
    WHERE (p_branch_id IS NULL OR r.BranchID = p_branch_id)
    AND (p_start_date IS NULL OR su.UsageDate >= p_start_date)
    AND (p_end_date IS NULL OR su.UsageDate <= p_end_date)
    GROUP BY hb.BranchID, hb.City, r.RoomID, r.RoomNumber, rt.TypeName, 
             sc.ServiceID, sc.ServiceName, sc.Price
    ORDER BY hb.City, r.RoomNumber, TotalRevenue DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetMonthlyRevenueReport(
    IN p_year INT,
    IN p_branch_id INT
)
BEGIN
    SELECT 
        hb.BranchID,
        hb.City as BranchCity,
        hb.Address as BranchAddress,
        YEAR(b.BillDate) as RevenueYear,
        MONTH(b.BillDate) as RevenueMonth,
        CASE MONTH(ANY_VALUE(b.BillDate))
            WHEN 1 THEN 'January'
            WHEN 2 THEN 'February'
            WHEN 3 THEN 'March'
            WHEN 4 THEN 'April'
            WHEN 5 THEN 'May'
            WHEN 6 THEN 'June'
            WHEN 7 THEN 'July'
            WHEN 8 THEN 'August'
            WHEN 9 THEN 'September'
            WHEN 10 THEN 'October'
            WHEN 11 THEN 'November'
            WHEN 12 THEN 'December'
        END as MonthName,
        COUNT(DISTINCT b.BillID) as TotalBills,
        COUNT(DISTINCT bk.BookingID) as TotalBookings,
        SUM(b.RoomCharges) as RoomRevenue,
        SUM(b.ServiceCharges) as ServiceRevenue,
        SUM(b.TotalAmount) as TotalRevenue,
        AVG(b.TotalAmount) as AverageRevenuePerBooking,
        SUM(COALESCE(p.TotalPaid, 0)) as CollectedRevenue,
        SUM(b.TotalAmount) - SUM(COALESCE(p.TotalPaid, 0)) as OutstandingRevenue
    FROM bill b
    JOIN booking bk ON b.BookingID = bk.BookingID
    JOIN bookingRooms br ON bk.BookingID = br.BookingID
    JOIN room r ON br.RoomID = r.RoomID
    JOIN hotelBranch hb ON r.BranchID = hb.BranchID
    LEFT JOIN (
        SELECT 
            BillID, 
            SUM(Amount) as TotalPaid
        FROM payment 
        WHERE PaymentStatus = 'completed'
        GROUP BY BillID
    ) p ON b.BillID = p.BillID
    WHERE (p_year IS NULL OR YEAR(b.BillDate) = p_year)
    AND (p_branch_id IS NULL OR hb.BranchID = p_branch_id)
    GROUP BY hb.BranchID, hb.City, hb.Address, YEAR(b.BillDate), MONTH(b.BillDate)
    ORDER BY hb.City, YEAR(b.BillDate) DESC, MONTH(b.BillDate) DESC;
END //
DELIMITER ;

DELIMITER //
CREATE PROCEDURE GetTopServicesReport(
    IN p_branch_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_limit INT
)
BEGIN
    DECLARE v_limit INT DEFAULT 10;
    
    IF p_limit IS NOT NULL AND p_limit > 0 THEN
        SET v_limit = p_limit;
    END IF;
    
    SELECT 
        sc.ServiceID,
        sc.ServiceName,
        sc.Price as BasePrice,
        COUNT(su.UsageID) as TotalUsages,
        SUM(su.Quantity) as TotalQuantity,
        COUNT(DISTINCT su.BookingID) as UniqueBookings,
        COUNT(DISTINCT g.GuestID) as UniqueGuests,
        SUM(su.Quantity * su.PriceAtUsage) as TotalRevenue,
        AVG(su.PriceAtUsage) as AveragePrice,
        (COUNT(su.UsageID) * 100.0 / 
            (SELECT COUNT(*) FROM serviceUsage su2 
             JOIN booking bk2 ON su2.BookingID = bk2.BookingID
             JOIN bookingRooms br2 ON bk2.BookingID = br2.BookingID
             JOIN room r2 ON br2.RoomID = r2.RoomID
             WHERE (p_branch_id IS NULL OR r2.BranchID = p_branch_id)
             AND (p_start_date IS NULL OR su2.UsageDate >= p_start_date)
             AND (p_end_date IS NULL OR su2.UsageDate <= p_end_date)
            )
        ) as UsagePercentage,
        CASE 
            WHEN COUNT(su.UsageID) >= (
                SELECT AVG(service_count) * 2 
                FROM (
                    SELECT COUNT(su3.UsageID) as service_count
                    FROM serviceUsage su3
                    JOIN booking bk3 ON su3.BookingID = bk3.BookingID
                    JOIN bookingRooms br3 ON bk3.BookingID = br3.BookingID
                    JOIN room r3 ON br3.RoomID = r3.RoomID
                    WHERE (p_branch_id IS NULL OR r3.BranchID = p_branch_id)
                    AND (p_start_date IS NULL OR su3.UsageDate >= p_start_date)
                    AND (p_end_date IS NULL OR su3.UsageDate <= p_end_date)
                    GROUP BY su3.ServiceID
                ) as avg_calc
            ) THEN 'High Demand'
            WHEN COUNT(su.UsageID) >= (
                SELECT AVG(service_count) 
                FROM (
                    SELECT COUNT(su3.UsageID) as service_count
                    FROM serviceUsage su3
                    JOIN booking bk3 ON su3.BookingID = bk3.BookingID
                    JOIN bookingRooms br3 ON bk3.BookingID = br3.BookingID
                    JOIN room r3 ON br3.RoomID = r3.RoomID
                    WHERE (p_branch_id IS NULL OR r3.BranchID = p_branch_id)
                    AND (p_start_date IS NULL OR su3.UsageDate >= p_start_date)
                    AND (p_end_date IS NULL OR su3.UsageDate <= p_end_date)
                    GROUP BY su3.ServiceID
                ) as avg_calc
            ) THEN 'Medium Demand'
            ELSE 'Low Demand'
        END as DemandLevel
    FROM serviceCatalogue sc
    LEFT JOIN serviceUsage su ON sc.ServiceID = su.ServiceID
    LEFT JOIN booking bk ON su.BookingID = bk.BookingID
    LEFT JOIN bookingRooms br ON bk.BookingID = br.BookingID
    LEFT JOIN room r ON br.RoomID = r.RoomID
    LEFT JOIN guest g ON bk.GuestID = g.GuestID
    WHERE (p_branch_id IS NULL OR r.BranchID = p_branch_id OR su.UsageID IS NULL)
    AND (p_start_date IS NULL OR su.UsageDate >= p_start_date OR su.UsageID IS NULL)
    AND (p_end_date IS NULL OR su.UsageDate <= p_end_date OR su.UsageID IS NULL)
    GROUP BY sc.ServiceID, sc.ServiceName, sc.Price
    ORDER BY TotalUsages DESC, TotalRevenue DESC
    LIMIT v_limit;
END //
DELIMITER ;

-- =============================================
-- PERFORMANCE INDEXES (Essential Only)
-- =============================================

CREATE INDEX idx_bill_date ON bill(BillDate);
CREATE INDEX idx_booking_dates ON booking(CheckInDate, CheckOutDate);
CREATE INDEX idx_room_status ON room(Status);
