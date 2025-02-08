"""Treatment model for storing treatment information."""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import enum

class TreatmentStatus(str, enum.Enum):
    """Status of treatment"""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Treatment(Base, TimestampMixin):
    """Treatment model"""
    __tablename__ = "treatments"

    id: Mapped[int] = mapped_column(primary_key=True)
    health_record_id: Mapped[int] = mapped_column(ForeignKey("health_records.id"))
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    status: Mapped[TreatmentStatus] = mapped_column(SQLEnum(TreatmentStatus))
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    provider_name: Mapped[str] = mapped_column(String(200))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    health_record: Mapped["HealthRecord"] = relationship(
        "HealthRecord", back_populates="treatments"
    )

    def __repr__(self) -> str:
        """String representation of the treatment"""
        return f"<Treatment {self.name} for record {self.health_record_id}>"
