# Aiven Database Connection Guide

## Steps to Connect to Your Aiven MySQL Database

### 1. Download the CA Certificate (Recommended)

1. Go to your Aiven console: https://console.aiven.io
2. Navigate to your MySQL service: **skynest-database-databaseproject-616**
3. Go to the **Overview** tab
4. Find the **Connection information** section
5. Click **Download CA cert** button
6. Save the certificate as `ca.pem` in the `backend/certs/` directory

### 2. Verify Your Connection Settings

Your current settings in `.env`:
```
DB_HOST=skynest-database-databaseproject-616.b.aivencloud.com
DB_PORT=21937
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_9ZKGn8oXGKK1XBypXSh
DB_SSL=true
```

### 3. Test the Connection

Run your backend server:
```bash
cd backend
npm start
```

You should see detailed connection logs that will help diagnose any issues.

### 4. Common Connection Issues & Solutions

#### Issue: "ECONNREFUSED" or "Connection refused"
**Solution:**
- Check if the host and port are correct
- Verify that your Aiven service is running (not paused)
- Check if there's a firewall blocking the connection

#### Issue: "ER_ACCESS_DENIED_ERROR"
**Solution:**
- Double-check your username and password in `.env`
- Ensure there are no extra spaces in the credentials
- Reset the password in Aiven console if needed

#### Issue: "ENOTFOUND" or "Host not found"
**Solution:**
- Verify the hostname is correct
- Check your internet connection
- Try pinging the host: `ping skynest-database-databaseproject-616.b.aivencloud.com`

#### Issue: "ETIMEDOUT" or "Connection timeout"
**Solution:**
- Check if your IP is whitelisted in Aiven (if IP filtering is enabled)
- Try disabling VPN if you're using one
- Check corporate/ISP firewall settings

#### Issue: "UNABLE_TO_VERIFY_LEAF_SIGNATURE" or SSL errors
**Solution:**
- Download the CA certificate from Aiven (see step 1)
- Place it in `backend/certs/ca.pem`
- Restart your backend server

### 5. Alternative: Test with MySQL Client

You can also test the connection using MySQL command line:

```bash
mysql --host=skynest-database-databaseproject-616.b.aivencloud.com --port=21937 --user=avnadmin --password=AVNS_9ZKGn8oXGKK1XBypXSh --ssl-mode=REQUIRED defaultdb
```

### 6. Aiven Service Status

Check your service status:
- Go to Aiven console
- Ensure your service shows "Running" status
- Check if the service is not in maintenance mode

### 7. IP Whitelist (If Enabled)

If you have IP filtering enabled in Aiven:
1. Go to your service in Aiven console
2. Click on **VPC** or **Allowed IP addresses**
3. Add your current IP address or use `0.0.0.0/0` to allow all IPs (not recommended for production)

### 8. Quick Connection Test Script

Create a test file to verify connection:

```javascript
// test-db-connection.js
require('dotenv').config();
const { testConnection } = require('./src/config/db');

(async () => {
  const isConnected = await testConnection();
  if (isConnected) {
    console.log('✓ Database connection successful!');
    process.exit(0);
  } else {
    console.log('✗ Database connection failed!');
    process.exit(1);
  }
})();
```

Run it:
```bash
node test-db-connection.js
```

### 9. Environment Variables Checklist

Ensure your `.env` file has:
- [x] DB_HOST - Aiven hostname
- [x] DB_PORT - Correct port (21937)
- [x] DB_NAME - Database name (defaultdb)
- [x] DB_USER - Username (avnadmin)
- [x] DB_PASSWORD - Correct password
- [x] DB_SSL - Set to 'true'

### 10. Need More Help?

Check the error messages in your console when starting the backend. The improved error handler will provide specific guidance based on the error type.

**Note:** Without the CA certificate, the connection will still work with `rejectUnauthorized: false`, but it's less secure. For production, always use the CA certificate.
