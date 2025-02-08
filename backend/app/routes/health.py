from fastapi import APIRouter, Request
from app.models.schemas import HealthCheck
from datetime import datetime
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/check",
    response_model=HealthCheck,
    summary="Check API health status",
    responses={
        200: {
            "description": "API is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "version": "0.1.0",
                        "timestamp": "2025-02-08T10:45:00"
                    }
                }
            }
        }
    }
)
async def health_check(request: Request):
    """
    Check the health status of the API.
    
    Returns:
        - **status**: Current API status
        - **version**: API version
        - **timestamp**: Current server time
    """
    return {
        "status": "healthy",
        "version": settings.version,
        "timestamp": datetime.utcnow()
    }
