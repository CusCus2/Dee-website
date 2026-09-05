import { getCurrentUser, logout } from '../api/auth.js';
import { showToast } from './toast.js';

function currentPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('reviews')) return 'reviews';
  if (path.includes('english')) return 'english';
  if (path.includes('spanish')) return 'spanish';
  if (path.includes('french')) return 'french';
  if (path.includes('account')) return 'account';
  return 'home';
}

function pageLink(page, href, label) {
  const active = currentPage() === page ? 'aria-current="page"' : '';
  return `<a class="nav-link" href="${href}" ${active}>${label}</a>`;
}

export async function renderLayout() {
  const headerMount = document.querySelector('[data-site-header]');
  const footerMount = document.querySelector('[data-site-footer]');

  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.warn('Could not resolve login state:', error);
  }

  if (headerMount) {
    headerMount.innerHTML = `
      <header class="sticky top-0 z-50 border-b border-forest/10 bg-cream/90 backdrop-blur-xl">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 lg:px-8">
          <a href="/" class="flex items-center gap-3" aria-label="Mingle and Speak home">
            <img src="/images/mingle+speak.webp" alt="" class="h-10 w-10 rounded-full object-cover ring-1 ring-forest/10" />
            <div>
              <div class="display text-xl leading-none text-forest">Mingle & Speak</div>
              <div class="mt-1 text-[10px] font-extrabold uppercase tracking-[.18em] text-forest/55">Language academy</div>
            </div>
          </a>

          <nav class="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            ${pageLink('home', '/', 'Home')}
            <div class="group relative">
              <button class="nav-link flex items-center gap-1" type="button">Languages <span aria-hidden="true">⌄</span></button>
              <div class="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div class="rounded-2xl border border-forest/10 bg-white p-2 shadow-xl">
                  <a href="/english.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇬🇧 English</a>
                  <a href="/spanish.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇪🇸 Spanish</a>
                  <a href="/french.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇫🇷 French</a>
                </div>
              </div>
            </div>
            ${pageLink('reviews', '/reviews.html', 'Reviews')}
            <a class="nav-link" href="/#contact">Contact</a>
          </nav>

          <div class="hidden items-center gap-2 lg:flex" data-auth-actions></div>

          <button data-mobile-toggle class="grid h-11 w-11 place-items-center rounded-full border border-forest/15 bg-white text-xl text-forest lg:hidden" aria-label="Open menu" aria-expanded="false">☰</button>
        </div>

        <div data-mobile-menu class="hidden border-t border-forest/10 bg-cream px-5 py-5 lg:hidden">
          <nav class="grid gap-4">
            <a class="font-bold text-forest" href="/">Home</a>
            <a class="font-bold text-forest" href="/english.html">English</a>
            <a class="font-bold text-forest" href="/spanish.html">Spanish</a>
            <a class="font-bold text-forest" href="/french.html">French</a>
            <a class="font-bold text-forest" href="/reviews.html">Reviews</a>
            <a class="font-bold text-forest" href="/#contact">Contact</a>
            <div class="mt-2 border-t border-forest/10 pt-4" data-mobile-auth></div>
          </nav>
        </div>
      </header>
    `;

    renderAuthActions(headerMount, user);

    const toggle = headerMount.querySelector('[data-mobile-toggle]');
    const menu = headerMount.querySelector('[data-mobile-menu]');
    toggle?.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? '☰' : '×';
    });
  }

  if (footerMount) {
    footerMount.innerHTML = `
      <footer class="border-t border-forest/10 bg-forest text-white">
        <div class="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
          <div>
            <div class="display text-3xl">Mingle & Speak</div>
            <p class="mt-3 max-w-md text-sm leading-7 text-white/70">Practical, personalised language training in English, Spanish and French for work, exams, travel and everyday confidence.</p>
          </div>
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[.18em] text-white/45">Explore</div>
            <div class="mt-4 grid gap-2 text-sm font-semibold text-white/80">
              <a href="/english.html" class="hover:text-white">English</a>
              <a href="/spanish.html" class="hover:text-white">Spanish</a>
              <a href="/french.html" class="hover:text-white">French</a>
              <a href="/reviews.html" class="hover:text-white">Student reviews</a>
            </div>
          </div>
          <div>
            <div class="text-xs font-extrabold uppercase tracking-[.18em] text-white/45">Contact</div>
            <div class="mt-4 grid gap-2 text-sm text-white/80">
              <a href="mailto:mingleandspeak@gmail.com" class="hover:text-white">mingleandspeak@gmail.com</a>
              <a href="tel:+33628612976" class="hover:text-white">French: +33 6 28 61 29 76</a>
              <a href="tel:+34614420871" class="hover:text-white">Spanish: +34 614 42 08 71</a>
              <span>Online lessons worldwide</span>
            </div>
          </div>
        </div>
        <div class="border-t border-white/10 px-5 py-5 text-center text-xs text-white/50">© ${new Date().getFullYear()} Mingle & Speak. All rights reserved.</div>
      </footer>
    `;
  }

  return user;
}

function renderAuthActions(root, user) {
  const desktop = root.querySelector('[data-auth-actions]');
  const mobile = root.querySelector('[data-mobile-auth]');

  if (user) {
    desktop.innerHTML = `
      <span class="max-w-36 truncate text-sm font-bold text-forest/70">Hi, <span data-user-name></span></span>
      <button class="btn-secondary !px-4 !py-2 text-sm" data-logout>Log out</button>
    `;
    mobile.innerHTML = `
      <div class="mb-3 text-sm font-bold text-forest/70">Signed in as <span data-user-name></span></div>
      <button class="btn-secondary w-full" data-logout>Log out</button>
    `;
    root.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = user.username; });
    root.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', handleLogout));
  } else {
    desktop.innerHTML = `
      <a class="btn-secondary !px-4 !py-2 text-sm" href="/account.html?mode=login">Log in</a>
      <a class="btn-primary !px-4 !py-2 text-sm" href="/account.html?mode=signup">Create account</a>
    `;
    mobile.innerHTML = `
      <div class="grid gap-2 sm:grid-cols-2">
        <a class="btn-secondary" href="/account.html?mode=login">Log in</a>
        <a class="btn-primary" href="/account.html?mode=signup">Create account</a>
      </div>
    `;
  }
}

async function handleLogout() {
  try {
    await logout();
    showToast('You have been logged out.');
    window.setTimeout(() => window.location.assign('/'), 350);
  } catch (error) {
    showToast(error.message || 'Could not log out.', 'error');
  }
}
