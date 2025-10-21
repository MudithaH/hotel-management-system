# Railway Deployment Guide

## Overview
This guide explains how to deploy the Hotel Management System on Railway.app. Since this is a multi-service application (backend + frontend), you'll need to deploy them as separate Railway services.

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway
- Aiven MySQL database (or Railway MySQL database)

## Architecture on Railway
- **Service 1**: Backend API (Node.js/Express)
- **Service 2**: Frontend (React/Vite)
- **Database**: External MySQL (Aiven) or Railway MySQL

## Deployment Steps

### Step 1: Deploy the Database (if not using Aiven)

1. Go to Railway dashboard
2. Click "New Project" → "Provision MySQL"
3. Note down the database credentials from the "Variables" tab

### Step 2: Deploy Backend Service

1. **Create Backend Service**
   - In Railway dashboard, click "New" → "GitHub Repo"
   - Select your `hotel-management-system` repository
   - Railway will create a service

2. **Configure Root Directory**
   - Go to service Settings
   - Under "Build", set **Root Directory** to: `backend`
   - Set **Builder** to: `DOCKERFILE` or `NIXPACKS`

3. **Add Environment Variables**
   Go to "Variables" tab and add:
   ```
   DB_HOST=<your-aiven-host>
   DB_PORT=<your-db-port>
   DB_NAME=hotel_management
   DB_USER=<your-db-user>
   DB_PASSWORD=<your-db-password>
   JWT_SECRET=<generate-a-long-random-string>
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the generated URL (e.g., `https://your-backend.up.railway.app`)

### Step 3: Deploy Frontend Service

1. **Create Frontend Service**
   - In the same Railway project, click "New" → "GitHub Repo"
   - Select the same repository
   - This creates a second service

2. **Configure Root Directory**
   - Go to service Settings
   - Under "Build", set **Root Directory** to: `frontend`
   - Set **Builder** to: `DOCKERFILE`

3. **Add Environment Variables**
   Go to "Variables" tab and add:
   ```
   VITE_API_URL=<your-backend-url-from-step-2>/api
   ```
   Example: `https://hotel-backend-production.up.railway.app/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Step 4: Update Backend CORS

1. Go to backend service "Variables" tab
2. Add/Update:
   ```
   FRONTEND_URL=<your-frontend-url>
   ```
   Example: `https://hotel-frontend-production.up.railway.app`

3. Redeploy backend service

### Step 5: Initialize Database

You need to run the SQL schema files. Two options:

**Option A: Using Railway MySQL Client**
1. Go to your MySQL service
2. Click "Connect" → "MySQL Client"
3. Run the SQL files in order:
   ```bash
   mysql -h <host> -u <user> -p<password> <database> < backend/schema.sql
   mysql -h <host> -u <user> -p<password> <database> < backend/procedures.sql
   mysql -h <host> -u <user> -p<password> <database> < backend/triggers.sql
   ```

**Option B: Using seed.js**
1. Add a new variable to backend: `INITIALIZE_DB=true`
2. Ensure `seed.js` runs on startup
3. Deploy backend - it will initialize the database

## Configuration Files Explained

### railway.toml
Tells Railway to use Dockerfile for building the backend service.

### nixpacks.toml
Alternative build configuration using Nixpacks (Railway's default builder).

### .railwayignore
Excludes unnecessary files from deployment (similar to .gitignore).

## Troubleshooting

### Error: "Error creating build plan with Railpack"
**Solution**: 
- Set the **Root Directory** in Railway service settings to: `backend`
- Set **Builder** to: `DOCKERFILE`
- This tells Railway where your application code is located

### Error: "No start command was found"
**Solution**:
- The root `requirements.txt` file was confusing Railway (it's been renamed to `PROJECT_REQUIREMENTS.md`)
- Ensure **Root Directory** is set to `backend` in Railway settings
- Railway will use the `Procfile` or `railway.toml` start command
- If still failing, manually set Start Command in Settings to: `node src/server.js`

### Database Connection Failed
**Solution**:
- Check all DB environment variables are correct
- Ensure Aiven database allows Railway IPs (usually 0.0.0.0/0)
- Test connection with Railway's built-in MySQL client

### Build Timeout
**Solution**:
- Railway has a 10-minute build timeout
- Optimize Dockerfile by using build cache
- Consider splitting large dependencies

### CORS Errors
**Solution**:
- Ensure `FRONTEND_URL` in backend matches your frontend Railway URL
- Update backend CORS configuration in `backend/src/app.js`

## Alternative: Monorepo Approach

If you want to deploy as a single service, create a root `package.json`:

```json
{
  "name": "hotel-management-system",
  "scripts": {
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  }
}
```

Then set Railway start command to: `npm run install:backend && npm run build:frontend && npm start`

## Cost Optimization

- **Free Tier**: Railway gives $5/month free credit
- **Backend**: ~$0.01/hour ($7.30/month)
- **Frontend**: ~$0.01/hour ($7.30/month)
- **MySQL**: Use external Aiven (free tier) or Railway MySQL (~$5/month)

## Health Checks

Railway automatically monitors:
- **Backend**: `GET /api/health`
- **Frontend**: `GET /`

## Custom Domains

1. Go to service "Settings" → "Domains"
2. Click "Generate Domain" or add custom domain
3. Update DNS records as instructed

## Continuous Deployment

Railway auto-deploys on:
- Push to main branch (or configured branch)
- Pull request merges

To disable:
- Go to service Settings → "Deploy" → Disable "Auto-Deploy"

## Useful Commands

Check logs:
```bash
railway logs
```

Run commands in Railway environment:
```bash
railway run npm install
railway run node seed.js
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository
