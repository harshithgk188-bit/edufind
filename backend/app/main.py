from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .database import engine, Base, get_db
from .models import College, District, Course
from .utils.seed_data import seed_database

# Import routers
from .routers import (
    auth_router,
    districts_router,
    courses_router,
    colleges_router,
    ratings_router,
    favorites_router,
    recommendations_router,
    ai_router,
    admin_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="REST API for EduFind – Smart College & Course Discovery and Recommendation System"
)

# Parse CORS allowed origins from environment variable
raw_origins = settings.ALLOWED_ORIGINS.strip() if settings.ALLOWED_ORIGINS else "*"
if raw_origins == "*":
    origins = ["*"]
else:
    origins = [orig.strip() for orig in raw_origins.split(",") if orig.strip()]
    for dev_origin in ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"]:
        if dev_origin not in origins:
            origins.append(dev_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Safe table creation
    try:
        print("[INFO] Checking and creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] Database tables verified.")
    except Exception as e:
        print(f"[WARNING] Database table creation notice: {e}")

    # Auto-seed database if fewer than full dataset
    try:
        db = next(get_db())
        try:
            colleges_count = db.query(College).count()
            if colleges_count < 60:
                print(f"[INFO] Current college count is {colleges_count}. Seeding/updating comprehensive database...")
                res = seed_database(db)
                print(f"[SUCCESS] Database populated: {res.get('message')}")
        finally:
            db.close()
    except Exception as e:
        print(f"[WARNING] Database startup notice: {e}")

# Mount API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(districts_router, prefix="/api")
app.include_router(courses_router, prefix="/api")
app.include_router(colleges_router, prefix="/api")
app.include_router(ratings_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        colleges_count = db.query(College).count()
        districts_count = db.query(District).count()
        courses_count = db.query(Course).count()
        return {
            "status": "healthy",
            "database": "connected",
            "stats": {
                "colleges": colleges_count,
                "districts": districts_count,
                "courses": courses_count
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "disconnected",
            "error": str(e)
        }
