/* AppsDreamz site behaviour: navigation, sticky CTA, booking form. */
(function () {
  'use strict';
  var FORM_ENDPOINT = ''; // Set to a Formspree / Web3Forms / HubSpot URL to submit directly instead of opening email.
  var EMAIL = 'aneel@appsdreamz.com';

  /* ---------- navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var panelBtns = [].slice.call(document.querySelectorAll('.has-panel > .toplink'));
  var mobile = window.matchMedia('(max-width:1080px)');

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

  /* ---------- sticky mobile CTA ---------- */
  var sticky = document.querySelector('.sticky-cta');
  var formArea = document.getElementById('book');
  var formVisible = false;
  if (sticky) {
    if (formArea && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { formVisible = es[0].isIntersecting; update(); }).observe(formArea);
    }
    var update = function () { sticky.classList.toggle('show', window.scrollY > 480 && !formVisible); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById('bookform');
  if (!form) return;
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
      if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', lead_type: type });
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
