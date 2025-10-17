# 🏗️ Hotel Management System - Project Structure

This document provides a comprehensive overview of the project's architecture, file organization, and component relationships.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Root Directory](#root-directory)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Architecture Diagram](#architecture-diagram)
6. [Key Files Explanation](#key-files-explanation)
7. [Data Flow](#data-flow)
8. [Component Hierarchy](#component-hierarchy)

---

## 🎯 Overview

**Project Type:** Full-Stack Hotel Management System  
**Architecture:** MVC Pattern with REST API  
**Tech Stack:** Node.js/Express + React/Vite + MySQL  
**Total Files:** 50+ source files  
**Total Components:** 18 React components

---

## 📁 Root Directory

```
Test-Hotel-Management-Database-Project/
│
├── 📂 backend/                    # Node.js/Express API Server
├── 📂 frontend/                   # React/Vite Client Application
├── 📂 .git/                       # Git version control
│
├── 📄 README.md                   # Project documentation & features
├── 📄 SETUP.md                    # Installation & setup guide
├── 📄 requirements.txt            # Complete requirements & dependencies
└── 📄 PROJECT_STRUCTURE.md        # This file
```

---

## 🔧 Backend Structure

### Complete Backend Tree

```
backend/
│
├── 📂 src/                        # Source code directory
│   │
│   ├── 📂 config/                 # Configuration files
│   │   └── 📄 db.js              # MySQL connection pool & query executor
│   │
│   ├── 📂 controllers/            # Business logic layer
│   │   ├── 📄 adminController.js # Admin operations
│   │   │   ├── getStaff()
│   │   │   ├── createStaff()
│   │   │   ├── updateStaff()
│   │   │   ├── deleteStaff()
│   │   │   ├── getRooms()
│   │   │   ├── createRoom()
│   │   │   ├── updateRoom()
│   │   │   ├── deleteRoom()
│   │   │   └── generateRoomOccupancyReport() # PDF generation
│   │   │
│   │   ├── 📄 authController.js  # Authentication & authorization
│   │   │   ├── login()
│   │   │   ├── getProfile()
│   │   │   └── updateProfile()
│   │   │
│   │   └── 📄 staffController.js # Staff operations
│   │       ├── getGuests()
│   │       ├── createGuest()
│   │       ├── updateGuest()
│   │       ├── getBookings()
│   │       ├── createBooking()
│   │       ├── updateBooking()
│   │       ├── getServices()
│   │       ├── addServiceUsage()
│   │       ├── getBills()
│   │       ├── generateBill()
│   │       └── processPayment()
│   │
│   ├── 📂 middleware/             # Express middleware
│   │   ├── 📄 authMiddleware.js  # JWT verification & role checks
│   │   │   ├── protect()          # Verify JWT token
│   │   │   └── authorize()        # Check user roles
│   │   │
│   │   └── 📄 errorHandler.js    # Error handling middleware
│   │       ├── notFound()         # 404 handler
│   │       └── errorHandler()     # Global error handler
│   │
│   ├── 📂 routes/                 # API route definitions
│   │   ├── 📄 adminRoutes.js     # Admin endpoints
│   │   │   ├── GET    /staff
│   │   │   ├── POST   /staff
│   │   │   ├── PUT    /staff/:id
│   │   │   ├── DELETE /staff/:id
│   │   │   ├── GET    /rooms
│   │   │   ├── POST   /rooms
│   │   │   ├── PUT    /rooms/:id
│   │   │   ├── DELETE /rooms/:id
│   │   │   └── GET    /reports/room-occupancy
│   │   │
│   │   ├── 📄 authRoutes.js      # Authentication endpoints
│   │   │   ├── POST   /login
│   │   │   ├── GET    /profile
│   │   │   └── PUT    /profile
│   │   │
│   │   └── 📄 staffRoutes.js     # Staff endpoints
│   │       ├── GET    /guests
│   │       ├── POST   /guests
│   │       ├── PUT    /guests/:id
│   │       ├── GET    /bookings
│   │       ├── POST   /bookings
│   │       ├── PUT    /bookings/:id
│   │       ├── GET    /services
│   │       ├── POST   /services/usage
│   │       ├── GET    /bills
│   │       ├── POST   /bills/generate
│   │       └── POST   /payments
│   │
│   ├── 📂 utils/                  # Utility functions
│   │   └── 📄 helpers.js         # Helper functions
│   │
│   ├── 📄 app.js                 # Express application setup
│   │   ├── Middleware config (CORS, Helmet, Rate limiting)
│   │   ├── Body parsers
│   │   ├── Route mounting
│   │   └── Error handlers
│   │
│   └── 📄 server.js              # Server entry point
│       ├── Database connection test
│       ├── Server startup
│       └── Graceful shutdown handling
│
├── 📂 node_modules/               # Dependencies (auto-generated)
│
├── 📄 .env                       # Environment variables
│   ├── DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
│   ├── JWT_SECRET, JWT_EXPIRE
│   ├── PORT, NODE_ENV
│   └── FRONTEND_URL
│
├── 📄 .gitignore                 # Git ignore patterns
├── 📄 complete_database_setup.sql # Complete DB with data
├── 📄 schema.sql                 # Database schema only
├── 📄 seed.js                    # Sample data seeder script
├── 📄 package.json               # NPM dependencies & scripts
└── 📄 package-lock.json          # Locked dependency versions
```

### Backend Dependencies

**Production:**
- `express` - Web framework
- `mysql2` - Database driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `cors` - CORS middleware
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `pdfkit` - PDF generation

**Development:**
- `nodemon` - Auto-restart server

---

## 🎨 Frontend Structure

### Complete Frontend Tree

```
frontend/
│
├── 📂 src/                        # Source code directory
│   │
│   ├── 📂 api/                    # API service layer
│   │   └── 📄 index.js           # Axios configuration & API calls
│   │       ├── authAPI           # Authentication endpoints
│   │       ├── adminAPI          # Admin endpoints
│   │       └── staffAPI          # Staff endpoints
│   │
│   ├── 📂 components/             # Reusable components
│   │   ├── 📄 Layout.jsx         # Main layout wrapper
│   │   ├── 📄 Navbar.jsx         # Top navigation bar
│   │   └── 📄 Sidebar.jsx        # Side navigation menu
│   │
│   ├── 📂 context/                # React Context API
│   │   └── 📄 AuthContext.jsx    # Authentication state management
│   │       ├── AuthProvider
│   │       ├── useAuth hook
│   │       ├── login()
│   │       ├── logout()
│   │       └── updateUser()
│   │
│   ├── 📂 pages/                  # Page components
│   │   │
│   │   ├── 📂 admin/              # Admin pages (8 components)
│   │   │   ├── 📄 AdminDashboard.jsx
│   │   │   │   ├── Statistics cards
│   │   │   │   ├── Quick actions
│   │   │   │   ├── Reports tab
│   │   │   │   └── Dashboard widgets
│   │   │   │
│   │   │   ├── 📄 StaffManagement.jsx
│   │   │   │   ├── Staff list/table
│   │   │   │   ├── Add staff form
│   │   │   │   ├── Edit staff modal
│   │   │   │   └── Delete confirmation
│   │   │   │
│   │   │   ├── 📄 RoomManagement.jsx
│   │   │   │   ├── Room list/table
│   │   │   │   ├── Add room form
│   │   │   │   ├── Edit room modal
│   │   │   │   └── Room status updates
│   │   │   │
│   │   │   ├── 📄 OccupancyReport.jsx
│   │   │   │   ├── Date range selector
│   │   │   │   ├── Generate report button
│   │   │   │   └── PDF download
│   │   │   │
│   │   │   ├── 📄 BillingSummary.jsx
│   │   │   │   ├── Revenue metrics
│   │   │   │   ├── Payment statistics
│   │   │   │   └── Charts/graphs
│   │   │   │
│   │   │   ├── 📄 MonthlyRevenue.jsx
│   │   │   │   ├── Monthly breakdown
│   │   │   │   ├── Revenue trends
│   │   │   │   └── Comparison charts
│   │   │   │
│   │   │   ├── 📄 ServiceUsageReport.jsx
│   │   │   │   ├── Service usage stats
│   │   │   │   ├── Popular services
│   │   │   │   └── Revenue by service
│   │   │   │
│   │   │   └── 📄 TopServices.jsx
│   │   │       ├── Most used services
│   │   │       └── Service rankings
│   │   │
│   │   ├── 📂 auth/               # Authentication pages
│   │   │   └── 📄 Login.jsx
│   │   │       ├── Login form
│   │   │       ├── Email/password fields
│   │   │       └── Submit & validation
│   │   │
│   │   └── 📂 staff/              # Staff pages (6 components)
│   │       │
│   │       ├── 📄 StaffDashboard.jsx
│   │       │   ├── Quick stats
│   │       │   ├── Today's bookings
│   │       │   └── Action buttons
│   │       │
│   │       ├── 📄 GuestManagement.jsx
│   │       │   ├── Guest list/table
│   │       │   ├── Add guest form
│   │       │   ├── Edit guest modal
│   │       │   └── Search functionality
│   │       │
│   │       ├── 📄 BookingManagement.jsx
│   │       │   ├── Booking list/table
│   │       │   ├── Create booking form
│   │       │   ├── Edit booking modal
│   │       │   ├── Check-in/out buttons
│   │       │   └── Booking status
│   │       │
│   │       ├── 📄 BookingOperations.jsx
│   │       │   ├── Booking operations UI
│   │       │   ├── Room assignment
│   │       │   └── Booking modifications
│   │       │
│   │       ├── 📄 ServiceManagement.jsx
│   │       │   ├── Service list
│   │       │   ├── Add service to booking
│   │       │   └── Service pricing
│   │       │
│   │       └── 📄 BillingManagement.jsx
│   │           ├── Generate bill
│   │           ├── View bills
│   │           ├── Process payment
│   │           └── Payment history
│   │
│   ├── 📂 routes/                 # Routing configuration
│   │   └── 📄 ProtectedRoute.jsx # Route protection wrapper
│   │       ├── Check authentication
│   │       ├── Verify role permissions
│   │       └── Redirect to login
│   │
│   ├── 📄 App.jsx                # Main application component
│   │   ├── Router configuration
│   │   ├── Route definitions
│   │   ├── Protected route wrapping
│   │   └── Layout structure
│   │
│   ├── 📄 main.jsx               # React entry point
│   │   ├── ReactDOM render
│   │   ├── AuthProvider wrapper
│   │   └── BrowserRouter wrapper
│   │
│   └── 📄 index.css              # Global styles
│       ├── Tailwind directives
│       ├── Custom CSS
│       └── Global overrides
│
├── 📂 node_modules/               # Dependencies (auto-generated)
│
├── 📄 index.html                 # HTML template
├── 📄 .gitignore                 # Git ignore patterns
├── 📄 package.json               # NPM dependencies & scripts
├── 📄 package-lock.json          # Locked dependency versions
├── 📄 postcss.config.js          # PostCSS configuration
├── 📄 tailwind.config.js         # Tailwind CSS configuration
└── 📄 vite.config.js             # Vite build tool configuration
```

### Frontend Dependencies

**Production:**
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Client-side routing
- `axios` - HTTP client
- `lucide-react` - Icon library
- `react-hot-toast` - Toast notifications

**Development:**
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin
- `tailwindcss` - CSS framework
- `autoprefixer` - CSS prefixing
- `postcss` - CSS processing
- `eslint` - Code linting
- `@types/react` - TypeScript definitions
- `@types/react-dom` - TypeScript definitions

---

## 🏛️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT SIDE                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application (Port 3000)             │  │
│  │                                                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  Login   │  │  Admin   │  │  Staff   │            │  │
│  │  │  Page    │  │  Pages   │  │  Pages   │            │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │  │
│  │       │             │             │                    │  │
│  │       └─────────────┼─────────────┘                    │  │
│  │                     │                                   │  │
│  │            ┌────────▼─────────┐                        │  │
│  │            │  React Router    │                        │  │
│  │            │  Protected Routes│                        │  │
│  │            └────────┬─────────┘                        │  │
│  │                     │                                   │  │
│  │            ┌────────▼─────────┐                        │  │
│  │            │   AuthContext    │                        │  │
│  │            │   (State Mgmt)   │                        │  │
│  │            └────────┬─────────┘                        │  │
│  │                     │                                   │  │
│  │            ┌────────▼─────────┐                        │  │
│  │            │   Axios API      │                        │  │
│  │            │   Service Layer  │                        │  │
│  │            └────────┬─────────┘                        │  │
│  └─────────────────────┼─────────────────────────────────┘  │
└────────────────────────┼────────────────────────────────────┘
                         │
                    HTTP/REST
                    (JSON)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       SERVER SIDE                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Express.js API (Port 5000)                  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            Middleware Layer                      │  │  │
│  │  │  • CORS        • Rate Limiting                   │  │  │
│  │  │  • Helmet      • Body Parsing                    │  │  │
│  │  │  • JWT Auth    • Error Handling                  │  │  │
│  │  └─────────────────┬───────────────────────────────┘  │  │
│  │                    │                                   │  │
│  │  ┌─────────────────▼───────────────────────────────┐  │  │
│  │  │              Routes Layer                        │  │  │
│  │  │  ┌───────────┐ ┌──────────┐ ┌──────────┐       │  │  │
│  │  │  │   Auth    │ │  Admin   │ │  Staff   │       │  │  │
│  │  │  │  Routes   │ │  Routes  │ │  Routes  │       │  │  │
│  │  │  └─────┬─────┘ └────┬─────┘ └────┬─────┘       │  │  │
│  │  └────────┼────────────┼────────────┼─────────────┘  │  │
│  │           │            │            │                 │  │
│  │  ┌────────▼────────────▼────────────▼─────────────┐  │  │
│  │  │           Controllers Layer                     │  │  │
│  │  │  • authController                               │  │  │
│  │  │  • adminController (+ PDF generation)           │  │  │
│  │  │  • staffController                              │  │  │
│  │  └─────────────────┬───────────────────────────────┘  │  │
│  │                    │                                   │  │
│  │  ┌─────────────────▼───────────────────────────────┐  │  │
│  │  │            Database Layer                        │  │  │
│  │  │  • Connection Pool (mysql2/promise)             │  │  │
│  │  │  • Query Executor                                │  │  │
│  │  └─────────────────┬───────────────────────────────┘  │  │
│  └────────────────────┼─────────────────────────────────┘  │
└───────────────────────┼────────────────────────────────────┘
                        │
                   MySQL Protocol
                        │
┌───────────────────────▼────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          MySQL Database (Port 3306)                   │  │
│  │          Database: hotel_management                   │  │
│  │                                                         │  │
│  │  Tables (13 total):                                   │  │
│  │  • roomType        • guest         • designation      │  │
│  │  • hotelBranch     • staff         • room            │  │
│  │  • booking         • service       • serviceUsage     │  │
│  │  • payment         • bill          • billItems        │  │
│  │  • auditLog                                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Key Files Explanation

### Backend Core Files

#### `src/server.js`
- **Purpose:** Application entry point
- **Responsibilities:**
  - Tests database connection
  - Starts Express server
  - Handles graceful shutdown (SIGTERM, SIGINT)
  - Logs startup information

#### `src/app.js`
- **Purpose:** Express application configuration
- **Responsibilities:**
  - Configures middleware (CORS, Helmet, Rate limiting)
  - Sets up body parsers
  - Mounts route handlers
  - Defines error handlers
  - Health check endpoint

#### `src/config/db.js`
- **Purpose:** Database connection management
- **Responsibilities:**
  - Creates MySQL connection pool
  - Tests database connectivity
  - Provides query executor function
  - Handles database errors

#### `src/controllers/*Controller.js`
- **Purpose:** Business logic implementation
- **Responsibilities:**
  - Process requests
  - Interact with database
  - Format responses
  - Handle errors
  - Generate reports (adminController)

#### `src/middleware/authMiddleware.js`
- **Purpose:** Authentication & authorization
- **Responsibilities:**
  - Verify JWT tokens
  - Check user roles
  - Protect routes
  - Handle auth errors

#### `src/routes/*Routes.js`
- **Purpose:** API endpoint definitions
- **Responsibilities:**
  - Define HTTP methods and paths
  - Map routes to controllers
  - Apply middleware
  - Handle route-level validation

---

### Frontend Core Files

#### `src/main.jsx`
- **Purpose:** React application entry point
- **Responsibilities:**
  - Render root React component
  - Wrap with AuthProvider
  - Initialize React Router

#### `src/App.jsx`
- **Purpose:** Main application component
- **Responsibilities:**
  - Define all routes
  - Configure protected routes
  - Set up layout structure
  - Handle routing logic

#### `src/context/AuthContext.jsx`
- **Purpose:** Authentication state management
- **Responsibilities:**
  - Store user data and token
  - Provide login/logout functions
  - Manage authentication state
  - Persist auth in localStorage

#### `src/api/index.js`
- **Purpose:** API service layer
- **Responsibilities:**
  - Configure Axios instance
  - Define API endpoints
  - Handle HTTP requests
  - Manage request/response interceptors

#### `src/components/Layout.jsx`
- **Purpose:** Application layout wrapper
- **Responsibilities:**
  - Render Navbar
  - Render Sidebar
  - Structure page content
  - Provide consistent layout

#### `src/routes/ProtectedRoute.jsx`
- **Purpose:** Route protection
- **Responsibilities:**
  - Check authentication status
  - Verify user roles
  - Redirect unauthorized users
  - Render protected content

---

## 🔄 Data Flow

### 1. Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Enter credentials
     ▼
┌──────────────┐
│ Login.jsx    │
└────┬─────────┘
     │ 2. Submit form
     ▼
┌──────────────┐
│ authAPI.     │
│ login()      │
└────┬─────────┘
     │ 3. POST /api/auth/login
     ▼
┌──────────────┐
│ authRoutes   │
└────┬─────────┘
     │ 4. Route to controller
     ▼
┌──────────────┐
│ auth         │
│ Controller   │
│ .login()     │
└────┬─────────┘
     │ 5. Query database
     ▼
┌──────────────┐
│ MySQL DB     │
│ staff table  │
└────┬─────────┘
     │ 6. Return user data
     ▼
┌──────────────┐
│ auth         │
│ Controller   │
└────┬─────────┘
     │ 7. Generate JWT token
     │ 8. Return response
     ▼
┌──────────────┐
│ AuthContext  │
│ .login()     │
└────┬─────────┘
     │ 9. Store token & user
     │ 10. Update state
     ▼
┌──────────────┐
│ Dashboard    │
│ (Redirect)   │
└──────────────┘
```

### 2. Protected Resource Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Click "View Staff"
     ▼
┌──────────────┐
│ Protected    │
│ Route        │
└────┬─────────┘
     │ 2. Check auth
     ▼
┌──────────────┐
│ Staff        │
│ Management   │
└────┬─────────┘
     │ 3. Request data
     ▼
┌──────────────┐
│ adminAPI.    │
│ getStaff()   │
└────┬─────────┘
     │ 4. GET /api/admin/staff
     │    + JWT token in header
     ▼
┌──────────────┐
│ auth         │
│ Middleware   │
└────┬─────────┘
     │ 5. Verify token
     │ 6. Check role
     ▼
┌──────────────┐
│ adminRoutes  │
└────┬─────────┘
     │ 7. Route to controller
     ▼
┌──────────────┐
│ admin        │
│ Controller   │
│ .getStaff()  │
└────┬─────────┘
     │ 8. Query database
     ▼
┌──────────────┐
│ MySQL DB     │
│ staff table  │
└────┬─────────┘
     │ 9. Return staff list
     ▼
┌──────────────┐
│ Staff        │
│ Management   │
│ (Display)    │
└──────────────┘
```

### 3. PDF Report Generation Flow

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │ 1. Select date range
     │ 2. Click "Generate Report"
     ▼
┌──────────────┐
│ Occupancy    │
│ Report.jsx   │
└────┬─────────┘
     │ 3. fetch() with credentials
     ▼
┌──────────────┐
│ GET /api/    │
│ admin/       │
│ reports/     │
│ room-        │
│ occupancy    │
└────┬─────────┘
     │ 4. Auth middleware
     ▼
┌──────────────┐
│ admin        │
│ Controller   │
│ .generate    │
│ RoomOccup... │
└────┬─────────┘
     │ 5. Query bookings & rooms
     ▼
┌──────────────┐
│ MySQL DB     │
└────┬─────────┘
     │ 6. Return data
     ▼
┌──────────────┐
│ admin        │
│ Controller   │
└────┬─────────┘
     │ 7. Generate PDF (pdfkit)
     │ 8. Stream PDF
     ▼
┌──────────────┐
│ Browser      │
│ Download     │
└──────────────┘
```

---

## 🧩 Component Hierarchy

### Frontend Component Tree

```
main.jsx
└── AuthProvider
    └── BrowserRouter
        └── App.jsx
            ├── Route: / (redirect)
            │
            ├── Route: /login
            │   └── Login.jsx
            │
            ├── ProtectedRoute: /admin/*
            │   └── Layout
            │       ├── Navbar
            │       ├── Sidebar
            │       └── Outlet
            │           └── AdminDashboard.jsx
            │               ├── Stats Cards
            │               ├── Quick Actions
            │               ├── Reports Tab
            │               │   └── OccupancyReport.jsx
            │               ├── BillingSummary.jsx
            │               ├── MonthlyRevenue.jsx
            │               ├── ServiceUsageReport.jsx
            │               └── TopServices.jsx
            │
            ├── ProtectedRoute: /admin/staff
            │   └── Layout
            │       └── StaffManagement.jsx
            │           ├── Staff Table
            │           ├── Add Staff Form
            │           └── Edit Modal
            │
            ├── ProtectedRoute: /admin/rooms
            │   └── Layout
            │       └── RoomManagement.jsx
            │           ├── Room Table
            │           ├── Add Room Form
            │           └── Edit Modal
            │
            ├── ProtectedRoute: /staff/*
            │   └── Layout
            │       └── StaffDashboard.jsx
            │           ├── Quick Stats
            │           ├── Today's Bookings
            │           └── Action Cards
            │
            ├── ProtectedRoute: /staff/guests
            │   └── Layout
            │       └── GuestManagement.jsx
            │
            ├── ProtectedRoute: /staff/bookings
            │   └── Layout
            │       └── BookingManagement.jsx
            │           └── BookingOperations.jsx
            │
            ├── ProtectedRoute: /staff/services
            │   └── Layout
            │       └── ServiceManagement.jsx
            │
            └── ProtectedRoute: /staff/billing
                └── Layout
                    └── BillingManagement.jsx
```

---

## 📊 Database Schema Overview

### 13 Tables Structure

```
hotel_management (Database)
│
├── 📋 roomType
│   ├── RoomTypeID (PK)
│   ├── TypeName
│   ├── Capacity
│   ├── DailyRate
│   └── Amenities
│
├── 📋 guest
│   ├── GuestID (PK)
│   ├── Name
│   ├── Email
│   └── Phone
│
├── 📋 designation
│   ├── DesignationID (PK)
│   ├── Designation
│   └── Salary
│
├── 📋 hotelBranch
│   ├── BranchID (PK)
│   ├── Address
│   ├── City
│   ├── Phone
│   └── Email
│
├── 📋 staff
│   ├── StaffID (PK)
│   ├── HashedPassword
│   ├── BranchID (FK)
│   ├── DesignationID (FK)
│   ├── Name
│   ├── NIC
│   ├── Email
│   └── Phone
│
├── 📋 room
│   ├── RoomID (PK)
│   ├── RoomTypeID (FK)
│   ├── BranchID (FK)
│   ├── RoomNumber
│   └── Status
│
├── 📋 booking
│   ├── BookingID (PK)
│   ├── GuestID (FK)
│   ├── RoomID (FK)
│   ├── CheckInDate
│   ├── CheckOutDate
│   └── Status
│
├── 📋 service
│   ├── ServiceID (PK)
│   ├── ServiceName
│   └── Price
│
├── 📋 serviceUsage
│   ├── UsageID (PK)
│   ├── BookingID (FK)
│   ├── ServiceID (FK)
│   ├── Quantity
│   └── UsageDate
│
├── 📋 payment
│   ├── PaymentID (PK)
│   ├── BillID (FK)
│   ├── Amount
│   ├── PaymentDate
│   └── PaymentMethod
│
├── 📋 bill
│   ├── BillID (PK)
│   ├── BookingID (FK)
│   ├── TotalAmount
│   ├── GeneratedDate
│   └── Status
│
├── 📋 billItems
│   ├── BillItemID (PK)
│   ├── BillID (FK)
│   ├── Description
│   ├── Quantity
│   └── Amount
│
└── 📋 auditLog
    ├── LogID (PK)
    ├── StaffID (FK)
    ├── Action
    ├── TableName
    ├── RecordID
    └── Timestamp
```

---

## 🔒 Security Features

### Backend Security Layers

1. **Authentication**
   - JWT-based token authentication
   - Password hashing with bcryptjs (10 salt rounds)
   - Token expiry (7 days)

2. **Authorization**
   - Role-based access control (Admin/Staff)
   - Protected routes with middleware
   - Route-level permissions

3. **Request Protection**
   - Rate limiting (100 req/15min general)
   - Strict auth rate limiting (5 req/15min)
   - CORS configuration
   - Helmet security headers

4. **Data Protection**
   - SQL injection prevention (parameterized queries)
   - Input validation
   - Error message sanitization

5. **Audit Trail**
   - auditLog table tracks all changes
   - Timestamp all operations
   - Link actions to staff members

---

## 📦 NPM Scripts

### Backend Scripts
```bash
npm start       # Start production server
npm run dev     # Development mode with nodemon
npm run seed    # Seed database with sample data
npm test        # Run tests (placeholder)
```

### Frontend Scripts
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

---

## 🌐 API Endpoints Summary

### Base URL: `http://localhost:5000/api`

#### Authentication (`/auth`)
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile

#### Admin Routes (`/admin`) - 🔒 Admin Only
- `GET /staff` - List all staff
- `POST /staff` - Create new staff
- `PUT /staff/:id` - Update staff
- `DELETE /staff/:id` - Delete staff
- `GET /rooms` - List all rooms
- `POST /rooms` - Create new room
- `PUT /rooms/:id` - Update room
- `DELETE /rooms/:id` - Delete room
- `GET /reports/room-occupancy` - Generate PDF report

#### Staff Routes (`/staff`) - 🔒 Staff/Admin
- `GET /guests` - List all guests
- `POST /guests` - Register new guest
- `PUT /guests/:id` - Update guest info
- `GET /bookings` - List all bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:id` - Update booking
- `GET /services` - List services
- `POST /services/usage` - Add service to booking
- `GET /bills` - List bills
- `POST /bills/generate` - Generate bill
- `POST /payments` - Process payment

---

## 🎯 Features by Role

### Admin Features
- ✅ View dashboard with statistics
- ✅ Manage staff members (CRUD)
- ✅ Manage rooms (CRUD)
- ✅ Generate reports (PDF)
- ✅ View billing summaries
- ✅ View revenue analytics
- ✅ View service usage reports
- ✅ Monitor branch performance

### Staff Features
- ✅ View staff dashboard
- ✅ Manage guests (CRUD)
- ✅ Create and manage bookings
- ✅ Add services to bookings
- ✅ Generate bills
- ✅ Process payments
- ✅ View booking history

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```
**Server:** http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
**App:** http://localhost:3000

### 3. Login
- **Admin:** `admin@branch1.com` / `password123`
- **Staff:** `sarah@branch1.com` / `password123`

---

## 📈 Project Statistics

| Metric | Count |
|--------|-------|
| Total Source Files | 50+ |
| React Components | 18 |
| API Endpoints | 20+ |
| Database Tables | 13 |
| Backend Controllers | 3 |
| Frontend Pages | 15 |
| Middleware | 2 |
| Route Files | 3 |
| Backend Dependencies | 9 |
| Frontend Dependencies | 17 |

---

## 📚 Technology Stack Summary

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18
- **Database:** MySQL v8.0+
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet + CORS + Rate Limiting
- **PDF Generation:** PDFKit

### Frontend
- **Library:** React v18.2
- **Build Tool:** Vite v4.4
- **Routing:** React Router v6.15
- **HTTP Client:** Axios v1.5
- **Styling:** Tailwind CSS v3.3
- **Icons:** Lucide React v0.263
- **Notifications:** React Hot Toast v2.4

### Database
- **RDBMS:** MySQL
- **Connection:** mysql2/promise with pooling
- **Pattern:** Raw SQL queries (no ORM)
- **Tables:** 13 normalized tables

---

## 🔗 Related Documentation

- [README.md](README.md) - Project overview and features
- [SETUP.md](SETUP.md) - Installation and setup guide
- [requirements.txt](requirements.txt) - Complete requirements and dependencies

---

**Last Updated:** October 17, 2025  
**Version:** 1.0.0  
**Maintainer:** Hotel Management System Team
