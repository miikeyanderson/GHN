"""Patient schemas for request/response validation."""
from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class PatientBase(BaseModel):
    """Shared properties"""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: str = Field(..., pattern="^(male|female|other)$")
    contact_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(None, max_length=500)

class PatientCreate(PatientBase):
    """Properties to receive on patient creation"""
    pass

class PatientUpdate(PatientBase):
    """Properties to receive on patient update"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female|other)$")

class PatientInDBBase(PatientBase):
    """Properties shared by models stored in DB"""
    id: int
    is_active: bool

    class Config:
        """Pydantic config"""
        from_attributes = True

class Patient(PatientInDBBase):
    """Properties to return to client"""
    pass

class PatientInDB(PatientInDBBase):
    """Additional properties stored in DB"""
    pass
