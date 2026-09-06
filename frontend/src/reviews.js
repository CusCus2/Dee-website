import './main.js';
import { authReady } from './main.js';
import {
  createAdminReview,
  createReview,
  deleteReview,
  getReviews,
  updateReview
} from './api/reviews.js';
import { showToast } from './components/toast.js';

const reviewsGrid = document.querySelector('[data-reviews-grid]');
const reviewPanel = document.querySelector('[data-review-panel]');
const reviewForm = document.querySelector('[data-review-form]');
const formTitle = document.querySelector('[data-review-form-title]');
const formHint = document.querySelector('[data-review-form-hint]');
const submitButton = document.querySelector('[data-review-submit]');
const cancelButton = document.querySelector('[data-review-cancel]');
const emptyState = document.querySelector('[data-empty-reviews]');
const loadingState = document.querySelector('[data-loading-reviews]');
const ratingInput = document.querySelector('[data-rating-input]');
const authorInput = document.querySelector('[name="author_name"]');
const adminBadge = document.querySelector('[data-admin-badge]');
const starButtons = [...document.querySelectorAll('[data-star]')];

let currentUser = null;
let reviews = [];
let editingReviewId = null;
let selectedRating = 5;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function stars(rating) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
}

function isAdmin() {
  return currentUser?.role === 'admin';
}

function setRating(value) {
  selectedRating = Number(value);
  ratingInput.value = String(selectedRating);

  starButtons.forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.star) <= selectedRating);
    button.setAttribute('aria-pressed', String(Number(button.dataset.star) === selectedRating));
  });
}

starButtons.forEach((button) => {
  button.addEventListener('click', () => setRating(button.dataset.star));
});

setRating(5);

function ownReview() {
  if (!currentUser || isAdmin()) return null;
  return reviews.find((review) => review.user_id === currentUser.id) || null;
}

function renderReviews() {
  loadingState?.classList.add('hidden');

  const published = reviews.filter(
    (review) => !review.status || review.status === 'published'
  );

  emptyState?.classList.toggle('hidden', published.length !== 0);

  reviewsGrid.innerHTML = published.map((review) => {
    const ownsReview = Boolean(
      currentUser &&
      !isAdmin() &&
      review.user_id === currentUser.id
    );

    const canManage = Boolean(
      currentUser &&
      (isAdmin() || review.user_id === currentUser.id)
    );

    const author = review.author_name || 'Verified learner';

    return `
      <article
        class="soft-card flex h-full flex-col rounded-[1.6rem] bg-white p-6"
        data-review-id="${review.id}"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="stars text-lg" aria-label="${review.rating} out of 5 stars">
              ${stars(review.rating)}
            </div>
            <div class="mt-2 text-xs font-extrabold uppercase tracking-[.14em] text-forest/45">
              ${escapeHtml(author)}
            </div>
          </div>

          ${ownsReview
            ? '<span class="rounded-full bg-mint px-3 py-1 text-xs font-extrabold text-forest">Your review</span>'
            : ''}
        </div>

        <p class="mt-5 flex-1 whitespace-pre-line text-[15px] leading-7 text-ink/75">
          ${escapeHtml(review.comment)}
        </p>

        ${canManage ? `
          <div class="mt-6 flex gap-2 border-t border-forest/10 pt-4">
            <button
              class="btn-secondary !px-4 !py-2 text-sm"
              data-edit-review="${review.id}"
            >
              Edit
            </button>
            <button
              class="btn-danger !px-4 !py-2 text-sm"
              data-delete-review="${review.id}"
            >
              Delete
            </button>
          </div>
        ` : ''}
      </article>
    `;
  }).join('');

  document.querySelectorAll('[data-edit-review]').forEach((button) => {
    button.addEventListener('click', () => {
      startEdit(Number(button.dataset.editReview));
    });
  });

  document.querySelectorAll('[data-delete-review]').forEach((button) => {
    button.addEventListener('click', () => {
      removeReview(Number(button.dataset.deleteReview));
    });
  });
}

function prepareCreateForm() {
  editingReviewId = null;
  reviewForm.querySelector('[data-form-fields]').classList.remove('hidden');
  submitButton.classList.remove('hidden');
  cancelButton.classList.add('hidden');
  submitButton.textContent = 'Publish review';

  if (isAdmin()) {
    formTitle.textContent = 'Add a review';
    formHint.textContent = 'Admin mode: add a testimonial on behalf of a learner.';
    adminBadge?.classList.remove('hidden');
    authorInput.value = '';
  } else {
    formTitle.textContent = 'Leave a review';
    formHint.textContent = 'Tell future learners what your experience was like.';
    adminBadge?.classList.add('hidden');

    if (!authorInput.value) {
      authorInput.value = currentUser?.username || '';
    }
  }
}

