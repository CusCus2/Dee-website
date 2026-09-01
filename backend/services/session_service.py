import secrets
import hashlib


def create_session_token():
    return secrets.token_urlsafe(32)

def hash_session_token(token:str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

