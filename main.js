/* ========================================
   Anna Milaeva — Main JavaScript
   ======================================== */

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

// Desktop dropdown — opens on hover, link navigates on click
const dropdown = document.querySelector('.nav__dropdown');
const dropdownToggle = document.querySelector('.nav__dropdown-toggle');
const dropdownArrow = dropdown ? dropdown.querySelector('.nav__dropdown-arrow') : null;

if (dropdown && dropdownToggle) {
  // Arrow click toggles dropdown without navigating
  if (dropdownArrow) {
    dropdownArrow.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.remove('open');
  });
}

// Mobile dropdown
const mobileDropdown = document.querySelector('.nav__mobile-dropdown');
const mobileDropdownToggle = document.querySelector('.nav__mobile-dropdown-toggle');

if (mobileDropdown && mobileDropdownToggle) {
  mobileDropdownToggle.addEventListener('click', () => {
    mobileDropdown.classList.toggle('open');
  });
}

// Dynamic hero padding — measure fixed header elements so content never hides behind them
function adjustHeroPadding() {
  const announcementBar = document.querySelector('.announcement-bar');
  const navEl = document.getElementById('nav');
  const hero = document.querySelector('.hero, .hero--compact');
  if (!navEl || !hero) return;

  const barHeight = announcementBar ? announcementBar.offsetHeight : 0;
  const navHeight = navEl.querySelector('.nav__inner').offsetHeight;
  hero.style.paddingTop = (barHeight + navHeight + 32) + 'px';
}

adjustHeroPadding();
window.addEventListener('resize', adjustHeroPadding);
document.fonts.ready.then(adjustHeroPadding);

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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));
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

