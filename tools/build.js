// AppsDreamz static site builder. Run: node tools/build.js
// Writes every page from the shared layout below. Edit content here, then rebuild.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://appsdreamz.com/';
const EMAIL = 'aneel@appsdreamz.com';
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------- navigation ---------- */
const NAV = [
  { label: 'Services', items: [
    ['services/', 'All services', 'Five stages of one Oracle Fusion HCM practice'],
    ['services/oracle-fusion-hcm-implementation/', 'Implementation', 'Design to go-live, phased where it matters'],
    ['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation & Stabilisation', 'Programmes that stopped converging'],
    ['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll & Statutory Localisation', 'Designed from the contract'],
    ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Interfaces that fail loudly'],
    ['services/oracle-fusion-hcm-managed-support/', 'Managed Support', 'Cycle support and release regression'],
    ['services/oracle-hcm-ai-agent-studio/', 'AI & Agent Studio Advisory', 'Agents on processes that are ready'],
  ]},
  { label: 'Solutions', items: [
    ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500 fixed fee'],
    ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', '2–3 days · USD 2,500 fixed fee'],
    ['solutions/payroll-run-readiness/', 'Payroll Run Readiness', 'Go/no-go before the first live run'],
    ['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'UAE and Saudi Arabia'],
    ['solutions/india-payroll-statutory-compliance/', 'India Payroll & Statutory Compliance', 'Control-first statutory payroll'],
    ['solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs', 'What Oracle does not validate'],
  ]},
  { label: 'Industries', items: [
    ['industries/', 'All markets', 'Where we deliver'],
    ['industries/gcc-middle-east/', 'GCC / Middle East', 'UAE and Saudi Arabia delivery'],
    ['industries/india/', 'India', 'Indian statutory payroll'],
    ['industries/global-enterprises/', 'Global Enterprises', 'Multi-country Fusion HCM estates'],
  ]},
  { label: 'Clients & Results', items: [
    ['clients-results/', 'Overview', 'Evidence, not promises'],
    ['clients-results/case-studies/', 'Case studies', 'Two engagements, anonymised'],
    ['clients-results/partner-delivery/', 'Partner & white-label delivery', 'The team other firms subcontract to'],
  ]},
  { label: 'About', items: [
    ['about/', 'Company', 'Senior-only, deliberately small'],
    ['about/leadership/', 'Leadership & experts', 'Who you will be speaking to'],
    ['about/delivery-method/', 'Delivery method', 'How an engagement runs'],
    ['about/security-data-handling/', 'Security & data handling', 'How we treat your tenant and data'],
  ]},
  { label: 'Insights', items: [
    ['insights/', 'All insights', 'Guides for Fusion HCM buyers'],
    ['resources/payroll-statutory-risk-checklist/', 'Payroll & Statutory Risk Checklist', 'Free self-assessment'],
  ]},
  { label: 'Contact', href: 'contact/' },
];

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');
const ARROW = '<svg class="ar" aria-hidden="true" width="18" height="12" viewBox="0 0 18 12"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const LI_ICON = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>';

function btn(href, text, cls = 'btn') { return `<a class="${cls}" href="${href}">${text}${ARROW}</a>`; }
function eyebrow(t) { return `<p class="eyebrow"><span class="sl" aria-hidden="true"></span>${t}</p>`; }
function sectionHead(label, h2, intro) {
  return `<div class="shead">${label ? eyebrow(label) : ''}<h2>${h2}</h2>${intro ? `<p class="intro">${intro}</p>` : ''}</div>`;
}
function faq(items) {
  return `<div class="faq">${items.map(([q, a]) => `<details><summary><span>${q}</span><i aria-hidden="true"></i></summary><div class="ans"><p>${a}</p></div></details>`).join('')}</div>`;
}
function faqSchema(items) {
  return { '@type': 'FAQPage', mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q.replace(/<[^>]+>/g, ''), acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) };
}
function list(items, cls = 'ticks') { return `<ul class="${cls}">${items.map(i => `<li>${i}</li>`).join('')}</ul>`; }

/* ---------- shared blocks ---------- */
const PARTNERS = [
  ['appstec.png', 'AppsTec Consulting'], ['appslink.png', 'Appslink Consulting'], ['qualidad.png', 'The Qualidad'], ['qspear.png', 'QSpear'],
  ['satcon.png', 'SatCon'], ['appzlogic.png', 'Appzlogic'], ['augsta.png', 'Augsta'],
];
const partnerStrip = p => `<ul class="logos" aria-label="Partners and white-label clients">${PARTNERS.map(([f, n]) => `<li><img src="${p}images/logos/${f}" alt="${n}" height="40" loading="lazy"></li>`).join('')}<li class="txtlogo">Manureva Digital</li></ul>`;

const STATS = `<dl class="stats">
  <div><dt>8</dt><dd>partner and client organisations have paid for delivery</dd></div>
  <div><dt>8 of 12</dt><dd>Fusion HCM modules we take live ourselves</dd></div>
  <div><dt>3</dt><dd>countries of statutory delivery: UAE, Saudi Arabia, India</dd></div>
  <div><dt>2</dt><dd>engagements documented, both anonymised</dd></div>
</dl>`;

const MODULES = `<div class="tablewrap"><table class="grade">
<thead><tr><th scope="col">Area</th><th scope="col">Grade</th><th scope="col">What the grade means</th></tr></thead>
<tbody>
<tr><td>Core HR · Payroll · Absence · Time and Labor · Recruiting · Talent · Learning · Integrations</td><td><span class="chip d">Delivered</span></td><td>We own design, build and go-live</td></tr>
<tr><td>Compensation · Benefits · HR Helpdesk</td><td><span class="chip s">Supported</span></td><td>Configured and tested inside a programme we do not lead</td></tr>
<tr><td>Workforce Health and Safety</td><td><span class="chip a">Advisory</span></td><td>Scoping and review only</td></tr>
<tr><td>Statutory localisation: UAE, Saudi Arabia, India</td><td><span class="chip d">Delivered</span></td><td>Statutory design delivered to date</td></tr>
<tr><td>Oracle AI and Agent Studio</td><td><span class="chip a">Advisory</span></td><td>Use-case scoping, design and review</td></tr>
</tbody></table></div>`;

const COMPARE = `<div class="tablewrap"><table class="compare">
<caption class="vh">Why organisations choose AppsDreamz</caption>
<thead><tr><th scope="col"></th><th scope="col">Global systems integrators</th><th scope="col">Generic HR consultancies</th><th scope="col" class="us">AppsDreamz</th></tr></thead>
<tbody>
<tr><th scope="row">Focus</th><td>Broad enterprise transformation across ERP, HCM and cloud</td><td>HR operating model, policy and change</td><td class="us">Oracle Fusion HCM, with EBS coexistence</td></tr>
<tr><th scope="row">Who does the work</th><td>Leveraged teams; senior people at pursuit and steering</td><td>Advisors; configuration often outsourced</td><td class="us">The senior consultant who scoped it</td></tr>
<tr><th scope="row">Payroll and statutory depth</th><td>Varies by team and country</td><td>Limited system depth</td><td class="us">Element sets designed from employment contracts</td></tr>
<tr><th scope="row">Cross-module handoffs</th><td>Usually tested module by module</td><td>Out of scope</td><td class="us">Designed and checked explicitly</td></tr>
<tr><th scope="row">Rescue of another firm’s build</th><td>Often re-scoped as a new programme</td><td>Rarely offered</td><td class="us">Core offer: Health Check, then Stabilise</td></tr>
<tr><th scope="row">How you start</th><td>Discovery phase, scoped by proposal</td><td>Workshops</td><td class="us">Fixed fee: USD 2,500 or USD 7,500, credited forward</td></tr>
<tr><th scope="row">Transparency</th><td>Capability statements across the suite</td><td>—</td><td class="us">Published grading: Delivered, Supported, Advisory</td></tr>
</tbody></table></div>`;

const HANDOFFS = [
  ['Recruiting', 'Core HR', 'Offer terms into the employee record', 'An offer approved over email because the in-system chain stalled lands in Core HR with terms nobody re-keyed.'],
  ['Onboarding', 'Payroll', 'Mobilisation dates into payroll', 'Visa and mobilisation dates tracked outside onboarding arrive at payroll as a retro.'],
  ['Compensation', 'Payroll', 'Allowances into the gratuity base', 'A restructure moves the base and nothing recalculates the end-of-service provision.'],
  ['Absence', 'Payroll', 'Accrual into pay and provision', 'Leave accrues on the calendar rather than the contract, and the liability drifts.'],
  ['Payroll', 'Statutory files', 'Pay into the statutory return', 'Files pass validation, misclassify a component, and the reconciliation finds it weeks later.'],
  ['Payroll', 'Balance sheet', 'Provision to the general ledger', 'The end-of-service provision is understated every month until a settlement exposes it.'],
];
const handoffDiagram = `<figure class="hand-fig">
  <figcaption class="figcap">FIG. 02 — Where Oracle Fusion HCM programmes break down</figcaption>
  <ol class="chain" aria-label="Module chain from hire to balance sheet">
    ${['Recruiting', 'Onboarding', 'Core HR', 'Compensation', 'Absence and Time', 'Payroll', 'Statutory files', 'Balance sheet'].map((m, i) => `<li><span class="node">${m}</span></li>`).join('')}
  </ol>
  <ol class="hlist">
    ${HANDOFFS.map(([a, b, t, d], i) => `<li><span class="hn" aria-hidden="true">${i + 1}</span><div><p class="ht">${a} → ${b}: ${t}</p><p class="hd">${d}</p></div></li>`).join('')}
  </ol>
</figure>`;

const STAGES = [
  ['Implement', 'Full-suite programmes from design through go-live, phased where a single date carries too much risk.', 'A go-live that turns every open defect into a payroll correction', 'A controlled go-live with known, owned residual risk', 'services/oracle-fusion-hcm-implementation/'],
  ['Localise', 'Statutory design for each country: gratuity and end-of-service bases from contract terms, statutory file structures, leave accrual on contract rather than calendar.', 'Provisions understated without any error raised', 'Statutory outputs that reconcile', 'services/oracle-fusion-payroll-statutory-localisation/'],
  ['Integrate', 'Bank, statutory, finance, assessment and job-board interfaces that assert volume and totals before a file leaves the tenant.', 'A partial post discovered weeks later through the data it corrupted', 'Failures surfaced the moment they happen', 'services/oracle-fusion-hcm-integrations/'],
  ['Stabilise', 'Root cause and remediation for cycles that complete only through manual correction.', 'The workaround becoming the process', 'Cycles that close without a correction queue', 'services/oracle-fusion-hcm-remediation-stabilisation/'],
  ['Run', 'Managed support, cycle support and quarterly release regression from a pack written from your own configuration.', 'A quarterly update breaking a fast formula', 'Recurring issues retired, not re-logged', 'services/oracle-fusion-hcm-managed-support/'],
];
const stagesBlock = p => `<ol class="stages">${STAGES.map(([n, what, fail, out, href], i) => `<li>
  <p class="snum">0${i + 1}</p><h3>${n}</h3><p>${what}</p>
  <dl><dt>Failure prevented</dt><dd>${fail}</dd><dt>Outcome</dt><dd>${out}</dd></dl>
  <a class="tlink" href="${p}${href}">${n} service${ARROW}</a></li>`).join('')}</ol>`;

const offers = p => `<div class="offers">
  <article class="offer">
    <p class="otype">For an implementation already live</p>
    <h3>Oracle Fusion HCM Health Check</h3>
    <p class="price">USD 7,500 <span>3 weeks · fixed fee</span></p>
    <p>Diagnose configuration, data, process, integration and statutory risk against a read-only copy of production and three closed cycles.</p>
    <p class="best"><b>Best for</b> live customers, in-flight programmes, organisations preparing for go-live.</p>
    <p class="credit">Credited in full against any work commissioned from the findings.</p>
    <div class="row">${btn(p + 'book-diagnostic/?type=health-check', 'Request the Health Check scope')}<a class="tlink" href="${p}solutions/oracle-fusion-hcm-health-check/">What it covers${ARROW}</a></div>
  </article>
  <article class="offer">
    <p class="otype">For a programme in flight or being planned</p>
    <h3>Oracle Fusion HCM Design Review</h3>
    <p class="price">USD 2,500 <span>2–3 days · fixed fee</span></p>
    <p>Review design decisions, configuration approach, integrations and risk areas before build or go-live, the cheapest point at which any of it can change.</p>
    <p class="best"><b>Best for</b> programme owners, implementation teams and Oracle customers who want an independent specialist review.</p>
    <p class="credit">Scope confirmed on the call before anything is signed.</p>
    <div class="row">${btn(p + 'book-diagnostic/?type=design-review', 'Request a Design Review')}<a class="tlink" href="${p}solutions/oracle-fusion-hcm-design-review/">What it covers${ARROW}</a></div>
  </article>
</div>`;

const FOUNDERS = [
  ['aneel', 'Aneel Kumar Bonu', 'Founder &amp; CEO', 'Driving product vision, customer outcomes, and the future of fair performance systems.', 'https://www.linkedin.com/in/aneel-kumar-bonu/'],
  ['prashanth', 'Prashanth', 'Co-founder', 'Building secure, scalable AI systems that transform people decisions into measurable business outcomes.', 'https://www.linkedin.com/in/prashanth-s-reddy/'],
];
const founders = p => `<div class="founders">${FOUNDERS.map(([img, n, r, b, li]) => `<article class="fcard"><img src="${p}images/team/${img}.jpg" alt="Portrait of ${n}" width="112" height="112" loading="lazy"><h3>${n}</h3><p class="frole">${r}</p><p class="fbio">${b}</p><a class="fli" href="${li}" target="_blank" rel="noopener" aria-label="${n} on LinkedIn (opens in a new tab)">${LI_ICON}LinkedIn</a></article>`).join('')}</div>`;

const ctaBand = (p, h, body, primary = ['book-diagnostic/', 'Book a 45-minute diagnostic'], secondary) => `<section class="band cta" aria-label="Next step"><div class="in">
  <div><h2>${h}</h2><p>${body}</p></div>
  <div class="row">${btn(p + primary[0], primary[1], 'btn on-dark')}${secondary ? `<a class="btn ghost" href="${p}${secondary[0]}">${secondary[1]}</a>` : ''}</div>
  <span class="slash" aria-hidden="true"></span></div></section>`;

const related = (p, items) => `<section class="sect related"><div class="in">${sectionHead('Related', 'Where to go next')}<ul class="rel">${items.map(([h, t, d]) => `<li><a href="${p}${h}"><span class="rt">${t}</span><span class="rd">${d}</span>${ARROW}</a></li>`).join('')}</ul></div></section>`;

