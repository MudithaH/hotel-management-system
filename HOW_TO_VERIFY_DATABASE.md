# How to Verify Your Database Connection (Aiven vs Local)

## ✅ CONFIRMED: You're Connected to Aiven!

Your verification shows:
- **Host:** `skynest-database-1` (Aiven internal hostname)
- **Port:** `21937` (Aiven custom port, not standard 3306)
- **Database:** `defaultdb` (Aiven default, not `hotel_management`)
- **SSL:** ✅ Enabled with `TLS_AES_256_GCM_SHA384`
- **User:** `avnadmin@203.189.184.122` (your IP)

## 🔍 Quick Verification Methods

### Method 1: Run Verification Script (Recommended)
```bash
cd backend
node verify_database.js
```

**What to look for:**
- ✅ **Aiven:** Host contains "aivencloud" or custom hostname, Port 21937, SSL enabled
- ❌ **Local:** Host is "localhost", Port 3306, SSL disabled

### Method 2: Check .env File
```bash
cat backend/.env | grep DB_
```

**Aiven Configuration:**
```env
DB_HOST=skynest-database-databaseproject-616.b.aivencloud.com  # Contains "aivencloud"
DB_PORT=21937                                                  # Non-standard port
DB_NAME=defaultdb                                              # Aiven default
DB_SSL=true                                                    # SSL required
```

**Local Configuration:**
```env
DB_HOST=localhost        # or 127.0.0.1
DB_PORT=3306            # Standard MySQL port
DB_NAME=hotel_management
DB_SSL=false            # Usually not needed locally
```

### Method 3: Direct MySQL Query
```bash
mysql --host=skynest-database-databaseproject-616.b.aivencloud.com \
  --port=21937 \
  --user=avnadmin \
  --password=AVNS_9ZKGn8oXGKK1XBypXSh \
  --ssl-mode=REQUIRED \
  defaultdb \
  -e "SELECT @@hostname, @@port, DATABASE(), USER(), VERSION();"
```

### Method 4: Check Backend Logs
When you start your backend (`npm start`), look for:
```
Database connected successfully
```

Then check the database host in the connection pool configuration.

### Method 5: Test with Wrong Credentials
**Temporarily** change your `.env` to wrong credentials:
```bash
# Edit .env and change password
DB_PASSWORD=wrong_password
```

Then run:
```bash
node verify_database.js
```

If it fails to connect, you know it's reading from `.env` correctly. 
**Don't forget to change it back!**

### Method 6: Check Active MySQL Connections

**On Local MySQL (if running):**
```bash
mysql -u root -p -e "SHOW PROCESSLIST;"
```

You should NOT see your backend connection here if using Aiven.

**On Aiven (via their console):**
- Log into Aiven console
- Go to your service
- Check "Current queries" or "Metrics"
- You should see active connections from your IP

## 🎯 Quick Reference Table

| Indicator | Aiven | Local |
|-----------|-------|-------|
| **Hostname** | `*.aivencloud.com` or cloud hostname | `localhost` or `127.0.0.1` |
| **Port** | 21937 (custom) | 3306 (standard) |
| **Database** | `defaultdb` | `hotel_management` |
| **SSL** | ✅ Required | ❌ Usually disabled |
| **User** | `avnadmin` | `root` |
| **Connection** | Shows your public IP | Shows localhost |

## 🔧 How to Switch Between Databases

### Switch to Aiven:
Edit `backend/.env`:
```env
DB_HOST=skynest-database-databaseproject-616.b.aivencloud.com
DB_PORT=21937
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_9ZKGn8oXGKK1XBypXSh
DB_SSL=true
```

### Switch to Local:
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hotel_management
DB_USER=root
DB_PASSWORD=Ishakya.123
DB_SSL=false
```

After changing, restart your backend server!

## 📊 Current Status

Based on the verification output:

✅ **CURRENTLY CONNECTED TO: AIVEN CLOUD DATABASE**

Evidence:
- Hostname: `skynest-database-1`
- Port: `21937`
- Database: `defaultdb`
- SSL: Enabled (TLS_AES_256_GCM_SHA384)
- User: `avnadmin@203.189.184.122`
- 13 tables found
- 5 stored procedures found

Your backend is **NOT** using local database. It's successfully connected to Aiven! 🎉

## 🚨 Troubleshooting

**Still unsure?**

1. **Stop local MySQL** (if you have it):
   ```bash
   sudo systemctl stop mysql
   # or
   sudo service mysql stop
   ```

2. **Try your backend**:
   ```bash
   cd backend
   npm start
   ```

3. If it still works → You're using Aiven! ✅
4. If it fails → You were using local, and now it can't connect

Don't forget to start MySQL again if you need it:
```bash
sudo systemctl start mysql
```

## 📝 Notes

- Your `.env` file determines which database is used
- Always check `.env` first when troubleshooting connections
- Aiven requires SSL, local typically doesn't
- Port 21937 is a clear indicator of Aiven (non-standard port)
- The verification script is the most reliable method

---

**Last Verified:** October 18, 2025  
**Status:** ✅ Connected to Aiven Cloud Database
