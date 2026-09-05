from contextlib import contextmanager
import logging
import os
from pathlib import Path
from typing import Iterator
from dataclasses import dataclass
import datetime

import pymysql
from pymysql.connections import Connection

@dataclass
class Users:
    id: int | None
    username: str
    email: str
    password_hash: str
    created_at: str | None = None

@dataclass
class Reviews:
    id: int | None
    user_id: int
    rating: float
    comment: str
    status : str

@dataclass
class Session:
    id: int | None
    user_id: int
    token_hash: str
    created_at: str
    expires_at : datetime
    revoked_at : str | None

class Database:
    def __init__(self, logger: logging.Logger):
        self.logger = logger

    @contextmanager
    def _connection(self) -> Iterator[Connection]:
        connection = pymysql.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT")),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False
        )

        try:
            yield connection

            connection.commit()

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    def initialise(self) -> None:
        sql_statements = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        """,

        """
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            rating INT NOT NULL,
            comment TEXT NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'published',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_reviews_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            CONSTRAINT uq_reviews_user
                UNIQUE (user_id),

            CONSTRAINT chk_review_rating
                CHECK (rating >= 1 AND rating <= 5)
        );
        """,

        """
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token_hash CHAR(64) NOT NULL UNIQUE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at VARCHAR(40) NOT NULL,
            revoked_at VARCHAR(40),

            CONSTRAINT fk_sessions_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
        """
    ]

        try:
            with self._connection() as conn:
                with conn.cursor() as cursor:
                    for statement_number, statement in enumerate(sql_statements, start = 1):
                        cursor.execute(statement)

                        self.logger.debug(
                            "Executed schema statement | statement=%s",
                            statement_number
                        )

            self.logger.info(
                "SQLite db schema initialised successfully "
            )
        except pymysql.MySQLError as e:
            self.logger.error(
                "SQLite db schema initialisation failed | error=%s",
                str(e)
            )
            raise

    def create_user(self, user: Users) -> int:
        statement = """
        INSERT INTO users (username, email, password_hash)
        VALUES (%s, %s, %s)
        """
        try:
            with self._connection() as conn:
                with conn.cursor() as cursor:

                    cursor.execute(
                        statement,
                        (
                        user.username,
                        user.email,
                        user.password_hash
                        )
                    )

                    user_id = cursor.lastrowid

                    if user_id is None:
                        raise pymysql.MySQLError(
                            "Failed to retrieve inserted user ID"
                        )

                    self.logger.info(
                        "User created successfully | user_id=%s",
                        user_id
                    )

                    return user_id

        except pymysql.err.IntegrityError as e:
            self.logger.error(
                "Failed to create user due to integrity error | error=%s",
                str(e)
            )
            raise

        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to create user | error=%s",
                str(e)
            )
            raise

    def create_review(self, review: Reviews) -> int:
            statement = """
            INSERT INTO reviews (user_id, rating, comment, status)
            VALUES (%s, %s, %s, %s)
            """
            try:
                with self._connection() as conn:
                    self.logger.debug("Succesfully connected to DB to insert new review")
                    with conn.cursor() as cursor:
                        cursor.execute(statement, (
                            review.user_id, review.rating, review.comment, review.status
                        ))
                        review_id = cursor.lastrowid
                        self.logger.info("Review created successfully | review_id=%s", review_id)
                        if review_id is None:
                            self.logger.error("Failed to retrieve last inserted review ID")
                            raise pymysql.MySQLError("Failed to retrieve last inserted review ID")
                        else:
                            return review_id
                
            except pymysql.err.IntegrityError as e:
                self.logger.error(
                    "Failed to create Review due to integrity error | error=%s",
                    str(e)
                    )
                raise
            
            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to create Review | error=%s",
                    str(e)
                )
                raise

    def update_user(self, user: Users) -> None:
        statement = """
        UPDATE users
        SET username = %s, email = %s, password_hash = %s
        WHERE id = %s
        """
        try:
            with self._connection() as conn:
                self.logger.debug("Succesfully connected to DB to update user")
                with conn.cursor() as cursor:
                    cursor.execute(statement, (
                        user.username, user.email, user.password_hash, user.id
                    ))
                    if cursor.rowcount == 0:
                        self.logger.warning("No user found with id=%s", user.id)
                    else:
                        self.logger.info("User updated successfully | user_id=%s", user.id)

        except pymysql.err.IntegrityError as e:
                self.logger.error(
                    "Failed to update user due to integrity error | error=%s",
                    str(e)
                    )
                raise
            
        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to update user | error=%s",
                str(e)
            )
            raise

    def update_review(self, review: Reviews) -> None:
            statement = """
            UPDATE reviews
            SET rating = %s, comment = %s
            WHERE id = %s
            """
            try:
                with self._connection() as conn:
                    self.logger.debug("Succesfully connected to DB to update review")
                    with conn.cursor() as cursor:
                        cursor.execute(statement, (
                            review.rating, review.comment, review.id
                        ))
                        if cursor.rowcount == 0:
                            self.logger.warning("No review found with id=%s", review.id)
                        else:
                            self.logger.info("Review updated successfully | review_id=%s", review.id)

            except pymysql.err.IntegrityError as e:
                self.logger.error(
                    "Failed to update review due to integrity error | error=%s",
                    str(e)
                    )
                raise
            
            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to update review | error=%s",
                    str(e)
                )
                raise

    def delete_user(self, user_id: int) -> None:
        statement = "DELETE FROM users WHERE id = %s"
        try:
            with self._connection() as conn:
                self.logger.debug("Succesfully connected to DB to delete user")
                with conn.cursor() as cursor:
                    cursor.execute(statement, (user_id,))
                    if cursor.rowcount == 0:
                        self.logger.warning("No user found with id=%s", user_id)
                    else:
                        self.logger.info("User deleted successfully | user_id=%s", user_id)

        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to delete user | error=%s",
                str(e)
            )
            raise


    def delete_review(self, review_id: int) -> None:
            statement = "DELETE FROM reviews WHERE id = %s"
            try:
                with self._connection() as conn:
                    self.logger.debug("Succesfully connected to DB to delete review")
                    with conn.cursor() as cursor:
                        cursor.execute(statement, (review_id,))
                        if cursor.rowcount == 0:
                            self.logger.warning("No review found with id=%s", review_id)
                        else:
                            self.logger.info("Review deleted successfully | review_id=%s", review_id)

            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to delete review | error=%s",
                    str(e)
                )
                raise

    def get_user_by_id(self, user_id : int) -> Users | None:
        statement = "SELECT * FROM users WHERE id = %s"
        try:
            with self._connection() as conn:
                self.logger.debug("Succesfully connected to DB to retrieve user by id")
                with conn.cursor() as cursor:
                    cursor.execute(statement, (user_id,))
                    row = cursor.fetchone()
            if row is None:
                self.logger.warning("No user found with id=%s", user_id)
                return None
            user = Users(
                id=row["id"],
                username=row["username"],
                email=row["email"],
                password_hash=row["password_hash"],
                created_at=row["created_at"]
            )
            self.logger.info("User retrieved successfully | user_id=%s", user_id)
            return user

        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to retrieve user by id | error=%s",
                str(e)
            )
            raise


    def get_user_by_email(self, email : str) -> Users | None:
            statement = "SELECT * FROM users WHERE email = %s"
            try:
                with self._connection() as conn:
                    self.logger.debug("Succesfully connected to DB to retrieve user by email")
                    with conn.cursor() as cursor:
                        cursor.execute(statement, (email,))
                        row = cursor.fetchone()
                    if row is None:
                        self.logger.warning("No user found with email=%s", email)
                        return None
                    else:
                        user = Users(
                            id=row["id"],
                            username=row["username"],
                            email=row["email"],
                            password_hash=row["password_hash"],
                            created_at=row["created_at"]
                        )
                        self.logger.info("User retrieved successfully | email=%s", email)
                        return user
    
            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to retrieve user by email | error=%s",
                    str(e)
                )
                raise


    def get_user_by_username(self, username : str) -> Users | None:
                statement = "SELECT * FROM users WHERE username = %s"
                try:
                    with self._connection() as conn:
                        self.logger.debug("Succesfully connected to DB to retrieve user by username")
                        with conn.cursor() as cursor:
                            cursor.execute(statement, (username,))
                            row = cursor.fetchone()
                        if row is None:
                            self.logger.warning("No user found with username=%s", username)
                            return None
                        else:
                            user = Users(
                                id=row["id"],
                                username=row["username"],
                                email=row["email"],
                                password_hash=row["password_hash"],
                                created_at=row["created_at"]
                            )
                            self.logger.info("User retrieved successfully | username=%s", username)
                            return user
        
                except pymysql.err.IntegrityError as e:
                    self.logger.error(
                        "Failed to retrieve user by username | error=%s",
                        str(e)
                    )
                    raise
                except pymysql.MySQLError as e:
                    self.logger.error(
                        "Failed to retrieve user by username due to database error | error=%s",
                        str(e)
                    )
                    raise

    def get_review_by_id(self, review_id : int) -> Reviews | None:
                statement = "SELECT * FROM reviews WHERE id = %s"
                try:
                    with self._connection() as conn:
                            cursor = conn.cursor()
                            cursor.execute(statement, (review_id,))
                            row = cursor.fetchone()
                            if row is None:
                                self.logger.warning("No review found with review_id=%s", review_id)
                                return None
                            else:
                                review = Reviews (
                                    id = row["id"],
                                    user_id = row["user_id"],
                                    rating = row["rating"],
                                    comment = row["comment"],
                                    status = row["status"],
                                )
                            self.logger.info("Review retrieved successfully | review_id=%s", review_id)
                            return review
    
                except pymysql.err.IntegrityError as e:
                    self.logger.error(
                        "Failed to retrieve review by review_id | error=%s",
                        str(e)
                    )
                    raise
                except pymysql.MySQLError as e:
                    self.logger.error(
                        "Failed to retrieve review by review_id due to database error | error=%s",
                        str(e)
                    )
                    raise

    def get_review_by_user_id(self, user_id : int) -> Reviews | None:
            statement = "SELECT * FROM reviews WHERE user_id = %s"
            try:
                with self._connection() as conn:
                        cursor = conn.cursor()
                        cursor.execute(statement, (user_id,))
                        row = cursor.fetchone()
                        if row is None:
                            self.logger.warning("No review found with user_id=%s", user_id)
                            return None
                        else:
                            review = Reviews (
                                id = row["id"],
                                user_id = row["user_id"],
                                rating = row["rating"],
                                comment = row["comment"],
                                status = row["status"],
                            )
                        self.logger.info("Review retrieved successfully | user_id=%s", user_id)
                        return review

            except pymysql.err.IntegrityError as e:
                self.logger.error(
                    "Failed to retrieve review by user_id | error=%s",
                    str(e)
                )
                raise
            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to retrieve review by user_id due to database error | error=%s",
                    str(e)
                )
                raise

    def get_reviews(self) -> list[Reviews]:
                statement = "SELECT * FROM reviews WHERE status = 'published'"
                try:
                    with self._connection() as conn:
                            cursor = conn.cursor()
                            cursor.execute(statement)
                            rows = cursor.fetchall()
                            if rows is None:
                                self.logger.warning("No reviews found")
                                return []
                            else:
                                reviews = []
                                for row in rows:
                                    review = Reviews (
                                        id = row["id"],
                                        user_id = row["user_id"],
                                        rating = row["rating"],
                                        comment = row["comment"],
                                        status = row["status"],
                                    )
                                    reviews.append(review)

                                return reviews
    
                except pymysql.err.IntegrityError as e:
                    self.logger.error(
                        "Failed to retrieve reviews | error=%s",
                        str(e)
                    )
                    raise
                except pymysql.MySQLError as e:
                    self.logger.error(
                        "Failed to retrieve reviews due to database error | error=%s",
                        str(e)
                    )
                    raise

    def create_session(self, user_id: int, token_hash: str, expires_at: str) -> int:
        statement = """
            INSERT INTO sessions (user_id, token_hash, expires_at) 
            VALUES (%s, %s, %s)
        """

        with self._connection() as conn:
            try:
                cursor = conn.cursor()
                cursor.execute(statement, (
                    user_id,
                    token_hash,
                    expires_at
                ))

                session_id = cursor.lastrowid
                self.logger.info("Session created successfully | session_id=%s", session_id)
                if session_id is None:
                    self.logger.debug("Failed to retrieve last inserted session ID")
                    raise pymysql.MySQLError("Failed to retrieve last inserted session ID")
                else:
                    return session_id
                
            except pymysql.err.IntegrityError as e:
                self.logger.error(
                    "Failed to create session due to integrity error | error=%s",
                    str(e)
                )
                raise
            except pymysql.MySQLError as e:
                self.logger.error(
                    "Failed to create session due to database error | error=%s",
                    str(e)
                )
                raise

    def get_session_by_token_hash(self, token_hash: str) -> Session | None:
        statement = "SELECT * FROM sessions WHERE token_hash = %s"
        try:
            with self._connection() as conn:
                cursor = conn.cursor()
                cursor.execute(statement, (token_hash,))
                row = cursor.fetchone()
                if row is None:
                    self.logger.debug("No session found with token_hash =%s", token_hash)
                    return None
                else:
                    session = Session(
                        id = row["id"],
                        user_id = row["user_id"],
                        token_hash = row["token_hash"],
                        created_at = row["created_at"],
                        expires_at = datetime.datetime.fromisoformat(row["expires_at"]), # convert it back for comparison
                        revoked_at = row["revoked_at"]
                    )
                    self.logger.debug("Session retrieved successfully | token_hash=%s", token_hash)
                    return session

        except pymysql.err.IntegrityError as e:
            self.logger.error(
                "Failed to retrieve session by token_hash | error=%s",
                str(e)
            )
            raise
        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to retrieve session by token_hash due to database error | error=%s",
                str(e)
            )
        raise

    def revoke_session(self, session_id: int, revoked_at: str):
        statement = "UPDATE sessions SET revoked_at = %s WHERE id = %s"
        try:
            with self._connection() as conn:
                cursor = conn.cursor()
                cursor.execute(statement, (revoked_at, session_id))
                if cursor.rowcount == 0:
                    self.logger.debug("No session found with id=%s", session_id)
                self.logger.debug("Session revoked successfully | session_id=%s", session_id)
        except pymysql.err.IntegrityError as e:
            self.logger.error(
                "Failed to revoke session | error=%s",
                str(e)
            )
            raise
        except pymysql.MySQLError as e:
            self.logger.error(
                "Failed to revoke session due to database error | error=%s",
                str(e)
            )
            raise