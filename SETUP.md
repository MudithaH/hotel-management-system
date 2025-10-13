# Hotel Management System - Setup Instructions

## 🚀 Quick Start Guide

Follow these steps to get the Hotel Management System running on your local machine.

### Prerequisites
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **Git** (optional, for cloning)

### Step 1: Database Setup

1. **Install and start MySQL server**
   
2. **Create the database:**
   ```sql
   CREATE DATABASE hotel_management;
   ```

3. **Import the schema:**
   - Open MySQL Workbench or command line
   - Run the contents of `backend/schema.sql` in your MySQL client
   - Or use command line:
     ```bash
     mysql -u your_username -p hotel_management < backend/schema.sql
     ```

### Step 2: Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env` file and update with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=hotel_management
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_super_secret_key_at_least_32_characters_long
   ```

4. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   ✅ Backend should now be running on `http://localhost:5000`

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

   ✅ Frontend should now be running on `http://localhost:3000`

### Step 4: Test the Application

1. **Open your browser and go to `http://localhost:3000`**

2. **Login with demo credentials:**
   - **Admin**: `admin@branch1.com` / `password123`
   - **Staff**: `sarah@branch1.com` / `password123`

3. **Explore the features:**
   - Admin can manage staff and view analytics
   - Staff can create guests, manage bookings, and process payments

## 🎯 What You Should See

### After Successful Setup:
- **Backend terminal**: "Server running on port 5000" + "Database connected successfully"
- **Frontend terminal**: "Local: http://localhost:3000"
- **Browser**: Login page with hotel management system interface

### Demo Data Included:
- 3 hotel branches (New York, Los Angeles, Miami)
- 9 staff members (3 per branch)
- 30 rooms (10 per branch)
- Sample guests, bookings, and transactions

## 🔧 Troubleshooting

### Common Issues:

**❌ Database connection failed:**
- Check if MySQL server is running
- Verify database credentials in `.env`
- Ensure `hotel_management` database exists

**❌ Port already in use:**
- Change `PORT=5001` in backend `.env`
- Or stop other services using port 5000/3000

**❌ Module not found:**
- Run `npm install` in both backend and frontend folders
- Delete `node_modules` and run `npm install` again if needed

**❌ Seeding fails:**
- Ensure database is empty or drop/recreate it
- Check MySQL user has CREATE/INSERT permissions

### Reset Everything:
```bash
# Drop and recreate database
DROP DATABASE hotel_management;
CREATE DATABASE hotel_management;

# Re-import schema and seed data
mysql -u root -p hotel_management < backend/schema.sql
cd backend && npm run seed
```

## 📚 Next Steps

Once the system is running:

1. **Explore Admin Features** (login as admin):
   - View dashboard statistics
   - Manage staff members
   - Monitor room occupancy

2. **Test Staff Features** (login as staff):
   - Create new guests
   - Make room bookings
   - Add services and generate bills

3. **Understand the Code**:
   - Check backend API structure in `backend/src/`
   - Explore React components in `frontend/src/`
   - Review database relationships in `schema.sql`

## 🎉 Success!

If you can login and see the dashboard, congratulations! The Hotel Management System is now ready for development and testing.

For detailed feature documentation, see the main README.md file.

---

**Need help?** Check the troubleshooting section above or review the error messages in the terminal for specific issues.