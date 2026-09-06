from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    """
    What fields we expect to recieve from frontend in json request
    """
    username : str = Field(min_length= 3, max_length = 30)
    email : EmailStr
    password : str = Field(min_length=8, max_length=32)

class SignupResponse(BaseModel):
    """
    What fields we send back in json response
    """
    id : int
    username: str
    email : EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role : str