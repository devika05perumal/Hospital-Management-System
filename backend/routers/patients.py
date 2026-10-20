from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/api/patients", tags=["Patients"], dependencies=[Depends(get_current_user)])


def _get(db, pid):
    p = db.get(models.Patient, pid)
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return p


@router.post("", response_model=schemas.PatientOut, status_code=status.HTTP_201_CREATED)
def create(data: schemas.PatientBase, db: Session = Depends(get_db)):
    p = models.Patient(**data.model_dump()); db.add(p); db.commit(); db.refresh(p); return p


@router.get("", response_model=List[schemas.PatientOut])
def list_all(db: Session = Depends(get_db)):
    return db.query(models.Patient).order_by(models.Patient.id.desc()).all()


@router.get("/{pid}", response_model=schemas.PatientOut)
def get_one(pid: int, db: Session = Depends(get_db)):
    return _get(db, pid)


@router.put("/{pid}", response_model=schemas.PatientOut)
def update(pid: int, data: schemas.PatientBase, db: Session = Depends(get_db)):
    p = _get(db, pid)
    for k, v in data.model_dump().items():
        setattr(p, k, v)
    db.commit(); db.refresh(p); return p


@router.delete("/{pid}", status_code=status.HTTP_204_NO_CONTENT)
def delete(pid: int, db: Session = Depends(get_db)):
    db.delete(_get(db, pid)); db.commit()
