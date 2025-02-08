"""Health record model for storing patient health information."""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import enum

class RecordType(str, enum.Enum):
    """Type of health record"""
    GENERAL = "general"
    DIAGNOSIS = "diagnosis"
    TREATMENT = "treatment"
    LAB_RESULT = "lab_result"
    PRESCRIPTION = "prescription"

class HealthRecord(Base, TimestampMixin):
    """Health record model"""
    __tablename__ = "health_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"))
    record_type: Mapped[RecordType] = mapped_column(SQLEnum(RecordType))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    date_of_record: Mapped[datetime] = mapped_column(DateTime)
    provider_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    patient: Mapped["Patient"] = relationship("Patient", back_populates="health_records")
    treatments: Mapped[list["Treatment"]] = relationship(
        "Treatment", back_populates="health_record", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of the health record"""
        return f"<HealthRecord {self.title} for patient {self.patient_id}>"
