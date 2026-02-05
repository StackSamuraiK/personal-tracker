# Deployment Guide for Render

## Quick Setup

### 1. Configure Render Service

In your Render dashboard:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start`
3. **Root Directory**: `backend`

### 2. Environment Variables

Set these in the Render dashboard (Environment tab):

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to `production`

### 3. Auto-Deploy from GitHub

Connect your GitHub repository to Render, and it will auto-deploy on every push to master.

---

## Why the Build Was Failing

**The Problem:**
TypeScript compilation requires type definition packages (`@types/node`, `@types/express`, etc.) which are in `devDependencies`. By default, some platforms skip devDependencies in production.

**The Solution:**
Our `render.yaml` configuration explicitly runs `npm install` (which installs ALL dependencies including devDependencies) **before** running `npm run build`.

**Build Process:**
```bash
npm install          # Installs ALL dependencies (runtime + dev)
npm run build        # Compiles TypeScript → JavaScript
npm start            # Runs the compiled JavaScript from /dist
```

---

## Render Configuration File

The `render.yaml` file in the project root automatically configures your Render service with the correct build settings.

### Manual Setup (if not using render.yaml)

If you prefer to configure manually in the Render dashboard:

**Service Settings:**
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18+ (Render uses the latest LTS by default)

---

## Database Setup

Render requires a PostgreSQL database:

1. Create a PostgreSQL instance in Render
2. Copy the **Internal Database URL**
3. Add it to your service's environment variables as `DATABASE_URL`
4. The database will auto-migrate on first run (if you have migrations configured)

---

## Troubleshooting

### Build fails with TypeScript errors
- **Cause**: devDependencies not installed before build
- **Fix**: Ensure build command is `npm install && npm run build` (NOT `npm ci --production`)

### "Cannot find module" errors at runtime
- **Cause**: Missing runtime dependencies
- **Fix**: Ensure all runtime packages are in `dependencies`, not `devDependencies`

### Database connection fails
- **Cause**: Incorrect DATABASE_URL or database not created
- **Fix**: Use Render's **Internal Database URL**, not the external one

---

## Best Practices

✅ **DO:**
- Use `npm install` in build command (installs all deps for compilation)
- Keep TypeScript and `@types/*` in `devDependencies`
- Use environment variables for secrets
- Test builds locally with `npm run build` before deploying

❌ **DON'T:**
- Use `npm ci --production` for build (skips devDependencies)
- Commit `.env` files to Git
- Put TypeScript in `dependencies` just to fix builds
