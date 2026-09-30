(function () {
  'use strict';

  var root = document.documentElement;
  // Path to assets/ relative to the current page (the Chinese page lives in zh/).
  var assets = document.body.getAttribute('data-assets') || 'assets/';

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      var toLight = toggle.getAttribute('data-label-light') || 'Switch to light theme';
      var toDark = toggle.getAttribute('data-label-dark') || 'Switch to dark theme';
      toggle.setAttribute('aria-label', theme === 'dark' ? toLight : toDark);
    }
  }

  applyTheme(currentTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
    });
  }

  // Follow system changes until the visitor picks a theme explicitly.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem('theme'); } catch (err) {}
      if (!stored) applyTheme(e.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
  }

  /* ---------- Optional assets: CV and profile photo ----------
     Both stay hidden until the file exists in assets/.
     (A 404 for a missing optional file may appear in the browser console.) */
  var cvItem = document.getElementById('cv-item');
  if (cvItem && window.fetch) {
    fetch(assets + 'cv.pdf', { method: 'HEAD' })
      .then(function (res) {
        var type = res.headers.get('content-type') || '';
        if (res.ok && type.indexOf('pdf') !== -1) cvItem.hidden = false;
      })
      .catch(function () { /* keep hidden */ });
  }

  var photo = document.getElementById('hero-photo');
  var photoImg = document.getElementById('hero-photo-img');
  if (photo && photoImg) {
    var probe = new Image();
    probe.onload = function () {
      photoImg.src = probe.src;
      photo.hidden = false;
    };
    probe.src = assets + 'profile.jpg';
  }

  /* ---------- Highlight the current section in the nav ---------- */
  var links = document.querySelectorAll('.nav__links a[href^="#"]');
  var sections = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute('href'));
    if (s) sections.push({ link: a, el: s });
  });

  function updateActive() {
    var y = window.scrollY + 120;
    var active = null;
    sections.forEach(function (item) {
      if (item.el.offsetTop <= y) active = item;
    });
    // At the very bottom, always mark the last section.
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4 && sections.length) {
      active = sections[sections.length - 1];
    }
    sections.forEach(function (item) {
      if (item === active) item.link.setAttribute('aria-current', 'true');
      else item.link.removeAttribute('aria-current');
    });
  }

  if (sections.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { updateActive(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }
})();
