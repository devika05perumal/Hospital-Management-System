from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/api/doctors", tags=["Doctors"], dependencies=[Depends(get_current_user)])


def _get(db, did):
    d = db.get(models.Doctor, did)
    if not d:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return d


def _email_taken(db, email, exclude_id=None):
    q = db.query(models.Doctor).filter(models.Doctor.email == email)
    if exclude_id:
        q = q.filter(models.Doctor.id != exclude_id)
    return q.first() is not None


@router.post("", response_model=schemas.DoctorOut, status_code=status.HTTP_201_CREATED)
def create(data: schemas.DoctorBase, db: Session = Depends(get_db)):
    if _email_taken(db, data.email):
        raise HTTPException(status_code=400, detail="A doctor with this email already exists")
    d = models.Doctor(**data.model_dump()); db.add(d); db.commit(); db.refresh(d); return d


@router.get("", response_model=List[schemas.DoctorOut])
def list_all(db: Session = Depends(get_db)):
    return db.query(models.Doctor).order_by(models.Doctor.id.desc()).all()


@router.get("/{did}", response_model=schemas.DoctorOut)
def get_one(did: int, db: Session = Depends(get_db)):
    return _get(db, did)


@router.put("/{did}", response_model=schemas.DoctorOut)
def update(did: int, data: schemas.DoctorBase, db: Session = Depends(get_db)):
    d = _get(db, did)
    if _email_taken(db, data.email, did):
        raise HTTPException(status_code=400, detail="A doctor with this email already exists")
    for k, v in data.model_dump().items():
        setattr(d, k, v)
    db.commit(); db.refresh(d); return d


@router.delete("/{did}", status_code=status.HTTP_204_NO_CONTENT)
def delete(did: int, db: Session = Depends(get_db)):
    db.delete(_get(db, did)); db.commit()
