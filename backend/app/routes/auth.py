from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import Token, UserCreate, UserResponse
from app.models.user import User
from app.core.security import create_access_token, get_current_user
from app.core.config import get_settings
from app.core.database import get_db

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
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """
    Authenticate a user and return a JWT token.
    
    - **username**: Email address
    - **password**: User password
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    user.update_last_login()
    await db.commit()
    
    access_token = create_access_token(
        data={"sub": user.email},
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
async def register(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **full_name**: User's full name
    - **password**: Strong password (min 8 characters)
    """
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        is_active=True
    )
    db_user.password = user.password  # This will hash the password
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user
