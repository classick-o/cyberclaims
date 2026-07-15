// Integration tests against the live server on :3000. Senior-QA pass: happy paths,
// validation, authz, injection, robustness, and cleanup of everything it creates.
import { readFileSync } from 'node:fs';
const BASE = 'http://localhost:3000';
const ADMIN = { email: 'qa-admin@cyberclaims.net', password: 'QaTest!2026x' };
const EDITOR = { email: 'qa-editor@cyberclaims.net', password: 'QaTest!2026x' };

let pass = 0, fail = 0;
const fails = [];
const findings = [];
function ok(name, cond, detail = '') {
  if (cond) { pass++; process.stdout.write('.'); }
  else { fail++; fails.push(`${name}${detail ? ' - ' + detail : ''}`); process.stdout.write('F'); }
}
const finding = (sev, what) => findings.push(`[${sev}] ${what}`);

// cookie jar: { name: value }
function parseSetCookie(res) {
  const out = {};
  // node fetch exposes getSetCookie() (undici)
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    const [pair] = c.split(';');
    const i = pair.indexOf('=');
    out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  return out;
}
const cookieHeader = (jar) => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');

async function req(method, path, { body, form, jar, headers = {}, redirect = 'manual' } = {}) {
  const h = { ...headers };
  if (jar) {
    h.Cookie = cookieHeader(jar);
    if (jar.cc_csrf && method !== 'GET') h['x-csrf-token'] = jar.cc_csrf;
  }
  let payload;
  if (form) { payload = new URLSearchParams(form).toString(); h['Content-Type'] = 'application/x-www-form-urlencoded'; }
  else if (body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] = 'application/json'; }
  const res = await fetch(BASE + path, { method, headers: h, body: payload, redirect });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: res.headers, setCookies: parseSetCookie(res) };
}

async function login({ email, password }) {
  const r = await req('POST', '/api/admin/auth/login', { body: { email, password } });
  return { ...r.setCookies, _status: r.status, _admin: r.json?.admin };
}

const created = { posts: [], categories: [], authors: [], leads: [], media: [] };

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
async function testAuth() {
  console.log('\n\n AUTH ');
  ok('GET /me without cookie → 401', (await req('GET', '/api/admin/auth/me')).status === 401);
  const bad = await req('POST', '/api/admin/auth/login', { body: { email: ADMIN.email, password: 'wrong' } });
  ok('login wrong password → 401', bad.status === 401);
  ok('login wrong password: generic message', /Incorrect email or password/.test(bad.json?.message ?? ''),
     bad.json?.message);
  const unknown = await req('POST', '/api/admin/auth/login', { body: { email: 'nobody@nowhere.test', password: 'x' } });
  ok('login unknown email → 401 (same message = no enumeration)',
     unknown.status === 401 && unknown.json?.message === bad.json?.message);
  ok('login bad-email-format → 400 validation', (await req('POST', '/api/admin/auth/login', { body: { email: 'not-email', password: 'x' } })).status === 400);

  const jar = await login(ADMIN);
  ok('login valid → 200 + session cookie', jar._status === 200 && !!jar.cc_session, `status ${jar._status}`);
  ok('login sets csrf cookie', !!jar.cc_csrf);
  ok('login returns no password_hash', jar._admin && !('password_hash' in jar._admin));
  ok('GET /me with cookie → 200', (await req('GET', '/api/admin/auth/me', { jar })).status === 200);

  // CSRF - sent via direct fetch so the req() helper can't auto-fill the token
  const noCsrf = await req('POST', '/api/admin/posts', { body: { status: 'draft', translations: {} }, jar: { cc_session: jar.cc_session } });
  ok('mutation without CSRF header → 403', noCsrf.status === 403, `got ${noCsrf.status}`);
  const wrongCsrf = await fetch(BASE + '/api/admin/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: `cc_session=${jar.cc_session}; cc_csrf=${jar.cc_csrf}`, 'x-csrf-token': 'deadbeef' },
    body: '{}',
  });
  ok('mutation with mismatched CSRF → 403', wrongCsrf.status === 403, `got ${wrongCsrf.status}`);

  // tampered / garbage JWT
  const tampered = await req('GET', '/api/admin/auth/me', { jar: { cc_session: jar.cc_session.slice(0, -3) + 'xxx' } });
  ok('tampered JWT → 401', tampered.status === 401);
  ok('garbage JWT → 401', (await req('GET', '/api/admin/auth/me', { jar: { cc_session: 'not.a.jwt' } })).status === 401);

  // an unsigned/alg-none forged token must be rejected
  const forged = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.' + Buffer.from(JSON.stringify({ sub: 1, role: 'admin' })).toString('base64url') + '.';
  ok('alg:none forged JWT → 401', (await req('GET', '/api/admin/auth/me', { jar: { cc_session: forged } })).status === 401);

  // role gating: editor cannot GDPR-delete a lead
  const ejar = await login(EDITOR);
  ok('editor logs in', ejar._status === 200);
  const editorDelete = await req('DELETE', '/api/admin/leads/999999', { jar: ejar });
  ok('editor DELETE lead → 403 (admin-only)', editorDelete.status === 403, `got ${editorDelete.status}`);
  const adminDelete = await req('DELETE', '/api/admin/leads/999999', { jar });
  ok('admin DELETE missing lead → 404 (passes role gate)', adminDelete.status === 404, `got ${adminDelete.status}`);

  // logout clears the cookie
  const lo = await req('POST', '/api/admin/auth/logout', { jar });
  ok('logout → 200', lo.status === 200);
  ok('logout clears session cookie', 'cc_session' in lo.setCookies && lo.setCookies.cc_session === '');

  return jar; // (still valid - logout only tells the browser to drop it)
}