function renderPanel() {
  if (!currentUser) {
    reviewPanel.innerHTML = `
      <div class="rounded-[1.7rem] border border-forest/10 bg-mint/65 p-7">
        <div class="eyebrow">Share your experience</div>
        <h2 class="display mt-2 text-3xl text-forest">Studied with Mingle & Speak?</h2>
        <p class="mt-3 max-w-xl leading-7 text-ink/65">
          Create an account or log in to leave a review. Your login is used only to keep each review tied to a real account.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a class="btn-primary" href="/account.html?mode=signup&returnTo=/reviews.html">Create account</a>
          <a class="btn-secondary" href="/account.html?mode=login&returnTo=/reviews.html">Log in</a>
        </div>
      </div>
    `;
    return;
  }

  reviewForm.classList.remove('hidden');

  if (isAdmin()) {
    prepareCreateForm();
    return;
  }

  const existing = ownReview();

  if (existing) {
    adminBadge?.classList.add('hidden');
    formTitle.textContent = 'Your review is live';
    formHint.textContent = 'You can edit or delete it from the review card below.';
    submitButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    reviewForm.querySelector('[data-form-fields]').classList.add('hidden');
  } else {
    prepareCreateForm();
  }
}

function startEdit(reviewId) {
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return;

  editingReviewId = reviewId;

  reviewForm.querySelector('[data-form-fields]').classList.remove('hidden');
  submitButton.classList.remove('hidden');
  cancelButton.classList.remove('hidden');

  formTitle.textContent = isAdmin() ? 'Edit review' : 'Edit your review';
  formHint.textContent = isAdmin()
    ? 'Update the learner name, rating or comment, then save your changes.'
    : 'Update your name, rating or comment, then save your changes.';

  adminBadge?.classList.toggle('hidden', !isAdmin());

  authorInput.value = review.author_name || '';
  reviewForm.querySelector('[name="comment"]').value = review.comment;
  setRating(Math.max(1, Math.round(review.rating)));
  submitButton.textContent = 'Save changes';

  reviewPanel.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

function stopEdit() {
  editingReviewId = null;
  reviewForm.reset();
  setRating(5);
  cancelButton.classList.add('hidden');
  submitButton.textContent = 'Publish review';
  renderPanel();
}

cancelButton.addEventListener('click', stopEdit);

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!currentUser) return;

  const author_name = authorInput.value.trim();
  const comment = reviewForm.querySelector('[name="comment"]').value.trim();

  if (!author_name) {
    showToast('Please enter the name to display with the review.', 'error');
    return;
  }

  if (!comment) {
    showToast('Please write a short review first.', 'error');
    return;
  }

  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = editingReviewId ? 'Saving…' : 'Publishing…';

  try {
    const payload = {
      author_name,
      rating: selectedRating,
      comment
    };

    if (editingReviewId) {
      await updateReview(editingReviewId, payload);
      showToast('The review has been updated.');
    } else if (isAdmin()) {
      await createAdminReview(payload);
      showToast('The review has been added.');
    } else {
      await createReview(payload);
      showToast('Thanks — your review is now live.');
    }

    reviewForm.reset();
    setRating(5);
    editingReviewId = null;

    reviews = await getReviews();
    renderReviews();
    renderPanel();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = editingReviewId ? 'Save changes' : originalText;
  }
});

async function removeReview(reviewId) {
  const prompt = isAdmin()
    ? 'Delete this review? This cannot be undone.'
    : 'Delete your review? This cannot be undone.';

  if (!window.confirm(prompt)) return;

  try {
    await deleteReview(reviewId);
    showToast(isAdmin() ? 'The review has been deleted.' : 'Your review has been deleted.');

    reviews = await getReviews();
    renderReviews();
    renderPanel();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function init() {
  currentUser = await authReady;

  try {
    reviews = await getReviews();
    renderReviews();
    renderPanel();
  } catch (error) {
    loadingState.textContent =
      'We could not load reviews right now. Please try again shortly.';
    showToast(error.message, 'error');
  }
}

init();
