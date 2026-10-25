(function () {
  'use strict';

  // Muhurtham starts Sunday 6 Dec 2026, 10:30 am IST (UTC+5:30)
  var WEDDING_START = new Date('2026-12-06T10:30:00+05:30');
  var MAP_URL = 'https://www.google.com/maps/search/?api=1&query=9.4446389,77.7935833';

  /* ---------- countdown ---------- */
  var cd = {
    d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
    m: document.getElementById('cd-m'), s: document.getElementById('cd-s'),
    note: document.getElementById('countdown-note')
  };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  function tick() {
    var left = WEDDING_START - Date.now();
    if (left <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = '00';
      cd.note.textContent = 'The wedding muhurtham time has arrived.';
      return false;
    }
    var s = Math.floor(left / 1000);
    cd.d.textContent = Math.floor(s / 86400);
    cd.h.textContent = pad(Math.floor(s % 86400 / 3600));
    cd.m.textContent = pad(Math.floor(s % 3600 / 60));
    cd.s.textContent = pad(s % 60);
    return true;
  }
  if (tick()) {
    var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 1000);
  }

  /* ---------- QR code (scan for location) ---------- */
  var qrHost = document.getElementById('qr');
  var qrSvgMarkup = '';
  function buildQr() {
    if (typeof qrcode !== 'function') { qrHost.textContent = MAP_URL; return; }
    var qr = qrcode(0, 'M');           // auto version, medium error correction
    qr.addData(MAP_URL);
    qr.make();
    var n = qr.getModuleCount(), quiet = 2, size = n + quiet * 2, d = '';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + (c + quiet) + ' ' + (r + quiet) + 'h1v1h-1z';
      }
    }
    qrSvgMarkup =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="#2f2250"/></svg>';
    qrHost.innerHTML = qrSvgMarkup;
  }
  buildQr();

  document.getElementById('qr-download').addEventListener('click', function () {
    if (!qrSvgMarkup) return;
    var img = new Image(), px = 1024;
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = cv.height = px;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, px, px);
      cv.toBlob(function (blob) { saveBlob(blob, 'wedding-venue-location-qr.png'); }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(qrSvgMarkup);
  });

  /* ---------- calendar (.ics) ---------- */
  var EVENTS = {
    wedding: {
      uid: 'wedding-2026-12-06@prathika-gowthaman',
      title: 'Wedding of M. Muthu Prathika & I. Gowthaman',
      start: '20261206T050000Z', end: '20261206T062000Z',     // 10:30–11:50 IST
      place: 'Anil Papanasa Nadar Kalyana Mandapam, Sivakasi',
      note: 'Muhurtham 10.30 am to 11.50 am. Location: ' + MAP_URL
    },
    betrothal: {
      uid: 'betrothal-2026-12-05@prathika-gowthaman',
      title: 'Betrothal of M. Muthu Prathika & I. Gowthaman',
      start: '20261205T130000Z', end: '20261205T143000Z',     // 6:30–8:00 pm IST
      place: '',
      note: 'Betrothal on 5th December 2026, 6.30 pm to 8.00 pm'
    }
  };
  var esc = function (t) { return t.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); };
  document.querySelectorAll('[data-ics]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var e = EVENTS[btn.getAttribute('data-ics')];
      var lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT', 'UID:' + e.uid, 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d{3}/g, ''),
        'DTSTART:' + e.start, 'DTEND:' + e.end, 'SUMMARY:' + esc(e.title)
      ];
      if (e.place) lines.push('LOCATION:' + esc(e.place));
      lines.push('DESCRIPTION:' + esc(e.note), 'END:VEVENT', 'END:VCALENDAR');
      saveBlob(new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), btn.getAttribute('data-ics') + '.ics');
    });
  });

  function saveBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- share ---------- */
  var shareBtn = document.getElementById('share');
  if (navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', function () {
      navigator.share({
        title: 'Wedding Invitation – Prathika & Gowthaman',
        text: 'You are warmly invited: Sunday, 6 December 2026, Sivakasi.',
        url: location.href
      }).catch(function () {});
    });
  }

  /* ---------- scroll reveal + active nav ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-menu a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- invitation language ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.lang-switch [role="tab"]'));
  var pages = { ta: document.getElementById('page-ta'), en: document.getElementById('page-en') };
  function showLang(lang, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-lang') === lang;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    Object.keys(pages).forEach(function (k) {
      var on = k === lang, el = pages[k];
      el.hidden = !on;
      if (on) { el.classList.add('in'); el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); }
    });
    try { localStorage.setItem('inviteLang', lang); } catch (e) {}
  }
  if (tabs.length) {
    var saved = null;
    try { saved = localStorage.getItem('inviteLang'); } catch (e) {}
    showLang(saved === 'en' ? 'en' : 'ta', false);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { showLang(t.getAttribute('data-lang'), false); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
        if (n < 0) return;
        e.preventDefault();
        showLang(tabs[(n + tabs.length) % tabs.length].getAttribute('data-lang'), true);
      });
    });
  }

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('nav-toggle');
  var menu = document.getElementById('nav-menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  document.addEventListener('click', function (e) { if (menu.classList.contains('open') && !e.target.closest('.nav-inner')) setMenu(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function () { setMenu(false); });
})();
