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
