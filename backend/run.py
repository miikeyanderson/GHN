"""
Script to run the FastAPI application with proper configuration.
"""
import uvicorn
from app.core.config import get_settings

settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        workers=1,
        log_level="debug" if settings.DEBUG else "info",
        access_log=True,
        proxy_headers=True,
        forwarded_allow_ips="*",
    )
