/**
 * Express Application Setup
 * Main application configuration with middleware and routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);

// Welcome message for root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Hotel Management System API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      admin: '/api/admin',
      staff: '/api/staff'
    }
  });
});

// Handle 404 routes
app.use(notFound);

// Global error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;