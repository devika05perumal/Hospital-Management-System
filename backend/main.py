from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from database import Base, engine
import models  # noqa: F401
from routers import auth_routes, patients, doctors, appointments

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hospital Management System API", version="1.0.0")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    msgs = []
    for e in exc.errors():
        field = ".".join(str(x) for x in e["loc"] if x != "body")
        msgs.append(f"{field}: {e['msg']}")
    return JSONResponse(status_code=422, content={"detail": "; ".join(msgs), "errors": jsonable(exc.errors())})


def jsonable(errors):
    return [{"loc": e.get("loc"), "msg": e.get("msg"), "type": e.get("type")} for e in errors]


@app.exception_handler(SQLAlchemyError)
async def db_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(status_code=500, content={"detail": "Database error. Please try again."})


app.include_router(auth_routes.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(appointments.router)


@app.get("/")
def root():
    return {"message": "Hospital Management System API is running", "docs": "/docs"}
