import './main.js';
import { login, signup } from './api/auth.js';
import { showToast } from './components/toast.js';

const loginTab = document.querySelector('[data-tab="login"]');
const signupTab = document.querySelector('[data-tab="signup"]');
const loginPanel = document.querySelector('[data-panel="login"]');
const signupPanel = document.querySelector('[data-panel="signup"]');
const loginForm = document.querySelector('[data-login-form]');
const signupForm = document.querySelector('[data-signup-form]');

const params = new URLSearchParams(window.location.search);
let mode = params.get('mode') === 'signup' ? 'signup' : 'login';

function setMode(nextMode) {
  mode = nextMode;
  const loginActive = mode === 'login';
  loginPanel.classList.toggle('hidden', !loginActive);
  signupPanel.classList.toggle('hidden', loginActive);

  loginTab.className = loginActive
    ? 'rounded-full bg-forest px-5 py-2.5 text-sm font-extrabold text-white'
    : 'rounded-full px-5 py-2.5 text-sm font-extrabold text-forest/65 hover:bg-white';
  signupTab.className = !loginActive
    ? 'rounded-full bg-forest px-5 py-2.5 text-sm font-extrabold text-white'
    : 'rounded-full px-5 py-2.5 text-sm font-extrabold text-forest/65 hover:bg-white';

  const url = new URL(window.location.href);
  url.searchParams.set('mode', mode);
  window.history.replaceState({}, '', url);
}

setMode(mode);
loginTab.addEventListener('click', () => setMode('login'));
signupTab.addEventListener('click', () => setMode('signup'));

function setBusy(form, busy) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = busy;
  button.dataset.originalText ||= button.textContent;
  button.textContent = busy ? 'Please wait…' : button.dataset.originalText;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  setBusy(loginForm, true);

  try {
    await login({
      email: formData.get('email'),
      password: formData.get('password')
    });
    showToast('Welcome back!');
    const returnTo = params.get('returnTo');
    window.setTimeout(() => window.location.assign(returnTo || '/reviews.html'), 350);
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setBusy(loginForm, false);
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const password = formData.get('password');
  const confirmation = formData.get('confirm_password');

  if (password !== confirmation) {
    showToast('The passwords do not match.', 'error');
    return;
  }

  setBusy(signupForm, true);

  try {
    await signup({
      username: formData.get('username'),
      email: formData.get('email'),
      password
    });

    const email = formData.get('email');
    signupForm.reset();
    setMode('login');
    loginForm.querySelector('[name="email"]').value = email;
    showToast('Account created. You can log in now.');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setBusy(signupForm, false);
  }
});
