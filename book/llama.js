/* The llama's invitation. Shows once a visitor is engaged (20 seconds and 40% of the page),
   at most once every 14 days, never after a signup, never while someone is typing. */
(function () {
  var pop = document.getElementById('llamaPop');
  if (!pop) { return; }
  var path = window.location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  if (/\/book\/teams$/.test(path)) { return; }
  if (!document.getElementById('bkAgenda')) { pop.classList.add('llama-pop--low'); }
  var form = pop.querySelector('form');
  var m = path.match(/\/book\/(kate|daniel|priya|tom|marta)$/);
  var source = m ? 'popup-' + m[1] : 'popup-book';
  form.setAttribute('data-source', source);
  form.querySelector('[name="SIGNUP_SOURCE"]').value = source;
  if (m) { form.querySelector('[name="QUIZ_RESULT"]').value = m[1]; }

  function get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function track(name) { if (window.umami && typeof window.umami.track === 'function') { window.umami.track(name, { page: path }); } }

  if (get('aiamSignedUp')) { return; }
  if (Date.now() - (Number(get('llamaPopSeen')) || 0) < 14 * 864e5) { return; }

  var shown = false, timeOk = false, scrollOk = false;
  function typing() { var a = document.activeElement; return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName); }
  function check() {
    if (shown || !timeOk || !scrollOk || typing()) { return; }
    shown = true;
    pop.hidden = false;
    requestAnimationFrame(function () { pop.classList.add('show'); });
    set('llamaPopSeen', String(Date.now()));
    track('llama-pop-shown');
  }
  function close() {
    pop.classList.remove('show');
    setTimeout(function () { pop.hidden = true; }, 350);
  }
  setTimeout(function () { timeOk = true; check(); }, 20000);
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.4) { scrollOk = true; check(); }
  }, { passive: true });
  document.addEventListener('focusout', function () { setTimeout(check, 400); });
  pop.querySelectorAll('[data-llama-close]').forEach(function (b) {
    b.addEventListener('click', function () { track('llama-pop-closed'); close(); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { close(); } });

  // Any signup on the page counts: the llama will not ask again
  new MutationObserver(function () {
    if (document.querySelector('.bk-brevo.is-sent')) {
      set('aiamSignedUp', '1');
      if (form.classList.contains('is-sent')) { setTimeout(close, 4500); }
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
})();
