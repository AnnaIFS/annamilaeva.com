/* Shared behaviour for /book/teams and the character pages */
(function () {
  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') { window.umami.track(name, data); }
  }

  // Episodes: report the first play, and pause any other episode that is playing
  var videos = document.querySelectorAll('video[data-ep]');
  videos.forEach(function (v) {
    var reported = false;
    v.addEventListener('play', function () {
      videos.forEach(function (other) { if (other !== v) { other.pause(); } });
      if (!reported) {
        reported = true;
        track('episode-play', { episode: v.getAttribute('data-ep'), page: window.location.pathname });
      }
    });
  });

  // Practice signups go to the same Brevo form as the book page
  var BREVO_FORM_URL = 'https://dcaf4032.sibforms.com/serve/MUIFALbWwG25PtaOHafrnR3riv55863VfbgRNj2HN6rfpHhA4RoyfAsUlFBeXNnsdVpJded274JB9x0h-NcSeRkhOlhIEOnJL-zZK01OlIU1h4ez_cWcFfp-lFqVs-ZxX7r1_AmRqWGmjmwMwZBWupcLBjZTBE-qgugKnS1uBoXYd59o5gsFptPQr7cOPRY3P2JY6yEG3Sxtr6QZsA';
  document.querySelectorAll('.bk-brevo').forEach(function (form) {
    var msg = form.querySelector('.bk-brevo__msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = form.querySelector('[name="FIRSTNAME"]');
      var email = form.querySelector('[name="EMAIL"]');
      if (!first.value.trim() || !email.value || !email.checkValidity()) {
        msg.textContent = msg.getAttribute('data-bad');
        (first.value.trim() ? email : first).focus();
        return;
      }
      if (form.querySelector('[name="email_address_check"]').value) { return; }
      btn.disabled = true;
      fetch(BREVO_FORM_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(new FormData(form)) })
        .then(function () {
          form.classList.add('is-sent');
          msg.textContent = msg.getAttribute('data-ok');
          track('signup', { source: form.getAttribute('data-source') });
        })
        .catch(function () {
          btn.disabled = false;
          msg.textContent = msg.getAttribute('data-fail');
        });
    });
  });

  // Cards rise one after another as they come on screen
  var rising = document.querySelectorAll('.bp-rise');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        var el = entry.target;
        var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = (idx % 5) * 90 + 'ms';
        el.classList.add('bp-in');
        setTimeout(function () { el.style.transitionDelay = ''; }, 1200);
        obs.unobserve(el);
      });
    }, { threshold: 0.12 });
    rising.forEach(function (el) { obs.observe(el); });
  } else {
    rising.forEach(function (el) { el.classList.add('bp-in'); });
  }
})();
