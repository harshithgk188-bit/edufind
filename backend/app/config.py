import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduFind - Smart College & Course Discovery"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security: Read secrets exclusively from environment variables in production
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "edufind_default_secret_for_local_development_only_replace_in_prod"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080")) # 7 days
    
    # Cloud MySQL / SQLite database connection string
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./edufind.db"
    )
    
    # CORS: Comma-separated list of allowed origins (e.g. "https://edufind.vercel.app,http://localhost:3000")
    # In development, "*" allows all origins. In production, configure with your Vercel domain.
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "*")
    
    # Optional LLM API keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
