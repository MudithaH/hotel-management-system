/**
 * Utility Helper Functions
 * Common functions used across the application
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { insertRecord } = require('../config/db');

// Hash password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password with hashed password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Format date for MySQL datetime
const formatDateTime = (date) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (basic validation)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Check if two date ranges overlap (for room booking conflicts)
const datesOverlap = (start1, end1, start2, end2) => {
  return start1 <= end2 && start2 <= end1;
};

// Calculate number of days between two dates
const calculateDays = (checkIn, checkOut) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(checkIn);
  const secondDate = new Date(checkOut);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

// Log audit trail for data changes
const logAudit = async (staffId, tableName, operation) => {
  try {
    const query = `
      INSERT INTO AuditLog (StaffID, TableName, Operation, ChangedAt)
      VALUES (?, ?, ?, NOW())
    `;
    await insertRecord(query, [staffId, tableName, operation]);
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw error as audit logging shouldn't break main operations
  }
};

// Response formatter for consistent API responses
const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode
  };
};

// Pagination helper
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  
  return { limit, offset };
};



// Generate bill total with tax calculation
const calculateBillTotal = (roomCharges, serviceCharges, discount = 0, taxRate = 0.1) => {
  const subtotal = roomCharges + serviceCharges - discount;
  const tax = subtotal * taxRate;
  return subtotal + tax;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  formatDateTime,
  isValidEmail,
  isValidPhone,
  datesOverlap,
  calculateDays,
  logAudit,
  formatResponse,
  getPagination,

  calculateBillTotal
};