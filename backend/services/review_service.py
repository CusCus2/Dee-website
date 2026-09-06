from db_setup import *

class ReviewAlreadyExistsError(Exception):
    pass

class ReviewForbiddenError(Exception):
    pass

class ReviewNotFoundError(Exception):
    pass


class ReviewService:
    def __init__(self, db: Database):
        self.db = db

    def create_review(self, user: Users, author_name : str, rating: float, comment: str) -> Reviews:
        # check does user already have a review
        if user.role != "admin":
            existing_review = self.db.get_review_by_user_id(user.id)
            if existing_review is not None:
                raise ReviewAlreadyExistsError("User has already submitted a review")

        # create review
        review = Reviews(
            id = None, 
            user_id = user.id,
            author_name = author_name,
            rating = rating,
            comment = comment.strip(),
            status = "published"
        )

        review_id = self.db.create_review(review)
        review.id = review_id
        return review

    def get_reviews(self) -> list[Reviews]:
        return self.db.get_reviews()

    def update_review(self, review_id : int, user: Users, author_name : str, rating: float | None = None, comment: str | None = None) -> Reviews:
        review = self.db.get_review_by_id(review_id)
        if review is None:
            raise ReviewNotFoundError("Review not found")

        if review.user_id != user.id and user.role != "admin":
            raise ReviewForbiddenError("You are not allowed to update this review")

        if author_name is not None:
            review.author_name = author_name.strip()
        if rating is not None:
            review.rating = rating
        if comment is not None:
            review.comment = comment.strip()

        self.db.update_review(review)
        return review

    def delete_review(self, review_id: int, user: Users) -> None:
        review = self.db.get_review_by_id(review_id)
        if review is None:
            raise ReviewNotFoundError("Review not found")

        if review.user_id != user.id and user.role != "admin":
            raise ReviewForbiddenError("You are not allowed to delete this review")

        self.db.delete_review(review_id)