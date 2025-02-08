"""Patient routes."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.crud.patient import patient
from app.models.user import User
from app.schemas.patient import (
    Patient as PatientSchema,
    PatientCreate,
    PatientUpdate,
)

router = APIRouter()

@router.get("/", response_model=List[PatientSchema])
async def read_patients(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None, min_length=3),
    current_user: User = Depends(get_current_active_user),
) -> List[PatientSchema]:
    """Retrieve patients."""
    if search:
        patients = await patient.search(db, term=search, skip=skip, limit=limit)
    else:
        patients = await patient.get_multi(db, skip=skip, limit=limit)
    return patients

@router.post("/", response_model=PatientSchema)
async def create_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_in: PatientCreate,
    current_user: User = Depends(get_current_active_user),
) -> PatientSchema:
    """Create new patient."""
    if patient_in.email:
        patient_exists = await patient.get_by_email(db, email=patient_in.email)
        if patient_exists:
            raise HTTPException(
                status_code=400,
                detail="A patient with this email already exists.",
            )
    return await patient.create(db, obj_in=patient_in)

@router.get("/{patient_id}", response_model=PatientSchema)
async def read_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
) -> PatientSchema:
    """Get patient by ID."""
    patient_obj = await patient.get(db, id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient_obj

@router.put("/{patient_id}", response_model=PatientSchema)
async def update_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: int,
    patient_in: PatientUpdate,
    current_user: User = Depends(get_current_active_user),
) -> PatientSchema:
    """Update a patient."""
    patient_obj = await patient.get(db, id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await patient.update(db, db_obj=patient_obj, obj_in=patient_in)

@router.delete("/{patient_id}", response_model=PatientSchema)
async def delete_patient(
    *,
    db: AsyncSession = Depends(get_db),
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
) -> PatientSchema:
    """Delete a patient."""
    patient_obj = await patient.get(db, id=patient_id)
    if not patient_obj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return await patient.remove(db, id=patient_id)
