# 🔑 Login Credentials - SkyNest Hotel Management System

## ⚠️ Database Needs Seeding First!

Your Aiven database is currently empty. You need to run the seed script to populate it with sample data and create user accounts.

### 📦 How to Seed the Database

**Option 1: Using npm script (from backend directory)**
```bash
cd backend
npm run seed
```

**Option 2: Using Node directly**
```bash
cd backend
node seed.js
```

**Option 3: Using Docker container**
```bash
docker-compose exec backend npm run seed
```

---

## 🔐 Demo Login Credentials (After Seeding)

Once you've run the seed script, you can use these credentials to login:

### 👨‍💼 **ADMIN Accounts** (Full Access)

| Branch | Email | Password | Name |
|--------|-------|----------|------|
| **Colombo** | `admin@colombo.skynest.lk` | `password123` | Nuwan Perera |
| **Kandy** | `admin@kandy.skynest.lk` | `password123` | Chamari Wickramasinghe |
| **Galle** | `admin@galle.skynest.lk` | `password123` | Ruwan De Silva |

**Admin Capabilities:**
- ✅ View all reports (occupancy, revenue, billing, services)
- ✅ Manage staff members
- ✅ Manage rooms
- ✅ View all bookings and guests
- ✅ Access admin dashboard
- ✅ Full system access

---

### 👥 **STAFF Accounts** (Limited Access)

| Branch | Email | Password | Name |
|--------|-------|----------|------|
| **Colombo** | `sanduni@colombo.skynest.lk` | `password123` | Sanduni Fernando |
| **Colombo** | `kavindu@colombo.skynest.lk` | `password123` | Kavindu Silva |
| **Kandy** | `tharindu@kandy.skynest.lk` | `password123` | Tharindu Rajapaksha |
| **Kandy** | `nisha@kandy.skynest.lk` | `password123` | Nisha Gamage |
| **Galle** | `dilini@galle.skynest.lk` | `password123` | Dilini Jayawardena |
| **Galle** | `ashen@galle.skynest.lk` | `password123` | Ashen Mendis |

**Staff Capabilities:**
- ✅ Manage bookings
- ✅ Manage guests
- ✅ Manage services
- ✅ Create and manage bills
- ✅ Process payments
- ✅ View staff dashboard
- ❌ Cannot access admin features

---

## 📊 What Gets Seeded?

When you run the seed script, the following data will be created:

- **3 Hotel Branches:** Colombo, Kandy, Galle
- **2 Designations:** Admin (LKR 150,000), Staff (LKR 85,000)
- **5 Room Types:** Standard Single to Presidential Suite (LKR 12,500 - 70,000/night)
- **30 Rooms:** 10 rooms per branch (2 of each type)
- **9 Staff Members:** 3 per branch (1 admin + 2 staff)
- **12 Services:** Room service, spa, tours, etc.
- **10 Sample Guests:** With contact details
- **5 Sample Bookings:** With room assignments
- **Sample Bills & Payments:** For demonstration

---

## 🚀 Quick Start Guide

### Step 1: Seed the Database
```bash
cd backend
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
✅ Connected to database
🧹 Clearing existing data...
🏢 Seeding hotel branches...
💼 Seeding designations...
🛏️ Seeding room types...
...
✅ Database seeding completed successfully!

🔑 Demo Login Credentials:
   Admin (Colombo): admin@colombo.skynest.lk / password123
   Admin (Kandy): admin@kandy.skynest.lk / password123
   Admin (Galle): admin@galle.skynest.lk / password123
```

### Step 2: Access the Application
Go to: http://localhost:3000

### Step 3: Login
Use any of the credentials listed above.

**Recommended for first login:**
- Email: `admin@colombo.skynest.lk`
- Password: `password123`

---

## 🔧 Troubleshooting

### Seeding Fails?

**Check backend .env file:**
```bash
cat backend/.env | grep DB_
```

Should show:
```
DB_HOST=skynest-database-databaseproject-616.b.aivencloud.com
DB_PORT=21937
DB_NAME=defaultdb
```

**Test database connection:**
```bash
cd backend
npm run verify-db
```

**Check if Docker backend is running:**
```bash
docker-compose ps
```

If backend is not running:
```bash
docker-compose up -d
```

### Can't Login After Seeding?

1. **Verify data was created:**
   ```bash
   mysql --host=skynest-database-databaseproject-616.b.aivencloud.com \
     --port=21937 --user=avnadmin \
     --password=AVNS_9ZKGn8oXGKK1XBypXSh \
     --ssl-mode=REQUIRED defaultdb \
     -e "SELECT Email, Name FROM staff;"
   ```

2. **Check backend logs:**
   ```bash
   docker-compose logs backend
   ```

3. **Verify backend is connected to Aiven:**
   ```bash
   cd backend
   npm run verify-db
   ```

### Password Not Working?

- Password is **case-sensitive**: `password123` (all lowercase)
- Make sure you're using the correct email address
- Clear browser cache and try again
- Check browser console for errors (F12)

---

## 🔄 Re-seed Database (Fresh Start)

If you want to start over with fresh data:

```bash
cd backend
npm run seed
```

**WARNING:** This will delete all existing data and create fresh sample data!

---

## 🛡️ Security Notes

⚠️ **IMPORTANT for Production:**

1. **Change all passwords** - `password123` is for demo only!
2. **Use strong passwords** - At least 12 characters, mixed case, numbers, symbols
3. **Create production users** - Don't use demo accounts in production
4. **Update JWT_SECRET** - Generate a new random secret key
5. **Enable 2FA** - Consider adding two-factor authentication

**Generate secure password:**
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 📝 Notes

- All passwords are hashed using bcrypt (12 rounds)
- Currency is in Sri Lankan Rupees (LKR)
- Demo data includes bookings from October 2025
- Each branch has the same room configuration
- Sample guests and bookings for testing

---

## ✅ Current Status

- **Database:** ✅ Aiven Cloud (MySQL 8.0.35)
- **Backend:** ✅ Running on port 5000
- **Frontend:** ✅ Running on port 3000
- **Seeded:** ⏳ **Need to run seed script**

**Next Step:** Run `cd backend && npm run seed` to populate the database!

---

**Last Updated:** October 18, 2025  
**Version:** 1.0.0
