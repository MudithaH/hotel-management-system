# ====================================================================
# HOTEL MANAGEMENT SYSTEM - PROJECT REQUIREMENTS
# ====================================================================
# Version: 1.0.0
# Last Updated: October 17, 2025
# ====================================================================

# ====================================================================
# SYSTEM REQUIREMENTS
# ====================================================================

## Operating System
- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

## Runtime & Development Tools
- Node.js >= 18.0.0 (Recommended: v18.17.0 or higher)
- npm >= 9.0.0 (comes with Node.js)
- MySQL >= 8.0.0 (Recommended: v8.0.33 or higher)
- Git >= 2.30.0 (for version control)

## Web Browser (for frontend)
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

# ====================================================================
# BACKEND DEPENDENCIES (Node.js/Express)
# ====================================================================

## Core Framework
express@^4.18.2
  - Fast, minimalist web framework for Node.js
  - Used for building RESTful API endpoints

## Database
mysql2@^3.6.0
  - MySQL client for Node.js with Promise support
  - Used for database connection pooling and queries
  - Note: No ORM used - raw SQL queries

## Security & Authentication
bcryptjs@^2.4.3
  - Password hashing library
  - Used for secure password storage and verification

jsonwebtoken@^9.0.2
  - JSON Web Token implementation
  - Used for JWT-based authentication
  - Token expiry: 7 days (configurable)

helmet@^7.0.0
  - Security middleware for Express
  - Sets various HTTP headers for security

express-rate-limit@^6.8.1
  - Rate limiting middleware
  - Prevents brute force attacks
  - Config: 100 requests per 15 minutes (general)
  - Config: 5 requests per 15 minutes (auth endpoints)

## Cross-Origin & CORS
cors@^2.8.5
  - Cross-Origin Resource Sharing middleware
  - Enables frontend-backend communication

## Environment Configuration
dotenv@^16.3.1
  - Loads environment variables from .env file
  - Used for configuration management

## PDF Generation (for reports)
pdfkit@^0.13.0
  - PDF generation library for Node.js
  - Used for generating room occupancy reports and other PDF documents

## Development Dependencies
nodemon@^3.0.1
  - Auto-restart development server on file changes
  - Development tool only

# ====================================================================
# FRONTEND DEPENDENCIES (React/Vite)
# ====================================================================

## Core Framework
react@^18.2.0
  - JavaScript library for building user interfaces
  - Component-based architecture

react-dom@^18.2.0
  - React package for DOM manipulation
  - Required for React web applications

## Routing
react-router-dom@^6.15.0
  - Declarative routing for React applications
  - Used for client-side routing and protected routes

## HTTP Client
axios@^1.5.0
  - Promise-based HTTP client
  - Used for API calls to backend

## UI Components & Icons
lucide-react@^0.263.1
  - Beautiful & consistent icon toolkit
  - Used for UI icons throughout the application

## Notifications
react-hot-toast@^2.4.1
  - Lightweight toast notification library
  - Used for user feedback messages

## Build Tool
vite@^4.4.5
  - Next generation frontend build tool
  - Provides fast HMR (Hot Module Replacement)
  - Production build optimization

@vitejs/plugin-react@^4.0.3
  - Official Vite plugin for React
  - Enables React Fast Refresh

## CSS Framework
tailwindcss@^3.3.3
  - Utility-first CSS framework
  - Used for responsive UI design

autoprefixer@^10.4.15
  - PostCSS plugin to parse CSS and add vendor prefixes
  - Ensures cross-browser compatibility

postcss@^8.4.28
  - Tool for transforming CSS with JavaScript
  - Required for Tailwind CSS

## Code Quality (Development)
eslint@^8.45.0
  - JavaScript linting utility
  - Enforces code quality standards

eslint-plugin-react@^7.32.2
  - React specific linting rules

eslint-plugin-react-hooks@^4.6.0
  - Enforces React Hooks rules

eslint-plugin-react-refresh@^0.4.3
  - Validates React Refresh constraints

## TypeScript Definitions (Development)
@types/react@^18.2.15
  - TypeScript definitions for React

@types/react-dom@^18.2.7
  - TypeScript definitions for React DOM

# ====================================================================
# DATABASE REQUIREMENTS
# ====================================================================

## MySQL Database
- Database Name: hotel_management
- Character Set: utf8mb4
- Collation: utf8mb4_unicode_ci
- Connection Pool: 10 connections max
- Port: 3306 (default)

## Database Tables
The following tables are created by schema.sql:
- roomType          (Room types and pricing)
- guest             (Guest information)
- designation       (Staff job titles and salaries)
- hotelBranch       (Branch locations)
- staff             (Staff members with authentication)
- room              (Individual rooms)
- booking           (Guest reservations)
- service           (Available services)
- serviceUsage      (Services used during bookings)
- payment           (Payment transactions)
- bill              (Generated bills)
- billItems         (Line items for bills)
- auditLog          (System activity tracking)

# ====================================================================
# ENVIRONMENT VARIABLES (.env)
# ====================================================================

## Backend Environment Configuration
Required variables in backend/.env:

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=your_password_here

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# ====================================================================
# INSTALLATION INSTRUCTIONS
# ====================================================================

## 1. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE hotel_management;
exit;

# Import schema
cd backend
mysql -u root -p hotel_management < schema.sql

# Seed sample data (optional)
npm run seed
```

## 2. Backend Setup
```bash
cd backend
npm install
# Configure .env file with your database credentials
npm run dev      # Development mode with auto-restart
# OR
npm start        # Production mode
```

## 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Development mode
# OR
npm run build    # Production build
npm run preview  # Preview production build
```

