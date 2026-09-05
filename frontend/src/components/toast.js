let timer;

export function showToast(message, type = 'success') {
  let toast = document.querySelector('[data-toast]');

  if (!toast) {
    toast = document.createElement('div');
    toast.dataset.toast = '';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.toggle('error', type === 'error');
  toast.classList.add('show');

  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove('show'), 3500);
}
