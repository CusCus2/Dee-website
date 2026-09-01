from fastapi import HTTPException
from fastapi import Request, Response, status, Depends
from db_setup import *
from services.auth_service import *

# below function is dependancy injection
def get_auth_service(request: Request) -> AuthServices:
    """
    New to me, essentially this is a dependency injection function,
    it allows to get instances of objects which in this case is the 
    auth services object which is created in a test file, and then
    it injects it into routes by storing it in the fast apis state object,
    this is important so that we dont accidentally create multiple auth service
    objects which would have different database connections and cause issues.
    """
    return request.app.state.auth_service

# reusable auth function to be usedd in other routes
def require_user(
        request:Request,
        auth_service: AuthServices = Depends(get_auth_service)
    ) -> Users:
    token = request.cookies.get("session")

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated."
        )

    user = auth_service.get_current_user(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated."
        )

    return user