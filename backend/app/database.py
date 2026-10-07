import os
import ssl
import re
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Normalize MySQL driver scheme if needed
db_url = settings.DATABASE_URL
if db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

# Clean query arguments that PyMySQL does not support natively as URL query params
if "ssl_mode=" in db_url:
    db_url = re.sub(r'[?&]ssl_mode=[^&]+', '', db_url)
    if '?' not in db_url and '&' in db_url:
        db_url = db_url.replace('&', '?', 1)

# Engine configuration
connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    # Production MySQL connection pool settings
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

    # Auto-enable SSL context for Cloud MySQL (Aiven, TiDB, Railway, etc.)
    if "aivencloud" in db_url or "tidbcloud" in db_url or "railway" in db_url or "ssl" in db_url:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_ctx

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
