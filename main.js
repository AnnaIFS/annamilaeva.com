/* ========================================
   Anna Milaeva — Main JavaScript
   ======================================== */

// Clean addresses: links carry utm_ tags so analytics knows where a visit came
// from. Once the visit is counted, drop the tags from the address bar so people
// only see (and copy) the clean page address. main.js runs before the deferred
// Umami script wraps history.replaceState, so keeping the original here stops
// the clean-up from counting as a second page view.
const nativeReplaceState = history.replaceState.bind(history);
if (/[?&]utm_[a-z]+=/i.test(window.location.search)) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      [...params.keys()].forEach(key => { if (key.toLowerCase().startsWith('utm_')) params.delete(key); });
      const query = params.toString();
      nativeReplaceState(history.state, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    }, 1500);
  });
}

// Facebook in-app browser fix
if (/FBAN|FBAV|Instagram/i.test(navigator.userAgent)) {
  document.documentElement.classList.add('fb-browser');
}

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });

  // Close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

// Desktop dropdowns — open on hover, link navigates on click
const dropdowns = document.querySelectorAll('.nav__dropdown');

dropdowns.forEach(dropdown => {
  // Arrow click toggles this dropdown without navigating
  const dropdownArrow = dropdown.querySelector('.nav__dropdown-arrow');
  if (dropdownArrow) {
    dropdownArrow.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdowns.forEach(other => { if (other !== dropdown) other.classList.remove('open'); });
      dropdown.classList.toggle('open');
    });
  }
});

if (dropdowns.length) {
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
  });
}

// Mobile dropdowns
document.querySelectorAll('.nav__mobile-dropdown').forEach(mobileDropdown => {
  const mobileDropdownToggle = mobileDropdown.querySelector('.nav__mobile-dropdown-toggle');
  if (mobileDropdownToggle) {
    mobileDropdownToggle.addEventListener('click', () => {
      mobileDropdown.classList.toggle('open');
    });
  }
});

// Nav scroll shadow
const nav = document.getElementById('nav');

if (nav) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// Fade-in on scroll (Intersection Observer)
const fadeEls = document.querySelectorAll('.fade-in');

if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
  const reveal = (entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  };

  // A block taller than the screen can never show 15% of itself at once, so on a
  // phone it would sit at opacity 0 forever. Those get a threshold they can reach.
  const partial = new IntersectionObserver(reveal, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });
  const tall = new IntersectionObserver(reveal, {
    threshold: 0,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => {
    (el.offsetHeight > window.innerHeight * 0.5 ? tall : partial).observe(el);
  });
} else {
  // Fallback: show everything immediately
  fadeEls.forEach(el => el.classList.add('visible'));
}

// FAQ accordion
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq__item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
    });

    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// AJAX form submission (no redirect)
document.querySelectorAll('.ajax-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        form.style.display = 'none';
        const successEl = form.nextElementSibling;
        if (successEl && successEl.classList.contains('form-success')) {
          successEl.style.display = 'block';
        }
      } else {
        btn.textContent = 'Something went wrong. Try again.';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    }).catch(() => {
      btn.textContent = 'Something went wrong. Try again.';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; }, 3000);
    });
  });
});


// In-page links scroll by hand and never write the hash into the address bar.
// Clicking "See Current Cohort" used to leave #current-cohort in the URL, so a
// copied link dropped the next reader halfway down the page with the hero
// skipped. The ids stay in the markup, so links already shared still land.
// The skip link keeps its default behaviour, which moves keyboard focus.
document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // Clear the fixed nav, which otherwise covers the heading we scrolled to.
    const navBar = document.getElementById('nav');
    const clearance = (navBar ? navBar.offsetHeight : 0) + 24;
    const top = target.getBoundingClientRect().top + window.scrollY - clearance;

    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  });
});

// Keep the footer copyright year current. The HTML says the year it was
// written; this swaps in this year so nobody has to edit every page in January.
(function () {
  var year = String(new Date().getFullYear());
  document.querySelectorAll('.footer__bottom span, .sh-footer, footer').forEach(function (el) {
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3 && /©\s*\d{4}/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/(©\s*)\d{4}/, '$1' + year);
      }
    });
  });
})();