/* ---------- layout ---------- */
function header(p, current) {
  const isCur = href => current === href;
  const groups = NAV.map((g, gi) => {
    if (g.href) return `<li class="top"><a class="toplink" href="${p}${g.href}"${isCur(g.href) ? ' aria-current="page"' : ''}>${g.label}</a></li>`;
    const active = g.items.some(([h]) => isCur(h));
    return `<li class="top has-panel${active ? ' active' : ''}"><button class="toplink" type="button" aria-expanded="false" aria-controls="p${gi}">${g.label}<i aria-hidden="true"></i></button>
      <div class="panel" id="p${gi}"><ul>${g.items.map(([h, t, d]) => `<li><a href="${p}${h}"${isCur(h) ? ' aria-current="page"' : ''}><span class="pt">${t}</span><span class="pd">${d}</span></a></li>`).join('')}</ul></div></li>`;
  }).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-head"><div class="in">
  <a class="brand" href="${p || './'}" aria-label="AppsDreamz home"><img src="${p}images/appsdreamz-logo.png" alt="AppsDreamz" width="1200" height="456"></a>
  <button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false" aria-controls="site-nav"><i></i></button>
  <nav id="site-nav" aria-label="Main"><ul class="menu">${groups}</ul>
    <a class="btn head-cta" href="${p}book-diagnostic/">Book a diagnostic${ARROW}</a></nav>
</div></header>`;
}

function footer(p) {
  return `<footer class="site-foot"><span class="foot-slash" aria-hidden="true"></span><div class="in">
  <div class="fcol about"><img src="${p}images/appsdreamz-logo.png" alt="AppsDreamz" width="1200" height="456" class="flogo"><p>Oracle Fusion HCM implementation, remediation, statutory payroll and managed support. Senior consultants only.</p></div>
  <div class="fcol"><p class="fh">Services</p><ul>${NAV[0].items.slice(1).map(([h, t]) => `<li><a href="${p}${h}">${t}</a></li>`).join('')}</ul></div>
  <div class="fcol"><p class="fh">Solutions</p><ul>${NAV[1].items.map(([h, t]) => `<li><a href="${p}${h}">${t}</a></li>`).join('')}</ul><p class="fh">Industries</p><ul>${NAV[2].items.slice(1).map(([h, t]) => `<li><a href="${p}${h}">${t}</a></li>`).join('')}</ul></div>
  <div class="fcol"><p class="fh">Company</p><ul><li><a href="${p}clients-results/">Clients &amp; Results</a></li><li><a href="${p}about/">About</a></li><li><a href="${p}about/leadership/">Leadership</a></li><li><a href="${p}about/delivery-method/">Delivery method</a></li><li><a href="${p}about/security-data-handling/">Security &amp; data handling</a></li></ul><p class="fh">Insights</p><ul><li><a href="${p}insights/">All insights</a></li><li><a href="${p}resources/payroll-statutory-risk-checklist/">Risk checklist</a></li></ul></div>
  <div class="fcol contactc"><p class="fh">Contact</p><p><a href="mailto:${EMAIL}">${EMAIL}</a><br>Mon to Fri, 09:00 to 18:00 GST (UTC+4)<br>Replies within one working day</p>${btn(p + 'book-diagnostic/', 'Book a diagnostic', 'btn small')}</div>
</div>
<div class="in legal"><p>Registered office: Fourth Floor, No. 752/5/12 A, Flat No. 10, Sneha Residency South Block, NGR Layout, Babu Reddy Road, Rupena Agrahara, Bengaluru, Bengaluru Urban, Karnataka 560068, India. CIN U72900KA2022PTC158740.</p><p>AppsDreamz is an independent consultancy. © ${new Date().getFullYear()} AppsDreamz. <span class="legal-links"><a href="${p}legal/privacy/">Privacy notice</a> · <a href="${p}legal/cookies/">Cookie notice</a> · <a href="${p}about/security-data-handling/">Security &amp; data handling</a> · <button type="button" class="linkbtn" data-cookie-settings>Cookie settings</button></span></p></div>
</footer>
<div class="sticky-cta" aria-hidden="true"><a href="${p}book-diagnostic/" tabindex="-1">Book a 45-minute diagnostic</a></div>`;
}

const ORG = {
  '@type': 'ProfessionalService', '@id': SITE + '#org', name: 'AppsDreamz', url: SITE, email: EMAIL,
  logo: SITE + 'images/appsdreamz-logo.png', image: SITE + 'images/og-home.png',
  description: 'Oracle Fusion HCM implementation, remediation, statutory payroll localisation, integrations and managed support.',
  address: { '@type': 'PostalAddress', streetAddress: 'Fourth Floor, No. 752/5/12 A, Sneha Residency South Block, NGR Layout, Babu Reddy Road, Rupena Agrahara', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560068', addressCountry: 'IN' },
  areaServed: 'Worldwide',
  knowsAbout: ['Oracle Fusion HCM', 'Oracle Fusion Payroll', 'Statutory payroll localisation', 'WPS', 'GOSI', 'Gratuity and end-of-service provisions', 'Oracle HCM integrations', 'Oracle AI Agent Studio', 'Oracle E-Business Suite coexistence'],
  founder: FOUNDERS.map(([, n, , , li]) => ({ '@type': 'Person', name: n, sameAs: li })),
};

const ASSET_V = Object.fromEntries(['css', 'js'].map(e => [e, require('crypto').createHash('md5').update(fs.readFileSync(path.join(ROOT, 'assets/site.' + e))).digest('hex').slice(0, 8)]));

function page({ file, title, desc, h1, crumbs, body, current, schema = [], noindex }) {
  const depth = file.split('/').length - 1;
  const p = '../'.repeat(depth);
  const url = SITE + file.replace(/index\.html$/, '');
  const bc = crumbs ? { '@type': 'BreadcrumbList', itemListElement: [['', 'Home'], ...crumbs].map(([h, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n.replace(/&amp;/g, '&'), item: SITE + h })) } : null;
  const graph = [ORG, { '@type': 'WebSite', '@id': SITE + '#site', url: SITE, name: 'AppsDreamz', publisher: { '@id': SITE + '#org' } }, ...(bc ? [bc] : []), ...schema];
  const crumbHtml = crumbs ? `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${p || './'}">Home</a></li>${crumbs.map(([h, n], i) => i === crumbs.length - 1 ? `<li aria-current="page">${n}</li>` : `<li><a href="${p}${h}">${n}</a></li>`).join('')}</ol></nav>` : '';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#071C35">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AppsDreamz">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}images/og-home.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${SITE}images/og-home.png">
<link rel="icon" type="image/png" href="${p}images/appsdreamz-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&family=Inter:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${p}assets/site.css?v=${ASSET_V.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head>
<body>
${header(p, current)}
<main id="main">
${crumbHtml}
${body(p)}
</main>
${footer(p)}
<div class="cookie" id="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-t" aria-describedby="cookie-d" hidden>
  <div class="cookie-in">
    <div class="cookie-txt"><p class="cookie-t" id="cookie-t"><span class="sl" aria-hidden="true"></span>Your privacy, your choice</p>
      <p id="cookie-d">We use only what the site needs to work. With your consent we would also use privacy-friendly analytics to see which pages help visitors. No advertising cookies, ever. <a href="${p}legal/cookies/">Cookie notice</a></p></div>
    <div class="cookie-btns"><button type="button" class="btn ghost-dark small" data-consent="denied">Essential only</button><button type="button" class="btn small" data-consent="granted">Accept analytics</button></div>
  </div>
</div>
<script src="${p}assets/site.js?v=${ASSET_V.js}" defer></script>
</body>
</html>
`;
  const out = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return file;
}

/* ---------- service page template ---------- */
function servicePage(o) {
  return page({
    file: o.slug + 'index.html', title: o.title, desc: o.desc, current: o.slug,
    crumbs: o.parent[0] === o.slug ? [[o.slug, o.name]] : [[o.parent[0], o.parent[1]], [o.slug, o.name]],
    schema: [{ '@type': 'Service', name: o.name.replace(/&amp;/g, '&'), serviceType: o.serviceType || o.name.replace(/&amp;/g, '&'), provider: { '@id': SITE + '#org' }, areaServed: o.area || 'Worldwide', url: SITE + o.slug, ...(o.offer ? { offers: { '@type': 'Offer', price: o.offer, priceCurrency: 'USD' } } : {}) }, faqSchema(o.faq)],
    body: p => `
<section class="hero sub"><div class="in">
  ${eyebrow(o.eyebrow)}
  <h1>${o.h1}</h1>
  <p class="lead">${o.lead}</p>
  <div class="row">${btn(p + (o.cta1 || ['book-diagnostic/'])[0], (o.cta1 || [, 'Book a 45-minute diagnostic'])[1])}${o.cta2 ? `<a class="btn ghost-dark" href="${p}${o.cta2[0]}">${o.cta2[1]}</a>` : ''}</div>
  ${o.facts ? `<dl class="facts">${o.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
</div></section>
<section class="sect"><div class="in split">
  <div>${sectionHead('The problem', o.problemH)}</div>
  <div class="prose">${o.problem.map(t => `<p>${t}</p>`).join('')}<h3 class="minor">Who it is for</h3><p>${o.who}</p></div>
</div></section>
${o.extra ? o.extra(p) : ''}
<section class="sect tint"><div class="in">
  ${sectionHead('What we do', o.whatH || 'Scope of the work')}
  ${list(o.what, 'ticks cols')}
</div></section>
<section class="sect"><div class="in split3">
  <div><h3 class="minor">Deliverables</h3>${list(o.deliverables, 'dash')}</div>
  <div><h3 class="minor">Approach</h3><p>${o.approach}</p></div>
  <div><h3 class="minor">Outcomes</h3>${list(o.outcomes, 'dash')}</div>
</div></section>
${o.proof ? `<section class="sect"><div class="in proofline"><p class="eyebrow"><span class="sl" aria-hidden="true"></span>Proof</p><p>${o.proof}</p><a class="tlink" href="${p}clients-results/case-studies/">Read the case studies${ARROW}</a></div></section>` : ''}
<section class="sect"><div class="in split">
  <div>${sectionHead('Questions', 'Frequently asked')}</div>
  <div>${faq(o.faq)}</div>
</div></section>
${ctaBand(p, o.ctaH || 'Get a specialist view of your Oracle Fusion HCM risk.', o.ctaBody || 'Forty-five minutes with the consultant who would do the work. You leave with our read on whether the problem is configuration, data, process or scope.', o.cta1 || undefined, o.cta2)}
${related(p, o.related)}`
  });
}

/* ================= PAGES ================= */
const pages = [];

/* ---------- HOME ---------- */
const HMAP = [
  { k: 'corehr', label: 'Core HR', x: 320.0, y: 108.0, chip: 'GO', topics: ['Workforce structures', 'Employment records', 'Onboarding journeys', 'Documents', 'Security roles', 'Directory'], checks: ['Structures validated', 'Person data reconciled', 'Security roles mapped', 'Approval workflows tested'] },
  { k: 'recruiting', label: 'Recruiting', x: 448.7, y: 161.3, chip: 'GO', topics: ['Job requisitions', 'Candidate experience', 'Interviews', 'Job offers', 'Background checks', 'Onboarding'], checks: ['Requisition templates aligned', 'Offer approvals routed', 'Offer terms match the hire', 'Onboarding journeys tested'] },
  { k: 'talent', label: 'Talent', x: 502.0, y: 290.0, chip: 'GO', topics: ['Performance management', 'Goal setting', 'Succession planning', 'Career management', 'Talent review', 'Profiles and skills'], checks: ['Review templates configured', 'Performance cycles tested', 'Talent profiles migrated', 'Succession data validated'] },
  { k: 'learning', label: 'Learning', x: 448.7, y: 418.7, chip: 'GO', topics: ['Learning catalogue', 'Courses and offerings', 'Compliance learning', 'Learning journeys', 'Self-service learning', 'Learning reports'], checks: ['Catalogue migrated', 'Assignment rules tested', 'Completion records reconciled', 'Compliance alerts working'] },
  { k: 'payroll', label: 'Payroll', x: 320.0, y: 472.0, chip: 'GO', topics: ['Elements and earnings', 'Gross-to-net', 'Statutory deductions', 'Costing to GL', 'Payslips and bank files', 'Multi-country statutory'], checks: ['Gross-to-net reconciled', 'Statutory bases validated', 'Costing to GL balanced', 'Bank and WPS files checked'] },
  { k: 'time', label: 'Time and Labor', x: 191.3, y: 418.7, chip: 'GO', topics: ['Time entry layouts', 'Time rules', 'Overtime and shifts', 'Work schedules', 'Approvals and cut-offs', 'Time to payroll transfer'], checks: ['Time rules validated', 'Overtime mapped to pay', 'Approvals and cut-offs tested', 'Time reconciled to pay'] },
  { k: 'absence', label: 'Absence', x: 138.0, y: 290.0, chip: 'GO', topics: ['Absence plans', 'Accruals', 'Leave balances', 'Carry-over', 'Leave requests', 'Absence to payroll'], checks: ['Accrual plans match entitlement', 'Carry-over tested', 'Absence mapped to payroll', 'Balances reconciled'] },
  { k: 'ai', label: 'Fusion AI Agents', x: 191.3, y: 161.3, chip: 'ADVISORY', topics: ['Oracle AI Agent Studio', 'HR helpdesk agents', 'Employee agents', 'Manager agents', 'Generative AI in HCM', 'Security and governance'], checks: ['Use cases scoped', 'Data access reviewed', 'Agent workflows designed', 'Human approval points defined'], ai: 1 }
];

