from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    api_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Sentry
    sentry_dsn: str | None = None
    sentry_environment: str = "development"
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "{time} | {level} | {message}"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Ensure logs directory exists
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Log file path
LOG_FILE = LOGS_DIR / "ghn.log"
