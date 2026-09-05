from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db_setup import *
from logger_setup import *
from services.auth_service import AuthServices
from routes.auth import router as auth_router
from routes.review import router as review_router
from services.review_service import ReviewService


logger = configure_logging()


database = Database(
    Path("data/app.db"),
    logger
)

database.initialise()

auth_service = AuthServices(database)
review_service = ReviewService(database)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.auth_service = auth_service
app.state.review_service = review_service

app.include_router(auth_router)
app.include_router(review_router)