const HM0 = HMAP[0];
pages.push(page({
  file: 'index.html',
  title: 'Oracle Fusion HCM Implementation, Payroll &amp; Remediation | AppsDreamz',
  desc: 'Specialist Oracle Fusion HCM partner: implementation, remediation, statutory payroll localisation, integrations and managed support. Fixed-fee Health Check.',
  current: '',
  body: p => `
<section class="hero home dark"><span class="hero-grid" aria-hidden="true"></span><span class="hero-glow" aria-hidden="true"></span><span class="hero-slash" aria-hidden="true"></span><div class="in">
  <div class="hero-copy">
    ${eyebrow('Oracle Fusion HCM specialists · GCC, India and global')}
    <h1>Oracle Fusion HCM, from design to the payroll run <span class="hl">that has to be right.</span></h1>
    <p class="lead">AppsDreamz helps Oracle Fusion HCM customers implement, remediate, localise, integrate, and operate HR and payroll processes with confidence.</p>
    <p class="sub-lead">We find and fix the configuration, data, process, integration, and statutory-localisation failures that standard validation misses, before they reach payroll, compliance, or the balance sheet.</p>
    <div class="row">${btn(p + 'book-diagnostic/', 'Book a 45-minute diagnostic', 'btn on-dark')}<a class="btn ghost" href="#problems">See how we fix Fusion HCM issues</a></div>
  </div>
  <figure class="hmap" aria-labelledby="hmap-cap">
    <figcaption id="hmap-cap" class="vh">Interactive illustration: the Oracle Fusion HCM modules AppsDreamz covers (Core HR, Recruiting, Talent, Learning, Payroll, Time and Labor, Absence) and Fusion AI Agents, connected to one core. Select a module to see what should be ready and the readiness checks we run for it.</figcaption>
    <div class="hmap-stage">
    <p class="hm-tag">Fusion HCM · end to end <span>Select a module</span></p>
    <div class="hm-canvas">
    <svg viewBox="72 64 496 452" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="hg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#29ABE2" stop-opacity=".28"/><stop offset="1" stop-color="#29ABE2" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="320" cy="290" r="230" fill="url(#hg)"/>
      <circle cx="320" cy="290" r="175" class="hm-ring"/>
      <circle cx="320" cy="290" r="222" class="hm-ring2"/>
      <g class="hm-agents">${[0,120,240].map(d=>`<circle cx="${(320+222*Math.cos(d*Math.PI/180)).toFixed(1)}" cy="${(290+222*Math.sin(d*Math.PI/180)).toFixed(1)}" r="4"/>`).join('')}</g>
      ${HMAP.map((m,i)=>`<line x1="320" y1="290" x2="${m.x}" y2="${m.y}" class="hm-link${i===0?' hot':''}${m.ai?' ai':''}" data-k="${m.k}" style="--d:${i*.3}s"/>`).join('')}
      <rect x="250" y="240" width="140" height="100" class="hm-core"/>
      <path d="M250 240h22l-12 100h-10z" class="hm-core-sl"/>
      <text x="331" y="276" class="hm-k">ORACLE FUSION</text>
      <text x="331" y="312" class="hm-big">HCM</text>
      <text x="331" y="330" class="hm-s">end to end</text>
    </svg>
    ${HMAP.map((m,i)=>`<button type="button" class="hm-node${i===0?' hot':''}${m.ai?' ai':''}" data-k="${m.k}" aria-pressed="${i===0}" style="--d:${i*.1}s;left:${((m.x-72)/496*100).toFixed(2)}%;top:${((m.y-64)/452*100).toFixed(2)}%">${m.ai?'<span class="spark" aria-hidden="true"></span>':''}${m.label}</button>`).join('')}
    </div>
    </div>
    <div class="hm-prog" aria-hidden="true">${HMAP.map((m,i)=>`<i data-k="${m.k}"${i===0?' class="on"':''}></i>`).join('')}</div>
    <div class="hcards" aria-live="off">
      <div class="hcard topics"><p class="hc-h"><span class="hc-t">${HM0.label}</span><span class="hc-sub">What should be ready</span></p>
        <ul class="hc-chips">${HM0.topics.map((t,i)=>`<li style="--i:${i}">${t}</li>`).join('')}</ul></div>
      <div class="hcard ready"><p class="hc-h"><span>Readiness checks</span><span class="go">${HM0.chip}</span></p>
        <ul class="hc-checks">${HM0.checks.map((t,i)=>`<li style="--i:${i}">${t}</li>`).join('')}</ul></div>
    </div>
    <script type="application/json" id="hm-data">${JSON.stringify(Object.fromEntries(HMAP.map(m=>[m.k,{n:m.label,c:m.chip,t:m.topics,l:m.checks}])))}</script>
    <ol class="hlife" aria-label="Where we work in the lifecycle">${['Design','Build','Test','Go-live','Run','Support'].map((t,i)=>`<li style="--i:${i}">${t}</li>`).join('')}</ol>
    <p class="hmap-note">Illustrative: the modules and checks we deliver, not client data.</p>
  </figure>
</div>
<div class="in"><ul class="proofbar">
  <li><strong>8</strong>partner and white-label delivery relationships</li>
  <li><strong>7 modules</strong>delivered end to end, plus integrations and localisation</li>
  <li><strong>7 countries</strong>statutory payroll delivery, with partners</li>
  <li><strong>Fixed fee</strong>diagnostic and design-review options</li>
</ul></div></section>

<section class="sect" id="problems"><div class="in">
  ${sectionHead('The problem', 'When Fusion HCM looks configured—but payroll, hiring, or compliance still fails.', 'Every cycle completes, so nobody calls it broken. The cost shows up as correction work, explained variances and a provision that does not hold.')}
  <div class="cards4">
  ${[
    ['Payroll exceptions and reconciliation gaps', 'Exceptions every cycle and retro producing wrong results, worked through manually before pay date.', 'Overtime for the payroll team, corrected payslips, variances finance cannot explain.', 'We trace each recurring exception to the element, formula or upstream record that causes it.', 'services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation'],
    ['Statutory and localisation risk', 'A gratuity base that leaves out contract-eligible allowances raises no error. The payslip looks right.', 'The end-of-service provision is understated every month until a settlement exposes it.', 'We design the element set from the employment contracts and reconcile it to the balance sheet.', 'solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation'],
    ['Broken cross-module handoffs', 'Oracle validates each module. Nothing validates what Recruiting hands to Core HR, or Compensation to Payroll.', 'Offers approved over email; mobilisation dates arriving at payroll as retro.', 'We map every handoff and design a check for each one.', 'solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs'],
    ['Delayed or unstable implementation cycles', 'The programme has stopped converging; every test cycle surfaces new defects.', 'Moving go-live dates, rising change requests, a business that stops trusting the system.', 'We re-sequence go-live by risk and take it live in phases where one date carries too much.', 'services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation'],
  ].map(([h, prob, imp, act, href, link]) => `<article class="pcard"><h3>${h}</h3><dl><dt>Problem</dt><dd>${prob}</dd><dt>Business impact</dt><dd>${imp}</dd><dt>What we do</dt><dd>${act}</dd></dl><a class="tlink" href="${p}${href}">${link}${ARROW}</a></article>`).join('')}
  </div>
</div></section>

<section class="sect dark"><div class="in">
  ${sectionHead('Operating model', 'A specialist operating model for Oracle Fusion HCM.', 'Five stages of the same practice. Join at any one, including after another firm has finished. Most firms sell one stage; the difficult work is in what one stage hands to the next.')}
  ${stagesBlock(p)}
</div></section>

<section class="sect"><div class="in">
  ${sectionHead('Why AppsDreamz', 'Built for the failures that occur between modules, countries, and payroll cycles.', 'Hiring, talent, pay and statutory reporting are the same record at different moments. Oracle validates each module on its own terms. We design the checks for what passes between them: handoffs, payroll integrity, statutory compliance, integration reliability, data quality, reconciliation, exception management and post-go-live stabilisation.')}
  ${handoffDiagram}
  <h3 class="tabletitle">Why organisations choose AppsDreamz</h3>
  ${COMPARE}
</div></section>

<section class="sect tint"><div class="in">
  ${sectionHead('Proof', 'Evidence, not promises.', 'Engagement detail stays confidential, which is why both case studies are anonymised and there are no client-attributed percentages on this site.')}
  <div class="cases">
    <a class="case" href="${p}clients-results/case-studies/#phased-go-live"><p class="cmeta">GCC property and facilities group · 5,000–10,000 employees</p><h3>Taking a stalled full-suite Fusion HCM programme live in phases</h3><p>A full-suite programme had stopped converging. We took it live in phases.</p><span class="tlink">Read the case${ARROW}</span></a>
    <a class="case" href="${p}clients-results/case-studies/#payroll-stabilisation"><p class="cmeta">Middle East media and communications group · 2,000–5,000 employees</p><h3>Stabilising payroll that needed correction every cycle</h3><p>Exceptions every cycle, retro producing wrong results, and a gratuity base that did not match the employment contracts.</p><span class="tlink">Read the case${ARROW}</span></a>
  </div>
  <div class="partners"><p class="plabel">Consultancies and systems integrators who have paid us to deliver Oracle Fusion HCM work, most under their own badge</p>${partnerStrip(p)}</div>
  ${STATS}
</div></section>

<section class="sect" id="offers"><div class="in">
  ${sectionHead('Where to start', 'Start with a focused, fixed-fee assessment.', 'Both are fixed fee and both are confirmed on the call before anything is signed.')}
  ${offers(p)}
  <p class="third">Not ready to engage? <a href="${p}resources/payroll-statutory-risk-checklist/">Use the Oracle Fusion HCM Payroll &amp; Statutory Risk Checklist${ARROW}</a></p>
</div></section>

<section class="sect tint"><div class="in split">
  <div>${sectionHead('Expertise', 'Deep Oracle Fusion HCM expertise, where failure is expensive.', 'Twelve modules, graded by what we actually do. Eight we have taken live. The grade is published so you never have to guess.')}</div>
  <div>${MODULES}</div>
</div></section>

<section class="sect dark ai"><div class="in split">
  <div>${sectionHead('Oracle AI and agents', 'AI that improves Oracle HCM operations—without adding governance risk.')}</div>
  <div class="prose">
    <p>We help organisations apply Oracle AI Agent Studio and the published HCM agents to HR service delivery, policy and knowledge access, case triage, manager support, payroll exception analysis and operational insight, on processes that are ready for them.</p>
    <p>An agent on an unstable process automates the workaround, so readiness comes first.</p>
    <blockquote>AI should improve decision quality and operational efficiency without compromising payroll controls, data privacy, auditability, or accountability.</blockquote>
    <a class="tlink light" href="${p}services/oracle-hcm-ai-agent-studio/">AI &amp; Agent Studio Advisory${ARROW}</a>
  </div>
</div></section>

<section class="sect"><div class="in split">
  <div>${sectionHead('Who you will be speaking to', 'The consultant who scopes the work does the work.')}
    <p class="body">AppsDreamz is deliberately small. The problems clients bring us, a payroll closing on a correction queue or a programme that has stopped converging, are not solved by adding people. They are solved by someone who has closed GCC payrolls reading the configuration against the employment contracts.</p>
    <p class="body">So we turn down work we cannot staff with that person, and we say on the first call if the problem is not ours to fix.</p></div>
  <div>${founders(p)}</div>
</div></section>

${ctaBand(p, 'Get a specialist view of your Oracle Fusion HCM risk.', 'Book a 45-minute diagnostic call with an AppsDreamz Oracle Fusion HCM specialist. We will help you identify the highest-risk configuration, data, integration, payroll, or statutory-localisation issues.', undefined, ['resources/payroll-statutory-risk-checklist/', 'Use the risk checklist'])}
`
}));

/* ---------- SERVICES HUB ---------- */
pages.push(page({
  file: 'services/index.html', current: 'services/',
  title: 'Oracle Fusion HCM Services | AppsDreamz',
  desc: 'Oracle Fusion HCM services from one specialist practice: implementation, statutory localisation, integrations, stabilisation, managed support and AI advisory.',
  crumbs: [['services/', 'Services']],
  body: p => `
<section class="hero sub"><div class="in">
  ${eyebrow('Services')}
  <h1>Five stages of one Oracle Fusion HCM practice</h1>
  <p class="lead">Most firms sell one of them. The difficult work is almost always in what one stage hands to the next, so we deliver all five, and you can join at any one.</p>
  <div class="row">${btn(p + 'book-diagnostic/', 'Book a 45-minute diagnostic')}</div>
</div></section>
<section class="sect"><div class="in">
  <div class="svc-grid">
  ${NAV[0].items.slice(1).map(([h, t, d]) => `<a class="svc" href="${p}${h}"><h2>${t}</h2><p>${d}</p><span class="tlink">Read more${ARROW}</span></a>`).join('')}
  </div>
</div></section>
<section class="sect dark"><div class="in">${sectionHead('Operating model', 'How the stages connect')}${stagesBlock(p)}</div></section>
<section class="sect tint" id="modules"><div class="in split">
  <div>${sectionHead('Module coverage', 'Twelve modules, graded by what we actually do.')}</div><div>${MODULES}</div>
</div></section>
${ctaBand(p, 'Not sure which service you need?', 'Tell us where you are: planning, mid-programme, or live and not settled. We will tell you which entry point fits, or if the problem is not ours to fix.')}`
}));

