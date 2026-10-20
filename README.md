# Hospital Management System

Full-stack hospital admin panel.
- **Frontend:** HTML, CSS, vanilla JavaScript (Fetch API)
- **Backend:** Python FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt
- **Database:** MySQL (MySQL Workbench compatible)

## 1. Requirements
- Python 3.10+
- MySQL Server 8 + MySQL Workbench
- VS Code with the **Live Server** extension

## 2. Database setup (MySQL Workbench)
1. Open MySQL Workbench and connect to your local server.
2. File > Open SQL Script > select `database/hospital.sql`.
3. Click the lightning icon to execute. This creates `hospital_db`, all tables, foreign keys and sample patients/doctors/appointments.


## 3. Backend setup
```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env      # Windows (use `cp` on macOS/Linux)
```
Edit `backend/.env` and set your real `DB_PASSWORD` and a long random `SECRET_KEY`.

Run the API:
```bash
uvicorn main:app --reload --port 8000
```
API docs: http://127.0.0.1:8000/docs

## 4. Frontend
Open the `frontend` folder in VS Code, right-click `index.html` > **Open with Live Server**.
It opens at http://127.0.0.1:5500 (allowed by the backend CORS settings).

Register an account, log in, and start managing patients, doctors and appointments.

## API endpoints
| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/register | No |
| POST | /api/login | No |
| GET | /api/profile | JWT |
| GET/POST | /api/patients | JWT |
| GET/PUT/DELETE | /api/patients/{id} | JWT |
| GET/POST | /api/doctors | JWT |
| GET/PUT/DELETE | /api/doctors/{id} | JWT |
| GET/POST | /api/appointments | JWT |
| GET/PUT/DELETE | /api/appointments/{id} | JWT |

## Troubleshooting
- **"Cannot reach the server"** - make sure uvicorn is running on port 8000.
- **CORS error** - open the frontend via Live Server on port 5500 (or add your origin in `backend/main.py`).
- **Access denied for user 'root'** - check `DB_USER` / `DB_PASSWORD` in `backend/.env`.
- **Session expired** - tokens last 60 minutes; just log in again.
