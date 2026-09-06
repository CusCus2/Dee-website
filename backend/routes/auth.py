from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from schema.auth import *
from services.auth_service import *
from dependencies.auth import get_auth_service, require_user

import os

IS_PRODUCTION = (
    os.getenv("ENVIRONMENT") == "production"
)

router = APIRouter(prefix="/auth", tags=["auth"])

# # need to get the auth service objected created using the db, so do dependancy injection
# auth_service: AuthServices | None = None
# def configure_auth_routes(service: AuthServices):
#     global auth_service
#     auth_service = service

@router.post(
    "/signup",
    response_model = SignupResponse,
    status_code= status.HTTP_201_CREATED
)
def signup(
    request : SignupRequest,
    auth_service : AuthServices = Depends(get_auth_service)
    ):

    try:
        user = auth_service.register_user(
            username = request.username,
            email = request.email,
            password = request.password
        )

    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    
    return SignupResponse(
        id = user.id,
        username = user.username,
        email = user.email
    )

@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK
)
def login(
    request: LoginRequest, 
    response : Response,
    auth_service : AuthServices = Depends(get_auth_service)
    ):
    try:
        user, token = auth_service.login_user(
            email = request.email,
            password = request.password
        )
        
    except InvalidCredentialsError as e:
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

    response.set_cookie(
        key = "session",
        value = token,
        httponly = True,
        secure = IS_PRODUCTION, # temp, change to True when deployed NB!!!!
        samesite = "lax",
        max_age = 60*60*24, # match db expiry duration
        path = "/" # means cookie works on every page
    )
    
    return LoginResponse(
        id = user.id,
        username= user.username,
        email = user.email,
        role = user.role
    )

@router.get("/me")
def me(current_user : Users = Depends(require_user)):

    return { 
        "id" : current_user.id,
        "username" : current_user.username,
        "email" : current_user.email,
        "role" : current_user.role
    }

@router.post("/logout")
def logout(
    request: Request,
    response : Response,
    auth_service : AuthServices = Depends(get_auth_service)
    ):
    token = request.cookies.get("session")

    if token is not None:
        auth_service.logout_user(token)

    
    response.delete_cookie(key = "session", path = "/")

    return {
        "message" : "Logged out successfully."
    }
