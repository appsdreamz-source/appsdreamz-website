/* AppsDreamz site behaviour: navigation, sticky CTA, booking form. */
(function () {
  'use strict';
  var FORM_ENDPOINT = ''; // Set to a Formspree / Web3Forms / HubSpot URL to submit directly instead of opening email.
  var EMAIL = 'aneel@appsdreamz.com';

  /* ---------- navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var panelBtns = [].slice.call(document.querySelectorAll('.has-panel > .toplink'));
  var mobile = window.matchMedia('(max-width:1260px)');

  function closePanels(except) {
    panelBtns.forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.classList.remove('open');
    });
  }
  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    if (!open) closePanels();
  }
  panelBtns.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') !== 'true';
      closePanels(b);
      b.setAttribute('aria-expanded', String(open));
      document.getElementById(b.getAttribute('aria-controls')).classList.toggle('open', open);
    });
  });
  if (toggle) toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  document.addEventListener('click', function (e) {
    if (!mobile.matches && !e.target.closest('.has-panel')) closePanels();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openBtn = panelBtns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
    if (openBtn) { closePanels(); openBtn.focus(); return; }
    if (nav && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
  });
  mobile.addEventListener && mobile.addEventListener('change', function () { setNav(false); });

  /* ---------- header scroll state ---------- */
  var head = document.querySelector('.site-head');
  if (head) {
    var hs = function () { head.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', hs, { passive: true }); hs();
  }

  /* ---------- hero module map ---------- */
  var hmap = document.querySelector('.hmap');
  var hdata = document.getElementById('hm-data');
  if (hmap && hdata) {
    var HM = JSON.parse(hdata.textContent);
    var nodes = [].slice.call(hmap.querySelectorAll('.hm-node'));
    var links = [].slice.call(hmap.querySelectorAll('.hm-link'));
    var esc = function (t) { return String(t).replace(/[<>&]/g, ''); };
    var segs = [].slice.call(hmap.querySelectorAll('.hm-prog i'));
    var order = nodes.map(function (n) { return n.getAttribute('data-k'); });
    var cards = hmap.querySelector('.hcards');
    var cur = order[0];
    var pick = function (k, auto) {
      if (k === cur || !HM[k]) return;
      cur = k;
      nodes.forEach(function (n) { var on = n.getAttribute('data-k') === k; n.classList.toggle('hot', on); n.setAttribute('aria-pressed', String(on)); });
      links.forEach(function (l) { l.classList.toggle('hot', l.getAttribute('data-k') === k); });
      hmap.classList.toggle('ai-on', k === 'ai');
      hmap.querySelector('.hc-t').textContent = HM[k].n;
      hmap.querySelector('.go').textContent = HM[k].c;
      var li = function (arr) { return arr.map(function (t, i) { return '<li style="--i:' + i + '">' + esc(t) + '</li>'; }).join(''); };
      hmap.querySelector('.hc-chips').innerHTML = li(HM[k].t);
      hmap.querySelector('.hc-checks').innerHTML = li(HM[k].l);
      var ix = order.indexOf(k);
      segs.forEach(function (s, i) { s.classList.toggle('done', i < ix); s.classList.remove('on'); });
      if (segs[ix]) { void segs[ix].offsetWidth; segs[ix].classList.add('on'); }
      if (!auto) dl.push({ event: 'hero_module_select', module: k });
    };

    /* auto tour: clockwise from Core HR, one module per progress segment; stops for good once the visitor takes over */
    var DWELL = 3200, timer = null, stopped = false, inView = true;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var schedule = function () {
      clearTimeout(timer);
      if (stopped || !inView || document.hidden) return;
      timer = setTimeout(function () { pick(order[(order.indexOf(cur) + 1) % order.length], true); schedule(); }, DWELL);
    };
    var restart = function () {
      if (stopped) return;
      var s = segs[order.indexOf(cur)];
      if (s) { s.classList.remove('on'); void s.offsetWidth; s.classList.add('on'); }
      schedule();
    };
    var stop = function () {
      if (stopped) return;
      stopped = true; clearTimeout(timer);
      hmap.classList.add('hm-manual');
      cards.setAttribute('aria-live', 'polite');
    };
    if (reduce || !segs.length) { stop(); } else {
      hmap.classList.add('hm-auto');
      schedule();
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          var v = es[0].isIntersecting;
          if (v !== inView) { inView = v; hmap.classList.toggle('hm-paused', !v); if (v) restart(); else clearTimeout(timer); }
        }, { threshold: 0 }).observe(hmap);
      }
      document.addEventListener('visibilitychange', function () {
        hmap.classList.toggle('hm-paused', document.hidden);
        if (document.hidden) clearTimeout(timer); else restart();
      });
    }

    var stage = hmap.querySelector('.hmap-stage');
    if (stage) stage.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') stop(); });
    hmap.addEventListener('focusin', stop);
    hmap.addEventListener('touchstart', stop, { passive: true });
    nodes.forEach(function (n) {
      var k = n.getAttribute('data-k');
      n.addEventListener('mouseenter', function () { stop(); pick(k); });
      n.addEventListener('focus', function () { stop(); pick(k); });
      n.addEventListener('click', function () { stop(); pick(k); });
    });
  }

  /* ---------- sticky mobile CTA ---------- */
  var sticky = document.querySelector('.sticky-cta');
  var formArea = document.getElementById('book');
  var formVisible = false;
  if (sticky) {
    if (formArea && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; update(); }).observe(formArea);
    }
    var update = function () { var cb = document.getElementById('cookie'); sticky.classList.toggle('show', window.scrollY > 480 && !formVisible && (!cb || cb.hidden)); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- measurement hooks (no third-party tag is loaded; a GA4 / Plausible tag can read window.dataLayer) ---------- */
  var dl = window.dataLayer = window.dataLayer || [];
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/book-diagnostic|payroll-statutory-risk-checklist|mailto:/.test(h)) {
      dl.push({ event: /mailto:/.test(h) ? 'email_click' : 'cta_click', cta_text: a.textContent.trim().slice(0, 60), cta_href: h, cta_location: (a.closest('header,footer,section,aside') || {}).className || '' });
    }
  });
  var marks = [25, 50, 75, 90], hit = {};
  window.addEventListener('scroll', function () {
    var pct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    marks.forEach(function (m) { if (pct >= m && !hit[m]) { hit[m] = 1; dl.push({ event: 'scroll_depth', percent: m }); } });
  }, { passive: true });

  /* ---------- cookie consent ----------
     Set ANALYTICS_SRC to a GA4 / Plausible script URL; it loads only after "Accept analytics". */
  var ANALYTICS_SRC = '';
  var CKEY = 'ad-consent';
  var banner = document.getElementById('cookie');
  function getConsent() { try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; } }
  function applyConsent(state) {
    dl.push({ event: 'consent_update', analytics_storage: state, ad_storage: 'denied' });
    if (state === 'granted' && ANALYTICS_SRC && !document.getElementById('an-tag')) {
      var t = document.createElement('script'); t.id = 'an-tag'; t.async = true; t.src = ANALYTICS_SRC; document.head.appendChild(t);
    }
  }
  dl.push({ event: 'consent_default', analytics_storage: 'denied', ad_storage: 'denied' });
  var saved = getConsent();
  if (saved && saved.v) applyConsent(saved.v);
  else if (banner) banner.hidden = false;
  if (banner) banner.addEventListener('click', function (e) {
    var b = e.target.closest('[data-consent]'); if (!b) return;
    var v = b.getAttribute('data-consent');
    try { localStorage.setItem(CKEY, JSON.stringify({ v: v, d: new Date().toISOString().slice(0, 10) })); } catch (e2) {}
    banner.hidden = true; applyConsent(v); window.dispatchEvent(new Event('scroll'));
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-cookie-settings]') || !banner) return;
    banner.hidden = false; var f = banner.querySelector('[data-consent="granted"]'); if (f) f.focus();
  });

  /* ---------- risk checklist ---------- */
  var cl = document.getElementById('checklist');
  if (cl) {
    var boxes = [].slice.call(cl.querySelectorAll('input[type=checkbox]'));
    var n = document.getElementById('cl-n'), msg = document.getElementById('cl-msg');
    var score = function () {
      var c = boxes.filter(function (b) { return b.checked; }).length, gaps = boxes.length - c;
      n.textContent = c;
      msg.textContent = c === 0 ? 'Tick the checks you can evidence today.' : gaps === 0 ? 'Every check evidenced. Re-run this each quarter.' : gaps + (gaps === 1 ? ' check' : ' checks') + ' you cannot evidence yet. ' + (gaps >= 6 ? 'That pattern usually means the workaround has become the process.' : 'Each is worth a closer look.');
    };
    cl.addEventListener('change', function () { score(); if (!cl.dataset.s) { cl.dataset.s = 1; dl.push({ event: 'checklist_start' }); } });
    score();
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById('bookform');
  if (!form) return;
  var started = false, submitted = false;
  form.addEventListener('focusin', function () { if (!started) { started = true; dl.push({ event: 'form_start', form_type: form.elements.type.value }); } });
  window.addEventListener('pagehide', function () { if (started && !submitted) dl.push({ event: 'form_abandon', form_type: form.elements.type.value }); });
  var params = new URLSearchParams(location.search);
  var TYPES = {
    'health-check': ['Request the Health Check scope', 'Health Check scope request'],
    'design-review': ['Request a Design Review', 'Design Review request'],
    'case-study': ['Request a case study or reference', 'Case study / reference request'],
    'partner': ['Request a partner conversation', 'Partner conversation request'],
    'diagnostic': ['Request my diagnostic call', '45-minute diagnostic request']
  };
  var type = TYPES[params.get('type')] ? params.get('type') : 'diagnostic';
  form.elements.type.value = type;
  document.getElementById('form-title').textContent = TYPES[type][0];

  var region = '';
  try { region = ((navigator.language || '').split('-')[1] || '').toUpperCase(); } catch (e) {}
  ['f-country', 'f-cc'].forEach(function (id) {
    var sel = document.getElementById(id);
    var opt = region && sel.querySelector('option[data-r="' + region + '"]');
    if (opt) sel.selectedIndex = opt.index;
  });

  var errsum = document.getElementById('errsum');
  var LABELS = { name: 'Full name', email: 'Work email', company: 'Company', title: 'Job title', country: 'Country / region', status: 'Oracle Fusion HCM status', challenge: 'Primary challenge', consent: 'Consent' };
  var MSGS = { name: 'Enter your full name.', email: 'Enter a work email, like name@company.com.', company: 'Enter your company name.', title: 'Enter your job title.', country: 'Choose your country or region.', status: 'Choose where you are with Oracle Fusion HCM.', challenge: 'Choose your primary challenge.', consent: 'Tick the box so we can use your details to arrange the call.' };

  function val(n) { var el = form.elements[n]; return el ? String(el.value || '').trim() : ''; }
  function fieldEl(n) { var el = form.elements[n]; return el && el.length && !el.tagName ? el[0] : el; }
  function setError(n, msg) {
    var el = fieldEl(n);
    var holder = el.closest('.f') || el.closest('.consent');
    var id = 'err-' + n;
    var old = document.getElementById(id);
    if (old) old.remove();
    var targets = form.elements[n].length && !form.elements[n].tagName ? [].slice.call(form.elements[n]) : [el];
    targets.forEach(function (t) {
      if (msg) { t.setAttribute('aria-invalid', 'true'); t.setAttribute('aria-describedby', id); }
      else { t.removeAttribute('aria-invalid'); t.removeAttribute('aria-describedby'); }
    });
    if (msg && holder) {
      var s = document.createElement('span');
      s.className = 'ferr'; s.id = id; s.textContent = msg;
      holder.appendChild(s);
    }
  }
  function check(n) {
    var bad = false;
    if (n === 'consent') bad = !form.elements.consent.checked;
    else if (n === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val('email'));
    else bad = !val(n);
    setError(n, bad ? MSGS[n] : '');
    return !bad;
  }
  Object.keys(MSGS).forEach(function (n) {
    var el = fieldEl(n);
    var evt = (el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'blur';
    var els = form.elements[n].length && !form.elements[n].tagName ? [].slice.call(form.elements[n]) : [el];
    els.forEach(function (x) { x.addEventListener(evt, function () { if (x.hasAttribute('aria-invalid') || evt === 'change') check(n); }); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var failed = Object.keys(MSGS).filter(function (n) { return !check(n); });
    if (failed.length) {
      errsum.innerHTML = '<strong>Please fix ' + failed.length + (failed.length === 1 ? ' field' : ' fields') + ':</strong><ul>' +
        failed.map(function (n) { var el = fieldEl(n); return '<li><a href="#' + el.id + '" data-f="' + el.id + '">' + LABELS[n] + '</a></li>'; }).join('') + '</ul>';
      errsum.hidden = false; errsum.focus();
      return;
    }
    errsum.hidden = true;
    var phone = val('phone') ? (val('cc') + ' ' + val('phone')).trim() : '';
    var lines = [
      'Request: ' + TYPES[type][1],
      'Full name: ' + val('name'), 'Work email: ' + val('email'), 'Company: ' + val('company'), 'Job title: ' + val('title'),
      'Country / region: ' + val('country'), 'Phone: ' + phone,
      'Oracle Fusion HCM status: ' + val('status'), 'Primary challenge: ' + val('challenge'),
      '', 'Notes: ' + val('message')
    ];
    var finish = function () {
      document.getElementById('done-name').textContent = ', ' + val('name').split(' ')[0];
      form.hidden = true;
      var done = document.getElementById('done');
      done.hidden = false; done.focus();
      submitted = true;
      dl.push({ event: 'generate_lead', lead_type: type });
    };
    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) })
        .then(function (r) { if (!r.ok) throw new Error(); finish(); })
        .catch(function () { errsum.textContent = 'Your request could not be sent. Email ' + EMAIL + ' instead, or try again.'; errsum.hidden = false; errsum.focus(); });
      return;
    }
    location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(TYPES[type][1] + ': ' + val('company')) + '&body=' + encodeURIComponent('Hello AppsDreamz,\n\n' + lines.join('\n') + '\n');
    finish();
  });
  errsum.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-f]');
    if (a) { e.preventDefault(); document.getElementById(a.getAttribute('data-f')).focus(); }
  });
})();
