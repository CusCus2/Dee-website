from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from schema.review import *
from services.auth_service import *
from services.review_service import *
from dependencies.auth import get_auth_service, require_user, require_admin
from dependencies.review import *

router = APIRouter(prefix = "/reviews", tags=["reviews"])

@router.post(
    "",
    response_model = ReviewResponse,
    status_code = status.HTTP_201_CREATED,
)
def create_review(
    request: ReviewRequest,
    user: Users = Depends(require_user),
    review_service: ReviewService = Depends(get_review_service)
):
    try:
        review = review_service.create_review(
            user = user,
            author_name = request.author_name,
            rating = request.rating,
            comment = request.comment
        )
    except ReviewAlreadyExistsError as e:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    return ReviewResponse(
        id = review.id,
        user_id = review.user_id,
        author_name = review.author_name,
        rating = review.rating,
        comment = review.comment,
        status = review.status
    )

@router.post(
    "/admin",
    response_model = ReviewResponse,
    status_code = status.HTTP_201_CREATED,
)
def create_admin_review(
    request: ReviewRequest,
    user: Users = Depends(require_admin),
    review_service: ReviewService = Depends(get_review_service)
):
    try:
        review = review_service.create_review(
            user = user,
            author_name = request.author_name,
            rating = request.rating,
            comment = request.comment
        )
    except ReviewAlreadyExistsError as e:
        raise HTTPException(
            status_code = status.HTTP_409_CONFLICT,
            detail=str(e)
        )

    return ReviewResponse(
        id = review.id,
        user_id = review.user_id,
        author_name = review.author_name,
        rating = review.rating,
        comment = review.comment,
        status = review.status
    )


@router.get(
    "",
    response_model = list[ReviewResponse],
    status_code = status.HTTP_200_OK
)
def get_reviews(
    review_service: ReviewService = Depends(get_review_service)
):
    reviews = review_service.get_reviews()
    return [
        ReviewResponse(
            id = review.id,
            user_id = review.user_id,
            author_name = review.author_name,
            rating = review.rating,
            comment = review.comment,
            status = review.status
        )
        for review in reviews
    ]

@router.patch(
    "/{review_id}",
    response_model = ReviewResponse,
    status_code = status.HTTP_200_OK
)
def update_review(
    review_id: int,
    request: UpdateReviewRequest,
    user: Users = Depends(require_user),
    review_service: ReviewService = Depends(get_review_service)
):
    try:
        review = review_service.update_review(
            review_id = review_id,
            user = user,
            author_name = request.author_name,
            rating = request.rating,
            comment = request.comment
        )

    except ReviewNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ReviewForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

    return review

@router.delete(
    "/{review_id}",
    status_code = status.HTTP_204_NO_CONTENT
)
def delete_review(
    review_id: int,
    user: Users = Depends(require_user),
    review_service: ReviewService = Depends(get_review_service)
):
    try:
        review_service.delete_review(
            review_id = review_id,
            user = user
        )
    except ReviewNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ReviewForbiddenError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)