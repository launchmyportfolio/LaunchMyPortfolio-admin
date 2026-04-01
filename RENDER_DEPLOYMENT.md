# Render Deployment Guide

## Frontend & Backend Setup on Render

### Backend Deployment (Node.js/Express)

#### Step 1: Prepare Your Repository

```bash
# Make sure your repository is pushed to GitHub
git push origin main
```

#### Step 2: Create Backend Service on Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository
4. Configure the service:
   - **Name**: `launchportfolio-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run dev` or `npm start`
   - **Branch**: `main`

#### Step 3: Set Environment Variables

In Render Dashboard → Your Service → **Environment**:

```
MONGO_URI=mongodb://your-connection-string
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.onrender.com,http://localhost:3000
```

#### Step 4: Note Your Backend URL

After deployment, you'll get a URL like: `https://launchportfolio-api.onrender.com`

---

### Frontend Deployment (Static Site)

#### Option 1: Deploy on Render (Recommended)

1. Click **"New +"** → **"Static Site"**
2. Select your GitHub repository
3. Configure:
   - **Name**: `launchportfolio-admin`
   - **Build Command**: (leave empty - no build needed)
   - **Publish Directory**: `frontend`

#### Option 2: Deploy via other platforms

- **Netlify**: Drag & drop `frontend` folder
- **Vercel**: Import repository
- **GitHub Pages**: Push frontend to separate branch

#### Step 5: Update Frontend Configuration

Once you have your backend Render URL, update the configuration:

**File**: `frontend/js/config.js`

```javascript
production: {
  API_BASE_URL: 'https://launchportfolio-api.onrender.com/api',
  API_TIMEOUT: 15000,
},
```

Or set it via environment variable in Render dashboard:

```
VITE_API_BASE_URL=https://launchportfolio-api.onrender.com/api
```

---

### Environment Detection

The frontend automatically detects the environment:

- **Development** (localhost/127.0.0.1): Uses local API (`http://localhost:5000/api`)
- **Production** (any other domain): Uses Render API URL

### Testing

1. **Local Testing**: 
   ```bash
   npm run dev  # Backend
   npx http-server -p 3000  # Frontend
   ```

2. **Production Testing**:
   - Visit your Render frontend URL
   - Check browser console for: `📍 API Base URL: https://launchportfolio-api.onrender.com/api`
   - Verify CORS is configured in backend

---

### Troubleshooting

#### CORS Errors
- Check `CORS_ORIGIN` includes your frontend URL
- Format: `https://your-frontend-url.onrender.com`

#### API Connection Fails
- Verify backend URL in `config.js` matches Render deployment URL
- Check backend service status on Render dashboard
- Ensure `NODE_ENV=production` is set

#### Cold Starts
Render services spin down after inactivity. First requests may be slow (30-60s).

---

### Quick Checklist

- [ ] Backend deployed on Render
- [ ] Backend environment variables set
- [ ] CORS_ORIGIN includes frontend URL
- [ ] Frontend deployed on Render or other platform
- [ ] `config.js` has correct backend API URL
- [ ] `config.js` script loaded before `api.js` in all HTML files
- [ ] Tested login → dashboard → customers workflow
- [ ] Tested add/edit customer forms
- [ ] Tested payment recording

---

### Contact & Support

For issues, check:
1. Render dashboard logs
2. Browser DevTools console
3. Network tab for failed requests
4. Backend application logs

