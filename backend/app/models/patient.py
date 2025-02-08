"""Patient model for storing patient information."""
from datetime import date
from typing import Optional
from sqlalchemy import String, Date, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

class Patient(Base, TimestampMixin):
    """Patient model"""
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    date_of_birth: Mapped[date] = mapped_column(Date)
    gender: Mapped[str] = mapped_column(String(20))
    contact_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    health_records: Mapped[list["HealthRecord"]] = relationship(
        "HealthRecord", back_populates="patient", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """String representation of the patient"""
        return f"<Patient {self.first_name} {self.last_name}>"
