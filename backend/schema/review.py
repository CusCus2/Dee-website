from pydantic import BaseModel, EmailStr, Field

class ReviewRequest(BaseModel):
    author_name : str = Field(min_length=1, max_length = 100)
    rating : float = Field(ge=1, le=5)
    comment : str = Field(min_length=1, max_length=2000)

class ReviewResponse(BaseModel):
    id : int
    user_id : int
    author_name : str
    rating : float
    comment : str
    status : str

class UpdateReviewRequest(BaseModel):
    author_name : str | None = Field(min_length=1, max_length = 100)
    rating: float | None = Field(default=None, ge=1, le=5)
    comment: str | None = Field(default=None,min_length=1,max_length=2000)