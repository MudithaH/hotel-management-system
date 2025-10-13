# 🏨 Hotel Management System

A comprehensive full-stack hotel management system built with **Node.js/Express** backend and **React/Vite** frontend. This system is designed for internal hotel staff to manage guests, bookings, rooms, and billing operations.

## 🚀 Features

### For Administrators
- **Dashboard Overview**: Statistics and branch performance metrics
- **Staff Management**: Create, update, and delete staff members
- **Room Management**: Manage room types, availability, and assignments
- **Branch Operations**: Monitor branch-specific data and operations

### For Staff Members
- **Guest Management**: Register and manage guest information
- **Booking System**: Create reservations with conflict detection
- **Service Management**: Add services to existing bookings
- **Billing & Payments**: Generate bills and process payments
- **Room Status**: Update room availability and occupancy

### Technical Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access**: Admin and Staff role permissions
- **Real-time Validation**: Prevent double bookings and conflicts
- **Audit Logging**: Track all system changes for accountability
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - Database driver (no ORM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
hotel-management-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth and error handling
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── seed.js             # Database seeding script
├── frontend/               # React/Vite application
│   ├── src/
│   │   ├── api/            # Axios API calls
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route protection
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql          # Database schema
```

## ⚡ Quick Setup

### Prerequisites
- **Node.js** (v18+ recommended)
- **MySQL** (v8.0+ recommended)  
- **npm** or **yarn** package manager

### 1. Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE hotel_management;
```

2. **Import Schema:**
```bash
mysql -u your_username -p hotel_management < database/schema.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=hotel_management
# DB_USER=your_mysql_username
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=your_super_secret_jwt_key

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend application will run on `http://localhost:3000`

## 🔑 Demo Credentials

### Branch 1 (New York)
- **Admin**: `admin@branch1.com` / `password123`
- **Staff**: `sarah@branch1.com` / `password123`

### Branch 2 (Los Angeles)  
- **Admin**: `admin@branch2.com` / `password123`
- **Staff**: `david@branch2.com` / `password123`

### Branch 3 (Miami)
- **Admin**: `admin@branch3.com` / `password123`
- **Staff**: `maria@branch3.com` / `password123`

## 📝 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # Staff login
GET  /api/auth/profile        # Get user profile  
POST /api/auth/logout         # Logout (audit log)
```

### Admin Endpoints
```
GET  /api/admin/dashboard/stats    # Dashboard statistics
GET  /api/admin/staff              # Get all staff
POST /api/admin/staff              # Create staff member
PUT  /api/admin/staff/:id          # Update staff member  
DELETE /api/admin/staff/:id        # Delete staff member
GET  /api/admin/rooms              # Get branch rooms
GET  /api/admin/room-types         # Get room types
GET  /api/admin/designations       # Get designations
```

### Staff Endpoints
```
GET  /api/staff/rooms/available    # Get available rooms
POST /api/staff/guests             # Create guest
GET  /api/staff/guests             # Get all guests
POST /api/staff/bookings           # Create booking
GET  /api/staff/bookings           # Get branch bookings
GET  /api/staff/services           # Get services catalog
POST /api/staff/services/usage     # Add service usage
POST /api/staff/bills/:bookingId   # Generate bill
```

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs with salt rounds
- **Role-Based Access Control** (Admin vs Staff permissions)
- **Input Validation** and sanitization
- **SQL Injection Prevention** via parameterized queries
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests

## 📊 Database Schema Overview

### Core Tables
- **hotelBranch**: Hotel branch information (3 branches)
- **designation**: Staff roles and salaries  
- **staff**: Staff members with authentication
- **guest**: Guest information
- **roomType**: Room categories and pricing
- **room**: Individual rooms per branch

### Booking Tables  
- **booking**: Reservation details
- **bookingRooms**: Room assignments to bookings
- **serviceCatalogue**: Available services
- **serviceUsage**: Services used per booking

### Financial Tables
- **bill**: Generated bills with charges breakdown
- **payment**: Payment transactions
- **AuditLog**: System change tracking

## 🚦 Development Scripts

### Backend Scripts
```bash
npm start          # Production server
npm run dev        # Development server with nodemon
npm run seed       # Populate database with sample data
```

### Frontend Scripts  
```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
```

## 📈 Sample Data Included

The seeding script creates:
- **3 Hotel Branches** (New York, Los Angeles, Miami)
- **30 Rooms** (10 per branch, 2 of each room type)
- **9 Staff Members** (1 admin + 2 staff per branch)
- **10 Sample Guests** with contact information
- **5 Active Bookings** with room assignments
- **10 Services** (room service, laundry, spa, etc.)
- **Sample bills and payments** for demonstration

## 🔧 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Hotel Management System
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL service is running
   - Check database credentials in `.env`
   - Ensure database `hotel_management` exists

2. **Port Already in Use**
   - Backend: Change `PORT` in backend `.env`
   - Frontend: Change port in `vite.config.js`

3. **CORS Issues**
   - Verify `FRONTEND_URL` in backend `.env`
   - Check API calls use correct backend URL

4. **Authentication Issues**
   - Clear browser localStorage
   - Verify JWT_SECRET is set in backend `.env`
   - Check token expiration in JWT payload

## 📚 Learning Resources

This project demonstrates:
- **REST API Development** with Express.js
- **JWT Authentication** implementation
- **MySQL Database Design** with proper relationships
- **React Context API** for state management  
- **Protected Routes** and role-based access
- **Modern React Hooks** and functional components
- **Responsive Design** with Tailwind CSS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Future Enhancements

- **Email Notifications** for booking confirmations
- **PDF Bill Generation** for guest receipts  
- **Advanced Reporting** with charts and analytics
- **Mobile App** for staff on-the-go access
- **Payment Gateway Integration** for online payments
- **Inventory Management** for hotel supplies
- **Maintenance Scheduling** for room upkeep

---

**Built with ❤️ for learning full-stack development**