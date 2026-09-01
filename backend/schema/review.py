from pydantic import BaseModel, EmailStr, Field

class ReviewRequest(BaseModel):
    rating : float = Field(ge=0, le=5)
    comment : str = Field(min_length=1, max_length=2000)

class ReviewResponse(BaseModel):
    id : int
    user_id : int
    rating : float
    comment : str
    status : str

class UpdateReviewRequest(BaseModel):
    rating: float | None = Field(default=None, ge=0, le=5)
    comment: str | None = Field(default=None,min_length=1,max_length=2000)