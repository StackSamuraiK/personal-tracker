# 🚀 Quick Fix for Render Deployment

## The Problem
Your TypeScript build fails on Render because it's not installing devDependencies before building.

## The Solution

### In Your Render Dashboard:

**Go to your backend service → Settings → Build & Deploy**

Change the **Build Command** to:
```bash
npm install && npm run build
```

Make sure **Start Command** is:
```bash
npm start
```

Set **Root Directory** to:
```
backend
```

### Required Environment Variables

In **Environment** tab, add:
- `DATABASE_URL` - your PostgreSQL connection string (from Render database)
- `JWT_SECRET` - your JWT secret key
- `NODE_ENV` - set to `production`

### Then Redeploy

Click **Manual Deploy** → **Deploy latest commit**

---

## Alternative: Use render.yaml (Automatic Configuration)

I've created a `render.yaml` file in your project root. To use it:

1. Push this file to GitHub
2. In Render, create a new **Blueprint** instance from your repo
3. Render will automatically configure everything

---

## What Changed in Your Code

✅ Added `render.yaml` - automatic Render configuration  
✅ Updated `backend/package.json` - added prebuild script to clean old builds  
✅ Created `DEPLOYMENT.md` - full deployment documentation

**Next step:** Commit and push these changes, then update your Render build command!
