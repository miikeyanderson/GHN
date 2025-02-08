"""CRUD operations for HealthRecord model."""
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.health_record import HealthRecord
from app.schemas.health_record import HealthRecordCreate, HealthRecordUpdate

class CRUDHealthRecord(CRUDBase[HealthRecord, HealthRecordCreate, HealthRecordUpdate]):
    """CRUD operations for HealthRecord model"""

    async def get_by_patient(
        self,
        db: AsyncSession,
        *,
        patient_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[HealthRecord]:
        """Get health records for a patient"""
        result = await db.execute(
            select(HealthRecord)
            .filter(HealthRecord.patient_id == patient_id)
            .options(selectinload(HealthRecord.treatments))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def create_with_treatments(
        self,
        db: AsyncSession,
        *,
        obj_in: HealthRecordCreate,
        patient_id: int
    ) -> HealthRecord:
        """Create a health record with treatments"""
        treatments_data = obj_in.treatments
        health_record_data = obj_in.model_dump(exclude={"treatments"})
        
        db_obj = HealthRecord(**health_record_data, patient_id=patient_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)

        if treatments_data:
            from app.models.treatment import Treatment
            for treatment_data in treatments_data:
                treatment = Treatment(
                    **treatment_data.model_dump(),
                    health_record_id=db_obj.id
                )
                db.add(treatment)
            
            await db.commit()
            await db.refresh(db_obj)

        return db_obj

health_record = CRUDHealthRecord(HealthRecord)
