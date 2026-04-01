# Production Registration Failed - Troubleshooting Guide

## Problem: "Registration failed. Please try again" + GET / 404

This typically means:
1. ❌ CORS is blocking the registration request
2. ❌ Backend URL is wrong in frontend
3. ❌ MongoDB connection is failing
4. ❌ Frontend and backend are not properly deployed

---

## Solution: Step-by-Step Fix

### Step 1: Fix Backend Environment Variables on Render

#### In Render Dashboard:
1. Go to your backend service
2. Click **"Environment"**
3. Update/add these variables:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/launchportfolio_admin?retryWrites=true&w=majority
JWT_SECRET=your-long-random-secret-key-here-use-something-like-abc123xyz789...
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://launchportfolio-admin.onrender.com,http://localhost:3000
```

**Important:**
- ❌ Remove any trailing commas in CORS_ORIGIN
- ✅ Use YOUR actual frontend URL from Render
- ✅ Use MongoDB Atlas connection string (not localhost!)

#### Get MongoDB Atlas URL:
1. Go to [mongodb.com](https://mongodb.com) → Atlas
2. Create cluster (free tier available)
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/...`
4. Paste into `MONGO_URI` above

---

### Step 2: Update Frontend Configuration for Render

#### File: `frontend/js/config.js`

Update the production API URL:

```javascript
production: {
  // Replace with your actual Render backend URL
  API_BASE_URL: 'https://your-launchportfolio-api.onrender.com/api',
  API_TIMEOUT: 15000,
},
```

**Find your backend URL:**
1. Go to Render Dashboard → Your backend service
2. URL is shown at the top (e.g., `https://launchportfolio-api.onrender.com`)

---

### Step 3: Verify Frontend Deployment

#### Check These:

✅ **Frontend is deployed separately** (not on backend server)
- Should be a "Static Site" service on Render OR
- Deployed on Netlify, Vercel, or other platform

✅ **Frontend files are in correct directory**
- All HTML files should be in `frontend/` folder
- `js/config.js` and `js/api.js` at `frontend/js/`

✅ **Render points to correct directory**
- Publish Directory: `frontend`
- Build Command: (leave empty - no build needed)

---

### Step 4: Test the Registration Flow

1. **Check backend logs:**
   - Render Dashboard → Backend Service → "Logs"
   - Look for any MongoDB or CORS errors

2. **Check browser console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for error messages
   - Check if `API_BASE_URL` is correct

3. **Test the request:**
   - In Console, run:
   ```javascript
   console.log('API URL:', window.APP_CONFIG.API_BASE_URL);
   ```
   - Should show production URL, not localhost

---

## Common Issues & Fixes

### Issue: "CORS error" in browser console

**Solution:**
```bash
# In backend .env (Render dashboard)
CORS_ORIGIN=https://launchportfolio-admin.onrender.com,http://localhost:3000
```

- ✅ Use HTTPS for production (Render auto-provides SSL)
- ✅ No trailing commas
- ✅ Use exact frontend URL

### Issue: "MongoDB connection failed"

**Solution:**
- Check `MONGO_URI` is from MongoDB Atlas (not localhost)
- Verify username:password are correct
- Check IP whitelist on MongoDB Atlas (allow all: 0.0.0.0/0)

### Issue: "GET / 404" error

**Solution:**
- This means backend is being accessed but frontend route doesn't exist
- Frontend should be deployed **separately** from backend
- OR backend should serve frontend static files (requires changes)

### Issue: Registration page won't load

**Solution:**
1. Check frontend is deployed (should see login page)
2. Check `config.js` is loaded:
   ```javascript
   // In browser console:
   console.log(window.APP_CONFIG);
   ```
   Should show your API URL

---

## Deployment Checklist

- [ ] Backend deployed on Render Web Service
- [ ] Backend environment variables set (MongoDB, JWT_SECRET, CORS_ORIGIN)
- [ ] MongoDB Atlas cluster created with connection string
- [ ] Frontend deployed on Render Static Site (or Netlify/Vercel)
- [ ] Frontend `config.js` has correct production API URL
- [ ] `config.js` script loaded before `api.js` in HTML
- [ ] CORS_ORIGIN doesn't have trailing comma
- [ ] NODE_ENV=production set in backend
- [ ] Tested login → register → dashboard flow

---

## Quick Restart

If changes aren't taking effect:

1. **Backend on Render:**
   - Go to service → "Manual Deploy" → "Deploy latest"

2. **Frontend on Render:**
   - Go to service → "Manual Deploy" → "Deploy latest"

3. **Browser:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache if needed

---

## Need Help?

Check these files in your repository:

1. `backend/.env` - Verify all variables are set
2. `frontend/js/config.js` - Verify production API_BASE_URL
3. `frontend/js/api.js` - Should use `window.APP_CONFIG`
4. All HTML files - Should load `config.js` before `api.js`

**Example correct script order:**
```html
<script src="js/config.js"></script>
<script src="js/api.js"></script>
```

