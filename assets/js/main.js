(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Language (English / Chinese, switched in place) ----------
     English is the default text in the HTML. Elements with data-zh hold the Chinese
     replacement for their content; data-zh-<attr> holds it for an attribute. */
  var TRANSLATED_ATTRS = ['title', 'aria-label', 'alt', 'lang', 'content'];
  var originals = new Map();
  var lang = 'en';

  var THEME_LABELS = {
    en: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme' },
    zh: { toLight: '切换到浅色主题', toDark: '切换到深色主题' }
  };

  function storedLang() {
    try {
      var q = new URLSearchParams(window.location.search).get('lang');
      if (q === 'zh' || q === 'en') return q;
      var v = localStorage.getItem('lang');
      if (v === 'zh' || v === 'en') return v;
    } catch (e) { /* ignore */ }
    return 'en';
  }

  function applyLang(next) {
    lang = next;
    root.setAttribute('lang', next === 'zh' ? 'zh-CN' : 'en');

    var selector = '[data-zh]' + TRANSLATED_ATTRS.map(function (a) { return ',[data-zh-' + a + ']'; }).join('');
    document.querySelectorAll(selector).forEach(function (el) {
      var saved = originals.get(el);
      if (!saved) {
        saved = { html: el.innerHTML, attrs: {} };
        TRANSLATED_ATTRS.forEach(function (a) {
          if (el.hasAttribute('data-zh-' + a)) saved.attrs[a] = el.getAttribute(a);
        });
        originals.set(el, saved);
      }
      if (el.hasAttribute('data-zh')) {
        el.innerHTML = next === 'zh' ? el.getAttribute('data-zh') : saved.html;
      }
      TRANSLATED_ATTRS.forEach(function (a) {
        if (el.hasAttribute('data-zh-' + a)) {
          el.setAttribute(a, next === 'zh' ? el.getAttribute('data-zh-' + a) : saved.attrs[a]);
        }
      });
    });

    applyTheme(currentTheme()); // theme-toggle label depends on the language
  }

  var langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      var next = lang === 'zh' ? 'en' : 'zh';
      applyLang(next);
      try { localStorage.setItem('lang', next); } catch (e) { /* storage unavailable */ }
    });
  }

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      var t = THEME_LABELS[lang];
      toggle.setAttribute('aria-label', theme === 'dark' ? t.toLight : t.toDark);
    }
  }

  applyTheme(currentTheme());

  var initialLang = storedLang();
  if (initialLang !== 'en') applyLang(initialLang);

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
    fetch('assets/cv.pdf', { method: 'HEAD' })
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
    probe.src = 'assets/profile.jpg';
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
