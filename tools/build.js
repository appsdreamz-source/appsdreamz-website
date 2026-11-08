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
    ['solutions/gcc-payroll-localisation/', 'GCC Payroll Localisation', 'UAE and Saudi Arabia'],
    ['solutions/cross-module-handoff-remediation/', 'Cross-Module Handoffs', 'What Oracle does not validate'],
  ]},
  { label: 'Clients & Results', items: [
    ['clients-results/', 'Overview', 'Evidence, not promises'],
    ['clients-results/case-studies/', 'Case studies', 'Two engagements, anonymised'],
    ['clients-results/partner-delivery/', 'Partner & white-label delivery', 'The team other firms subcontract to'],
  ]},
  { label: 'About', items: [
    ['about/', 'Company & founders', 'Senior-only, deliberately small'],
    ['about/delivery-method/', 'Delivery method', 'How an engagement runs'],
    ['about/security-data-handling/', 'Security & data handling', 'How we treat your tenant and data'],
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
    <a class="btn head-cta" href="${p}book-diagnostic/">Book a 45-minute diagnostic</a></nav>
</div></header>`;
}

function footer(p) {
  return `<footer class="site-foot"><span class="foot-slash" aria-hidden="true"></span><div class="in">
  <div class="fcol about"><img src="${p}images/appsdreamz-logo.png" alt="AppsDreamz" width="1200" height="456" class="flogo"><p>Oracle Fusion HCM implementation, remediation, statutory payroll and managed support. Senior consultants only.</p></div>
  <div class="fcol"><p class="fh">Services</p><ul>${NAV[0].items.slice(1).map(([h, t]) => `<li><a href="${p}${h}">${t}</a></li>`).join('')}</ul></div>
  <div class="fcol"><p class="fh">Solutions</p><ul>${NAV[1].items.map(([h, t]) => `<li><a href="${p}${h}">${t}</a></li>`).join('')}</ul><p class="fh">Company</p><ul><li><a href="${p}clients-results/">Clients &amp; Results</a></li><li><a href="${p}about/">About</a></li><li><a href="${p}about/security-data-handling/">Security &amp; data handling</a></li></ul></div>
  <div class="fcol contactc"><p class="fh">Contact</p><p><a href="mailto:${EMAIL}">${EMAIL}</a><br>Mon to Fri, 09:00 to 18:00 GST (UTC+4)<br>Replies within one working day</p><p>Dubai · Riyadh · Bengaluru</p>${btn(p + 'book-diagnostic/', 'Book a diagnostic', 'btn small')}</div>
</div>
<div class="in legal"><p>Registered office: Fourth Floor, No. 752/5/12 A, Flat No. 10, Sneha Residency South Block, NGR Layout, Babu Reddy Road, Rupena Agrahara, Bengaluru, Bengaluru Urban, Karnataka 560068, India. CIN U72900KA2022PTC158740.</p><p>AppsDreamz is an independent consultancy. © ${new Date().getFullYear()} AppsDreamz.</p></div>
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
<link rel="stylesheet" href="${p}assets/site.css">
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
<script src="${p}assets/site.js" defer></script>
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
pages.push(page({
  file: 'index.html',
  title: 'Oracle Fusion HCM Implementation, Payroll &amp; Remediation | AppsDreamz',
  desc: 'Specialist Oracle Fusion HCM partner: implementation, remediation, statutory payroll localisation, integrations and managed support. Fixed-fee Health Check, USD 7,500.',
  current: '',
  body: p => `
<section class="hero home"><div class="in">
  <div class="hero-copy">
    ${eyebrow('Oracle Fusion HCM specialists · GCC, India and global')}
    <h1>Oracle Fusion HCM, from design to the payroll run that has to be right.</h1>
    <p class="lead">AppsDreamz helps Oracle Fusion HCM customers implement, remediate, localise, integrate, and operate HR and payroll processes with confidence.</p>
    <p class="sub-lead">We find and fix the configuration, data, process, integration, and statutory-localisation failures that standard validation misses, before they reach payroll, compliance, or the balance sheet.</p>
    <div class="row">${btn(p + 'book-diagnostic/', 'Book a 45-minute diagnostic')}<a class="btn ghost-dark" href="#problems">See how we fix Fusion HCM issues</a></div>
  </div>
  <figure class="board" aria-labelledby="board-cap">
    <figcaption id="board-cap" class="figcap">FIG. 01 — Payroll run control register · illustrative</figcaption>
    <table>
      <thead><tr><th scope="col">Check</th><th scope="col">Read against</th><th scope="col">Status</th></tr></thead>
      <tbody>
      ${[['Gratuity base', 'Contract-eligible allowances'], ['WPS file', 'Component classification'], ['GOSI base', 'Salary after restructure'], ['Leave accrual', 'Contractual entitlement'], ['Offer → employee record', 'Approved offer terms'], ['End-of-service provision', 'Balance sheet']].map(([a, b], i) => `<tr style="--i:${i}"><td>${a}</td><td>${b}</td><td><span class="st"><span class="chk">Checking</span><span class="ok">Reconciled</span></span></td></tr>`).join('')}
      </tbody>
    </table>
    <p class="board-foot">Six of the checks a Health Check runs on every closed cycle.</p>
  </figure>
</div>
<div class="in"><ul class="proofbar">
  <li>8 partner and white-label delivery relationships</li>
  <li>Oracle Fusion HCM, Payroll, Integrations and Statutory Localisation</li>
  <li>GCC and India payroll expertise</li>
  <li>Fixed-fee diagnostic and design-review options</li>
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

${ctaBand(p, 'Get a specialist view of your Oracle Fusion HCM risk.', 'Book a 45-minute diagnostic call with an AppsDreamz Oracle Fusion HCM specialist. We will help you identify the highest-risk configuration, data, integration, payroll, or statutory-localisation issues.', undefined, ['solutions/oracle-fusion-hcm-health-check/', 'See how the Health Check works'])}
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
    ['Which countries have you localised?', 'Statutory delivery to date covers the UAE, Saudi Arabia and India. For any other country we tell you on the first call exactly what we have and have not done.'],
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
  desc: 'Oracle Fusion Payroll design and statutory localisation for the UAE, Saudi Arabia and India: WPS, GOSI, gratuity, end-of-service, leave accrual and reconciliation.',
  eyebrow: 'Services · Localise', h1: 'Oracle Fusion Payroll, designed from the contract and reconciled to the balance sheet',
  lead: 'Statutory design for each country you operate in, delivered to date across the UAE, Saudi Arabia and India.',
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
  problemH: 'Localisation goes wrong without raising a flag',
  problem: ['A gratuity base that excludes contract-eligible allowances does not throw an error. Payroll runs, the payslip looks right, and the end-of-service provision is understated every month until someone leaves and the accrual does not cover the settlement.', 'The same pattern sits in statutory files that pass validation but misclassify a pay component, in contribution bases that drift after a salary restructure, and in leave accrual that follows the calendar rather than the contract. None of it appears as a defect. All of it eventually appears as a number that has to be explained.'],
  who: 'Payroll directors, finance controllers and HRIS leads in the GCC and India, and multinationals adding those countries.',
  what: ['Payroll design and configuration', 'Element sets designed from employment contracts', 'Fast formulas and retro behaviour', 'Gratuity and end-of-service bases', 'WPS file structure and component classification', 'GOSI contribution base after every restructure', 'Leave accrual on contractual entitlement', 'Reconciliation: payroll to GL, provision to balance sheet', 'Exception management', 'Audit readiness'],
  deliverables: ['Element-to-contract mapping', 'Statutory rules register per country', 'Reconciliation pack', 'Exception catalogue with owners'],
  approach: 'We start from the employment contracts and design the element set to them, rather than configuring the standard localisation and reconciling afterwards.',
  outcomes: ['Accurate, auditable payroll runs', 'Provisions that reconcile to the balance sheet', 'Statutory files that are correct, not only valid'],
  proof: 'A Middle East media and communications group came to us with a gratuity base that did not match its employment contracts.',
  faq: [
    ['Which countries have you delivered?', 'The UAE, Saudi Arabia and India. The mechanism is the same in any jurisdiction, and we tell you on the first call what we have and have not done for yours.'],
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
  cta1: ['book-diagnostic/?type=health-check', 'Request the Health Check scope'], cta2: ['book-diagnostic/', 'Book a 45-minute diagnostic'],
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
    <div class="tablewrap"><table class="plain"><tbody>
      ${[['Gratuity base', 'Which allowances the contract makes eligible'], ['Performance management', 'Goals, performance, succession'], ['Learning', 'Catalogue, assignment, compliance evidence'], ['Leave accrual and end-of-service provision', 'Contractual entitlement, reconciled to the balance sheet'], ['Recruiting', 'Requisition, offer, approval chain'], ['Onboarding', 'Visa, medical, mobilisation dates'], ['Offer-to-record handoff', 'Offer terms landing correctly in the employee record'], ['Mobilisation-to-payroll handoff', 'Dates tracked outside onboarding, before they arrive at payroll as a retro']].map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}
    </tbody></table></div>
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
  facts: [['Delivered', 'United Arab Emirates, Saudi Arabia'], ['Run from', 'Dubai · Riyadh · Bengaluru']],
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
  desc: 'Oracle validates each Fusion HCM module on its own terms. We design and fix the checks between them: offer to record, mobilisation to payroll, pay to statutory return.',
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
<section class="sect tint"><div class="in split"><div>${sectionHead('Coverage', 'Modules and markets')}<p class="body">Statutory delivery to date: United Arab Emirates, Saudi Arabia, India. Engagements run from Dubai, Riyadh and Bengaluru.</p></div><div>${MODULES}</div></div></section>
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
  desc: 'Consultancies and systems integrators subcontract Oracle Fusion HCM payroll and statutory work to AppsDreamz, delivered by named senior consultants under their badge.',
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
<section class="sect"><div class="in split"><div>${sectionHead('Where partners use us', 'The work partners bring')}</div><div>${list(['Payroll and statutory design inside your implementation', 'GCC and India localisation', 'Stabilisation of a programme in trouble', 'Integrations and release regression', 'Specialist review before go-live'], 'ticks')}</div></div></section>
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
  <div><dt>Delivery locations</dt><dd>Dubai · Riyadh · Bengaluru</dd></div>
  <div><dt>Registered office</dt><dd>Bengaluru, India</dd></div>
  <div><dt>CIN</dt><dd>U72900KA2022PTC158740</dd></div>
  <div><dt>Hours</dt><dd>Mon to Fri, 09:00 to 18:00 GST (UTC+4)</dd></div>
</dl></div></div></section>
${related(p, [['about/delivery-method/', 'Delivery method', 'How an engagement runs'], ['about/security-data-handling/', 'Security &amp; data handling', 'How we treat your data'], ['clients-results/', 'Clients &amp; Results', 'Evidence, not promises']])}`
}));

pages.push(page({
  file: 'about/delivery-method/index.html', current: 'about/delivery-method/',
  title: 'How an AppsDreamz Engagement Runs | Delivery Method',
  desc: 'From a 45-minute diagnostic to a fixed-fee Design Review or Health Check, remediation, go-live and managed operations: how AppsDreamz delivers Oracle Fusion HCM work.',
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
  <div><dt>Delivery locations</dt><dd>Dubai · Riyadh · Bengaluru</dd></div>
  <div><dt>Registered office</dt><dd>Bengaluru, India</dd></div>
</dl></div></section>`
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
