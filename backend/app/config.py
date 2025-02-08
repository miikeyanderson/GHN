from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Settings
    api_env: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_version: str = "0.1.0"
    
    # Sentry
    sentry_dsn: str | None = None
    sentry_environment: str = "development"
    sentry_traces_sample_rate: float = 0.05  # Reduced to 5% for better performance
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "env_prefix": ""
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# Ensure logs directory exists
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Log file path
LOG_FILE = LOGS_DIR / "ghn.log"
