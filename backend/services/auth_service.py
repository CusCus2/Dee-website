from db_setup import *
from services.password_service import hash_password, verify_password
from services.session_service import create_session_token, hash_session_token
from datetime import datetime, timedelta, timezone


class UserAlreadyExistsError(Exception):
    pass

class InvalidCredentialsError(Exception):
    pass

class AuthServices:

    def __init__(self, database : Database):
        self.database = database

    def register_user(self, username: str, email : str, password : str) -> Users:
        # tidy up inputs
        email = email.strip().lower()
        username = username.strip()

        # check is username and email already exist
        existing_email = self.database.get_user_by_email(email)
        if existing_email is not None:
            raise UserAlreadyExistsError("An account already exists with this email.")

        existing_username = self.database.get_user_by_username(username)
        if existing_username is not None:
            raise UserAlreadyExistsError("An account already exists with this username.")

        # convert the password to a hash
        password_hash = hash_password(password)

        # create a user object and store it in db
        user = Users(
            id=None,
            username = username,
            email = email,
            password_hash = password_hash
        )

        user_id = self.database.create_user(user)

        user.id = user_id

        return user


    def login_user(self, email: str, password: str) -> tuple[Users, str]:
        email = email.strip().lower()
        user = self.database.get_user_by_email(email)

        # validate authentication
        if user is None:
            raise InvalidCredentialsError("The email or password is incorrect!")

        password_valid = verify_password(password, user.password_hash)
        if not password_valid:
            raise InvalidCredentialsError("The email or password is incorrect!")

        # session creation
        token = create_session_token()
        token_hash = hash_session_token(token)
        expires_at = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()            
        session_id = self.database.create_session(user_id = user.id, token_hash = token_hash, expires_at = expires_at)

        return user , token

    def get_current_user(self, token: str) -> Users | None:
        token_hash = hash_session_token(token)
        session = self.database.get_session_by_token_hash(token_hash)
        if session is None:
            return None

        if session.revoked_at is not None:
            return None

        if session.expires_at < datetime.now(timezone.utc):
            return None

        user = self.database.get_user_by_id(session.user_id)
        if user is None:
            return None

        return user

    def logout_user(self, token: str) -> None:
        token_hash = hash_session_token(token)
        session = self.database.get_session_by_token_hash(token_hash)
        if session is None:
            return None
        if session.revoked_at is not None:
            return None

        self.database.revoke_session(session_id = session.id, revoked_at = datetime.now(timezone.utc).isoformat())
        return None