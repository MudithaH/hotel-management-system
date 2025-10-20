# Uploading Database to Aiven

This guide will help you upload your hotel management database to Aiven MySQL.

## Prerequisites

1. **Aiven Account** - You should have created an Aiven MySQL service
2. **Connection Details** - From your Aiven console, get:
   - Host (e.g., `mysql-xxxxx.aivencloud.com`)
   - Port (usually `3306`)
   - Username (usually `avnadmin`)
   - Password
   - Database name (usually `defaultdb`)

## Method 1: Using Bash Script (Recommended for Linux/Mac)

### Step 1: Install MySQL Client (if not already installed)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-client

# macOS
brew install mysql-client
```

### Step 2: Edit the Upload Script
Open `upload_to_aiven.sh` and replace these values with your Aiven details:
```bash
AIVEN_HOST="your-host.aivencloud.com"
AIVEN_PORT="3306"
AIVEN_USER="avnadmin"
AIVEN_PASSWORD="your-password"
AIVEN_DATABASE="defaultdb"
```

### Step 3: Run the Script
```bash
./upload_to_aiven.sh
```

## Method 2: Using Node.js Script

### Step 1: Install Dependencies
```bash
npm install mysql2
```

### Step 2: Edit the Upload Script
Open `upload_to_aiven.js` and replace the values in `AIVEN_CONFIG`:
```javascript
const AIVEN_CONFIG = {
  host: 'your-host.aivencloud.com',
  port: 3306,
  user: 'avnadmin',
  password: 'your-password',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: true
  },
  multipleStatements: true
};
```

### Step 3: Run the Script
```bash
node upload_to_aiven.js
```

## Method 3: Manual MySQL Command Line

### Upload Schema
```bash
mysql --host=YOUR_AIVEN_HOST \
  --port=YOUR_AIVEN_PORT \
  --user=YOUR_AIVEN_USER \
  --password=YOUR_AIVEN_PASSWORD \
  --ssl-mode=REQUIRED \
  YOUR_DATABASE_NAME < backend/schema.sql
```

### Upload Stored Procedures
```bash
mysql --host=YOUR_AIVEN_HOST \
  --port=YOUR_AIVEN_PORT \
  --user=YOUR_AIVEN_USER \
  --password=YOUR_AIVEN_PASSWORD \
  --ssl-mode=REQUIRED \
  YOUR_DATABASE_NAME < backend/complete_database_setup.sql
```

## Method 4: Using Aiven Console

1. Log in to your Aiven console
2. Go to your MySQL service
3. Click on "Query Editor" or use the connection string to connect via your favorite MySQL client
4. Copy and paste the contents of `backend/schema.sql`
5. Execute the SQL
6. Copy and paste the contents of `backend/complete_database_setup.sql`
7. Execute the SQL

## After Upload - Update Your Backend Configuration

### Update `.env` file
Create or update `backend/.env` with your Aiven connection details:
```env
DB_HOST=your-host.aivencloud.com
DB_PORT=3306
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your-password

# Add SSL configuration if needed
DB_SSL=true

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=your-frontend-url
```

### Update `backend/src/config/db.js` for SSL
If your current db.js doesn't support SSL, you may need to update it:
```javascript
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: true
  } : false
});
```

## Troubleshooting

### SSL Certificate Issues
If you get SSL errors, you can:
1. Download the CA certificate from Aiven console
2. Use `ssl-mode=REQUIRED` without certificate verification (less secure)
3. Set `rejectUnauthorized: false` in Node.js (not recommended for production)

### Connection Timeout
- Check if your IP is whitelisted in Aiven console
- Verify firewall settings
- Ensure correct host and port

### Authentication Failed
- Double-check username and password
- Verify the user has proper permissions

## Verification

After upload, verify your database:
```bash
mysql --host=YOUR_AIVEN_HOST \
  --port=YOUR_AIVEN_PORT \
  --user=YOUR_AIVEN_USER \
  --password=YOUR_AIVEN_PASSWORD \
  --ssl-mode=REQUIRED \
  YOUR_DATABASE_NAME \
  -e "SHOW TABLES;"
```

Or check stored procedures:
```bash
mysql --host=YOUR_AIVEN_HOST \
  --port=YOUR_AIVEN_PORT \
  --user=YOUR_AIVEN_USER \
  --password=YOUR_AIVEN_PASSWORD \
  --ssl-mode=REQUIRED \
  YOUR_DATABASE_NAME \
  -e "SHOW PROCEDURE STATUS WHERE Db = 'YOUR_DATABASE_NAME';"
```

## Next Steps

1. Test your backend connection to Aiven
2. Update your Docker configuration if using containers
3. Run your seed script to populate initial data (if needed)
4. Update frontend API endpoint if needed
