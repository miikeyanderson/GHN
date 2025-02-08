from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import sys
import logging.handlers
from app.config import get_settings, LOG_FILE
from app.core.logging import setup_sentry, capture_error, logger

# Initialize settings
settings = get_settings()

# Initialize Sentry
setup_sentry()

# Configure file handler
file_handler = logging.handlers.RotatingFileHandler(
    LOG_FILE,
    maxBytes=500 * 1024 * 1024,  # 500 MB
    backupCount=10
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(file_handler)

# Configure console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(console_handler)

# Set logging level
logger.setLevel(logging.DEBUG)

app = FastAPI(
    title="Global HealthOps Nexus API",
    description="""Backend API for the Global HealthOps Nexus (GHN) MVP.
    
    ## Features
    
    * 🔐 **Authentication**: JWT-based authentication system
    * 👥 **User Management**: User registration and profile management
    * 🏥 **Health Records**: Secure health record management
    * 📊 **Analytics**: Health data analytics and reporting
    
    ## Authentication
    
    All authenticated endpoints require a valid JWT token in the Authorization header:
    ```
    Authorization: Bearer <token>
    ```
    
    ## Error Handling
    
    The API uses standard HTTP status codes and returns consistent error responses:
    ```json
    {
        "detail": "Error message",
        "status_code": 400,
        "timestamp": "2025-02-08T10:45:00"
    }
    ```
    """,
    version="0.1.0",
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "Operations for user authentication and registration"
        },
        {
            "name": "Health",
            "description": "API health check and monitoring endpoints"
        }
    ],
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
allowed_origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Alternative Vite port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info(f"Configured CORS with allowed origins: {allowed_origins}")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Log the incoming request
    logger.info(
        f"Incoming {request.method} {request.url.path}",
        extra={
            "headers": dict(request.headers),
            "client": request.client.host if request.client else "unknown",
        }
    )
    
    try:
        response = await call_next(request)
        duration = time.time() - start_time
        
        # Log the response
        logger.info(
            f"Completed {request.method} {request.url.path} - {response.status_code}",
            extra={
                "duration": f"{duration:.2f}s",
                "status_code": response.status_code,
            }
        )
        return response
    except Exception as e:
        logger.error(
            f"Error processing {request.method} {request.url.path}: {str(e)}",
            exc_info=True
        )
        raise
    return response

# Error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error processing request: {request.url.path}", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Import routers
from app.routes import auth, health

# Include routers
app.include_router(auth.router)
app.include_router(health.router)

# Test endpoint for error logging
@app.get("/test-error", include_in_schema=False)
@capture_error
async def test_error():
    """Endpoint that raises an error to test Sentry integration"""
    logger.info("Test error endpoint called")
    raise ValueError("This is a test error to verify Sentry integration")
