from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

# Get the root directory of the project
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
LOG_FILE = ROOT_DIR / "logs" / "app.log"

class Settings(BaseSettings):
    """Application settings"""
    
    # Core settings
    DEBUG: bool = False
    PROJECT_NAME: str = "Global HealthOps Nexus API"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api/v1"
    API_ENV: str = "development"
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "*"  # Allow all origins in development by default
    
    # Sentry
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    SENTRY_TRACES_SAMPLE_RATE: float = 1.0
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
