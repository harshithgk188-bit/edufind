# EduFind – Smart College & Course Discovery and Recommendation System

A modern, responsive full-stack web application designed for students to discover, compare, and get personalized recommendations for colleges and courses across Karnataka.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Production Hosting |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Leaflet (OpenStreetMap), Recharts, Lucide Icons | **Vercel** |
| **Backend API** | Python 3.12, FastAPI, Uvicorn / Gunicorn, SQLAlchemy 2.0, Pydantic v2 | **Render** |
| **Database** | MySQL 8.0 / MariaDB (Normalized 3NF relational schema) | **Cloud MySQL** (Aiven, TiDB Cloud, Railway) |
| **Authentication** | JWT (JSON Web Tokens), Bcrypt password hashing | Role-Based (Student, College Admin, Super Admin) |

---

## 📁 Repository Structure

```
eduFind/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # Navbar, Footer, CollegeCard, Filters, Leaflet Map, Reviews, AI Chat
│   │   ├── context/              # AuthContext, CompareContext, FavoritesContext
│   │   ├── pages/                # Home, Districts, Search, Details, Compare, Recommendations, Dashboards
│   │   ├── services/api.js       # Dynamic Axios client using VITE_API_URL
│   │   └── App.jsx               # Routes and Global Floating Assistant
│   ├── .env.example              # VITE_API_URL template
│   ├── vercel.json               # SPA routing rewrite rule for Vercel
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # FastAPI Python Server
│   ├── app/
│   │   ├── main.py               # FastAPI entry, dynamic CORS middleware, startup auto-seeder
│   │   ├── config.py             # Settings loading from environment variables
│   │   ├── database.py           # SQLAlchemy engine with cloud connection pooling
│   │   ├── models/               # 11 Relational DB models
│   │   ├── routers/              # Auth, Districts, Courses, Colleges, Ratings, Recommendations, AI, Admin
│   │   ├── services/             # Auth, Recommender, Ground-Truth AI Assistant
│   │   └── utils/seed_data.py    # Seed data generator
│   ├── .env.example              # Production backend environment template
│   ├── requirements.txt          # Python dependencies (FastAPI, PyMySQL, Gunicorn, etc.)
│   └── run.py                    # Local launcher
│
├── database/
│   ├── cloud_mysql_import.sql    # Universal cloud SQL import script (works on all cloud databases)
│   ├── schema.sql                # Complete MySQL 8.0 schema DDL
│   └── seed.sql                  # Verified Karnataka colleges seed dataset
│
├── docs/
│   ├── ARCHITECTURE.md           # System architecture and API design
│   └── BCA_PROJECT_REPORT.md     # 23-section BCA major project report & viva questions
│
├── .gitignore                    # Prevents secrets, node_modules, and virtualenvs from leaking
├── start_all.bat                 # One-click Windows local launcher
└── README.md
```

---

## 💻 Local Development Setup

### 1. Backend (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
- API Server: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

### 2. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🚀 Production Deployment Guide

### STEP 1: Cloud MySQL Database Setup
Choose any reliable free/affordable Cloud MySQL provider:
- **Aiven for MySQL** (Free tier / free trial with MySQL 8.0, SSL enabled)
- **TiDB Cloud** (Free Serverless MySQL-compatible cluster)
- **Railway** (MySQL database service)

Once created, obtain your connection string:
```
mysql+pymysql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?ssl_verify_cert=false
```

### STEP 2: Import Database Tables & Seed Data
Execute the universal cloud SQL script in your cloud console / DBeaver / phpMyAdmin:
- Script location: `database/cloud_mysql_import.sql`
*(Alternatively, simply pointing FastAPI to the cloud database will automatically create all tables and populate the verified dataset on its very first launch).*

### STEP 3 & 4: Deploy FastAPI Backend on Render
1. Create an account on **[Render.com](https://render.com/)**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing the `eduFind` project.
4. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables under **Environment**:
   - `DATABASE_URL`: Your cloud MySQL connection string
   - `SECRET_KEY`: A strong random string
   - `ALLOWED_ORIGINS`: `*` (temporarily, update with your Vercel URL in Step 7)
6. Click **Create Web Service**. Note your Render backend URL (e.g., `https://edufind-backend.onrender.com`).

### STEP 5 & 6: Deploy React Frontend on Vercel
1. Create an account on **[Vercel.com](https://vercel.com/)**.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Root Directory**: Click edit and choose `frontend`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-service.onrender.com` (Your Render URL from Step 4)
6. Click **Deploy**. Note your live Vercel URL (e.g., `https://edufind-app.vercel.app`).

### STEP 7: Update Backend CORS on Render
1. Go back to your Render Dashboard → Your Web Service → **Environment**.
2. Update `ALLOWED_ORIGINS` to:
   ```
   https://your-edufind-app.vercel.app,http://localhost:3000
   ```
3. Save changes. Render will automatically redeploy the service with strict CORS protection.

### STEP 8: Test Deployed Application
Verify all features on the live Vercel website:
- Student Registration & Login
- District Selection (Tumkur, Bangalore, etc.)
- Course Search (BCA, MCA, B.Com, etc.)
- College Profiles & Verified Fee Breakdowns
- 6-Category Rating Submission & Reviews
- Favorites & Side-by-Side College Comparison Matrix
- Smart Recommendation Engine Match Scores
- Ground-Truth EduFind AI Assistant
- Super Admin Dashboard Analytics & Audits
