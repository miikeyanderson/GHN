"""
Constants used throughout the application.
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
LOGS_DIR = BASE_DIR / "logs"
LOG_FILE = LOGS_DIR / "app.log"

# Ensure logs directory exists
LOGS_DIR.mkdir(exist_ok=True)

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM = "HS256"

# Database
DATABASE_NAME = "app.db"
DATABASE_PATH = BASE_DIR / DATABASE_NAME

# API
API_V1_STR = "/api/v1"
