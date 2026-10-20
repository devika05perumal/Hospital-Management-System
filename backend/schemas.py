from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PatientBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    age: int = Field(ge=0, le=150)
    gender: Literal["Male", "Female", "Other"]
    phone: str = Field(min_length=5, max_length=20)
    address: Optional[str] = None


class PatientOut(PatientBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: Optional[datetime] = None


class DoctorBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    specialization: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=5, max_length=20)
    email: EmailStr


class DoctorOut(DoctorBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: Optional[datetime] = None


class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: datetime
    reason: Optional[str] = Field(default=None, max_length=255)
    status: Literal["Scheduled", "Completed", "Cancelled"] = "Scheduled"


class AppointmentOut(AppointmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    created_at: Optional[datetime] = None
