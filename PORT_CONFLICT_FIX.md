# 🔧 Port Conflict Resolution Guide

## Problem Identified

**Error:** Port 5000 is already in use  
**Cause:** A Node.js process (PID: 30176) is running on port 5000  
**Likely:** Your backend server is running locally outside of Docker

---

## Solution Options

### Option 1: Stop the Local Backend Server (Recommended)

Stop the Node.js process that's using port 5000:

```powershell
# Kill the process using port 5000
Stop-Process -Id 30176 -Force

# Or find and stop all node processes
Get-Process -Name node | Stop-Process -Force

# Verify port is free
netstat -ano | Select-String ":5000"
```

Then start Docker containers:

```powershell
docker-compose up -d
```

---

### Option 2: Change Docker Port Mapping

If you want to keep the local server running and run Docker on a different port:

**Edit `docker-compose.yml`:**

Change backend port mapping from `5000:5000` to `5001:5000`:

```yaml
backend:
  ports:
    - "5001:5000"  # Host:Container
```

**Update frontend API calls:**

If frontend is hardcoded to port 5000, you'll need to update `frontend/src/api/index.js` to use port 5001.

Then:

```powershell
docker-compose up -d
```

Access:
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

---

### Option 3: Check for Running Terminals

Check if you have a terminal running `npm run dev` or `npm start` in the backend folder:

1. Look at VS Code terminal tabs
2. Check Task Manager for node.exe processes
3. Stop any running backend servers

---

## Quick Commands

### Stop the conflicting process:
```powershell
# Stop specific process
Stop-Process -Id 30176 -Force

# Or stop all node processes (careful if you have other node apps)
Get-Process -Name node | Stop-Process -Force
```

### Verify port is free:
```powershell
netstat -ano | Select-String ":5000"
# Should return empty if port is free
```

### Start Docker containers:
```powershell
# Start in detached mode
docker-compose up -d

# Or start with logs visible
docker-compose up

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Verification Steps

After starting containers:

1. **Check container status:**
   ```powershell
   docker-compose ps
   ```
   Should show both containers as "running"

2. **Test backend health:**
   ```powershell
   curl http://localhost:5000/api/health
   ```

3. **Test frontend:**
   ```powershell
   curl http://localhost:3000
   ```

4. **Open in browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/health

---

## Common Issues

### Issue: Port still in use after stopping process

**Solution:**
```powershell
# Force kill all node processes
taskkill /F /IM node.exe

# Wait a few seconds
Start-Sleep -Seconds 3

# Try again
docker-compose up -d
```

### Issue: Frontend can't connect to backend

**Cause:** Frontend might be configured to use localhost:5000 but backend is on different port

**Solution:** Check `frontend/src/api/index.js` and ensure it points to correct backend URL

### Issue: Docker containers exit immediately

**Check logs:**
```powershell
docker-compose logs backend
docker-compose logs frontend
```

Common causes:
- Database connection failed (MySQL not running)
- Missing environment variables
- Application error on startup

---

## Recommended Workflow

When using Docker, you should:

1. ✅ **Stop all local servers** (npm run dev, npm start)
2. ✅ **Ensure MySQL is running locally** (net start MySQL80)
3. ✅ **Start Docker containers** (docker-compose up -d)
4. ✅ **Access via browser** (http://localhost:3000)

When developing locally (without Docker):

1. ✅ **Stop Docker containers** (docker-compose down)
2. ✅ **Start backend** (cd backend && npm run dev)
3. ✅ **Start frontend** (cd frontend && npm run dev)
4. ✅ **Ensure MySQL is running**

---

## Current Recommendation

Since you're trying to use Docker, I recommend:

```powershell
# 1. Stop the local backend server
Stop-Process -Id 30176 -Force

# 2. Verify port is free
netstat -ano | Select-String ":5000"

# 3. Ensure MySQL is running
net start MySQL80

# 4. Start Docker containers
docker-compose up -d

# 5. Check status
docker-compose ps

# 6. View logs
docker-compose logs -f

# 7. Open browser
Start-Process http://localhost:3000
```

---

**Quick Fix Command:**

```powershell
Stop-Process -Id 30176 -Force; docker-compose up -d; docker-compose ps
```

This will stop the conflicting process and start Docker containers in one command.
