# SentinelAI — Complete Production Deployment & Database Setup Guide

This guide details step-by-step instructions for deploying the **PostgreSQL + PostGIS Database**, the **Node.js/Express Backend**, and the **Vite React Frontend** to production.

---

## 🗄️ Phase 1: Deploying the PostgreSQL + PostGIS Database

### Recommended Cloud Database Providers (Free Tier Available):
1. **Supabase (Recommended)**: [https://supabase.com](https://supabase.com) (Includes built-in PostGIS & SQL Editor)
2. **Neon Serverless Postgres**: [https://neon.tech](https://neon.tech)
3. **Render PostgreSQL**: [https://render.com](https://render.com)

---

### Step-by-Step Supabase Database Setup:

1. **Create a Supabase Project:**
   - Go to [https://supabase.com](https://supabase.com) and log in.
   - Click **"New Project"**, name it `SentinelAI-Database`, and set a secure database password.
   - Select region **South Asia (Mumbai - ap-south-1)** for lowest latency in India.

2. **Enable PostGIS Spatial Extension:**
   - In Supabase Dashboard, navigate to **SQL Editor**.
   - Paste and run the following command:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     ```

3. **Deploy Database Tables (Schema Execution):**
   - In SQL Editor, copy and paste the contents of [`database/schema.sql`](./database/schema.sql) and click **RUN**.
   - This creates tables for `users`, `incident_categories`, `incidents`, `infrastructure_telemetry`, and `patrol_allocations`.

4. **Seed Database with Hyderabad Telemetry Data:**
   - Copy and paste the contents of [`database/seed.sql`](./database/seed.sql) into the SQL Editor and click **RUN**.
   - This populates 57+ spatial locations, CCTV arrays, dark zone streetlights, and police stations across Hyderabad.

5. **Copy Your Database Connection String:**
   - Go to **Project Settings -> Database -> Connection String**.
   - Copy the URI under **URI / Node.js**:
     ```env
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
     ```

---

## ⚙️ Phase 2: Deploying the Express Backend API

### Deploying to Render.com:

1. **Connect GitHub Repository:**
   - Log in to [https://render.com](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repo: `harsha-vardhan-reddy-aindla/SentinalAI`.

2. **Configure Service Settings:**
   - **Name:** `sentinel-ai-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/server.js`

3. **Set Environment Variables:**
   Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `GEMINI_API_KEY`: `YOUR_GEMINI_API_KEY_HERE`
   - `JWT_SECRET`: `sentinel_ai_super_secret_jwt_key_2026_production_grade`
   - `DATABASE_URL`: *(Your Supabase connection string from Phase 1)*

4. Click **Deploy Web Service**. Render will build and deploy your API (e.g. `https://sentinel-ai-backend.onrender.com`).

---

## 🌐 Phase 3: Deploying the React Frontend

### Deploying to Vercel (Recommended):

1. **Import Repository on Vercel:**
   - Log in to [https://vercel.com](https://vercel.com).
   - Click **Add New...** -> **Project**.
   - Import `harsha-vardhan-reddy-aindla/SentinalAI`.

2. **Configure Build Settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Configure API Rewrite Proxy (`vercel.json`):**
   Add a `vercel.json` file inside `frontend/` to route `/api/*` to your backend:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://sentinel-ai-backend.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

4. Click **Deploy**. Vercel will deploy your live website link (e.g. `https://sentinal-ai.vercel.app`)!

---

## 💡 Verification Checklist After Deployment

- [ ] Open frontend URL on mobile & desktop.
- [ ] Test **Citizen Mobile OTP Login** (Mobile: `+91 9876543210`, OTP: `123456`).
- [ ] Test **Police Officer Login** (Badge ID: `P-8842`, Password: `Sentinel123!`).
- [ ] Test submitting a citizen report via **Live GPS / Landmark selector** on `/report`.
- [ ] Verify emergency dispatch on `/police`.
