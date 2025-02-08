"""Health record schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.health_record import RecordType

class TreatmentBase(BaseModel):
    """Base Treatment Schema"""
    name: str = Field(..., min_length=1, max_length=200)
    description: str
    provider_name: str = Field(..., min_length=1, max_length=200)
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class TreatmentCreate(TreatmentBase):
    """Properties to receive on treatment creation"""
    pass

class Treatment(TreatmentBase):
    """Properties to return to client"""
    id: int
    health_record_id: int
    status: str

    class Config:
        """Pydantic config"""
        from_attributes = True

class HealthRecordBase(BaseModel):
    """Base Health Record Schema"""
    record_type: RecordType
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    date_of_record: datetime
    provider_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None

class HealthRecordCreate(HealthRecordBase):
    """Properties to receive on health record creation"""
    treatments: Optional[List[TreatmentCreate]] = None

class HealthRecordUpdate(BaseModel):
    """Properties to receive on health record update"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    provider_name: Optional[str] = Field(None, max_length=200)
    notes: Optional[str] = None

class HealthRecord(HealthRecordBase):
    """Properties to return to client"""
    id: int
    patient_id: int
    treatments: List[Treatment] = []

    class Config:
        """Pydantic config"""
        from_attributes = True
