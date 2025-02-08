"""Health record routes."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.crud.health_record import health_record
from app.crud.patient import patient
from app.models.user import User
from app.schemas.health_record import (
    HealthRecord as HealthRecordSchema,
    HealthRecordCreate,
    HealthRecordUpdate,
)

router = APIRouter()

@router.get("/patient/{patient_id}/records/", response_model=List[HealthRecordSchema])
async def read_patient_health_records(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
) -> List[HealthRecordSchema]:
    """Retrieve health records for a patient."""
    patient_obj = await patient.get(db, id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await health_record.get_by_patient(
        db, patient_id=patient_id, skip=skip, limit=limit
    )

@router.post("/patient/{patient_id}/records/", response_model=HealthRecordSchema)
async def create_patient_health_record(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: int,
    health_record_in: HealthRecordCreate,
    current_user: User = Depends(get_current_active_user),
) -> HealthRecordSchema:
    """Create new health record for a patient."""
    patient_obj = await patient.get(db, id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await health_record.create_with_treatments(
        db, obj_in=health_record_in, patient_id=patient_id
    )

@router.get("/records/{record_id}", response_model=HealthRecordSchema)
async def read_health_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: int,
    current_user: User = Depends(get_current_active_user),
) -> HealthRecordSchema:
    """Get health record by ID."""
    health_record_obj = await health_record.get(db, id=record_id)
    if not health_record_obj:
        raise HTTPException(status_code=404, detail="Health record not found")
    return health_record_obj

@router.put("/records/{record_id}", response_model=HealthRecordSchema)
async def update_health_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: int,
    health_record_in: HealthRecordUpdate,
    current_user: User = Depends(get_current_active_user),
) -> HealthRecordSchema:
    """Update a health record."""
    health_record_obj = await health_record.get(db, id=record_id)
    if not health_record_obj:
        raise HTTPException(status_code=404, detail="Health record not found")
    return await health_record.update(
        db, db_obj=health_record_obj, obj_in=health_record_in
    )

@router.delete("/records/{record_id}", response_model=HealthRecordSchema)
async def delete_health_record(
    *,
    db: AsyncSession = Depends(get_db),
    record_id: int,
    current_user: User = Depends(get_current_active_user),
) -> HealthRecordSchema:
    """Delete a health record."""
    health_record_obj = await health_record.get(db, id=record_id)
    if not health_record_obj:
        raise HTTPException(status_code=404, detail="Health record not found")
    return await health_record.remove(db, id=record_id)
