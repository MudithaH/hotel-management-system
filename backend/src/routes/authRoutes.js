const express = require('express');
const { login, getProfile, refreshToken, logout } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();


//POST /api/auth/login
router.post('/login',login);

//POST /api/auth/profile
router.post('/profile',getProfile);

//POST /api/auth/refresh
router.post('/refresh', authenticateToken, refreshToken);

//POST /api/auth/logout
router.post('/logout',logout);

module.exports = router;