// ---- Holiday gifts bar (Nov 2026 to Jan 2027) ----
// A slim line above the menu that points to /gifts (English pages) or /es/regalos
// (Spanish pages). Everything for it lives in
// this block: the style, the markup and the switch-off date. From HOLIDAY_BAR_END
// on (the visitor's own clock) it never appears, so it removes itself. To take
// it out early, delete this block and gifts-llama.jpg.
// The bar sits in the page flow and scrolls away; the fixed menu rides down with
// it at the top and settles at 0 once the bar is gone. The X hides it on that
// browser for good. The llama nods once (under a second), never with reduced motion.
(function () {
  var HOLIDAY_BAR_END = new Date(2027, 0, 7); // 7 January 2027, 00:00 local time
  var path = window.location.pathname;

  if (new Date() >= HOLIDAY_BAR_END) return;
  if (/^\/(gifts|es\/regalos)(\.html)?\/?$/.test(path)) return; // already on a gifts page
  var es = /^\/es(\/|$)/.test(path);
  var t = es ? {
    region: 'Regalos para estas fiestas', href: '/es/regalos', title: 'Regalos para estas fiestas',
    more: 'Menos cosas, m\u00e1s cuidado.', cta: 'Ver los regalos', close: 'Cerrar la barra de regalos'
  } : {
    region: 'Holiday gifts', href: '/gifts', title: 'Holiday gifts that help',
    more: 'Less stuff, more care.', cta: 'See the gifts', close: 'Close the holiday gifts bar'
  };
  try { if (localStorage.getItem('hgbar-closed') === '1') return; } catch (e) {}

  var css =
    '.hgbar{position:relative;z-index:1001;background:#A94A22;color:#fff;font-family:var(--font-body);}' +
    '.hgbar__inner{display:flex;align-items:center;justify-content:center;gap:12px;min-height:48px;padding:6px 52px 6px 16px;max-width:1200px;margin:0 auto;}' +
    '.hgbar__link{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none;font-size:0.95rem;line-height:1.35;}' +
    '.hgbar__img{flex:none;width:36px;height:36px;border-radius:50%;border:2px solid #FAF7F2;background:#FAF7F2;object-fit:cover;}' +
    '.hgbar__title{font-family:var(--font-heading);font-size:1.08rem;font-weight:500;}' +
    '.hgbar__more{opacity:0.92;}' +
    '.hgbar__cta{font-weight:600;color:#fff;border-bottom:1.5px solid #E8A020;padding-bottom:1px;white-space:nowrap;}' +
    '.hgbar__link:hover .hgbar__cta{border-bottom-color:#fff;}' +
    '.hgbar__link:focus-visible,.hgbar__close:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:4px;}' +
    '.hgbar__close{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:44px;height:44px;border:0;background:transparent;color:#fff;font-size:22px;line-height:1;cursor:pointer;opacity:0.85;}' +
    '.hgbar__close:hover{opacity:1;}' +
    '@media (prefers-reduced-motion:no-preference){.hgbar__img{animation:hgbarNod 0.9s ease-in-out 0.8s 1 both;transform-origin:50% 85%;}}' +
    '@keyframes hgbarNod{0%{transform:rotate(0)}30%{transform:rotate(-9deg)}65%{transform:rotate(6deg)}100%{transform:rotate(0)}}' +
    '@media (max-width:768px){.hgbar__more,.hgbar__dot,.hgbar__words{display:none;}.hgbar__inner{justify-content:flex-start;}.hgbar__link{gap:10px;}.hgbar__img{width:32px;height:32px;}.hgbar__title{font-size:1.02rem;border-bottom:1.5px solid #E8A020;}.hgbar__cta{border-bottom:0;font-size:1.05rem;}}' +
    '@media (max-width:399px){.hgbar__inner{padding-right:48px;}.hgbar__link{gap:8px;}.hgbar__img{width:28px;height:28px;}.hgbar__title{font-size:0.92rem;}}' +
    '@media (max-width:339px){.hgbar__inner{padding-left:12px;}.hgbar__title{font-size:0.84rem;}}' +
    '@media print{.hgbar{display:none;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.className = 'hgbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', t.region);
  bar.innerHTML =
    '<div class="hgbar__inner">' +
      '<a class="hgbar__link" href="' + t.href + '" data-umami-event="holiday-bar-click" data-umami-event-lang="' + (es ? 'es' : 'en') + '">' +
        '<img class="hgbar__img" src="/gifts-llama.jpg" alt="" width="36" height="36">' +
        '<span><span class="hgbar__title">' + t.title + '<span class="hgbar__dot">.</span></span> ' +
        '<span class="hgbar__more">' + t.more + '</span></span> ' +
        '<span class="hgbar__cta"><span class="hgbar__words">' + t.cta + '&nbsp;</span><span aria-hidden="true">&rarr;</span></span>' +
      '</a>' +
      '<button type="button" class="hgbar__close" aria-label="' + t.close + '">&times;</button>' +
    '</div>';

  // After the skip link, so keyboard users still meet "Skip to content" first.
  var skip = document.querySelector('.skip-link');
  if (skip && skip.parentNode === document.body) skip.after(bar);
  else document.body.insertBefore(bar, document.body.firstChild);

  // Measured on load and resize only, so scrolling stays cheap. In the Facebook
  // and Instagram app browsers the menu is not fixed, so it is left alone there.
  var menu = document.getElementById('nav');
  var menuFixed = false, barHeight = 0;
  function measure() {
    menuFixed = !!menu && bar.isConnected && getComputedStyle(menu).position === 'fixed';
    barHeight = bar.isConnected ? bar.offsetHeight : 0;
    place();
  }
  function place() {
    if (!menu) return;
    var top = menuFixed ? Math.max(0, barHeight - window.scrollY) : 0;
    menu.style.top = top ? top + 'px' : '';
  }
  measure();
  window.addEventListener('scroll', place, { passive: true });
  window.addEventListener('resize', measure);

  bar.querySelector('.hgbar__close').addEventListener('click', function () {
    try { localStorage.setItem('hgbar-closed', '1'); } catch (e) {}
    bar.remove();
    measure();
    if (window.umami && typeof window.umami.track === 'function') window.umami.track('holiday-bar-close');
  });
})();
