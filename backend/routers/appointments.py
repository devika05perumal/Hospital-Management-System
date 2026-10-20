from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/api/appointments", tags=["Appointments"], dependencies=[Depends(get_current_user)])


def _out(a):
    return schemas.AppointmentOut(
        id=a.id, patient_id=a.patient_id, doctor_id=a.doctor_id,
        appointment_date=a.appointment_date, reason=a.reason, status=a.status,
        created_at=a.created_at,
        patient_name=a.patient.name if a.patient else None,
        doctor_name=a.doctor.name if a.doctor else None,
    )


def _validate(db, data):
    if not db.get(models.Patient, data.patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
    if not db.get(models.Doctor, data.doctor_id):
        raise HTTPException(status_code=404, detail="Doctor not found")


def _get(db, aid):
    a = db.get(models.Appointment, aid)
    if not a:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return a


@router.post("", response_model=schemas.AppointmentOut, status_code=status.HTTP_201_CREATED)
def create(data: schemas.AppointmentBase, db: Session = Depends(get_db)):
    _validate(db, data)
    a = models.Appointment(**data.model_dump()); db.add(a); db.commit(); db.refresh(a)
    return _out(a)


@router.get("", response_model=List[schemas.AppointmentOut])
def list_all(db: Session = Depends(get_db)):
    rows = (db.query(models.Appointment)
            .options(joinedload(models.Appointment.patient), joinedload(models.Appointment.doctor))
            .order_by(models.Appointment.appointment_date.desc()).all())
    return [_out(a) for a in rows]


@router.get("/{aid}", response_model=schemas.AppointmentOut)
def get_one(aid: int, db: Session = Depends(get_db)):
    return _out(_get(db, aid))


@router.put("/{aid}", response_model=schemas.AppointmentOut)
def update(aid: int, data: schemas.AppointmentBase, db: Session = Depends(get_db)):
    a = _get(db, aid); _validate(db, data)
    for k, v in data.model_dump().items():
        setattr(a, k, v)
    db.commit(); db.refresh(a); return _out(a)


@router.delete("/{aid}", status_code=status.HTTP_204_NO_CONTENT)
def delete(aid: int, db: Session = Depends(get_db)):
    db.delete(_get(db, aid)); db.commit()
