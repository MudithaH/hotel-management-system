/**
 * Authentication Routes
 * Defines all auth-related endpoints
 */

const express = require('express');
const router = express.Router();
const { login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

//  POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', authenticateToken, getProfile);


// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

module.exports = router;