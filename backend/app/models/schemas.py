from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    """Base user schema with common attributes"""
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., description="User's full name")

class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")

class UserResponse(UserBase):
    """Schema for user response"""
    id: int = Field(..., description="User's unique identifier")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schema for authentication token"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")

class TokenData(BaseModel):
    """Schema for token payload"""
    email: Optional[str] = Field(None, description="User's email from token")

class HealthCheck(BaseModel):
    """Schema for health check response"""
    status: str = Field(..., description="API status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(..., description="Current timestamp")

class ErrorResponse(BaseModel):
    """Schema for error responses"""
    detail: str = Field(..., description="Error detail message")
    status_code: int = Field(..., description="HTTP status code")
    timestamp: datetime = Field(..., description="Error timestamp")
