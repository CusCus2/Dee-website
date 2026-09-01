from db_setup import *
from pathlib import Path
from logger_setup import configure_logging
import logging

# db_url = Path(__file__).parent / "database.db"
# logger = configure_logging()
# db = Database(db_url ,logger)
# db.initialise()

# user_1 = Users(id=None, username="testuser5", email='testuser5@example.com', password_hash='hashed_password2')
# user_1_id = db.create_user(user_1)

# review_1 = Reviews(id=None, user_id=user_1_id, rating=4.5, comment="Great service!", status="pending")
# review_1_id = db.create_review(review_1)

# loaded_user = db.get_user_by_id(user_1_id)
# email_user = db.get_user_by_email('testuser4@example.com')
# loaded_review = db.get_review_by_id(review_1_id)
# print(loaded_user)
# print(email_user)
# print(loaded_review)

from services.password_service import *
password = input("password: ")
hashed = hash_password(password)
print("Stored Value: ", hashed)
print(verify_password(password, hashed))