// ═══════════════════════════════════════════════════════════════════════════
// POSTS
// ═══════════════════════════════════════════════════════════════════════════
async function testPosts(jar) {
  console.log('\n\n POSTS ');
  ok('list posts → 200', (await req('GET', '/api/admin/posts', { jar })).status === 200);
  ok('GET missing post → 404', (await req('GET', '/api/admin/posts/999999', { jar })).status === 404);

  // create valid
  const mk = (over = {}) => ({
    status: 'draft', featured: false, category_id: null, author_id: null, cover_media_id: null,
    translations: { en: { title: 'QA Integration Post', body_html: '<p>Hello <strong>world</strong>.</p>', slug: 'qa-integration-post', ...over } },
  });
  const create = await req('POST', '/api/admin/posts', { body: mk(), jar });
  ok('create valid post → 201 + id', create.status === 201 && Number.isInteger(create.json?.id), JSON.stringify(create.json));
  const id = create.json?.id; if (id) created.posts.push(id);

  // round-trip: GET then PUT unchanged must succeed (the null-SEO bug)
  const got = await req('GET', `/api/admin/posts/${id}`, { jar });
  const rt = await req('PUT', `/api/admin/posts/${id}`, {
    body: { ...got.json.post, translations: got.json.post.translations }, jar,
  });
  ok('GET→PUT round-trip → 200', rt.status === 200, `status ${rt.status} ${JSON.stringify(rt.json)}`);

  // XSS in body is sanitised on write - verify via GET
  const xss = await req('POST', '/api/admin/posts', { body: mk({ slug: 'qa-xss', title: 'QA XSS test', body_html: '<p>ok</p><script>alert(document.cookie)</script><img src=x onerror=alert(1)>' }), jar });
  if (xss.json?.id) created.posts.push(xss.json.id);
  const xssGot = await req('GET', `/api/admin/posts/${xss.json.id}`, { jar });
  const storedBody = xssGot.json?.post?.translations?.en?.body_html ?? '';
  ok('stored body has no <script>', !/<script/i.test(storedBody), storedBody.slice(0, 80));
  ok('stored body has no onerror', !/onerror/i.test(storedBody));

  // reserved slug rejected
  const reserved = await req('POST', '/api/admin/posts', { body: mk({ slug: 'about-us', title: 'Reserved slug probe' }), jar });
  ok('reserved slug → 400', reserved.status === 400, `got ${reserved.status}`);
  ok('reserved slug error names the field', reserved.json?.errors?.[0]?.field === 'slug', JSON.stringify(reserved.json));

  // slug collision → friendly 400 on the slug field
  const dup = await req('POST', '/api/admin/posts', { body: mk({ slug: 'qa-integration-post', title: 'Different title same slug' }), jar });
  ok('duplicate slug → 400', dup.status === 400, `got ${dup.status} ${JSON.stringify(dup.json)}`);
  ok('duplicate slug error is on slug field', dup.json?.errors?.[0]?.field === 'slug', JSON.stringify(dup.json));

  // bad FK (category that doesn't exist) → friendly 400, not 500
  const badFk = await req('POST', '/api/admin/posts', { body: { ...mk({ slug: 'qa-badfk', title: 'Bad FK probe' }), category_id: 987654 }, jar });
  ok('nonexistent category_id → 400 (not 500)', badFk.status === 400, `got ${badFk.status} ${JSON.stringify(badFk.json)}`);
  if (badFk.status === 500) finding('HIGH', 'POST /posts with a nonexistent category_id returns 500 instead of a friendly 400');

  // invalid payloads
  ok('empty body → 400', (await req('POST', '/api/admin/posts', { body: mk({ body_html: '' }), jar })).status === 400);
  ok('2-char title → 400', (await req('POST', '/api/admin/posts', { body: mk({ title: 'ab', slug: 'qa-short' }), jar })).status === 400);
  ok('no translations → 400', (await req('POST', '/api/admin/posts', { body: { status: 'draft', translations: {} }, jar })).status === 400);
  ok('malformed JSON → 400', (await req('POST', '/api/admin/posts', { jar, headers: { 'Content-Type': 'application/json' }, body: undefined, ...{ } , }) , true) && (await (async () => {
    const r = await fetch(BASE + '/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf }, body: '{bad json' });
    return r.status;
  })()) === 400);

  // status endpoint + featured exclusivity
  const p2 = await req('POST', '/api/admin/posts', { body: mk({ slug: 'qa-feature-a', title: 'QA feature A' }), jar });
  const p3 = await req('POST', '/api/admin/posts', { body: mk({ slug: 'qa-feature-b', title: 'QA feature B' }), jar });
  if (p2.json?.id) created.posts.push(p2.json.id);
  if (p3.json?.id) created.posts.push(p3.json.id);
  await req('PUT', `/api/admin/posts/${p2.json.id}`, { body: { ...mk({ slug: 'qa-feature-a', title: 'QA feature A' }), featured: true, status: 'published' }, jar });
  await req('PUT', `/api/admin/posts/${p3.json.id}`, { body: { ...mk({ slug: 'qa-feature-b', title: 'QA feature B' }), featured: true, status: 'published' }, jar });
  const feats = await req('GET', '/api/admin/posts', { jar });
  const featCount = (feats.json?.posts ?? []).filter((p) => p.featured).length;
  ok('at most one featured post', featCount <= 1, `found ${featCount} featured`);

  // bad status value
  ok('status endpoint rejects bad value → 400', (await req('POST', `/api/admin/posts/${id}/status`, { body: { status: 'nope' }, jar })).status === 400);

  // robustness: hostile pagination must degrade to the default, never 500
  for (const qs of ['?limit=abc', '?limit=-5', '?offset=abc', '?limit=1e9', '?limit=abc&offset=-1', '?limit=%27']) {
    const r = await req('GET', `/api/admin/posts${qs}`, { jar });
    ok(`posts ${qs} → 200`, r.status === 200 && Array.isArray(r.json?.posts), `got ${r.status}`);
    if (r.status === 500) finding('MEDIUM', `GET /admin/posts${qs} returns 500 (non-numeric LIMIT/OFFSET reaches MySQL)`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TAXONOMY
// ═══════════════════════════════════════════════════════════════════════════
async function testTaxonomy(jar) {
  console.log('\n\n TAXONOMY ');
  const cat = (over = {}) => ({ key_slug: 'qa-cat', color: '#8b5bbd', sort_order: 0, translations: { en: { name: 'QA Cat' } }, ...over });
  const c1 = await req('POST', '/api/admin/categories', { body: cat(), jar });
  ok('create category → 201', c1.status === 201, `got ${c1.status} ${JSON.stringify(c1.json)}`);
  if (c1.json?.id) created.categories.push(c1.json.id);

  // duplicate key_slug - a friendly 400, and no raw MySQL text leaked
  const cdup = await req('POST', '/api/admin/categories', { body: cat(), jar });
  ok('duplicate category key_slug → 400 (not 500)', cdup.status === 400, `got ${cdup.status} ${JSON.stringify(cdup.json)}`);
  ok('duplicate category error does not leak the DB constraint',
     !/Duplicate entry|for key|categories\./i.test(JSON.stringify(cdup.json)), JSON.stringify(cdup.json));
  if (cdup.status === 500) finding('MEDIUM', 'POST /admin/categories with an existing key_slug returns 500');
  if (cdup.json?.id) created.categories.push(cdup.json.id);

  // bad colour / bad key_slug
  ok('bad hex colour → 400', (await req('POST', '/api/admin/categories', { body: cat({ key_slug: 'qa-c2', color: 'red' }), jar })).status === 400);
  ok('key_slug with spaces → 400', (await req('POST', '/api/admin/categories', { body: cat({ key_slug: 'has spaces' }), jar })).status === 400);

  // authors
  const a1 = await req('POST', '/api/admin/authors', { body: { name: 'QA Author', role: 'Tester' }, jar });
  ok('create author → 201', a1.status === 201, `got ${a1.status} ${JSON.stringify(a1.json)}`);
  if (a1.json?.id) created.authors.push(a1.json.id);
  ok('1-char author name → 400', (await req('POST', '/api/admin/authors', { body: { name: 'A' }, jar })).status === 400);
  const aput = await req('PUT', `/api/admin/authors/${a1.json.id}`, { body: { name: 'QA Author Renamed', role: 'Senior Tester' }, jar });
  ok('update author → 200', aput.status === 200);
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA
// ═══════════════════════════════════════════════════════════════════════════
async function testMedia(jar) {
  console.log('\n\n MEDIA ');
  ok('list media → 200', (await req('GET', '/api/admin/media', { jar })).status === 200);
  // upload with no file
  const noFile = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf, 'Content-Type': 'multipart/form-data; boundary=X' }, body: '--X--\r\n' });
  ok('upload with no file → 400', noFile.status === 400, `got ${noFile.status}`);

  // a text file dressed as an image (magic-byte sniff must reject it)
  const fd = new FormData();
  fd.append('file', new Blob(['#!/bin/sh\nrm -rf /'], { type: 'image/png' }), 'evil.png');
  const fake = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf }, body: fd });
  ok('non-image bytes with image/png type → 400', fake.status === 400, `got ${fake.status}`);

  // a real image on disk (undici's Blob path mangles inline base64, so read a file)
  const realImg = new Uint8Array(readFileSync(new URL('../public/logo-mark.webp', import.meta.url)));
  const fd2 = new FormData();
  fd2.append('file', new Blob([realImg], { type: 'image/webp' }), 'logo.webp');
  fd2.append('alt', 'QA test image');
  const up = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf }, body: fd2 });
  const upJson = await up.json().catch(() => null);
  ok('valid image upload → 201', up.status === 201, `got ${up.status} ${JSON.stringify(upJson)}`);
  ok('upload re-encoded to webp', upJson?.media?.mime === 'image/webp', upJson?.media?.mime);
  if (upJson?.media?.id) created.media.push(upJson.media.id);

  // corrupt-but-sniffable image: valid PNG header, garbage body. Must be a friendly 400,
  // not a 500 leaking the raw libvips message ("vipspng: libpng read error").
  const corrupt = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(64).fill(0x41)]);
  const fd3 = new FormData();
  fd3.append('file', new Blob([corrupt], { type: 'image/png' }), 'corrupt.png');
  const bad = await fetch(BASE + '/api/admin/media', { method: 'POST', headers: { Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf }, body: fd3 });
  const badJson = await bad.json().catch(() => null);
  ok('corrupt image → 400 (not 500)', bad.status === 400, `got ${bad.status}`);
  ok('corrupt image error does not leak libvips internals',
     !/vips|libpng|libjpeg|VipsJpeg/i.test(JSON.stringify(badJson)), JSON.stringify(badJson));

  // PATCH alt with an over-length locale - must not 500
  if (upJson?.media?.id) {
    const badLocale = await req('PATCH', `/api/admin/media/${upJson.media.id}`, { body: { locale: 'this-locale-is-way-too-long', alt: 'x' }, jar });
    ok('PATCH media with over-length locale does not 500', badLocale.status !== 500, `got ${badLocale.status}`);
    if (badLocale.status === 500) finding('MEDIUM', 'PATCH /admin/media/:id with a >5-char locale returns 500 (locale is unvalidated → ER_DATA_TOO_LONG on media_translations.locale)');
  }
  // list with junk limit
  const nan = await req('GET', '/api/admin/media?limit=abc', { jar });
  ok('media list ?limit=abc → 200', nan.status === 200, `got ${nan.status}`);
  // the picker asks for exactly 200 - the cap must not clip a legitimate request
  ok('media list ?limit=200 → 200', (await req('GET', '/api/admin/media?limit=200', { jar })).status === 200);
  if (nan.status === 500) finding('MEDIUM', 'GET /admin/media?limit=abc returns 500');
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC LEADS  (turnstile is ON - budget is 5 non-honeypot requests / 15min)
// ═══════════════════════════════════════════════════════════════════════════
async function testLeads(jar) {
  console.log('\n\n LEADS ');
  // honeypot: caught BEFORE the limiter, returns a fake 200 with no insert
  const hp = await req('POST', '/api/lead', { body: { source: 'hero', full_name: 'Bot Bot', email: 'bot@bot.test', _honey: 'gotcha' } });
  ok('honeypot → 200 fake success', hp.status === 200 && hp.json?.success === true, `got ${hp.status}`);

  // validation runs after the limiter: invalid source
  const badSource = await req('POST', '/api/lead', { body: { source: 'evil', full_name: 'Jo Bloggs', email: 'a@b.co' } });
  ok('bad source → 400', badSource.status === 400, `got ${badSource.status}`);

  // valid body, no captcha token → 400 from verifyTurnstile
  const noCaptcha = await req('POST', '/api/lead', { body: { source: 'hero', full_name: 'Jo Bloggs', email: 'a@b.co' } });
  ok('valid body without captcha → 400 captcha error', noCaptcha.status === 400 && noCaptcha.json?.errors?.[0]?.field === 'captcha', `${noCaptcha.status} ${JSON.stringify(noCaptcha.json)}`);

  // admin side
  ok('admin list leads → 200', (await req('GET', '/api/admin/leads', { jar })).status === 200);
  ok('admin lead 404', (await req('GET', '/api/admin/leads/999999', { jar })).status === 404);
  ok('admin patch missing lead → 404', (await req('PATCH', '/api/admin/leads/999999', { body: { status: 'contacted' }, jar })).status === 404);
  ok('admin patch bad status → 400', (await req('PATCH', '/api/admin/leads/1', { body: { status: 'nope' }, jar })).status === 400);
  const csv = await req('GET', '/api/admin/leads/export.csv', { jar });
  ok('CSV export → 200 text/csv', csv.status === 200 && /text\/csv/.test(csv.headers.get('content-type') ?? ''), csv.headers.get('content-type'));
  ok('CSV export not matched as an id', csv.status !== 404);
  // leads list junk limit
  const nan = await req('GET', '/api/admin/leads?limit=abc', { jar });
  ok('leads list ?limit=abc → 200', nan.status === 200, `got ${nan.status}`);
  if (nan.status === 500) finding('MEDIUM', 'GET /admin/leads?limit=abc returns 500');
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY / ROBUSTNESS
// ═══════════════════════════════════════════════════════════════════════════
async function testSecurity(jar) {
  console.log('\n\n SECURITY / ROBUSTNESS ');
  // unmatched /api routes → JSON 404 for every method (the notFound bug we fixed)
  for (const m of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
    const r = await req(m, '/api/does-not-exist', { body: m === 'GET' ? undefined : {}, jar });
    ok(`${m} /api/does-not-exist → JSON 404`, r.status === 404 && r.json?.success === false, `got ${r.status}`);
  }
  // protected route without auth
  ok('GET /admin/posts without auth → 401', (await req('GET', '/api/admin/posts')).status === 401);
  ok('GET /admin/leads without auth → 401', (await req('GET', '/api/admin/leads')).status === 401);

  // SQL injection in a search param must not error or leak
  const sqli = await req('GET', `/api/admin/posts?q=${encodeURIComponent("' OR 1=1 --")}`, { jar });
  ok('SQLi in ?q → 200, parameterised (no 500)', sqli.status === 200, `got ${sqli.status}`);
  const sqli2 = await req('GET', `/api/admin/leads?q=${encodeURIComponent("'; DROP TABLE leads; --")}`, { jar });
  ok('SQLi in leads ?q → 200 (no 500)', sqli2.status === 200, `got ${sqli2.status}`);
  // the table is still there
  ok('leads table survived injection', (await req('GET', '/api/admin/leads', { jar })).status === 200);

  // security headers on the HTML
  const home = await fetch(BASE + '/');
  ok('CSP header present on HTML', !!home.headers.get('content-security-policy'));
  ok('X-Content-Type-Options nosniff', home.headers.get('x-content-type-options') === 'nosniff');
  ok('frame-ancestors none (anti-clickjack)', /frame-ancestors 'none'/.test(home.headers.get('content-security-policy') ?? ''));
  // admin is noindex
  const adminHead = await fetch(BASE + '/admin/');
  ok('/admin noindex header', /noindex/.test(adminHead.headers.get('x-robots-tag') ?? ''), adminHead.headers.get('x-robots-tag'));

  // site 404 is HTML, not JSON
  const site404 = await fetch(BASE + '/definitely-not-a-page-xyz/');
  ok('unknown site path → 404 HTML', site404.status === 404 && /text\/html/.test(site404.headers.get('content-type') ?? ''));

  // oversized JSON body → 413, handled (not a crash)
  const big = 'x'.repeat(2 * 1024 * 1024);
  const oversize = await fetch(BASE + '/api/admin/posts', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookieHeader(jar), 'x-csrf-token': jar.cc_csrf }, body: JSON.stringify({ status: 'draft', translations: { en: { title: 'big', body_html: big } } }) });
  ok('2MB JSON body → 413 (not 500/hang)', oversize.status === 413, `got ${oversize.status}`);
  if (oversize.status === 500) finding('LOW', '2MB JSON body returns 500 instead of 413');

  // uploads dir must not serve dotfiles or traverse
  ok('path traversal on /uploads → not 200', (await fetch(BASE + '/uploads/../package.json')).status !== 200);
}

