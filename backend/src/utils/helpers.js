/**
 * Utility Helper Functions
 * Common functions used across the application
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Calculate number of days between two dates
const calculateDays = (checkIn, checkOut) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(checkIn);
  const secondDate = new Date(checkOut);
  
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
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

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  isValidEmail,
  isValidPhone,
  calculateDays,
  formatResponse
};