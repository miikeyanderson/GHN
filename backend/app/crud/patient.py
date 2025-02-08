"""CRUD operations for Patient model."""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate

class CRUDPatient(CRUDBase[Patient, PatientCreate, PatientUpdate]):
    """CRUD operations for Patient model"""

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[Patient]:
        """Get a patient by email"""
        result = await db.execute(select(Patient).filter(Patient.email == email))
        return result.scalar_one_or_none()

    async def search(
        self,
        db: AsyncSession,
        *,
        term: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Patient]:
        """Search patients by name or email"""
        result = await db.execute(
            select(Patient).filter(
                (Patient.first_name.ilike(f"%{term}%")) |
                (Patient.last_name.ilike(f"%{term}%")) |
                (Patient.email.ilike(f"%{term}%"))
            ).offset(skip).limit(limit)
        )
        return result.scalars().all()

patient = CRUDPatient(Patient)
