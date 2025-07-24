# Render Environment Variable Setup

## 🔧 Fix Mobile Login Issue

Your mobile login is failing because the frontend is trying to connect to `localhost:3001` instead of your Render API.

## 📋 Steps to Fix:

1. **Go to your Render Dashboard**
   - Visit: https://dashboard.render.com
   - Find your "kairos-v2-0" service

2. **Navigate to Environment Tab**
   - Click on your service
   - Go to "Environment" tab

3. **Add Environment Variable**
   - Click "Add Environment Variable"
   - **Name:** `VITE_API_URL`
   - **Value:** `https://kairos-v2-0.onrender.com/api`
   - Click "Save Changes"

4. **Wait for Auto-Deploy**
   - Render will automatically redeploy your app
   - This takes 2-5 minutes

## ✅ After Deployment:

Your mobile login will work because:
- Frontend will connect to: `https://kairos-v2-0.onrender.com/api`
- Instead of: `http://localhost:3001/api` (which mobile can't reach)

## 🧪 Test:

After deployment, try logging in on your phone at:
https://kairos-v2-0.onrender.com/login

The "unexpected error occurred" should be fixed! 🎉 