# ====================================================================
# PORT USAGE
# ====================================================================
- Backend API: http://localhost:5000
- Frontend App: http://localhost:3000
- MySQL Database: localhost:3306

# ====================================================================
# API ENDPOINTS
# ====================================================================

## Authentication (/api/auth)
POST   /api/auth/login              - User login
GET    /api/auth/profile            - Get user profile
PUT    /api/auth/profile            - Update user profile

## Admin Routes (/api/admin) - Requires Admin Role
GET    /api/admin/staff             - Get all staff
POST   /api/admin/staff             - Create new staff
PUT    /api/admin/staff/:id         - Update staff
DELETE /api/admin/staff/:id         - Delete staff
GET    /api/admin/rooms             - Get all rooms
POST   /api/admin/rooms             - Create new room
PUT    /api/admin/rooms/:id         - Update room
DELETE /api/admin/rooms/:id         - Delete room
GET    /api/admin/reports/room-occupancy  - Generate room occupancy report (PDF)

## Staff Routes (/api/staff) - Requires Staff/Admin Role
GET    /api/staff/guests            - Get all guests
POST   /api/staff/guests            - Create new guest
PUT    /api/staff/guests/:id        - Update guest
GET    /api/staff/bookings          - Get all bookings
POST   /api/staff/bookings          - Create new booking
PUT    /api/staff/bookings/:id      - Update booking
GET    /api/staff/services          - Get all services
POST   /api/staff/services/usage    - Add service to booking
GET    /api/staff/bills             - Get all bills
POST   /api/staff/bills/generate    - Generate bill
POST   /api/staff/payments          - Process payment

# ====================================================================
# DEFAULT CREDENTIALS (After Seeding)
# ====================================================================

## Admin Account
Email: admin@branch1.com
Password: password123
Role: Administrator

## Staff Account
Email: sarah@branch1.com
Password: password123
Role: Front Desk Staff

# ====================================================================
# PROJECT STRUCTURE
# ====================================================================

backend/
├── src/
│   ├── config/db.js              - Database connection pool
│   ├── controllers/              - Business logic
│   │   ├── adminController.js    - Admin operations
│   │   ├── authController.js     - Authentication
│   │   └── staffController.js    - Staff operations
│   ├── middleware/
│   │   ├── authMiddleware.js     - JWT verification
│   │   └── errorHandler.js       - Error handling
│   ├── routes/                   - API routes
│   ├── utils/helpers.js          - Utility functions
│   ├── app.js                    - Express app setup
│   └── server.js                 - Server entry point
├── package.json
├── schema.sql                    - Database schema
└── seed.js                       - Sample data seeder

frontend/
├── src/
│   ├── api/index.js              - API service layer
│   ├── components/               - Reusable components
│   ├── context/AuthContext.jsx   - Authentication context
│   ├── pages/                    - Page components
│   │   ├── admin/                - Admin pages
│   │   ├── auth/                 - Login page
│   │   └── staff/                - Staff pages
│   ├── routes/ProtectedRoute.jsx - Route protection
│   ├── App.jsx                   - Main app component
│   └── main.jsx                  - React entry point
├── package.json
├── vite.config.js                - Vite configuration
└── tailwind.config.js            - Tailwind CSS config

# ====================================================================
# SECURITY FEATURES
# ====================================================================
- JWT-based authentication with 7-day expiry
- Password hashing using bcryptjs (10 salt rounds)
- Rate limiting on all endpoints (100 req/15min)
- Stricter rate limiting on auth endpoints (5 req/15min)
- CORS protection with configured origins
- Helmet.js for HTTP security headers
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Role-based access control (Admin/Staff)
- Audit logging for all critical operations

# ====================================================================
# DEVELOPMENT SCRIPTS
# ====================================================================

## Backend Scripts
npm start       - Start production server
npm run dev     - Start development server with nodemon
npm run seed    - Seed database with sample data
npm test        - Run tests (not configured yet)

## Frontend Scripts
npm run dev     - Start Vite development server
npm run build   - Build for production
npm run preview - Preview production build
npm run lint    - Run ESLint

# ====================================================================
# TROUBLESHOOTING
# ====================================================================

## Database Connection Issues
- Verify MySQL is running: `mysql --version`
- Check credentials in backend/.env
- Ensure database exists: `SHOW DATABASES;`
- Check MySQL port: `SHOW VARIABLES LIKE 'port';`

## Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Vite will auto-increment to 3001, 3002, etc.

## CORS Issues
- Verify FRONTEND_URL in backend/.env matches frontend URL
- Check browser console for specific CORS errors

## JWT Errors
- Ensure JWT_SECRET is set in backend/.env
- Clear browser localStorage if tokens are expired
- Check token expiry setting (JWT_EXPIRE)

# ====================================================================
# PRODUCTION DEPLOYMENT NOTES
# ====================================================================

## Backend
- Set NODE_ENV=production
- Use process manager (PM2, Forever)
- Enable HTTPS
- Configure production database
- Set strong JWT_SECRET (32+ characters)
- Configure proper CORS origins
- Enable database backups
- Set up monitoring and logging

## Frontend
- Run `npm run build` to create production bundle
- Serve static files from `dist/` directory
- Use a web server (Nginx, Apache)
- Enable gzip compression
- Configure caching headers
- Use CDN for static assets

## Database
- Regular backups (daily recommended)
- Enable SSL connections
- Optimize queries and indexes
- Monitor connection pool usage
- Set up replication for high availability

# ====================================================================
# LICENSE & CREDITS
# ====================================================================
License: MIT
Project Type: Hotel Management System
Architecture: Full-stack (MERN-like with MySQL)
Pattern: MVC (Model-View-Controller)

# ====================================================================
# END OF REQUIREMENTS
# ====================================================================
