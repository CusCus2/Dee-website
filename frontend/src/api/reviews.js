import { apiFetch } from './client.js';

export function getReviews() {
  return apiFetch('/reviews');
}

export function createReview({ author_name, rating, comment }) {
  return apiFetch('/reviews', {
    method: 'POST',
    body: JSON.stringify({ author_name, rating, comment })
  });
}

export function createAdminReview({ author_name, rating, comment }) {
  return apiFetch('/reviews/admin', {
    method: 'POST',
    body: JSON.stringify({ author_name, rating, comment })
  });
}

export function updateReview(reviewId, { author_name, rating, comment }) {
  return apiFetch(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify({ author_name, rating, comment })
  });
}

export function deleteReview(reviewId) {
  return apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
}
