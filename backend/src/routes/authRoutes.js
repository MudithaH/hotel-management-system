/**
 * Authentication Routes
 * Defines all auth-related endpoints
 */

const express = require('express');
const router = express.Router();
const { login, getProfile, refreshToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   POST /api/auth/login
// @desc    Staff login with email and password
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current staff profile
// @access  Private (requires valid JWT)
router.get('/profile', authenticateToken, getProfile);

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private (requires valid JWT)
router.post('/refresh', authenticateToken, refreshToken);

// @route   POST /api/auth/logout
// @desc    Logout user (mainly for audit logging)
// @access  Private (requires valid JWT)
router.post('/logout', authenticateToken, logout);

module.exports = router;