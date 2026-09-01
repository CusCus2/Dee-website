from services.review_service import *
from fastapi import Request

def get_review_service(request: Request) -> ReviewService:
    return request.app.state.review_service