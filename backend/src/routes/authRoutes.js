//handle auth routes

const express = require('express');
const { login, getProfile, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

//  POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile (projected route)
router.get('/profile', authenticateToken, getProfile);

// POST /api/auth/logout
router.post('/logout', authenticateToken, logout);

module.exports = router;