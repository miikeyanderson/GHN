from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from app.models.schemas import Token, UserCreate, UserResponse
from app.core.security import create_access_token, get_current_user
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", 
    response_model=Token,
    summary="Authenticate user and return token",
    responses={
        200: {
            "description": "Successful login",
            "content": {
                "application/json": {
                    "example": {"access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...", "token_type": "bearer"}
                }
            }
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Incorrect email or password"}
                }
            }
        }
    }
)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate a user and return a JWT token.
    
    - **username**: Email address
    - **password**: User password
    """
    # Authentication logic here
    access_token = create_access_token(
        data={"sub": form_data.username},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    responses={
        201: {
            "description": "User successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "email": "user@example.com",
                        "full_name": "John Doe",
                        "id": 1,
                        "created_at": "2025-02-08T10:45:00"
                    }
                }
            }
        },
        400: {
            "description": "Invalid input",
            "content": {
                "application/json": {
                    "example": {"detail": "Email already registered"}
                }
            }
        }
    }
)
async def register(user: UserCreate):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **full_name**: User's full name
    - **password**: Strong password (min 8 characters)
    """
    # Registration logic here
    return {
        "email": user.email,
        "full_name": user.full_name,
        "id": 1,  # Replace with actual user ID
        "created_at": "2025-02-08T10:45:00"
    }
