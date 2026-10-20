-- Hospital Management System - MySQL schema
-- Import in MySQL Workbench: File > Open SQL Script > Execute (lightning icon)

CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;

DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male','Female','Other') NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_patients_name (name)
) ENGINE=InnoDB;

CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_doctors_specialization (specialization)
) ENGINE=InnoDB;

CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATETIME NOT NULL,
  reason VARCHAR(255),
  status ENUM('Scheduled','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appt_patient (patient_id),
  INDEX idx_appt_doctor (doctor_id),
  INDEX idx_appt_date (appointment_date),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Sample data (users are created through the Register page so passwords are bcrypt-hashed)
INSERT INTO patients (name, age, gender, phone, address) VALUES
('Arjun Mehta', 34, 'Male', '9876543210', '12 MG Road, Bengaluru'),
('Priya Nair', 28, 'Female', '9123456780', '45 Marine Drive, Kochi'),
('Rahul Verma', 52, 'Male', '9988776655', '8 Park Street, Kolkata');

INSERT INTO doctors (name, specialization, phone, email) VALUES
('Dr. Ananya Rao', 'Cardiology', '9000011111', 'ananya.rao@hospital.com'),
('Dr. Vikram Singh', 'Orthopedics', '9000022222', 'vikram.singh@hospital.com'),
('Dr. Meera Iyer', 'Pediatrics', '9000033333', 'meera.iyer@hospital.com');

INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, status) VALUES
(1, 1, '2026-10-10 10:00:00', 'Chest pain follow-up', 'Scheduled'),
(2, 3, '2026-10-11 11:30:00', 'Child vaccination', 'Scheduled'),
(3, 2, '2026-09-28 09:00:00', 'Knee pain', 'Completed');