// ═══════════════════════════════════════════════════════════════════════════
async function cleanup() {
  console.log('\n\n CLEANUP ');
  const jar = await login(ADMIN);
  for (const id of created.posts) await req('DELETE', `/api/admin/posts/${id}`, { jar });
  for (const id of created.categories) await req('DELETE', `/api/admin/categories/${id}`, { jar });
  for (const id of created.authors) await req('DELETE', `/api/admin/authors/${id}`, { jar });
  for (const id of created.media) await req('DELETE', `/api/admin/media/${id}`, { jar });
  console.log(`  removed ${created.posts.length} posts, ${created.categories.length} categories, ${created.authors.length} authors, ${created.media.length} media`);
}

(async () => {
  const jar = await testAuth();
  await testPosts(jar);
  await testTaxonomy(jar);
  await testMedia(jar);
  await testLeads(jar);
  await testSecurity(jar);
  await cleanup();

  console.log(`\n\n══════════════════════════════════════════`);
  console.log(`  INTEGRATION: ${pass} passed, ${fail} failed`);
  if (fails.length) { console.log('\n  FAILURES:'); fails.forEach((f) => console.log('    ✗ ' + f)); }
  if (findings.length) { console.log('\n  FINDINGS:'); [...new Set(findings)].forEach((f) => console.log('    • ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('\nHARNESS CRASH:', e); process.exit(2); });
