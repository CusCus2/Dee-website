from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from db_setup import Database
from logger_setup import configure_logging

from services.auth_service import AuthServices
from services.review_service import ReviewService

from routes.auth import router as auth_router
from routes.review import router as review_router


# Load values from backend/.env when running locally
load_dotenv()


logger = configure_logging()

database = Database(logger=logger)

database.initialise()


auth_service = AuthServices(database)
review_service = ReviewService(database)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",

        "https://mingleandspeak.com",
        "https://www.mingleandspeak.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.state.auth_service = auth_service
app.state.review_service = review_service


app.include_router(auth_router)
app.include_router(review_router)