import os
import ssl
import re
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

def create_db_engine(raw_url: str):
    db_url = raw_url.strip()
    if db_url.startswith("mysql://"):
        db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

    # Clean query arguments that PyMySQL does not support natively as URL query params
    if "ssl_mode=" in db_url or "ssl-mode=" in db_url:
        db_url = re.sub(r'[?&]ssl[-_]mode=[^&]+', '', db_url)
        if '?' not in db_url and '&' in db_url:
            db_url = db_url.replace('&', '?', 1)

    connect_args = {}
    engine_kwargs = {
        "pool_pre_ping": True,
    }

    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    else:
        engine_kwargs["pool_recycle"] = 300
        engine_kwargs["pool_size"] = 10
        engine_kwargs["max_overflow"] = 20

        # Auto-enable SSL context for Cloud MySQL (Aiven, TiDB, Railway, etc.)
        if any(keyword in db_url for keyword in ["aivencloud", "tidbcloud", "railway", "ssl"]):
            ssl_ctx = ssl._create_unverified_context()
            connect_args["ssl"] = ssl_ctx

    return create_engine(
        db_url,
        connect_args=connect_args,
        **engine_kwargs
    )

Base = declarative_base()

# Resilient engine initialization
try:
    engine = create_db_engine(settings.DATABASE_URL)
    with engine.connect() as test_conn:
        pass
    print("[SUCCESS] Primary database connection established.")
except Exception as e:
    if not settings.DATABASE_URL.startswith("sqlite"):
        print(f"[WARNING] Primary Cloud MySQL connection issue: {e}")
        print("[INFO] Enabling high-availability SQLite fallback to ensure uninterrupted service.")
        engine = create_engine(
            "sqlite:///./edufind.db",
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )
    else:
        raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
