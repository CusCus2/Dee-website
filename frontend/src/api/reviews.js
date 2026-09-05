import { apiFetch } from './client.js';

export function getReviews() {
  return apiFetch('/reviews');
}

export function createReview({ rating, comment }) {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ rating, comment })
  });
}

export function updateReview(reviewId, { rating, comment }) {
  return apiFetch(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, comment })
  });
}

export function deleteReview(reviewId) {
  return apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
}
