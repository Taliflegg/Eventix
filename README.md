# 🚀 Eventix - Production Deployment Guide

A full-stack TypeScript monorepo with Express backend, React frontend, and Supabase database.

## 🚀 Quick Start

**Required tools:**
- Node.js 22+ 
- npm
- Git

```bash
# Clone the repository
git clone <your-repo-url>
cd eventix

# Install all dependencies
npm run install:all

# Build shared types package
cd packages/shared && npm run build && cd ../..

# Set up environment files
cd packages/backend && cp .env.example .env
cd ../frontend && cp .env.example .env && cd ../..

# Start both frontend and backend
npm run dev
```

**That's it!** 🎉
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

## 📋 Table of Contents

- [🏗️ Architecture Overview](#️-architecture-overview)
- [🔧 Prerequisites](#-prerequisites)
- [🗄️ Database Setup (Supabase)](#️-database-setup-supabase)
- [🖥️ Backend Deployment (Render)](#️-backend-deployment-render)
- [🌐 Frontend Deployment (Netlify)](#-frontend-deployment-netlify)
- [🔗 Final Configuration](#-final-configuration)
- [✅ Testing Your Production Setup](#-testing-your-production-setup)
- [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Netlify)     │───▶│   (Render)      │───▶│   (Supabase)    │
│   React + TS    │    │   Express + TS  │    │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Live URLs after deployment:**
- Frontend: `https://your-app.netlify.app`
- Backend API: `https://your-backend.onrender.com/api`
- Database: Managed by Supabase

---

## 🔧 Prerequisites

Before starting, ensure you have accounts on:

- [GitHub](https://github.com) (for code repository)
- [Supabase](https://supabase.com) (database)
- [Render](https://render.com) (backend hosting)
- [Netlify](https://netlify.com) (frontend hosting)

---

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project

1. **Sign up/Login** to [Supabase](https://supabase.com)
2. **Create New Project**
   - Project name: `eventix-db` (or your choice)
   - Database password: Generate and **save securely**
   - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for setup** (1-2 minutes)

### Step 2: Set Up Database Schema

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Copy and paste this SQL:

```sql
-- Create the events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'he')),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('meat', 'dairy', 'vegetarian', 'vegan', 'kosher', 'bbq', 'other')),
  expected_count INTEGER NOT NULL,
  actual_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_datetime ON events(datetime);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Click **"RUN"** to execute

### Step 3: Get Your Credentials

1. Go to **Settings → API**
2. **Copy and save these values:**
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (for production)

> ⚠️ **Keep these credentials secure!** Never commit them to git.

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy to Render

1. **Sign up/Login** to [Render](https://render.com)
2. **Connect GitHub** account if not already connected
3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository
   - Select your `eventix` repository

4. **Configure the service:**
   - **Name**: `eventix-backend`
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main` (or `production`)
   - **Root Directory**: `packages/backend`
   - **Runtime**: Node
   - **Build Command**: 
     ```bash
     cd ../shared && npm install && npm run build && cd ../backend && npm ci --include=dev && npm run build
     ```
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Set Environment Variables

In the Render dashboard, go to **Environment** tab and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `CORS_ORIGIN` | `https://your-frontend-url.netlify.app` | Update after frontend deployment |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase dashboard |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1...` | From Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1...` | From Supabase dashboard (optional) |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Test your backend**: Visit `https://your-backend.onrender.com/api/health`

> 📝 **Save your backend URL** - you'll need it for frontend configuration!

---

## 🌐 Frontend Deployment (cloudflare)

### Step 1: Deploy to cloudflare

1. **Sign up/Login** to [cloudflare](https://cloudflare.com)
2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from GitHub
   - Select your `eventix` repository

3. **Configure the project:**
   - **Project Name**: `eventix-frontend`
   - **Branch to Deploy**: `main` (or `production`)
   - **Framework Preset**: Create React App
   - **Base Directory**: `packages/frontend`
   - **Build Command**: 
     ```bash
     cd ../shared && npm install && npm run build && cd ../frontend && npm install && npm run build
     ```
   - **Publish Directory**: `packages/frontend/build`

### Step 2: Set Environment Variables

In cloudflare dashboard, go to **Settings** → **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` | Production |
| `REACT_APP_ENV` | `production` | Production |

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. **Test your frontend**: Visit your cloudflare URL

---

## 🔗 Final Configuration

### Update CORS Settings

1. **Go back to Render** (backend)
2. **Update Environment Variables**:
   - Set `CORS_ORIGIN` to your actual cloudflare URL: `https://your-app.cloudflare.app`
3. **Redeploy** the backend service

### Enable Auto-Deploy (Optional)

**For Render:**
1. Go to **Settings** → **Build & Deploy**
2. Enable **Auto-Deploy**: `Yes`

**For cloudflare:**
- Auto-deploy is enabled by default

---

## ✅ Testing Your Production Setup

### 1. Health Check
Visit: `https://your-backend.onrender.com/api/health`

**Expected response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-05-25T...",
    "uptime": 123.45,
    "environment": "production"
  }
}
```

### 3. Frontend Application
Visit: `https://your-app.cloudflare.app`

**Should show:**
- ✅ Events list loads successfully
- ✅ Backend health check works
- ✅ Clicking events shows details
- ✅ Error handling works

### 4. Database Verification
1. Go to **Supabase Dashboard** → **Table Editor**
2. Check **events** table has data
3. Verify new events appear when backend initializes

---

## 🎉 Success!

Your full-stack application is now running in production with:

- ✅ **Frontend** on cloudflare with global CDN
- ✅ **Backend** on Render with auto-scaling
- ✅ **Database** on Supabase with backups
- ✅ **HTTPS** enabled everywhere
- ✅ **Auto-deployment** from GitHub

*Happy coding! 🚀*#   E v e n t i x  
 