/* ---------- SERVICE PAGES ---------- */
const SVC = ['services/', 'Services'];
pages.push(servicePage({
  slug: 'services/oracle-fusion-hcm-implementation/', parent: SVC, name: 'Oracle Fusion HCM Implementation',
  title: 'Oracle Fusion HCM Implementation Services | AppsDreamz',
  desc: 'Oracle Fusion HCM implementation led by senior specialists: design, configuration, data migration, integrations, testing, cutover and phased go-live.',
  eyebrow: 'Services · Implement', h1: 'Oracle Fusion HCM implementation, designed around the payroll run',
  lead: 'Full-suite Fusion HCM programmes from design through go-live, phased where a single date carries too much risk. Payroll and statutory design start in week one, not after Core HR.',
  cta2: ['book-diagnostic/?type=design-review', 'Request a Design Review'],
  problemH: 'Implementations fail where modules meet',
  problem: ['Most programmes are planned module by module and tested the same way. The failures that matter appear at the handoffs, in statutory outputs, and in the first live payroll cycles.', 'By then, every open defect becomes a payroll correction, and the business starts working around the system it has just paid for.'],
  who: 'Organisations moving to Fusion HCM from E-Business Suite, legacy payroll or spreadsheets, in one country or several.',
  what: ['Design from employment contracts', 'Enterprise structure and payroll relationship model', 'Configuration and fast formulas', 'Data migration with reconciliation per load', 'Integrations that assert volume and totals', 'Test approach including cross-module and parallel runs', 'Cutover planning and go-live readiness', 'Hypercare and post-go-live support'],
  deliverables: ['Design documents per module', 'Element set mapped to contracts', 'Integration inventory', 'Migration reconciliation reports', 'Test plan and evidence', 'Cutover runbook'],
  approach: 'We decide the go-live shape early. Where several countries, payroll and hiring change at once, we phase it, so each go-live carries risk you can see and own.',
  outcomes: ['A go-live with known, owned residual risk', 'First payroll cycles that reconcile', 'A configuration your HRIS team can explain'],
  proof: 'A GCC property and facilities group of 5,000–10,000 employees had a full-suite programme that stopped converging. We took it live in phases.',
  faq: [
    ['Do you implement the full suite or individual modules?', 'Both. We take eight modules live ourselves: Core HR, Payroll, Absence, Time and Labor, Recruiting, Talent, Learning and Integrations. Compensation, Benefits and HR Helpdesk we configure and test inside programmes another firm leads.'],
    ['Can you work alongside our existing implementation partner?', 'Yes. Much of our delivery is for other consultancies, under their badge. We can also take a defined workstream, such as payroll and statutory design, inside a programme someone else leads.'],
    ['How do you decide on a phased go-live?', 'When one date carries too much risk: several countries, payroll and hiring changing together, or a migration that cannot be reconciled in a single cutover. The Design Review examines the go-live shape specifically.'],
    ['Which countries have you localised?', 'Statutory delivery to date, including work with our delivery partners, covers the UAE, Saudi Arabia, India, Malaysia, Singapore, the United Kingdom and the United States. For any other country we tell you on the first call exactly what we have and have not done.'],
  ],
  related: [['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'Element sets from the contract'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Interfaces that fail loudly'], ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', '2–3 days before build']],
}));

pages.push(servicePage({
  slug: 'services/oracle-fusion-hcm-remediation-stabilisation/', parent: SVC, name: 'Oracle Fusion HCM Remediation &amp; Stabilisation',
  title: 'Oracle Fusion HCM Remediation &amp; Stabilisation | AppsDreamz',
  desc: 'Stabilise a delayed or post-go-live Oracle Fusion HCM programme: root-cause analysis of payroll exceptions, integration failures and cross-module handoffs.',
  eyebrow: 'Services · Stabilise', h1: 'Stabilise an Oracle Fusion HCM programme that stopped converging',
  lead: 'For programmes running on manual correction, delayed go-lives, and organisations whose implementation partner has handed over while issues remain.',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  problemH: 'Every cycle completes, so nobody calls it broken',
  problem: ['Payroll exceptions get worked through on the Thursday before pay date. An offer is approved over email because the chain in the system stalls. A performance cycle closes because HR chased it in a spreadsheet.', 'The workaround becomes the process. Two years later HR, payroll and talent acquisition have absorbed correction work that no one budgeted for and no one reports.'],
  who: 'Delayed or unstable programmes, organisations live on Fusion HCM with recurring exceptions, and teams whose implementation partner has rolled off.',
  what: ['Root-cause analysis of recurring payroll exceptions', 'Retro and fast formula review', 'Integration failure review', 'Data-quality assessment', 'Cross-module handoff mapping', 'Remediation roadmap sequenced by exposure and effort', 'Execution of the fixes with regression evidence', 'Agreed stabilisation exit criteria'],
  deliverables: ['Issue register with root cause per item', 'Remediation roadmap', 'Configuration fixes with test evidence', 'Stabilisation exit report'],
  approach: 'It starts with a Health Check, credited in full. The remediation plan sequences every fix by exposure and effort, so you can see the cost of each item before you commit.',
  outcomes: ['Cycles that close without a correction queue', 'An owner for every recurring issue', 'A business that trusts the system again'],
  proof: 'A Middle East media and communications group had exceptions every cycle, retro producing wrong results, and a gratuity base that did not match the employment contracts.',
  faq: [
    ['Will you take over from our current implementation partner?', 'We can, but usually we do not need to. Most stabilisation work runs alongside the team in place, with a defined scope and a named owner for each fix.'],
    ['Can you fix a configuration another firm built?', 'Yes. That is most of this work. The Health Check reads the configuration as built against the contracts it was meant to implement.'],
    ['How long does stabilisation take?', 'It depends on what the Health Check finds. Each item in the remediation plan carries an effort estimate before you commit to it.'],
    ['What access do you need?', 'For the Health Check: a read-only copy of production, three closed payroll cycles and your contract templates.'],
  ],
  related: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500'], ['solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs', 'What Oracle does not validate'], ['services/oracle-fusion-hcm-managed-support/', 'Managed Support', 'Keep it stable']],
}));

pages.push(servicePage({
  slug: 'services/oracle-fusion-payroll-statutory-localisation/', parent: SVC, name: 'Oracle Fusion Payroll &amp; Statutory Localisation',
  title: 'Oracle Fusion Payroll &amp; Statutory Localisation | AppsDreamz',
  desc: 'Oracle Fusion Payroll design and statutory localisation across the GCC, India, Malaysia, Singapore, the UK and the US: WPS, GOSI, gratuity, end-of-service, leave accrual and reconciliation.',
  eyebrow: 'Services · Localise', h1: 'Oracle Fusion Payroll, designed from the contract and reconciled to the balance sheet',
  lead: 'Statutory design for each country you operate in, delivered to date, including with our delivery partners, across the UAE, Saudi Arabia, India, Malaysia, Singapore, the United Kingdom and the United States.',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  problemH: 'Localisation goes wrong without raising a flag',
  problem: ['A gratuity base that excludes contract-eligible allowances does not throw an error. Payroll runs, the payslip looks right, and the end-of-service provision is understated every month until someone leaves and the accrual does not cover the settlement.', 'The same pattern sits in statutory files that pass validation but misclassify a pay component, in contribution bases that drift after a salary restructure, and in leave accrual that follows the calendar rather than the contract. None of it appears as a defect. All of it eventually appears as a number that has to be explained.'],
  who: 'Payroll directors, finance controllers and HRIS leads in the GCC, India, Southeast Asia, the UK and the US, and multinationals adding countries to Fusion.',
  what: ['Payroll design and configuration', 'Element sets designed from employment contracts', 'Fast formulas and retro behaviour', 'Gratuity and end-of-service bases', 'WPS file structure and component classification', 'GOSI contribution base after every restructure', 'Leave accrual on contractual entitlement', 'Reconciliation: payroll to GL, provision to balance sheet', 'Exception management', 'Audit readiness'],
  deliverables: ['Element-to-contract mapping', 'Statutory rules register per country', 'Reconciliation pack', 'Exception catalogue with owners'],
  approach: 'We start from the employment contracts and design the element set to them, rather than configuring the standard localisation and reconciling afterwards.',
  outcomes: ['Accurate, auditable payroll runs', 'Provisions that reconcile to the balance sheet', 'Statutory files that are correct, not only valid'],
  proof: 'A Middle East media and communications group came to us with a gratuity base that did not match its employment contracts.',
  faq: [
    ['Which countries have you delivered?', 'The UAE, Saudi Arabia, India, Malaysia, Singapore, the United Kingdom and the United States, including work with our delivery partners. The mechanism is the same in any jurisdiction, and we tell you on the first call what we have and have not done for yours.'],
    ['Do you work with Oracle’s delivered localisations?', 'Yes. We start from them and design the element set from your employment contracts, so the configuration reflects your terms rather than a template.'],
    ['Can you validate an existing WPS file?', 'Yes. We check the classification of each pay component in the file, not only that it passes validation, and reconcile it back to the payroll register.'],
    ['How do you test a gratuity base?', 'We list which allowances each contract makes eligible, compare them with the elements feeding the base, and reconcile the end-of-service provision to the balance sheet.'],
  ],
  related: [['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'WPS, GOSI, gratuity'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'Payroll &amp; Statutory scope'], ['solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs', 'Where pay data comes from']],
}));

pages.push(servicePage({
  slug: 'services/oracle-fusion-hcm-integrations/', parent: SVC, name: 'Oracle Fusion HCM Integrations',
  title: 'Oracle Fusion HCM Integrations | AppsDreamz',
  desc: 'Oracle Fusion HCM integrations built to surface failure immediately: bank, statutory, finance, time, benefits, assessment and job-board interfaces.',
  eyebrow: 'Services · Integrate', h1: 'Oracle Fusion HCM integrations that fail loudly, not weeks later',
  lead: 'Bank, statutory, finance, assessment and job-board interfaces, built to surface a failure the moment it happens rather than weeks later through the data it corrupted.',
  cta2: ['book-diagnostic/?type=design-review', 'Request a Design Review'],
  problemH: 'A partial post that reports success',
  problem: ['An interface that posts half a file and reports success does not look like a failure. It looks like a reconciliation problem three weeks later, by which time the data has spread into payroll, finance and statutory returns.'],
  who: 'IT leaders, integration owners and payroll teams running Fusion HCM alongside banks, finance systems, time capture and third-party providers.',
  what: ['Integration inventory and ownership', 'Interface design and build', 'Volume and total assertions before a file leaves the tenant', 'Alerts to a named owner on a partial post', 'Reprocessing without anyone remembering the sequence', 'Finance and general-ledger interfaces', 'Bank and statutory file interfaces', 'Time, benefits, assessment and job-board feeds'],
  deliverables: ['Integration inventory and ownership matrix', 'Interface specifications', 'Error-handling and alerting design', 'Reconciliation reports and runbooks'],
  approach: 'Every interface asserts what it expects before it sends anything, and tells a named person when the answer is wrong.',
  outcomes: ['Failures detected when they happen', 'Clear ownership per interface', 'Fewer production incidents'],
  faq: [
    ['Can you review integrations another firm built?', 'Yes. The integration inventory is part of the Design Review and the Health Check, and we review error handling and reconciliation for each interface.'],
    ['How are integrations monitored after go-live?', 'Through Managed Support. Interfaces alert a named owner on a partial post and can be reprocessed safely.'],
    ['Which tools do you use?', 'Oracle’s HCM integration tooling and your existing middleware where you have one. We confirm the toolset on the first call.'],
  ],
  related: [['services/oracle-fusion-hcm-managed-support/', 'Managed Support', 'Monitoring and regression'], ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', 'Integration inventory review'], ['services/oracle-fusion-hcm-implementation/', 'Implementation', 'Design to go-live']],
}));

pages.push(servicePage({
  slug: 'services/oracle-fusion-hcm-managed-support/', parent: SVC, name: 'Oracle Fusion HCM Managed Support',
  title: 'Oracle Fusion HCM Managed Support (AMS) | AppsDreamz',
  desc: 'Oracle Fusion HCM managed support from the consultants who know your configuration: payroll-cycle support, incidents, enhancements and quarterly release regression.',
  eyebrow: 'Services · Run', h1: 'Managed support from the people who know your configuration',
  lead: 'Cycle support, production support and quarterly release regression testing from a named team. The regression pack we test against is written from your own configuration, not a template.',
  problemH: 'Support that re-logs the same issue every quarter',
  problem: ['Generic support desks close tickets. The same exception returns next cycle, and Oracle’s quarterly update lands on fast formulas nobody has retested.'],
  who: 'Organisations live on Fusion HCM that want predictable cycles and fewer recurring issues.',
  what: ['Production support and incident management', 'Payroll-cycle support', 'Enhancement requests', 'Quarterly release readiness and regression testing', 'Integration monitoring', 'Continuous improvement'],
  deliverables: ['Named support team', 'Monthly service report', 'Quarterly report naming what should stop recurring, and the configuration change that would end it'],
  approach: 'Support comes from the consultants who did the build, or, where another firm built it, after a Health Check gives us a baseline of your configuration.',
  outcomes: ['Predictable payroll cycles', 'Recurring issues retired rather than re-logged', 'Quarterly updates tested against your configuration'],
  faq: [
    ['Do you support configurations you did not build?', 'Yes, usually after a Health Check, which gives us a documented baseline of your configuration.'],
    ['How does release regression work?', 'Each quarter we test Oracle’s update against a regression pack written from your configuration, before it reaches production.'],
    ['What are your hours?', 'Monday to Friday, 09:00 to 18:00 GST (UTC+4). Cover around payroll-critical dates is agreed per contract.'],
  ],
  related: [['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation', 'Fix first, then run'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Monitored interfaces'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'Baseline your configuration']],
}));

pages.push(servicePage({
  slug: 'services/oracle-hcm-ai-agent-studio/', parent: SVC, name: 'Oracle HCM AI &amp; Agent Studio Advisory',
  title: 'Oracle HCM AI &amp; Agent Studio Advisory | AppsDreamz',
  desc: 'Apply Oracle AI Agent Studio and HCM agents to HR service delivery, knowledge access and payroll exception analysis, with governance and human oversight.',
  eyebrow: 'Services · AI advisory', h1: 'Oracle HCM AI and agents, on processes that are ready for them',
  lead: 'We scope, design and review uses of Oracle AI Agent Studio and the published HCM agents, with payroll controls, data privacy and accountability designed in from the start.',
  problemH: 'An agent on an unstable process automates the workaround',
  problem: ['AI makes a stable process faster. On a process that runs on manual correction, it makes the correction faster, and harder to see.', 'AI should improve decision quality and operational efficiency without compromising payroll controls, data privacy, auditability, or accountability.'],
  who: 'HR and HRIS leaders evaluating Oracle’s AI capabilities, and payroll and finance leaders who need to know the controls survive.',
  what: ['Use-case identification and readiness assessment', 'Agent design in Oracle AI Agent Studio', 'HR service delivery and case triage', 'Policy and knowledge access', 'Manager support', 'Payroll exception analysis', 'Governance: human oversight, audit trail, data access'],
  deliverables: ['Use-case shortlist with readiness rating', 'Agent design specification', 'Governance and control checklist', 'Pilot plan'],
  approach: 'Readiness first. We rate each process on stability and control before recommending an agent for it.',
  outcomes: ['AI use cases chosen for value and readiness', 'Controls and accountability defined before a pilot', 'A clear path from pilot to production'],
  faq: [
    ['Which processes should not use agents yet?', 'Any process that currently runs on workarounds. We assess readiness before recommending an agent.'],
    ['How do payroll controls stay intact?', 'Agents support decisions; they do not post payroll changes unattended. Human approval, audit trail and data access are designed before the pilot.'],
    ['Is this an advisory service?', 'Yes. AI and Agent Studio work is graded Advisory: scoping, design and review.'],
  ],
  related: [['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation', 'Make the process ready'], ['services/oracle-fusion-hcm-managed-support/', 'Managed Support', 'Run it day to day'], ['about/security-data-handling/', 'Security &amp; data handling', 'How we treat your data']],
}));

/* ---------- SOLUTIONS ---------- */
const SOL = ['services/', 'Services'];
pages.push(servicePage({
  slug: 'solutions/oracle-fusion-hcm-health-check/', parent: ['solutions/oracle-fusion-hcm-health-check/', 'Solutions'], name: 'Oracle Fusion HCM Health Check',
  title: 'Oracle Fusion HCM Health Check · 3 weeks, USD 7,500 | AppsDreamz',
  desc: 'A three-week, fixed-fee Oracle Fusion HCM Health Check: payroll, statutory and handoff risks read against your contracts. USD 7,500, credited in full.',
  eyebrow: 'Solutions · Health Check', h1: 'Oracle Fusion HCM Health Check',
  lead: 'Three weeks to read a live Oracle Fusion HCM implementation against the employment contracts it was built from, and hand back a plan you can act on with or without us.',
  offer: '7500', serviceType: 'Oracle Fusion HCM assessment',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['solutions/oracle-fusion-hcm-health-check/report-structure/', 'See the report structure'],
  facts: [['Fee', 'USD 7,500 fixed'], ['Duration', '3 weeks'], ['Credit', 'In full, against work from the findings'], ['Access', 'Read-only copy of production']],
  problemH: 'Who should buy it, and when',
  problem: ['Live customers with recurring exceptions, programmes approaching go-live, organisations whose implementation partner has handed over, and finance teams questioning a provision.', 'Buy it before an audit, before a restructure or salary review, before adding a country, or when the same exception has appeared three cycles running.'],
  who: 'HR, payroll, IT and finance leaders who need an independent, evidence-based reading of a live implementation.',
  extra: p => `<section class="sect"><div class="in">
    ${sectionHead('Two scopes', 'One scope per engagement', 'Additional scopes are quoted separately, because that is what keeps three weeks from becoming a surface scan.')}
    <div class="grid2">
      <article class="box"><h3>Payroll and Statutory</h3><p>Reads three closed cycles line by line, against the contracts.</p></article>
      <article class="box"><h3>Talent and Recruiting</h3><p>Reads the requisition-to-hire flow against how your team actually hires.</p></article>
    </div>
    <h3 class="minor spaced">Eight inspection areas</h3>
    <ol class="inspect">
      ${[['Gratuity base', 'Which allowances the contract makes eligible', 'Payroll'], ['Leave accrual and end-of-service provision', 'Contractual entitlement, reconciled to the balance sheet', 'Payroll'], ['Mobilisation-to-payroll handoff', 'Dates tracked outside onboarding, before they arrive at payroll as a retro', 'Handoff'], ['Offer-to-record handoff', 'Offer terms landing correctly in the employee record', 'Handoff'], ['Recruiting', 'Requisition, offer, approval chain', 'Talent'], ['Onboarding', 'Visa, medical, mobilisation dates', 'Talent'], ['Performance management', 'Goals, performance, succession', 'Talent'], ['Learning', 'Catalogue, assignment, compliance evidence', 'Talent']].map(([a, b, c], i) => `<li><span class="inum">${String(i + 1).padStart(2, '0')}</span><span class="itag">${c}</span><h4>${a}</h4><p>${b}</p></li>`).join('')}
    </ol>
    <div class="grid3 spaced">
      <div><h3 class="minor">You provide</h3>${list(['A read-only copy of production', 'Three closed payroll cycles', 'Employment contract templates', 'Time with your payroll, HRIS and finance leads'], 'dash')}</div>
      <div><h3 class="minor">How it runs</h3>${list(['Week 1: access, artefacts, cycle selection', 'Week 2: line-by-line reading and handoff tracing', 'Week 3: report, remediation plan, walkthrough'], 'dash')}</div>
      <div><h3 class="minor">Not included</h3>${list(['Fixing the issues found (quoted from the findings)', 'Write access to production', 'Modules outside the chosen scope'], 'dash')}</div>
    </div>
  </div></section>`,
  whatH: 'What you receive',
  what: ['A written report', 'Evidence pulled from your own payroll runs', 'A findings register', 'A remediation plan sequenced by exposure and effort', 'A walkthrough with HR, IT and finance in the room', 'A plan you can act on with or without us'],
  deliverables: ['Written report', 'Findings register with evidence', 'Remediation plan', 'Executive walkthrough'],
  approach: 'We read the configuration against the employment contracts it was built from, using evidence from your own closed cycles rather than a generic checklist.',
  outcomes: ['A ranked view of your exposure', 'Owners and effort for every fix', 'A decision on what to do next, with the fee credited if you continue with us'],
  faq: [
    ['Why three weeks?', 'It is long enough to read three closed cycles line by line against the contracts, and short enough to keep the scope sharp.'],
    ['Why only one scope per engagement?', 'Depth. Covering payroll and recruiting in the same three weeks would turn a line-by-line reading into a surface scan.'],
    ['Do you need access to production?', 'We work on a read-only copy of production. We never need write access.'],
    ['What if we do not continue with you?', 'The report and remediation plan are yours, written so you can act on them with or without us.'],
    ['How is the fee credited?', 'In full, against any work you commission from the findings.'],
    ['Can our implementation partner attend the walkthrough?', 'Yes. The walkthrough is held with HR, IT and finance in the room, and your partner is welcome.'],
  ],
  ctaH: 'Request the Health Check scope.', ctaBody: 'We confirm the scope on a 45-minute call before anything is signed.',
  related: [['solutions/oracle-fusion-hcm-design-review/', 'Design Review', 'For programmes not yet live'], ['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation', 'Acting on the findings'], ['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory', 'The payroll scope in depth']],
}));

pages.push(servicePage({
  slug: 'solutions/oracle-fusion-hcm-design-review/', parent: ['solutions/oracle-fusion-hcm-design-review/', 'Solutions'], name: 'Oracle Fusion HCM Design Review',
  title: 'Oracle Fusion HCM Design Review · 2–3 days, USD 2,500 | AppsDreamz',
  desc: 'An independent Oracle Fusion HCM design review before build or go-live: enterprise structure, payroll model, element set, integrations, testing and go-live shape.',
  eyebrow: 'Solutions · Design Review', h1: 'Oracle Fusion HCM Design Review',
  lead: 'Two to three days reading the design before it becomes the system. This is the cheapest point at which any of it can be changed.',
  offer: '2500', serviceType: 'Oracle Fusion HCM design assurance',
  cta1: ['book-diagnostic/?type=design-review', 'Request a Design Review'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  facts: [['Fee', 'USD 2,500 fixed'], ['Duration', '2–3 days'], ['Scope', 'Confirmed on the call'], ['Stage', 'Before build or go-live']],
  problemH: 'A design decision costs least before it is built',
  problem: ['Once a payroll relationship model or element set is configured, tested and migrated against, changing it means rework across every module that depends on it.', 'A short independent review at design sign-off, before SIT, or before a go-live decision catches the decisions that are expensive later.'],
  who: 'Programme owners, implementation teams and Oracle customers who want an independent specialist reading before they commit.',
  whatH: 'What the Design Review covers',
  what: ['Enterprise structure', 'Payroll relationship model', 'The element set against your employment contracts', 'The integration inventory', 'The test approach', 'The go-live shape'],
  deliverables: ['Findings rated by risk', 'Design decisions to revisit before build', 'Walkthrough with the programme team'],
  approach: 'We read the design documents and configuration workbooks against your contracts and operating countries, then walk the programme team through what we found.',
  outcomes: ['Expensive decisions caught while they are cheap', 'A go-live shape matched to the risk', 'Independent assurance for the steering committee'],
  faq: [
    ['Will this upset our implementation partner?', 'It should not. We review the design, not the people, and many of our engagements are delivered for other consultancies under their own badge.'],
    ['What do you need from us?', 'Design documents, configuration workbooks, the integration list, the test approach and a sample of employment contracts.'],
    ['Design Review or Health Check: which do I need?', 'If you are not live yet, the Design Review. If you are live, or in late testing with real cycles to read, the Health Check.'],
  ],
  ctaH: 'Request a Design Review.', ctaBody: 'We confirm the scope on a 45-minute call before anything is signed.',
  related: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'For live implementations'], ['services/oracle-fusion-hcm-implementation/', 'Implementation', 'Design to go-live'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Inventory and interface design']],
}));

pages.push(servicePage({
  slug: 'solutions/gcc-payroll-localisation/', parent: ['solutions/gcc-payroll-localisation/', 'Solutions'], name: 'GCC Payroll Localisation', area: ['United Arab Emirates', 'Saudi Arabia'],
  title: 'GCC Payroll Localisation in Oracle Fusion HCM | AppsDreamz',
  desc: 'Oracle Fusion HCM payroll localisation for the UAE and Saudi Arabia: WPS, GOSI, gratuity, end-of-service provisions, leave accrual and reconciliation.',
  eyebrow: 'Solutions · UAE and Saudi Arabia', h1: 'GCC payroll localisation in Oracle Fusion HCM',
  lead: 'Statutory payroll design for the UAE and Saudi Arabia, read against the contract rather than the template.',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  facts: [['Delivered', 'United Arab Emirates, Saudi Arabia']],
  problemH: 'In the Gulf, WPS and GOSI are where we see it most',
  problem: ['A WPS file can pass validation and still misclassify a pay component. A GOSI contribution base can drift after a salary restructure. A gratuity base can leave out allowances the contract makes eligible.', 'None of these raise an error in Fusion. Each appears later, as a number that finance or an auditor asks you to explain.'],
  who: 'GCC employers on Oracle Fusion HCM, and multinationals adding a UAE or Saudi entity.',
  extra: p => `<section class="sect"><div class="in">
    ${sectionHead('Read against the contract', 'What we check, and against what')}
    <div class="tablewrap"><table class="plain"><thead><tr><th scope="col">Obligation</th><th scope="col">Read against</th></tr></thead><tbody>
      ${[['Gratuity base', 'Which allowances the contract makes eligible'], ['WPS file structure', 'Component classification, not just validation'], ['GOSI contribution base', 'Salary after every restructure'], ['Leave accrual', 'Contractual entitlement, not the calendar'], ['End-of-service provision', 'Reconciled back to the balance sheet']].map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}
    </tbody></table></div>
  </div></section>`,
  what: ['Element sets designed from employment contracts', 'WPS file structure and component classification', 'GOSI contribution base design and reconciliation', 'Gratuity and end-of-service provision', 'Contract-based leave accrual', 'Statutory reporting', 'Payroll-to-GL reconciliation', 'Compliance risk register'],
  deliverables: ['Statutory rules register', 'Element-to-contract mapping', 'Reconciliation pack', 'Risk register with owners'],
  approach: 'We start from the employment contracts and design the element set to them, rather than configuring the standard localisation and reconciling afterwards.',
  outcomes: ['WPS files that are correct, not only valid', 'Contribution bases that follow restructures', 'An end-of-service provision that reconciles'],
  proof: 'A Middle East media and communications group had a gratuity base that did not match its employment contracts.',
  faq: [
    ['Which GCC countries have you delivered?', 'The United Arab Emirates and Saudi Arabia. If you operate elsewhere in the GCC, we tell you on the first call what we have and have not done there.'],
    ['Can you review an existing WPS file?', 'Yes. We check component classification and reconcile the file back to the payroll register.'],
    ['How do you check the gratuity base?', 'We list which allowances each contract makes eligible, compare them with the elements feeding the base, and reconcile the provision to the balance sheet.'],
  ],
  related: [['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'All countries'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'Payroll &amp; Statutory scope'], ['clients-results/case-studies/', 'Case studies', 'GCC engagements']],
}));

pages.push(servicePage({
  slug: 'solutions/cross-module-handoff-remediation/', parent: ['solutions/cross-module-handoff-remediation/', 'Solutions'], name: 'Cross-Module Handoff Remediation',
  title: 'Oracle Fusion HCM Cross-Module Handoff Remediation | AppsDreamz',
  desc: 'Oracle validates each Fusion HCM module on its own terms. We design the checks between them: offer to record, mobilisation to payroll, pay to statutory return.',
  eyebrow: 'Solutions · Handoffs', h1: 'Fix what Oracle does not validate: the handoffs between modules',
  lead: 'Hiring, talent, pay and statutory reporting are the same record at different moments. Oracle validates each module on its own terms. Nothing validates the handoffs between them, so that is where we design the checks.',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  problemH: 'One record, from the contract to the balance sheet',
  problem: ['A clean Recruiting configuration and a clean Payroll configuration can still produce a wrong payslip, because the offer terms never reached the employee record correctly.', 'Each module passes its own tests. The failure lives in what one hands to the next.'],
  who: 'Organisations live on several Fusion HCM modules, or about to go live on them together.',
  extra: p => `<section class="sect"><div class="in">${handoffDiagram}</div></section>`,
  what: ['Handoff map across your modules', 'A designed check for every handoff', 'Offer-to-record validation', 'Mobilisation-to-payroll controls', 'Compensation-to-gratuity-base recalculation', 'Payroll-to-statutory-file reconciliation'],
  deliverables: ['Handoff map', 'Control design per handoff', 'Implemented checks with test evidence'],
  approach: 'We trace one record from the employment contract to the balance sheet, and design a check at every point where it changes hands.',
  outcomes: ['Fewer retros and corrections', 'Failures caught at the handoff, not in payroll', 'A process that runs inside the system'],
  faq: [
    ['Which handoffs fail most often?', 'Offer terms into the employee record, mobilisation dates into payroll, allowances into the gratuity base, and pay into the statutory return.'],
    ['Is this part of the Health Check?', 'Yes. Offer-to-record and mobilisation-to-payroll are two of its eight inspection areas.'],
  ],
  related: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'Eight inspection areas'], ['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation', 'Fixing what we find'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Handoffs to other systems']],
}));

/* ---------- CLIENTS & RESULTS ---------- */
pages.push(page({
  file: 'clients-results/index.html', current: 'clients-results/',
  title: 'Clients &amp; Results | AppsDreamz Oracle Fusion HCM',
  desc: 'Evidence of AppsDreamz Oracle Fusion HCM delivery: anonymised case studies, eight partner and white-label clients, modules delivered and markets served.',
  crumbs: [['clients-results/', 'Clients &amp; Results']],
  body: p => `
<section class="hero sub"><div class="in">${eyebrow('Clients &amp; Results')}<h1>Evidence, not promises.</h1>
<p class="lead">Engagement detail stays confidential, which is why both case studies are anonymised and why there are no client-attributed percentages anywhere on this site.</p>
<div class="row">${btn(p + 'book-diagnostic/?type=case-study', 'Request a detailed case study or reference')}</div></div></section>
<section class="sect"><div class="in">${STATS}</div></section>
<section class="sect tint"><div class="in">${sectionHead('Case studies', 'Two engagements, anonymised')}
<div class="cases">
  <a class="case" href="${p}clients-results/case-studies/#phased-go-live"><p class="cmeta">GCC property and facilities group · 5,000–10,000 employees</p><h3>Taking a stalled full-suite Fusion HCM programme live in phases</h3><p>A full-suite programme had stopped converging. We took it live in phases.</p><span class="tlink">Read the case${ARROW}</span></a>
  <a class="case" href="${p}clients-results/case-studies/#payroll-stabilisation"><p class="cmeta">Middle East media and communications group · 2,000–5,000 employees</p><h3>Stabilising payroll that needed correction every cycle</h3><p>Exceptions every cycle, retro producing wrong results, and a gratuity base that did not match the employment contracts.</p><span class="tlink">Read the case${ARROW}</span></a>
</div></div></section>
<section class="sect"><div class="in">${sectionHead('Partners and white-label clients', 'The firms that pay us to deliver', 'Consultancies and systems integrators who have paid us to deliver Oracle Fusion HCM work, in most cases under their own badge. Listed by agreement.')}${partnerStrip(p)}<p><a class="tlink" href="${p}clients-results/partner-delivery/">How partner delivery works${ARROW}</a></p></div></section>
<section class="sect tint"><div class="in split"><div>${sectionHead('Coverage', 'Modules and markets')}<p class="body">Statutory delivery to date, including work with our delivery partners: United Arab Emirates, Saudi Arabia, India, Malaysia, Singapore, United Kingdom, United States.</p></div><div>${MODULES}</div></div></section>
${ctaBand(p, 'Need more detail before you engage?', 'We share a detailed, anonymised write-up of either engagement, or arrange a reference conversation where the client agrees.', ['book-diagnostic/?type=case-study', 'Request a case study or reference'])}`
}));

pages.push(page({
  file: 'clients-results/case-studies/index.html', current: 'clients-results/case-studies/',
  title: 'Oracle Fusion HCM Case Studies | AppsDreamz',
  desc: 'Two anonymised Oracle Fusion HCM engagements: a stalled full-suite programme taken live in phases, and payroll stabilisation for a Middle East media group.',
  crumbs: [['clients-results/', 'Clients &amp; Results'], ['clients-results/case-studies/', 'Case studies']],
  schema: [{ '@type': 'CreativeWork', name: 'Taking a stalled full-suite Fusion HCM programme live in phases', about: 'Oracle Fusion HCM implementation', author: { '@id': SITE + '#org' } }, { '@type': 'CreativeWork', name: 'Stabilising payroll that needed correction every cycle', about: 'Oracle Fusion Payroll stabilisation', author: { '@id': SITE + '#org' } }],
  body: p => {
    const cs = (id, title, facts, rows) => `<article class="cstudy" id="${id}"><div class="in split">
      <aside><dl class="cfacts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></aside>
      <div><h2>${title}</h2>${rows.map(([k, v]) => `<h3 class="minor">${k}</h3><p>${v}</p>`).join('')}
      <div class="row">${btn(p + 'book-diagnostic/?type=case-study', 'Request the detailed case study')}</div></div>
    </div></article>`;
    return `<section class="hero sub"><div class="in">${eyebrow('Case studies')}<h1>Two engagements, documented and anonymised</h1><p class="lead">Each follows the same structure: the problem, what was at risk, what we did, and the outcome. We publish only what the client has agreed we can say.</p></div></section>
    ${cs('phased-go-live', 'Taking a stalled full-suite Fusion HCM programme live in phases', [['Client type', 'Property and facilities group'], ['Region', 'GCC'], ['Employees', '5,000 to 10,000'], ['Scope', 'Full-suite Oracle Fusion HCM'], ['Services', 'Implementation · Stabilisation']], [
      ['Problem', 'A full-suite Fusion HCM programme had stopped converging.'],
      ['What was at risk', 'A single go-live date carried too much risk across hiring, pay and statutory outputs at once.'],
      ['What we did', 'We re-planned the go-live and took the programme live in phases, so each phase carried risk the client could see and own.'],
      ['Outcome', 'The programme went live in phases. A detailed write-up is available on request.']])}
    ${cs('payroll-stabilisation', 'Stabilising payroll that needed correction every cycle', [['Client type', 'Media and communications group'], ['Region', 'Middle East'], ['Employees', '2,000 to 5,000'], ['Scope', 'Payroll and statutory'], ['Services', 'Payroll &amp; Statutory Localisation · Stabilisation']], [
      ['Problem', 'Exceptions every payroll cycle, retro producing wrong results, and a gratuity base that did not match the employment contracts.'],
      ['What was at risk', 'Manual correction before every pay date, and an end-of-service provision that did not reflect contractual entitlement.'],
      ['What we did', 'We read the payroll configuration against the employment contracts it was meant to implement.'],
      ['Outcome', 'A detailed write-up of the findings and remediation is available on request.']])}
    ${ctaBand(p, 'Bring us the cycle you dread.', 'Payroll, hiring or performance: tell us which cycle you dread and we will tell you what is underneath it.')}`;
  }
}));

pages.push(page({
  file: 'clients-results/partner-delivery/index.html', current: 'clients-results/partner-delivery/',
  title: 'Partner &amp; White-Label Oracle Fusion HCM Delivery | AppsDreamz',
  desc: 'Consultancies and systems integrators subcontract Oracle Fusion HCM payroll and statutory work to AppsDreamz, delivered by named senior consultants.',
  crumbs: [['clients-results/', 'Clients &amp; Results'], ['clients-results/partner-delivery/', 'Partner delivery']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Partner &amp; white-label delivery')}<h1>The Oracle Fusion HCM team other consultancies subcontract to</h1>
<p class="lead">Being the firm a competitor subcontracts its payroll work to is a harder reference than a logo wall, so it is the one we lead with.</p>
<div class="row">${btn(p + 'book-diagnostic/?type=partner', 'Request a partner conversation')}</div></div></section>
<section class="sect"><div class="in">${partnerStrip(p)}</div></section>
<section class="sect tint"><div class="in grid3">
  <article class="box"><h3>White-label delivery</h3><p>We deliver under your badge, in front of your client.</p></article>
  <article class="box"><h3>Named consultants</h3><p>A named senior consultant, a scope agreed before the fee, and an escalation route that goes to the person doing the work.</p></article>
  <article class="box"><h3>Repeat programmes</h3><p>Partners come back for the second programme, which is the only measure of a partnership that means anything.</p></article>
</div></section>
<section class="sect"><div class="in split"><div>${sectionHead('Where partners use us', 'The work partners bring')}</div><div>${list(['Payroll and statutory design inside your implementation', 'Statutory localisation across seven countries', 'Stabilisation of a programme in trouble', 'Integrations and release regression', 'Specialist review before go-live'], 'ticks')}</div></div></section>
${ctaBand(p, 'Need Fusion HCM payroll depth on your next programme?', 'Talk to us about white-label or named delivery. Scope is agreed before the fee.', ['book-diagnostic/?type=partner', 'Request a partner conversation'])}`
}));

/* ---------- ABOUT ---------- */
pages.push(page({
  file: 'about/index.html', current: 'about/',
  title: 'About AppsDreamz | Oracle Fusion HCM Specialists',
  desc: 'AppsDreamz is a deliberately small, senior-only Oracle Fusion HCM consultancy. The consultant who scopes the work does the work. Meet the founders.',
  crumbs: [['about/', 'About']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('About')}<h1>The consultant who scopes the work does the work.</h1>
<p class="lead">AppsDreamz is deliberately small. The problems clients bring us are not solved by adding people. They are solved by someone senior reading the configuration against the employment contracts.</p></div></section>
<section class="sect"><div class="in split"><div>${sectionHead('Founders', 'Who you will be speaking to')}<p class="body">We turn down work we cannot staff with a senior consultant, and we say on the first call if the problem is not ours to fix.</p></div><div>${founders(p)}</div></div></section>
<section class="sect tint"><div class="in">${sectionHead('Practices', 'Oracle Applications is the practice; the rest exist because a clean configuration does not stay clean on its own.')}
<div class="grid3">
  <article class="box"><h3>Oracle Applications</h3><p>Fusion HCM across the suite, and E-Business Suite where a client still runs it, including the upgrade and coexistence work between the two.</p></article>
  <article class="box"><h3>Integrations and Extensions</h3><p>Interfaces that assert an expected volume and total before a file leaves the tenant, alert a named owner on a partial post, and can be reprocessed safely.</p></article>
  <article class="box"><h3>Oracle AI and Agents</h3><p>Agent Studio and the published HCM agents, on processes that are ready for them.</p></article>
  <article class="box"><h3>Managed Services</h3><p>Cycle support and quarterly release regression testing from the consultants who did the build.</p></article>
  <article class="box"><h3>Training</h3><p>The configuration, not the click path: what the fast formula does, where the statutory rules live, and what to check before a cycle is released. In your tenant, on your data.</p></article>
</div></div></section>
<section class="sect"><div class="in split"><div>${sectionHead('Company', 'Where we work from')}</div><div><dl class="facts light">
  <div><dt>Registered office</dt><dd>Bengaluru, India</dd></div>
  <div><dt>CIN</dt><dd>U72900KA2022PTC158740</dd></div>
  <div><dt>Hours</dt><dd>Mon to Fri, 09:00 to 18:00 GST (UTC+4)</dd></div>
</dl></div></div></section>
${related(p, [['about/delivery-method/', 'Delivery method', 'How an engagement runs'], ['about/security-data-handling/', 'Security &amp; data handling', 'How we treat your data'], ['clients-results/', 'Clients &amp; Results', 'Evidence, not promises']])}`
}));

pages.push(page({
  file: 'about/delivery-method/index.html', current: 'about/delivery-method/',
  title: 'How an AppsDreamz Engagement Runs | Delivery Method',
  desc: 'From a 45-minute diagnostic to a fixed-fee Design Review or Health Check, remediation, go-live and managed operations: how AppsDreamz delivers.',
  crumbs: [['about/', 'About'], ['about/delivery-method/', 'Delivery method']],
  body: p => {
    const steps = [
      ['Diagnostic call', '45 minutes with the consultant who would do the work. You leave with our read on whether the problem is configuration, data, process or scope.', 'Free'],
      ['Design Review or Health Check', 'A fixed-fee entry point confirmed on the call: 2–3 days before build, or 3 weeks on a live implementation.', 'USD 2,500 or USD 7,500'],
      ['Remediation plan', 'Findings sequenced by exposure and effort, with an owner and an estimate for each item.', 'Part of the Health Check'],
      ['Implement or stabilise', 'Design, build and fixes delivered by named senior consultants, phased where one date carries too much risk.', 'Scoped before the fee'],
      ['Test and validate', 'Cross-module scenarios, parallel runs and reconciliation, not only module-level tests.', 'Evidence for every fix'],
      ['Cutover and go-live', 'A go-live shape matched to the risk, with readiness criteria agreed in advance.', 'Phased where needed'],
      ['Run', 'Managed support, cycle support and quarterly release regression from a pack written from your configuration.', 'Named team'],
      ['Improve', 'Each quarter’s report names what should stop recurring, and the configuration change that would end it.', 'Quarterly'],
    ];
    return `<section class="hero sub"><div class="in">${eyebrow('Delivery method')}<h1>How an AppsDreamz engagement runs</h1><p class="lead">Every engagement starts with a conversation and a fixed-fee entry point. Nothing is signed until the scope is agreed.</p></div></section>
<section class="sect"><div class="in"><ol class="steps">${steps.map(([h, t, m], i) => `<li><span class="snum">${String(i + 1).padStart(2, '0')}</span><div><h2>${h}</h2><p>${t}</p><p class="smeta">${m}</p></div></li>`).join('')}</ol></div></section>
${ctaBand(p, 'Start with step one.', 'Forty-five minutes, no obligation, with the consultant who would do the work.')}`;
  }
}));

pages.push(page({
  file: 'about/security-data-handling/index.html', current: 'about/security-data-handling/',
  title: 'Security &amp; Data Handling | AppsDreamz',
  desc: 'How AppsDreamz handles your Oracle Fusion HCM tenant and employee data: read-only access, named consultants, client-owned access and minimum data.',
  crumbs: [['about/', 'About'], ['about/security-data-handling/', 'Security &amp; data handling']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Security &amp; data handling')}<h1>How we handle your tenant and your employees’ data</h1><p class="lead">Payroll data is among the most sensitive data an organisation holds. These are the principles every engagement follows.</p></div></section>
<section class="sect"><div class="in grid2">
  <article class="box"><h3>Read-only by default</h3><p>Health Checks run on a read-only copy of production. We do not need write access to diagnose a problem.</p></article>
  <article class="box"><h3>Minimum data</h3><p>We ask for the cycles, contracts and artefacts the scope needs, and no more. For a Health Check that means three closed cycles and contract templates.</p></article>
  <article class="box"><h3>Named people only</h3><p>Access is given to named consultants on the engagement. No shared accounts, no pyramid of unnamed staff.</p></article>
  <article class="box"><h3>You own the access</h3><p>Your team grants, reviews and revokes every account in your tenant. Scope is agreed before work starts.</p></article>
</div></section>
<section class="sect tint"><div class="in split"><div>${sectionHead('Procurement', 'Questionnaires and agreements')}</div><div><p class="body">Send your security questionnaire, data processing terms or NDA to <a href="mailto:${EMAIL}">${EMAIL}</a> and we will respond as part of scoping.</p></div></div></section>
${ctaBand(p, 'Questions from procurement or InfoSec?', 'Raise them on the first call. We would rather agree the controls before the work than after it.')}`
}));

/* ---------- BOOK DIAGNOSTIC ---------- */
const COUNTRIES = (() => { const dn = new Intl.DisplayNames(['en'], { type: 'region' }); const codes = 'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' '); return codes.map(c => [c, dn.of(c)]).sort((a, b) => a[1].localeCompare(b[1])); })();
const DIAL = 'AF93 AL355 DZ213 AD376 AO244 AG1268 AR54 AM374 AU61 AT43 AZ994 BS1242 BH973 BD880 BB1246 BY375 BE32 BZ501 BJ229 BT975 BO591 BA387 BW267 BR55 BN673 BG359 BF226 BI257 KH855 CM237 CA1 CV238 CF236 TD235 CL56 CN86 CO57 KM269 CG242 CD243 CR506 CI225 HR385 CU53 CY357 CZ420 DK45 DJ253 DM1767 DO1809 EC593 EG20 SV503 GQ240 ER291 EE372 SZ268 ET251 FJ679 FI358 FR33 GA241 GM220 GE995 DE49 GH233 GR30 GD1473 GT502 GN224 GW245 GY592 HT509 HN504 HK852 HU36 IS354 IN91 ID62 IR98 IQ964 IE353 IL972 IT39 JM1876 JP81 JO962 KZ7 KE254 KI686 KW965 KG996 LA856 LV371 LB961 LS266 LR231 LY218 LI423 LT370 LU352 MO853 MG261 MW265 MY60 MV960 ML223 MT356 MH692 MR222 MU230 MX52 FM691 MD373 MC377 MN976 ME382 MA212 MZ258 MM95 NA264 NR674 NP977 NL31 NZ64 NI505 NE227 NG234 KP850 MK389 NO47 OM968 PK92 PW680 PS970 PA507 PG675 PY595 PE51 PH63 PL48 PT351 PR1787 QA974 RO40 RU7 RW250 KN1869 LC1758 VC1784 WS685 SM378 ST239 SA966 SN221 RS381 SC248 SL232 SG65 SK421 SI386 SB677 SO252 ZA27 KR82 SS211 ES34 LK94 SD249 SR597 SE46 CH41 SY963 TW886 TJ992 TZ255 TH66 TL670 TG228 TO676 TT1868 TN216 TR90 TM993 TV688 UG256 UA380 AE971 GB44 US1 UY598 UZ998 VU678 VA379 VE58 VN84 YE967 ZM260 ZW263'.split(' ').reduce((m, s) => (m[s.slice(0, 2)] = s.slice(2), m), {});

pages.push(page({
  file: 'book-diagnostic/index.html', current: 'book-diagnostic/',
  title: 'Book a 45-Minute Oracle Fusion HCM Diagnostic | AppsDreamz',
  desc: 'Book a free 45-minute diagnostic call with an AppsDreamz Oracle Fusion HCM specialist. We reply with a proposed time within one working day.',
  crumbs: [['book-diagnostic/', 'Book a diagnostic']],
  body: p => `<section class="sect book"><div class="in split">
<div class="book-copy">
  ${eyebrow('Free · 45 minutes')}
  <h1>Book a 45-minute diagnostic</h1>
  <p class="lead">Tell us where you are: planning, mid-programme, or live and not settled. You leave with our read on whether the problem is configuration, data, process or scope.</p>
  ${list(['With the consultant who would do the work', 'No obligation, and no sales hand-off', 'A proposed time within one working day', 'If the problem is not ours to fix, we say so on the call'], 'ticks')}
  <dl class="facts light"><div><dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div><div><dt>Hours</dt><dd>Mon to Fri, 09:00 to 18:00 GST (UTC+4)</dd></div></dl>
</div>
<div class="formcard" id="book">
  <form id="bookform" novalidate>
    <h2 class="fh2" id="form-title">Request my diagnostic call</h2>
    <div class="errsum" id="errsum" role="alert" tabindex="-1" hidden></div>
    <input type="hidden" name="type" id="f-type" value="diagnostic">
    <div class="f"><label for="f-name">Full name</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
    <div class="f"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
    <div class="f2">
      <div class="f"><label for="f-company">Company</label><input id="f-company" name="company" type="text" autocomplete="organization" required></div>
      <div class="f"><label for="f-title">Job title</label><input id="f-title" name="title" type="text" autocomplete="organization-title" required></div>
    </div>
    <div class="f"><label for="f-country">Country / region</label><select id="f-country" name="country" required><option value="">Select</option>${COUNTRIES.map(([c, n]) => `<option value="${n.replace(/&/g, '&amp;')}" data-r="${c}">${n.replace(/&/g, '&amp;')}</option>`).join('')}</select></div>
    <div class="f"><span class="lbl" id="ph-l">Phone <span class="opt">(optional)</span></span><div class="phone"><select id="f-cc" name="cc" aria-label="Country code"><option value="">Code</option>${COUNTRIES.filter(([c]) => DIAL[c]).map(([c, n]) => `<option value="+${DIAL[c]}" data-r="${c}">${n.replace(/&/g, '&amp;')} (+${DIAL[c]})</option>`).join('')}</select><input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" aria-labelledby="ph-l" placeholder="Phone number"></div></div>
    <fieldset class="f"><legend>Oracle Fusion HCM status</legend><div class="radios">
      ${['Implementing now', 'Live and stable', 'Live but experiencing issues', 'Planning an implementation', 'Other'].map((s, i) => `<label class="radio"><input type="radio" name="status" value="${s}"${i === 0 ? ' required' : ''}><span>${s}</span></label>`).join('')}
    </div></fieldset>
    <div class="f"><label for="f-challenge">Primary challenge</label><select id="f-challenge" name="challenge" required><option value="">Select</option>${['Payroll', 'Statutory compliance', 'Integrations', 'Implementation delay', 'Post-go-live instability', 'Managed support', 'AI / Agent Studio', 'Other'].map(c => `<option>${c}</option>`).join('')}</select></div>
    <div class="f"><label for="f-msg">Anything we should read before the call? <span class="opt">(optional)</span></label><textarea id="f-msg" name="message" rows="4"></textarea></div>
    <label class="consent"><input type="checkbox" id="f-consent" name="consent" required><span>I agree to AppsDreamz using these details to arrange the call. They go only to the AppsDreamz team.</span></label>
    <button class="btn full" type="submit">Request my diagnostic call${ARROW}</button>
    <p class="fnote">You will receive a proposed time within one working day.</p>
  </form>
  <div class="done" id="done" hidden tabindex="-1">
    <h2 class="fh2">Thank you<span id="done-name"></span>.</h2>
    <p>Your email app has opened with your request addressed to ${EMAIL}. Press send, and you will receive a proposed time within one working day.</p>
    <p class="fnote">If your email app did not open, write to <a href="mailto:${EMAIL}">${EMAIL}</a> with the same details.</p>
  </div>
</div>
</div></section>`
}));

/* ---------- CONTACT ---------- */
pages.push(page({
  file: 'contact/index.html', current: 'contact/',
  title: 'Contact AppsDreamz | Oracle Fusion HCM Specialists',
  desc: 'Contact AppsDreamz about Oracle Fusion HCM implementation, payroll, remediation or managed support. Replies within one working day.',
  crumbs: [['contact/', 'Contact']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Contact')}<h1>Tell us where you are: planning, mid-programme, or live and not settled.</h1>
<p class="lead">Forty-five minutes, no obligation, and you leave with our read on whether the problem is configuration, data, process or scope.</p>
<div class="row">${btn(p + 'book-diagnostic/', 'Book a 45-minute diagnostic')}<a class="btn ghost-dark" href="${p}book-diagnostic/?type=partner">Request a partner conversation</a></div></div></section>
<section class="sect"><div class="in"><dl class="facts light wide">
  <div><dt>Email</dt><dd><a href="mailto:${EMAIL}">${EMAIL}</a></dd></div>
  <div><dt>Response time</dt><dd>One working day</dd></div>
  <div><dt>Hours</dt><dd>Mon to Fri, 09:00 to 18:00 GST (UTC+4)</dd></div>
  <div><dt>Registered office</dt><dd>Bengaluru, India</dd></div>
</dl></div></section>`
}));

/* ---------- MORE SOLUTIONS ---------- */
pages.push(servicePage({
  slug: 'solutions/payroll-run-readiness/', parent: ['solutions/payroll-run-readiness/', 'Solutions'], name: 'Payroll Run Readiness',
  title: 'Oracle Fusion Payroll Run Readiness | AppsDreamz',
  desc: 'Is your first Oracle Fusion payroll run ready? Parallel-run reconciliation, element and balance checks, statutory file dry-runs and go/no-go criteria.',
  eyebrow: 'Solutions · Before the first live run', h1: 'Is your first Fusion payroll run ready?',
  lead: 'A go/no-go reading of the first live payroll cycle: what has been reconciled, what has only been tested, and what will surface as a correction after pay date.',
  cta1: ['book-diagnostic/?type=design-review', 'Request a Design Review'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  problemH: 'Tested is not the same as reconciled',
  problem: ['Parallel runs that “mostly match” hide the variances that matter: a retro that only fires on a mid-cycle change, an allowance that drops out of the gratuity base, a statutory file that validates but misclassifies a component.', 'The first live run is the most expensive place to find them, because every error becomes a payslip correction in front of employees.'],
  who: 'Programme owners, payroll leads and finance controllers approaching the first live payroll cycle on Oracle Fusion.',
  extra: p => `<section class="sect"><div class="in">${sectionHead('Go / no-go', 'What we check before the first live run')}
    <div class="tablewrap"><table class="plain"><thead><tr><th scope="col">Check</th><th scope="col">Go when</th></tr></thead><tbody>
    ${[['Parallel-run reconciliation', 'Every variance is explained, owned and either fixed or accepted in writing'], ['Element set against contracts', 'Each pay component traces to a contract term or policy'], ['Balances and cutover values', 'Opening balances reconcile to the legacy system'], ['Retro behaviour', 'Mid-cycle changes produce the expected retro in a test cycle'], ['Gratuity and end-of-service base', 'Contract-eligible allowances are included and the provision reconciles'], ['Statutory files', 'A dry-run file reconciles to the payroll register, component by component'], ['Upstream handoffs', 'Offer, mobilisation, absence and compensation data arrive complete and on time'], ['Exception triage', 'A named owner and a same-day route exist for each exception type']].map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}
    </tbody></table></div></div></section>`,
  what: ['Parallel-run variance analysis', 'Element set and fast formula review', 'Cutover balance reconciliation', 'Retro scenario testing', 'Statutory file dry-run reconciliation', 'Upstream handoff checks', 'Exception triage plan for the first cycles', 'Go/no-go recommendation'],
  deliverables: ['Variance register with owners', 'Go/no-go criteria and status', 'First-cycle exception triage plan'],
  approach: 'Run as a Design Review before cutover, or as the Payroll and Statutory scope of a Health Check once real cycles exist.',
  outcomes: ['A go-live decision based on evidence', 'Known residual risk, owned by name', 'Fewer corrections after the first pay date'],
  faq: [
    ['When should readiness be assessed?', 'Before cutover planning is locked, so there is still time to fix what the parallel runs reveal.'],
    ['Is this a separate engagement?', 'It is scoped as a Design Review before go-live, or as the Payroll and Statutory scope of a Health Check after it.'],
  ],
  related: [['solutions/oracle-fusion-hcm-design-review/', 'Design Review', '2–3 days, USD 2,500'], ['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'Designed from the contract'], ['insights/how-to-prepare-payroll-run-readiness/', 'Readiness guide', 'Go/no-go criteria explained']],
}));

pages.push(servicePage({
  slug: 'solutions/india-payroll-statutory-compliance/', parent: ['solutions/india-payroll-statutory-compliance/', 'Solutions'], name: 'India Payroll &amp; Statutory Compliance', area: 'India',
  title: 'India Payroll &amp; Statutory Compliance in Oracle Fusion | AppsDreamz',
  desc: 'Oracle Fusion Payroll for India with a control-first approach: statutory configuration, reconciliation, integrations, reporting and audit readiness.',
  eyebrow: 'Solutions · India', h1: 'India payroll and statutory compliance in Oracle Fusion HCM',
  lead: 'Indian statutory payroll, designed control-first. India is one of seven countries where we have delivered statutory design to date, including work with our delivery partners.',
  cta1: ['book-diagnostic/', 'Book a 45-minute diagnostic'], cta2: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'],
  problemH: 'Many obligations, many places to drift',
  problem: ['Indian payroll combines central and state obligations: provident fund, employees’ state insurance, professional tax and labour welfare fund that vary by state, income-tax deduction and reporting, gratuity and statutory bonus.', 'Each depends on how pay components are classified and where employees are based. A component classified once and never revisited, or a state rule applied to the wrong location, does not raise an error. It shows up in a return, a reconciliation or an audit.'],
  who: 'Indian employers on Oracle Fusion HCM, and multinationals running Indian payroll in Fusion alongside other countries.',
  what: ['Payroll design and configuration for India', 'Pay component classification for each statutory base', 'Location-driven state rules', 'Compliance controls before each cycle is released', 'Payroll-to-GL and statutory reconciliation', 'Attendance, bank and statutory integrations', 'Statutory reporting', 'Audit readiness'],
  deliverables: ['Statutory rules register for India', 'Component classification matrix', 'Reconciliation pack', 'Pre-release control checklist'],
  approach: 'Control-first: every statutory base is defined from the pay components that feed it, and checked before each cycle is released, not after the return is filed.',
  outcomes: ['Statutory bases you can explain component by component', 'Reconciled returns', 'Audit evidence ready when asked'],
  faq: [
    ['Do you deliver Indian statutory payroll in Fusion?', 'Yes. India is one of seven countries where we have delivered statutory design to date, alongside the UAE, Saudi Arabia, Malaysia, Singapore, the United Kingdom and the United States, including work with our delivery partners. We confirm on the first call which components your scope covers.'],
    ['Can you review an existing India payroll configuration?', 'Yes, through the Payroll and Statutory scope of a Health Check, which reads three closed cycles against your contracts and policies.'],
  ],
  related: [['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'All countries'], ['industries/india/', 'India', 'Market overview'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'Payroll &amp; Statutory scope']],
}));

pages.push(servicePage({
  slug: 'solutions/ebs-fusion-hcm-coexistence/', parent: ['solutions/ebs-fusion-hcm-coexistence/', 'Solutions'], name: 'E-Business Suite and Fusion HCM Coexistence',
  title: 'Oracle EBS to Fusion HCM Coexistence &amp; Upgrade | AppsDreamz',
  desc: 'Run Oracle E-Business Suite HR and payroll alongside Fusion HCM, or move between them: coexistence design, data ownership, integrations and upgrade path.',
  eyebrow: 'Solutions · EBS and Fusion', h1: 'Running E-Business Suite and Fusion HCM side by side',
  lead: 'Fusion HCM across the suite, and E-Business Suite where a client still runs it, including the upgrade and coexistence work between the two.',
  problemH: 'Two systems, one employee record',
  problem: ['During a phased move, some processes run in Fusion and some stay in E-Business Suite. Unless ownership of each data item is explicit, the two systems drift, and payroll inherits the difference.'],
  who: 'Organisations on Oracle E-Business Suite HR or payroll planning a move to Fusion HCM, or running both during a phased transition.',
  what: ['Coexistence model and data ownership', 'Integration between EBS and Fusion', 'Payroll split and reconciliation', 'Upgrade and migration path', 'Cutover sequencing'],
  deliverables: ['Coexistence design', 'Data ownership matrix', 'Integration specifications', 'Migration and cutover plan'],
  approach: 'Decide which system owns each data item, design the integration to that ownership, and reconcile payroll across the boundary every cycle.',
  outcomes: ['A clear owner for every data item', 'Payroll that reconciles across both systems', 'A move to Fusion sequenced by risk'],
  faq: [['Do you still work on E-Business Suite?', 'Yes, where a client still runs it, including upgrade and coexistence work with Fusion HCM.']],
  related: [['services/oracle-fusion-hcm-implementation/', 'Implementation', 'Design to go-live'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Interfaces that fail loudly'], ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', 'Before you commit']],
}));

/* ---------- HEALTH CHECK REPORT STRUCTURE ---------- */
pages.push(page({
  file: 'solutions/oracle-fusion-hcm-health-check/report-structure/index.html', current: 'solutions/oracle-fusion-hcm-health-check/',
  title: 'Health Check Report Structure | AppsDreamz Oracle Fusion HCM',
  desc: 'What an AppsDreamz Oracle Fusion HCM Health Check report contains: findings register, evidence, remediation plan sequenced by exposure and effort, and walkthrough.',
  crumbs: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check'], ['solutions/oracle-fusion-hcm-health-check/report-structure/', 'Report structure']],
  body: p => {
    const secs = [
      ['Scope and method', 'The scope chosen (Payroll and Statutory, or Talent and Recruiting), the cycles read, the contracts and artefacts used, and who we spoke to.'],
      ['Summary for leadership', 'The handful of findings that carry the most exposure, in plain language, for HR, IT and finance.'],
      ['Findings register', 'Every finding with its inspection area, the evidence from your own runs, its exposure and the effort to fix it.'],
      ['Evidence', 'Extracts from closed cycles and configuration that show each finding, so your team can verify it independently.'],
      ['Remediation plan', 'Fixes sequenced by exposure and effort, each with a suggested owner, so you can act on it with or without us.'],
      ['Walkthrough', 'A session with HR, IT and finance in the room to go through the findings and agree next steps.'],
    ];
    return `<section class="hero sub"><div class="in">${eyebrow('Health Check · Report structure')}<h1>What the Health Check report contains</h1><p class="lead">The structure every Health Check report follows. The content is always your own evidence, from your own payroll runs.</p><div class="row">${btn(p + 'book-diagnostic/?type=health-check', 'Request the Health Check scope')}</div></div></section>
<section class="sect"><div class="in"><ol class="steps">${secs.map(([h, t], i) => `<li><span class="snum">${String(i + 1).padStart(2, '0')}</span><div><h2>${h}</h2><p>${t}</p></div></li>`).join('')}</ol></div></section>
${ctaBand(p, 'Want to see whether the Health Check fits?', 'We confirm the scope on a 45-minute call before anything is signed.', ['book-diagnostic/?type=health-check', 'Request the Health Check scope'])}`;
  }
}));

/* ---------- INDUSTRIES ---------- */
function industryPage(o) {
  return page({
    file: o.slug + 'index.html', title: o.title, desc: o.desc, current: o.slug,
    crumbs: [['industries/', 'Industries'], [o.slug, o.name]],
    body: p => `<section class="hero sub"><div class="in">${eyebrow(o.eyebrow)}<h1>${o.h1}</h1><p class="lead">${o.lead}</p><div class="row">${btn(p + 'book-diagnostic/', 'Book a 45-minute diagnostic')}</div>${o.facts ? `<dl class="facts">${o.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}</div></section>
<section class="sect"><div class="in split"><div>${sectionHead('What is different here', o.diffH)}</div><div>${list(o.diff, 'ticks')}</div></div></section>
<section class="sect tint"><div class="in">${sectionHead('Where to start', 'Relevant services and solutions')}<div class="svc-grid">${o.links.map(([h, t, d]) => `<a class="svc" href="${p}${h}"><h2>${t}</h2><p>${d}</p><span class="tlink">Read more${ARROW}</span></a>`).join('')}</div></div></section>
${o.proof ? `<section class="sect"><div class="in proofline"><p class="eyebrow"><span class="sl" aria-hidden="true"></span>Proof</p><p>${o.proof}</p><a class="tlink" href="${p}clients-results/case-studies/">Read the case studies${ARROW}</a></div></section>` : ''}
${ctaBand(p, o.ctaH, 'Forty-five minutes with the consultant who would do the work.')}`
  });
}
pages.push(page({
  file: 'industries/index.html', current: 'industries/',
  title: 'Markets We Serve | AppsDreamz Oracle Fusion HCM',
  desc: 'AppsDreamz delivers Oracle Fusion HCM for GCC employers, Indian enterprises and global organisations adding countries to a Fusion HCM estate.',
  crumbs: [['industries/', 'Industries']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Industries and markets')}<h1>Statutory reality, country by country</h1><p class="lead">Statutory delivery to date, including work with our delivery partners, covers the UAE, Saudi Arabia, India, Malaysia, Singapore, the United Kingdom and the United States. The failure mechanisms are the same in any jurisdiction.</p></div></section>
<section class="sect"><div class="in"><div class="svc-grid">${NAV[2].items.slice(1).map(([h, t, d]) => `<a class="svc" href="${p}${h}"><h2>${t}</h2><p>${d}</p><span class="tlink">Read more${ARROW}</span></a>`).join('')}</div></div></section>
${ctaBand(p, 'Operating somewhere else?', 'Tell us where. We will say on the first call exactly what we have and have not delivered in your countries.')}`
}));
pages.push(industryPage({
  slug: 'industries/gcc-middle-east/', name: 'GCC / Middle East',
  title: 'Oracle Fusion HCM for GCC Employers | AppsDreamz',
  desc: 'Oracle Fusion HCM for GCC and Middle East employers: WPS, GOSI, gratuity, expatriate mobilisation and multi-entity payroll',
  eyebrow: 'Industries · GCC / Middle East', h1: 'Oracle Fusion HCM for GCC employers',
  lead: 'Expatriate workforces, contract-driven gratuity and statutory files that must be correct, not only valid. Delivered in the UAE and Saudi Arabia.',
  facts: [['Delivered', 'UAE, Saudi Arabia'], ['Case studies', '2 GCC / Middle East']],
  diffH: 'What makes GCC payroll hard in Fusion',
  diff: ['Visa, medical and mobilisation dates tracked outside onboarding, arriving at payroll as retro', 'Gratuity bases that must follow the allowances each contract makes eligible', 'WPS files that pass validation but misclassify a component', 'GOSI contribution bases that drift after a salary restructure', 'Leave accrual that must follow the contract, not the calendar', 'End-of-service provisions that must reconcile to the balance sheet'],
  links: [['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'WPS, GOSI, gratuity'], ['solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs', 'Mobilisation to payroll'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500']],
  proof: 'A GCC property and facilities group taken live in phases, and a Middle East media group whose gratuity base did not match its contracts.',
  ctaH: 'Running Fusion HCM in the Gulf?',
}));
pages.push(industryPage({
  slug: 'industries/india/', name: 'India',
  title: 'Oracle Fusion HCM for Indian Enterprises | AppsDreamz',
  desc: 'Oracle Fusion HCM and Payroll for Indian enterprises: statutory payroll, state-level rules, attendance integrations and audit readiness.',
  eyebrow: 'Industries · India', h1: 'Oracle Fusion HCM for Indian enterprises',
  lead: 'Indian statutory payroll in Fusion, designed control-first.',
  facts: [['Statutory delivery', 'India']],
  diffH: 'What makes Indian payroll hard in Fusion',
  diff: ['Central and state obligations that depend on where each employee is based', 'Statutory bases that depend on how each pay component is classified', 'Attendance and time data from several sources', 'Income-tax deduction and reporting through the year', 'Audit evidence that has to be produced on request'],
  links: [['solutions/india-payroll-statutory-compliance/', 'India Payroll &amp; Statutory Compliance', 'Control-first design'], ['services/oracle-fusion-hcm-integrations/', 'Integrations', 'Attendance, bank, statutory'], ['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500']],
  ctaH: 'Running Fusion payroll in India?',
}));
pages.push(industryPage({
  slug: 'industries/global-enterprises/', name: 'Global Enterprises',
  title: 'Multi-Country Oracle Fusion HCM for Global Enterprises | AppsDreamz',
  desc: 'Adding countries to an Oracle Fusion HCM estate: global design with country-by-country statutory payroll, integrations and cross-module controls.',
  eyebrow: 'Industries · Global enterprises', h1: 'Adding countries to an Oracle Fusion HCM estate',
  lead: 'A global design only holds if each country’s statutory reality is designed in, not adapted afterwards. We deliver for organisations worldwide, and tell you plainly where we have delivered statutory design before.',
  facts: [['Statutory delivery to date', 'UAE, Saudi Arabia, India'], ['Engagements', 'Worldwide']],
  diffH: 'What goes wrong when countries are added',
  diff: ['A global element set that does not match local contracts', 'Statutory files bolted on after the global design is fixed', 'Integrations that differ by country without a shared control model', 'Payroll exceptions that only appear in one country’s cycle', 'Release regression that tests one country and assumes the rest'],
  links: [['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'Country by country'], ['solutions/ebs-fusion-hcm-coexistence/', 'EBS and Fusion coexistence', 'Phased moves'], ['services/oracle-fusion-hcm-managed-support/', 'Managed Support', 'Multi-country regression']],
  ctaH: 'Adding a country to Fusion HCM?',
}));

/* ---------- LEADERSHIP ---------- */
pages.push(page({
  file: 'about/leadership/index.html', current: 'about/leadership/',
  title: 'Leadership &amp; Experts | AppsDreamz',
  desc: 'Meet the AppsDreamz founders. The consultant who scopes your Oracle Fusion HCM work is the consultant who does it.',
  crumbs: [['about/', 'About'], ['about/leadership/', 'Leadership &amp; experts']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Leadership &amp; experts')}<h1>The consultant who scopes the work does the work.</h1><p class="lead">AppsDreamz is deliberately small and senior-only. There is no pyramid of unnamed staff behind the people you meet.</p></div></section>
<section class="sect"><div class="in split"><div>${sectionHead('Founders', 'Who you will be speaking to')}<p class="body">We turn down work we cannot staff with a senior consultant, and we say on the first call if the problem is not ours to fix.</p></div><div>${founders(p)}</div></div></section>
${ctaBand(p, 'Speak to the people who would do the work.', 'Forty-five minutes, no obligation.')}`
}));

/* ---------- RISK CHECKLIST ---------- */
const CHECKLIST = [
  ['Contracts and elements', [
    ['Every pay component traces to an employment contract term or written policy', 'Components configured from a template drift from what contracts promise'],
    ['Allowances eligible for gratuity or end-of-service are listed per contract type', 'An excluded allowance understates the provision every month'],
  ]],
  ['Statutory files', [
    ['Each statutory file reconciles to the payroll register, component by component', 'A file can pass validation and still misclassify a component'],
    ['Contribution bases are re-checked after every salary restructure', 'Bases drift silently after a restructure'],
  ]],
  ['Accruals and provisions', [
    ['Leave accrual follows contractual entitlement, not the calendar', 'Accrual on the calendar misstates the leave liability'],
    ['The end-of-service provision reconciles to the balance sheet each month', 'An unreconciled provision surfaces at settlement'],
  ]],
  ['Retro and exceptions', [
    ['The same exception has not appeared in three consecutive cycles', 'Recurring exceptions point to a configuration cause, not data entry'],
    ['Retro results are checked against expected values for mid-cycle changes', 'Wrong retro results compound across cycles'],
    ['Payroll does not depend on corrections made in the days before pay date', 'The workaround has become the process'],
  ]],
  ['Handoffs into payroll', [
    ['Offer terms land in the employee record without re-keying', 'Offers approved outside the system arrive with the wrong terms'],
    ['Visa and mobilisation dates are captured in onboarding, not a spreadsheet', 'Dates tracked outside the system arrive at payroll as a retro'],
    ['A compensation restructure triggers a recalculation of the gratuity base', 'Nothing recalculates the provision on its own'],
  ]],
  ['Integrations and releases', [
    ['Each interface checks expected volume and totals before sending', 'Partial posts are found weeks later through the data they corrupted'],
    ['A named owner is alerted when an interface posts partially', 'Unowned failures wait for the reconciliation'],
    ['Each quarterly update is regression-tested against your configuration', 'An untested update can break a fast formula'],
  ]],
];
const CL_COUNT = CHECKLIST.reduce((n, [, items]) => n + items.length, 0);
pages.push(page({
  file: 'resources/payroll-statutory-risk-checklist/index.html', current: 'resources/payroll-statutory-risk-checklist/',
  title: 'Oracle Fusion HCM Payroll &amp; Statutory Risk Checklist | AppsDreamz',
  desc: `A free ${CL_COUNT}-point self-assessment for Oracle Fusion HCM payroll and statutory risk: contracts, statutory files, provisions, retro, handoffs and integrations.`,
  crumbs: [['insights/', 'Insights'], ['resources/payroll-statutory-risk-checklist/', 'Risk checklist']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Free resource · Self-assessment')}<h1>Oracle Fusion HCM Payroll &amp; Statutory Risk Checklist</h1><p class="lead">${CL_COUNT} checks drawn from the failure points we see most often. Tick each one you can evidence today. Anything you cannot tick is worth a closer look.</p><p class="sub-lead">Nothing you tick leaves this page. Use your browser’s print function to save a copy.</p></div></section>
<section class="sect"><div class="in split cl-split">
  <form class="checklist" id="checklist" aria-label="Risk checklist">
  ${CHECKLIST.map(([g, items], gi) => `<fieldset><legend>${g}</legend>${items.map(([c, why], ii) => `<label class="cl"><input type="checkbox" name="c${gi}-${ii}"><span><b>${c}</b><span class="why">${why}</span></span></label>`).join('')}</fieldset>`).join('')}
  </form>
  <aside class="clscore" aria-live="polite"><p class="eyebrow"><span class="sl" aria-hidden="true"></span>Your result</p><p class="big"><span id="cl-n">0</span> / ${CL_COUNT}</p><p id="cl-msg">Tick the checks you can evidence today.</p>${btn(p + 'book-diagnostic/?type=health-check', 'Request the Health Check scope')}<p class="fnote dark-note">The Health Check tests these points against your own closed cycles and contracts.</p></aside>
</div></section>
${related(p, [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500'], ['insights/10-signs-your-fusion-hcm-programme-needs-a-health-check/', '10 signs you need a Health Check', 'Article'], ['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'WPS, GOSI, gratuity']])}`
}));

/* ---------- INSIGHTS ---------- */
const AUTHOR = { '@type': 'Organization', name: 'AppsDreamz', url: SITE };
const ARTICLES = [];
function article(o) {
  ARTICLES.push(o);
  return page({
    file: 'insights/' + o.slug + '/index.html', current: 'insights/', title: o.seo || (o.title + ' | AppsDreamz'), desc: o.desc,
    crumbs: [['insights/', 'Insights'], ['insights/' + o.slug + '/', o.short]],
    schema: [{ '@type': 'Article', headline: o.title.replace(/&amp;/g, '&'), description: o.desc, author: AUTHOR, publisher: { '@id': SITE + '#org' }, datePublished: o.date, dateModified: o.date, mainEntityOfPage: SITE + 'insights/' + o.slug + '/' }, ...(o.faq ? [faqSchema(o.faq)] : [])],
    body: p => `<article class="post"><header class="hero sub"><div class="in">${eyebrow(o.cat)}<h1>${o.title}</h1><p class="lead">${o.lead}</p><p class="byline">AppsDreamz Oracle Fusion HCM practice · <time datetime="${o.date}">${new Date(o.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p></div></header>
<div class="sect"><div class="in post-body">${o.body(p)}
${o.faq ? `<h2>Frequently asked</h2>${faq(o.faq)}` : ''}
<aside class="post-cta"><h2>${o.ctaH}</h2><p>${o.ctaBody}</p><div class="row">${btn(p + o.cta[0], o.cta[1])}</div></aside>
</div></div></article>
${related(p, o.related)}`
  });
}
pages.push(article({
  slug: 'health-check-vs-design-review', seo: 'Fusion HCM Health Check vs Design Review | AppsDreamz', short: 'Health Check vs Design Review', date: '2026-11-08', cat: 'Oracle Fusion HCM guides',
  title: 'Oracle Fusion HCM Health Check versus Design Review: which do you need?',
  desc: 'How to choose between a three-week Oracle Fusion HCM Health Check and a two-to-three-day Design Review: timing, scope, inputs, deliverables and price.',
  lead: 'Both are fixed-fee entry points. The right one depends on a single question: is the system already running payroll?',
  body: p => `<h2>The short answer</h2><p>If you are <b>not live yet</b>, you need the Design Review. If you are <b>live</b>, or late enough in testing to have real cycles to read, you need the Health Check.</p>
<div class="tablewrap"><table class="plain"><thead><tr><th scope="col"></th><th scope="col">Design Review</th><th scope="col">Health Check</th></tr></thead><tbody>
<tr><th scope="row">Stage</th><td>Before build or before go-live</td><td>Live, or late in testing</td></tr>
<tr><th scope="row">Reads</th><td>The design: documents and configuration workbooks</td><td>The system: a read-only copy of production and three closed cycles</td></tr>
<tr><th scope="row">Covers</th><td>Enterprise structure, payroll relationship model, element set against contracts, integration inventory, test approach, go-live shape</td><td>One scope: Payroll and Statutory, or Talent and Recruiting, across eight inspection areas</td></tr>
<tr><th scope="row">Duration</th><td>2 to 3 days</td><td>3 weeks</td></tr>
<tr><th scope="row">Fee</th><td>USD 2,500 fixed</td><td>USD 7,500 fixed, credited in full against work from the findings</td></tr>
<tr><th scope="row">You receive</th><td>Findings rated by risk, design decisions to revisit, walkthrough</td><td>Written report, findings register with evidence, remediation plan, walkthrough</td></tr>
</tbody></table></div>
<h2>Why the Design Review comes first when you can</h2><p>A design decision costs least before it is built. Once a payroll relationship model or element set has been configured, tested and migrated against, changing it means rework across every module that depends on it. Two to three days of independent reading at design sign-off is the cheapest assurance a programme can buy.</p>
<h2>Why the Health Check needs real cycles</h2><p>Localisation and handoff failures rarely show up in a design document. A gratuity base that excludes a contract-eligible allowance looks fine on paper and in the payslip. It only shows when you read closed cycles line by line against the contracts, which is what the Health Check does.</p>
<h2>Checklist: which one fits</h2>${list(['Payroll has not run live yet: <b>Design Review</b>', 'SIT or UAT is under way and parallel runs exist: <b>either</b>, depending on what is in doubt', 'Live with recurring exceptions: <b>Health Check</b>, Payroll and Statutory scope', 'Hiring happening outside the system: <b>Health Check</b>, Talent and Recruiting scope', 'Implementation partner has handed over with open issues: <b>Health Check</b>'], 'ticks')}`,
  faq: [['Can we do both?', 'Yes. Many programmes take a Design Review before build and a Health Check after the first live cycles.'], ['Is the Design Review fee credited?', 'The Health Check fee is credited in full against work commissioned from its findings. Ask us on the call about the Design Review.']],
  ctaH: 'Not sure which you need?', ctaBody: 'Tell us where you are on a 45-minute call and we will recommend one, or neither.', cta: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  related: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', '3 weeks · USD 7,500'], ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', '2–3 days · USD 2,500'], ['resources/payroll-statutory-risk-checklist/', 'Risk checklist', 'Free self-assessment']],
}));
pages.push(article({
  slug: '10-signs-your-fusion-hcm-programme-needs-a-health-check', seo: '10 Signs Your Fusion HCM Programme Needs a Health Check', short: '10 signs you need a Health Check', date: '2026-11-08', cat: 'Implementation risk',
  title: '10 signs your Oracle Fusion HCM programme needs a Health Check',
  desc: 'Ten signs an Oracle Fusion HCM implementation is running on workarounds: recurring payroll exceptions, wrong retro, gratuity gaps, off-system approvals and more.',
  lead: 'Every cycle completes, so nobody calls it broken. These are the signs that the workaround has become the process.',
  body: p => `<p>None of these raise an error in Fusion. Each is a sign that correction work has moved out of the system and into people’s weeks. Score yourself as you read: one point per sign you recognise.</p>
<ol class="signs">${[
  ['The same payroll exception appears every cycle', 'A recurring exception almost always has a configuration cause. Correcting it each month treats the symptom.'],
  ['Retro produces results nobody can explain', 'Wrong retro compounds: each cycle corrects the last one and introduces the next difference.'],
  ['Exceptions are worked through just before pay date', 'If the payroll team relies on the days before pay date to fix exceptions, the process now depends on that buffer.'],
  ['The gratuity base does not match the contracts', 'An allowance the contract makes eligible, left out of the base, understates the end-of-service provision every month.'],
  ['Statutory files pass validation but finance still finds differences', 'A file can be structurally valid and still misclassify a component.'],
  ['Contribution bases were not rechecked after a restructure', 'A salary restructure moves the base. Nothing recalculates it on its own.'],
  ['Offers are approved over email', 'When the approval chain in the system stalls, offers are approved outside it and re-keyed, with the errors that brings.'],
  ['Visa or mobilisation dates live in a spreadsheet', 'Dates tracked outside onboarding arrive at payroll late, as a retro.'],
  ['A performance cycle closed because HR chased it manually', 'The system recorded the outcome; it did not run the process.'],
  ['Your implementation partner has rolled off with open issues', 'Open defects at hand-over become your team’s workload, usually without anyone sizing it.'],
].map(([h, t]) => `<li><h3>${h}</h3><p>${t}</p></li>`).join('')}</ol>
<h2>How to read your score</h2>${list(['<b>0–2:</b> keep monitoring; run the risk checklist each quarter', '<b>3–5:</b> a focused Health Check will likely pay for itself in avoided correction work', '<b>6 or more:</b> the workaround is the process; start with a Health Check before any further change'], 'ticks')}
<p>The Health Check reads three closed cycles line by line against your employment contracts and returns a remediation plan sequenced by exposure and effort. It costs USD 7,500, takes three weeks, and the fee is credited in full against work commissioned from the findings.</p>`,
  ctaH: 'Recognised three or more?', ctaBody: 'Request the Health Check scope. We confirm it on a 45-minute call before anything is signed.', cta: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'],
  related: [['solutions/oracle-fusion-hcm-health-check/', 'Health Check', 'What it covers'], ['services/oracle-fusion-hcm-remediation-stabilisation/', 'Remediation &amp; Stabilisation', 'Acting on the findings'], ['resources/payroll-statutory-risk-checklist/', 'Risk checklist', 'Free self-assessment']],
}));
pages.push(article({
  slug: 'wps-gosi-gratuity-end-of-service-validation', seo: 'Validating WPS, GOSI, Gratuity and EOS in Fusion HCM', short: 'WPS, GOSI, gratuity and EOS', date: '2026-11-08', cat: 'Statutory localisation',
  title: 'WPS, GOSI, gratuity and end-of-service provisions: what Oracle Fusion HCM teams must validate',
  desc: 'How GCC payroll teams on Oracle Fusion HCM should validate WPS files, GOSI contribution bases, gratuity bases and end-of-service provisions.',
  lead: 'In the Gulf, these four are where a technically clean implementation most often goes wrong without raising a flag.',
  body: p => `<p>Each of the four below can be configured, tested and running without a single error in Fusion, and still be wrong. The common cause is the same: the configuration follows a standard template instead of the employment contracts it is meant to implement.</p>
<h2>1. WPS files: classification, not just validation</h2><p>A WPS file can pass every structural check and still place a pay component in the wrong category. <b>Validate:</b> reconcile each file to the payroll register component by component, and confirm each component’s classification against its contract or policy source.</p>
<h2>2. GOSI contribution base after restructures</h2><p>The contribution base depends on which components are included. A salary restructure changes those components, and the base does not recalculate itself. <b>Validate:</b> after every restructure, recompute the base for a sample of affected employees and compare it with what payroll used.</p>
<h2>3. Gratuity base: what the contract makes eligible</h2><p>A gratuity base that leaves out an allowance the contract makes eligible does not throw an error. Payroll runs and the payslip looks right. <b>Validate:</b> list, per contract type, which allowances are eligible, then compare that list with the elements that actually feed the base.</p>
<h2>4. End-of-service provision to the balance sheet</h2><p>If the base is understated, the provision is understated every month until someone leaves and the accrual does not cover the settlement. <b>Validate:</b> reconcile the provision to the balance sheet monthly, and recompute it independently for a sample of long-tenure employees.</p>
<h2>Diagnostic checklist</h2>${list(['Every WPS file reconciles to the payroll register by component', 'Each component’s WPS classification has a documented source', 'GOSI bases are recomputed after every restructure', 'Gratuity-eligible allowances are listed per contract type', 'Elements feeding the gratuity base match that list', 'The end-of-service provision reconciles to the balance sheet monthly', 'Leave accrual follows contractual entitlement, not the calendar'], 'ticks')}`,
  faq: [['Which GCC countries do you deliver?', 'The UAE and Saudi Arabia. For other GCC countries we tell you on the first call what we have and have not done.'], ['Can you review our existing WPS and GOSI set-up?', 'Yes. It is part of the Payroll and Statutory scope of the Health Check.']],
  ctaH: 'Want these checked against your own cycles?', ctaBody: 'The Payroll and Statutory scope of the Health Check reads three closed cycles line by line against your contracts.', cta: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'],
  related: [['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'UAE and Saudi Arabia'], ['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'Designed from the contract'], ['resources/payroll-statutory-risk-checklist/', 'Risk checklist', 'Free self-assessment']],
}));
pages.push(article({
  slug: 'how-to-prepare-payroll-run-readiness', seo: 'Preparing for Fusion Payroll Run Readiness | AppsDreamz', short: 'Payroll run readiness', date: '2026-11-08', cat: 'Payroll compliance',
  title: 'How to prepare for an Oracle Fusion HCM payroll run readiness assessment',
  desc: 'Go/no-go criteria for the first live Oracle Fusion payroll run: parallel-run variances, balances, retro, statutory files, handoffs and exception triage.',
  lead: 'The first live run is the most expensive place to find a payroll error. This is how to find them before it.',
  body: p => `<h2>Start from the variances, not the matches</h2><p>Parallel runs are usually reported as a match rate. The useful output is the list of variances, each with an explanation and an owner. A variance explained as “timing” or “rounding” without evidence is still open.</p>
<h2>Go/no-go criteria</h2>${list(['Every parallel-run variance is explained, owned and fixed or accepted in writing', 'Each pay component traces to a contract term or policy', 'Opening balances reconcile to the legacy system', 'Mid-cycle changes produce the expected retro in a test cycle', 'Contract-eligible allowances are in the gratuity base and the provision reconciles', 'A dry-run statutory file reconciles to the payroll register', 'Offer, mobilisation, absence and compensation data arrive complete and on time', 'Each exception type has a named owner and a same-day route'], 'ticks')}
<h2>What to prepare</h2>${list(['Parallel-run outputs and variance lists', 'Element set and contract templates', 'Cutover balance files', 'A dry-run statutory file', 'The interface schedule for the first cycle'], 'dash')}`,
  ctaH: 'Approaching your first live run?', ctaBody: 'A Design Review before cutover tests your readiness against these criteria.', cta: ['book-diagnostic/?type=design-review', 'Request a Design Review'],
  related: [['solutions/payroll-run-readiness/', 'Payroll Run Readiness', 'Go/no-go'], ['solutions/oracle-fusion-hcm-design-review/', 'Design Review', '2–3 days · USD 2,500'], ['services/oracle-fusion-payroll-statutory-localisation/', 'Payroll &amp; Statutory Localisation', 'Designed from the contract']],
}));
pages.push(page({
  file: 'insights/index.html', current: 'insights/',
  title: 'Oracle Fusion HCM Insights | AppsDreamz',
  desc: 'Practical guides for Oracle Fusion HCM buyers: Health Check or Design Review, payroll run readiness, GCC statutory validation and implementation risk.',
  crumbs: [['insights/', 'Insights']],
  body: p => `<section class="hero sub"><div class="in">${eyebrow('Insights')}<h1>Guides for Oracle Fusion HCM buyers</h1><p class="lead">Practical frameworks and checklists from the failure points we see in payroll, statutory localisation and cross-module handoffs.</p></div></section>
<section class="sect"><div class="in"><div class="svc-grid">
<a class="svc res" href="${p}resources/payroll-statutory-risk-checklist/"><p class="cmeta">Free resource</p><h2>Payroll &amp; Statutory Risk Checklist</h2><p>${CL_COUNT}-point self-assessment</p><span class="tlink">Use the checklist${ARROW}</span></a>
${ARTICLES.map(a => `<a class="svc" href="${p}insights/${a.slug}/"><p class="cmeta">${a.cat}</p><h2>${a.title}</h2><p>${a.lead}</p><span class="tlink">Read${ARROW}</span></a>`).join('')}
</div></div></section>
${ctaBody0(p)}`
}));
function ctaBody0(p) { return ctaBand(p, 'Prefer to talk it through?', 'Forty-five minutes with the consultant who would do the work.'); }

/* ---------- LEGAL ---------- */
pages.push(page({
  file: 'legal/privacy/index.html', current: 'legal/privacy/',
  title: 'Privacy Notice | AppsDreamz', desc: 'How AppsDreamz handles personal information sent through this website.',
  crumbs: [['legal/privacy/', 'Privacy notice']],
  body: p => `<section class="sect"><div class="in post-body legal-body">${eyebrow('Legal')}<h1>Privacy notice</h1><p class="byline">Last updated ${new Date(TODAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<h2>Who we are</h2><p>AppsDreamz (CIN U72900KA2022PTC158740), registered office in Bengaluru, Karnataka, India. Contact: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>What we collect</h2><p>When you use the booking form, the details you enter (name, work email, company, job title, country, optional phone, Fusion HCM status, challenge and message) are placed into an email in your own email app. Nothing is sent to us until you send that email. We receive only what you send.</p>
<h2>How we use it</h2><p>To reply to you, arrange the call you asked for and manage any engagement that follows. We do not sell your details or use them for unrelated marketing.</p>
<h2>Third parties involved in serving this site</h2><p>This site is hosted on GitHub Pages and loads fonts from Google Fonts. Like any web server, these services receive your IP address and browser details to deliver the page. We do not run analytics or advertising trackers on this site.</p>
<h2>Retention</h2><p>We keep enquiry emails for as long as needed to respond and to manage any engagement that follows.</p>
<h2>Your choices</h2><p>Email <a href="mailto:${EMAIL}">${EMAIL}</a> to ask what we hold about you, or to correct or delete it.</p>
</div></section>`
}));
pages.push(page({
  file: 'legal/cookies/index.html', current: 'legal/cookies/',
  title: 'Cookie Notice | AppsDreamz', desc: 'How AppsDreamz uses cookies and similar storage, and how to change your consent choice.',
  crumbs: [['legal/cookies/', 'Cookie notice']],
  body: p => `<section class="sect"><div class="in post-body legal-body">${eyebrow('Legal')}<h1>Cookie notice</h1><p class="byline">Last updated ${new Date(TODAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<p>When you first visit, a banner asks whether you accept analytics. You can choose <strong>Essential only</strong> or <strong>Accept analytics</strong>, and change your mind at any time with the <button type="button" class="linkbtn" data-cookie-settings>Cookie settings</button> link in the footer of every page.</p>
<h2>Essential storage</h2>
<p>We store your consent choice in your browser (local storage, key <code>ad-consent</code>) so we do not ask again on every page. It holds only "granted" or "denied" and the date you chose. It is not sent to us.</p>
<h2>Analytics (only with consent)</h2>
<p>No analytics tool is active on this website today. If we switch one on, it loads only after you select Accept analytics, and we will name the provider, the cookies it sets and how long they last here before it goes live.</p>
<h2>What we never use</h2>
<p>No advertising, retargeting or social media tracking cookies. The risk checklist keeps your ticks only on the page while it is open.</p>
<h2>Third parties</h2>
<p>Fonts are loaded from Google Fonts, which receives your IP address to deliver them.</p>
<p>Questions: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
</div></section>`
}));

/* ---------- redirects from old URLs ---------- */
const REDIRECTS = { 'services.html': 'services/', 'modules.html': 'services/#modules', 'how-we-work.html': 'about/delivery-method/', 'work.html': 'clients-results/case-studies/', 'engagements.html': 'solutions/oracle-fusion-hcm-health-check/', 'practices.html': 'about/', 'contact.html': 'contact/' };
for (const [from, to] of Object.entries(REDIRECTS)) {
  fs.writeFileSync(path.join(ROOT, from), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Moved | AppsDreamz</title><meta name="robots" content="noindex"><link rel="canonical" href="${SITE}${to.split('#')[0]}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page has moved to <a href="${to}">${to}</a>.</p></body></html>\n`);
}

/* ---------- sitemap ---------- */
const urls = pages.map(f => SITE + f.replace(/index\.html$/, ''));
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
console.log('built', pages.length, 'pages');
