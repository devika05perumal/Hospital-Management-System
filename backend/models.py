from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Enum("Male", "Female", "Other"), nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete")


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_date = Column(DateTime, nullable=False)
    reason = Column(String(255))
    status = Column(Enum("Scheduled", "Completed", "Cancelled"), nullable=False, default="Scheduled")
    created_at = Column(DateTime, server_default=func.now())
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
