import{b as h,c as R,s}from"./main-BmAzpG6X.js";function b(){return h("/reviews")}function A({author_name:t,rating:e,comment:r}){return h("/reviews",{method:"POST",body:JSON.stringify({author_name:t,rating:e,comment:r})})}function $({author_name:t,rating:e,comment:r}){return h("/reviews/admin",{method:"POST",body:JSON.stringify({author_name:t,rating:e,comment:r})})}function k(t,{author_name:e,rating:r,comment:u}){return h(`/reviews/${t}`,{method:"PATCH",body:JSON.stringify({author_name:e,rating:r,comment:u})})}function P(t){return h(`/reviews/${t}`,{method:"DELETE"})}const M=document.querySelector("[data-reviews-grid]"),C=document.querySelector("[data-review-panel]"),o=document.querySelector("[data-review-form]"),p=document.querySelector("[data-review-form-title]"),g=document.querySelector("[data-review-form-hint]"),a=document.querySelector("[data-review-submit]"),f=document.querySelector("[data-review-cancel]"),N=document.querySelector("[data-empty-reviews]"),T=document.querySelector("[data-loading-reviews]"),_=document.querySelector("[data-rating-input]"),v=document.querySelector('[name="author_name"]'),y=document.querySelector("[data-admin-badge]"),E=[...document.querySelectorAll("[data-star]")];let n=null,c=[],d=null,m=5;function L(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function B(t){const e=Math.max(0,Math.min(5,Math.round(Number(t)||0)));return`${"★".repeat(e)}${"☆".repeat(5-e)}`}function i(){return n?.role==="admin"}function w(t){m=Number(t),_.value=String(m),E.forEach(e=>{e.classList.toggle("active",Number(e.dataset.star)<=m),e.setAttribute("aria-pressed",String(Number(e.dataset.star)===m))})}E.forEach(t=>{t.addEventListener("click",()=>w(t.dataset.star))});w(5);function D(){return!n||i()?null:c.find(t=>t.user_id===n.id)||null}function S(){T?.classList.add("hidden");const t=c.filter(e=>!e.status||e.status==="published");N?.classList.toggle("hidden",t.length!==0),M.innerHTML=t.map(e=>{const r=!!(n&&!i()&&e.user_id===n.id),u=!!(n&&(i()||e.user_id===n.id)),l=e.author_name||"Verified learner";return`
      <article
        class="soft-card flex h-full flex-col rounded-[1.6rem] bg-white p-6"
        data-review-id="${e.id}"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="stars text-lg" aria-label="${e.rating} out of 5 stars">
              ${B(e.rating)}
            </div>
            <div class="mt-2 text-xs font-extrabold uppercase tracking-[.14em] text-forest/45">
              ${L(l)}
            </div>
          </div>

          ${r?'<span class="rounded-full bg-mint px-3 py-1 text-xs font-extrabold text-forest">Your review</span>':""}
        </div>

        <p class="mt-5 flex-1 whitespace-pre-line text-[15px] leading-7 text-ink/75">
          ${L(e.comment)}
        </p>

        ${u?`
          <div class="mt-6 flex gap-2 border-t border-forest/10 pt-4">
            <button
              class="btn-secondary !px-4 !py-2 text-sm"
              data-edit-review="${e.id}"
            >
              Edit
            </button>
            <button
              class="btn-danger !px-4 !py-2 text-sm"
              data-delete-review="${e.id}"
            >
              Delete
            </button>
          </div>
        `:""}
      </article>
    `}).join(""),document.querySelectorAll("[data-edit-review]").forEach(e=>{e.addEventListener("click",()=>{H(Number(e.dataset.editReview))})}),document.querySelectorAll("[data-delete-review]").forEach(e=>{e.addEventListener("click",()=>{Y(Number(e.dataset.deleteReview))})})}function q(){d=null,o.querySelector("[data-form-fields]").classList.remove("hidden"),a.classList.remove("hidden"),f.classList.add("hidden"),a.textContent="Publish review",i()?(p.textContent="Add a review",g.textContent="Admin mode: add a testimonial on behalf of a learner.",y?.classList.remove("hidden"),v.value=""):(p.textContent="Leave a review",g.textContent="Tell future learners what your experience was like.",y?.classList.add("hidden"),v.value||(v.value=n?.username||""))}function x(){if(!n){C.innerHTML=`
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
    `;return}if(o.classList.remove("hidden"),i()){q();return}D()?(y?.classList.add("hidden"),p.textContent="Your review is live",g.textContent="You can edit or delete it from the review card below.",a.classList.add("hidden"),f.classList.add("hidden"),o.querySelector("[data-form-fields]").classList.add("hidden")):q()}function H(t){const e=c.find(r=>r.id===t);e&&(d=t,o.querySelector("[data-form-fields]").classList.remove("hidden"),a.classList.remove("hidden"),f.classList.remove("hidden"),p.textContent=i()?"Edit review":"Edit your review",g.textContent=i()?"Update the learner name, rating or comment, then save your changes.":"Update your name, rating or comment, then save your changes.",y?.classList.toggle("hidden",!i()),v.value=e.author_name||"",o.querySelector('[name="comment"]').value=e.comment,w(Math.max(1,Math.round(e.rating))),a.textContent="Save changes",C.scrollIntoView({behavior:"smooth",block:"center"}))}function O(){d=null,o.reset(),w(5),f.classList.add("hidden"),a.textContent="Publish review",x()}f.addEventListener("click",O);o.addEventListener("submit",async t=>{if(t.preventDefault(),!n)return;const e=v.value.trim(),r=o.querySelector('[name="comment"]').value.trim();if(!e){s("Please enter the name to display with the review.","error");return}if(!r){s("Please write a short review first.","error");return}a.disabled=!0;const u=a.textContent;a.textContent=d?"Saving…":"Publishing…";try{const l={author_name:e,rating:m,comment:r};d?(await k(d,l),s("The review has been updated.")):i()?(await $(l),s("The review has been added.")):(await A(l),s("Thanks — your review is now live.")),o.reset(),w(5),d=null,c=await b(),S(),x()}catch(l){s(l.message,"error")}finally{a.disabled=!1,a.textContent=d?"Save changes":u}});async function Y(t){const e=i()?"Delete this review? This cannot be undone.":"Delete your review? This cannot be undone.";if(window.confirm(e))try{await P(t),s(i()?"The review has been deleted.":"Your review has been deleted."),c=await b(),S(),x()}catch(r){s(r.message,"error")}}async function F(){n=await R;try{c=await b(),S(),x()}catch(t){T.textContent="We could not load reviews right now. Please try again shortly.",s(t.message,"error")}}F();
