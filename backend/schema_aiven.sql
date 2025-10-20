-- Hotel Management System Database Schema
-- Modified for Aiven (using existing defaultdb database)

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `bill`;
DROP TABLE IF EXISTS `bookingRooms`;
DROP TABLE IF EXISTS `room`;
DROP TABLE IF EXISTS `serviceUsage`;
DROP TABLE IF EXISTS `serviceCatalogue`;
DROP TABLE IF EXISTS `booking`;
DROP TABLE IF EXISTS `AuditLog`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `hotelBranch`;
DROP TABLE IF EXISTS `designation`;
DROP TABLE IF EXISTS `guest`;
DROP TABLE IF EXISTS `roomType`;

CREATE TABLE `roomType` (
  `RoomTypeID` int AUTO_INCREMENT,
  `TypeName` varchar(50) NOT NULL,
  `Capacity` int NOT NULL,
  `DailyRate` decimal(10,2) NOT NULL,
  `Amenities` text(65535),
  PRIMARY KEY (`RoomTypeID`)
);

CREATE TABLE `guest` (
  `GuestID` int AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL UNIQUE,
  `Phone` varchar(20) NOT NULL,
  PRIMARY KEY (`GuestID`)
);

CREATE TABLE `designation` (
  `DesignationID` int AUTO_INCREMENT,
  `Designation` varchar(100) NOT NULL,
  `Salary` decimal(10,2) NOT NULL,
  PRIMARY KEY (`DesignationID`)
);

CREATE TABLE `hotelBranch` (
  `BranchID` int AUTO_INCREMENT,
  `Address` varchar(100) NOT NULL,
  `City` varchar(20) NOT NULL,
  `Phone` varchar(20) NOT NULL,
  `Email` varchar(100) NOT NULL UNIQUE,
  PRIMARY KEY (`BranchID`)
);

CREATE TABLE `staff` (
  `StaffID` int AUTO_INCREMENT,
  `HashedPassword` varchar(255) NOT NULL,
  `BranchID` int NOT NULL,
  `DesignationID` int NOT NULL,
  `Name` varchar(100) NOT NULL,
  `NIC` varchar(20) NOT NULL UNIQUE,
  `Email` varchar(100) NOT NULL UNIQUE,
  `Phone` varchar(20) NOT NULL,
  PRIMARY KEY (`StaffID`),
  FOREIGN KEY (`DesignationID`)
      REFERENCES `designation`(`DesignationID`),
  FOREIGN KEY (`BranchID`)
      REFERENCES `hotelBranch`(`BranchID`)
);

CREATE TABLE `AuditLog` (
  `AuditID` int AUTO_INCREMENT,
  `StaffID` int NOT NULL,
  `TableName` varchar(100) NOT NULL,
  `ChangedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Operation` varchar(100) NOT NULL,
  PRIMARY KEY (`AuditID`),
  FOREIGN KEY (`StaffID`)
      REFERENCES `staff`(`StaffID`)
);

CREATE TABLE `booking` (
  `BookingID` int AUTO_INCREMENT,
  `GuestID` int NOT NULL,
  `CheckInDate` datetime NOT NULL,
  `CheckOutDate` datetime NOT NULL,
  `BookingStatus` varchar(20) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`BookingID`),
  FOREIGN KEY (`GuestID`)
      REFERENCES `guest`(`GuestID`),
  CONSTRAINT chk_booking_dates CHECK (`CheckOutDate` > `CheckInDate`)
);

CREATE TABLE `serviceCatalogue` (
  `ServiceID` int AUTO_INCREMENT,
  `ServiceName` varchar(100) NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ServiceID`)
);

CREATE TABLE `serviceUsage` (
  `UsageID` int AUTO_INCREMENT,
  `BookingID` int NOT NULL,
  `ServiceID` int NOT NULL,
  `UsageDate` date NOT NULL,
  `Quantity` int NOT NULL DEFAULT 1,
  `PriceAtUsage` decimal(10,2) NOT NULL,
  PRIMARY KEY (`UsageID`),
  FOREIGN KEY (`ServiceID`)
      REFERENCES `serviceCatalogue`(`ServiceID`),
  FOREIGN KEY (`BookingID`)
      REFERENCES `booking`(`BookingID`)
);

CREATE TABLE `room` (
  `RoomID` int AUTO_INCREMENT,
  `BranchID` int NOT NULL,
  `RoomTypeID` int NOT NULL,
  `RoomNumber` varchar(10) NOT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'available',
  PRIMARY KEY (`RoomID`),
  UNIQUE KEY `unique_room_per_branch` (`BranchID`, `RoomNumber`),
  FOREIGN KEY (`BranchID`)
      REFERENCES `hotelBranch`(`BranchID`),
  FOREIGN KEY (`RoomTypeID`)
      REFERENCES `roomType`(`RoomTypeID`)
);

CREATE TABLE `bookingRooms` (
  `BookingRoomID` int AUTO_INCREMENT,
  `BookingID` int NOT NULL,
  `RoomID` int NOT NULL,
  PRIMARY KEY (`BookingRoomID`),
  UNIQUE KEY `unique_booking_room` (`BookingID`, `RoomID`),
  FOREIGN KEY (`BookingID`)
      REFERENCES `booking`(`BookingID`),
  FOREIGN KEY (`RoomID`)
      REFERENCES `room`(`RoomID`)
);

CREATE TABLE `bill` (
  `BillID` int AUTO_INCREMENT,
  `BookingID` int NOT NULL,
  `RoomCharges` decimal(10,2) NOT NULL DEFAULT 0.00,
  `ServiceCharges` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `Tax` decimal(10,2) NOT NULL DEFAULT 0.00,
  `TotalAmount` decimal(10,2) NOT NULL,
  `BillDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `BillStatus` varchar(20) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`BillID`),
  FOREIGN KEY (`BookingID`)
      REFERENCES `booking`(`BookingID`)
);

CREATE TABLE `payment` (
  `PaymentID` int AUTO_INCREMENT,
  `BillID` int NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `PaymentMethod` varchar(50) NOT NULL,
  `PaymentDate` date NOT NULL,
  `PaymentStatus` varchar(20) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`PaymentID`),
  FOREIGN KEY (`BillID`)
      REFERENCES `bill`(`BillID`)
);
