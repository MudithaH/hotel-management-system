# ⚠️ IMMEDIATE FIX - Railway "Dockerfile does not exist" Error

## The Problem
Railway is looking for a Dockerfile in the root, but it's actually in the `backend/` folder.

## THE FIX (Do this RIGHT NOW in Railway Dashboard):

### Step 1: Set Root Directory ⚠️ **MOST IMPORTANT**
1. Go to your Railway project
2. Click on your service (hotel-management-system)
3. Click **Settings** (in the left sidebar)
4. Scroll to **Build** section
5. Find **Root Directory** field
6. Type: `backend`
7. Click **Save** or the checkmark ✓

### Step 2: Set Builder (Optional but recommended)
1. In the same **Build** section
2. Find **Builder** dropdown
3. Select: `NIXPACKS` (or leave as auto-detect)
4. Click **Save**

### Step 3: Add Environment Variables
1. Click **Variables** tab
2. Add these variables one by one (click "+ New Variable"):

```
DB_HOST=skynest-database-databaseproject-616.b.aivencloud.com
DB_PORT=21937
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_9ZKGn8oXGKK1XBypXSh
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345678901234567890
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
```

**Note:** Railway will also provide a `PORT` variable automatically. Your app should use `process.env.PORT` to be Railway-compatible.

### Step 4: Deploy
1. Go back to **Deployments** tab
2. Click **Deploy** button (top right)
3. Watch the build logs

## What Changed in the Code

✅ Updated `railway.toml` to use **NIXPACKS** builder instead of DOCKERFILE
✅ NIXPACKS automatically detects Node.js and builds it correctly
✅ All changes pushed to both GitHub repos

## Why This Works

When you set **Root Directory** to `backend`:
- Railway looks inside the `backend/` folder
- Finds `package.json` ✓
- NIXPACKS detects it's a Node.js project ✓
- Installs dependencies with `npm install` ✓
- Starts with `node src/server.js` ✓

## If Still Having Issues

### Check 1: Verify Root Directory is Set
```
Settings → Build → Root Directory = "backend" ✓
```

### Check 2: Check Build Logs
Look for these lines in build logs:
```
✓ Using Nixpacks
✓ Detected Node.js
✓ Installing dependencies...
```

### Check 3: Manual Start Command (if needed)
If auto-detection fails:
1. Settings → Deploy
2. Set **Start Command**: `node src/server.js`
3. Save and redeploy

## Testing After Deployment

Once deployed successfully, Railway will give you a URL like:
`https://hotel-management-system-production.up.railway.app`

Test it:
```bash
curl https://your-url.up.railway.app/api/health
```

Should return: `{"status":"healthy"}`

## Summary of Required Settings

| Setting | Value | Status |
|---------|-------|--------|
| Root Directory | `backend` | ⚠️ **REQUIRED** |
| Builder | `NIXPACKS` | ✅ Recommended |
| All ENV vars | Added in Variables tab | ⚠️ **REQUIRED** |

---

## Next Steps After Successful Deployment

1. ✅ Test the API endpoints
2. ✅ Check database connection
3. ✅ Deploy frontend (separate service)
4. ✅ Update CORS settings with frontend URL

Good luck! 🚀
