(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const m="https://api.mingleandspeak.com".trim(),g=(m||"http://127.0.0.1:8000").replace(/\/$/,"");class h extends Error{constructor(a,t,n=null){super(a),this.name="ApiError",this.status=t,this.payload=n}}async function l(e,a={}){const t={...a.headers||{}};a.body&&!(a.body instanceof FormData)&&!t["Content-Type"]&&(t["Content-Type"]="application/json");const n=await fetch(`${g}${e}`,{credentials:"include",...a,headers:t}),s=n.headers.get("content-type")||"";let r=null;if(n.status!==204&&(r=s.includes("application/json")?await n.json().catch(()=>null):await n.text().catch(()=>null)),!n.ok){const o=r?.detail,p=Array.isArray(o)?o.map(f=>f.msg).join(" • "):null;throw new h(p||o||"Something went wrong. Please try again.",n.status,r)}return r}function T({username:e,email:a,password:t}){return l("/auth/signup",{method:"POST",body:JSON.stringify({username:e,email:a,password:t})})}function E({email:e,password:a}){return l("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:a})})}function x(){return l("/auth/logout",{method:"POST"})}async function b(){try{return await l("/auth/me")}catch(e){if(e instanceof h&&e.status===401)return null;throw e}}let c;function i(e,a="success"){let t=document.querySelector("[data-toast]");t||(t=document.createElement("div"),t.dataset.toast="",t.className="toast",document.body.appendChild(t)),t.textContent=e,t.classList.toggle("error",a==="error"),t.classList.add("show"),clearTimeout(c),c=setTimeout(()=>t.classList.remove("show"),3500)}function v(){const e=window.location.pathname.toLowerCase();return e.includes("reviews")?"reviews":e.includes("english")?"english":e.includes("spanish")?"spanish":e.includes("french")?"french":e.includes("account")?"account":"home"}function d(e,a,t){const n=v()===e?'aria-current="page"':"";return`<a class="nav-link" href="${a}" ${n}>${t}</a>`}async function y(){const e=document.querySelector("[data-site-header]"),a=document.querySelector("[data-site-footer]");let t=null;try{t=await b()}catch(n){console.warn("Could not resolve login state:",n)}if(e){e.innerHTML=`
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
            ${d("home","/","Home")}

            <div class="group relative">
              <button class="nav-link flex items-center gap-1" type="button">
                Languages <span aria-hidden="true">⌄</span>
              </button>

              <div class="invisible absolute left-1/2 top-full z-50 w-48 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div class="rounded-2xl border border-forest/10 bg-white p-2 shadow-xl">
                  <a href="/english.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇬🇧 English</a>
                  <a href="/spanish.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇪🇸 Spanish</a>
                  <a href="/french.html" class="block rounded-xl px-3 py-2.5 text-sm font-bold text-forest hover:bg-mint/60">🇫🇷 French</a>
                </div>
              </div>
            </div>

            ${d("reviews","/reviews.html","Reviews")}
            <a class="nav-link" href="/#contact">Contact</a>
          </nav>

          <div class="hidden items-center gap-2 lg:flex" data-auth-actions></div>

          <button
            data-mobile-toggle
            class="grid h-11 w-11 place-items-center rounded-full border border-forest/15 bg-white text-xl text-forest lg:hidden"
            aria-label="Open menu"
            aria-expanded="false"
          >
            ☰
          </button>
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
    `,w(e,t);const n=e.querySelector("[data-mobile-toggle]"),s=e.querySelector("[data-mobile-menu]");n?.addEventListener("click",()=>{const r=!s.classList.contains("hidden");s.classList.toggle("hidden"),n.setAttribute("aria-expanded",String(!r)),n.textContent=r?"☰":"×"})}return a&&(a.innerHTML=`
      <footer class="border-t border-forest/10 bg-forest text-white">
        <div class="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.2fr_.8fr_.8fr] lg:px-8">
          <div>
            <div class="display text-3xl">Mingle & Speak</div>
            <p class="mt-3 max-w-md text-sm leading-7 text-white/70">
              Practical, personalised language training in English, Spanish and French for work, exams, travel and everyday confidence.
            </p>
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

        <div class="border-t border-white/10 px-5 py-5 text-center text-xs text-white/50">
          © ${new Date().getFullYear()} Mingle & Speak. All rights reserved.
        </div>
      </footer>
    `),t}function w(e,a){const t=e.querySelector("[data-auth-actions]"),n=e.querySelector("[data-mobile-auth]");if(a){const s=a.role==="admin"?'<span class="rounded-full bg-coral/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-coral">Admin</span>':"";t.innerHTML=`
      ${s}
      <span class="max-w-36 truncate text-sm font-bold text-forest/70">
        Hi, <span data-user-name></span>
      </span>
      <button class="btn-secondary !px-4 !py-2 text-sm" data-logout>Log out</button>
    `,n.innerHTML=`
      <div class="mb-3 flex items-center gap-2 text-sm font-bold text-forest/70">
        Signed in as <span data-user-name></span>
        ${s}
      </div>
      <button class="btn-secondary w-full" data-logout>Log out</button>
    `,e.querySelectorAll("[data-user-name]").forEach(r=>{r.textContent=a.username}),e.querySelectorAll("[data-logout]").forEach(r=>{r.addEventListener("click",S)})}else t.innerHTML=`
      <a class="btn-secondary !px-4 !py-2 text-sm" href="/account.html?mode=login">Log in</a>
      <a class="btn-primary !px-4 !py-2 text-sm" href="/account.html?mode=signup">Create account</a>
    `,n.innerHTML=`
      <div class="grid gap-2 sm:grid-cols-2">
        <a class="btn-secondary" href="/account.html?mode=login">Log in</a>
        <a class="btn-primary" href="/account.html?mode=signup">Create account</a>
      </div>
    `}async function S(){try{await x(),i("You have been logged out."),window.setTimeout(()=>window.location.assign("/"),350)}catch(e){i(e.message||"Could not log out.","error")}}function u(e,a){const t=e.querySelector('button[type="submit"]');t&&(t.disabled=a,t.dataset.originalText||=t.textContent,t.textContent=a?"Sending…":t.dataset.originalText)}async function L(e){u(e,!0);try{const a=await fetch(e.action,{method:"POST",body:new FormData(e),headers:{Accept:"application/json"}});if(!a.ok){const n=(await a.json().catch(()=>null))?.errors?.map(s=>s.message).join(" • ");throw new Error(n||"Your message could not be sent. Please try again.")}e.reset(),i(e.dataset.successMessage||"Thanks! Your message has been sent.")}catch(a){i(a.message||"Your message could not be sent.","error")}finally{u(e,!1)}}function k(){document.querySelectorAll("[data-formspree-form]").forEach(e=>{e.addEventListener("submit",a=>{a.preventDefault(),L(e)})})}k();const C=y();export{T as a,l as b,C as c,E as l,i as s};
