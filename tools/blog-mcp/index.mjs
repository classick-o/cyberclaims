#!/usr/bin/env node
// Cyberclaims Blog — MCP server.
//
// Lets an AI assistant (Claude, etc.) create, edit and publish blog posts on the
// Cyberclaims website through its admin API. Share the folder with whoever runs the
// blog; they configure it in their MCP client with three env vars (see README):
//
//   CYBERCLAIMS_BASE_URL   e.g. https://cyberclaims.net   (the live site)
//   CYBERCLAIMS_EMAIL      an admin OR editor account email
//   CYBERCLAIMS_PASSWORD   that account's password
//
// It talks to the same admin API the CMS uses: JWT session cookie + double-submit CSRF.
// Nothing here bypasses the site's own validation or HTML sanitisation — a post created
// through this tool is exactly a post created in the admin panel.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { marked } from 'marked';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const BASE_URL = (process.env.CYBERCLAIMS_BASE_URL || 'https://cyberclaims.net').replace(/\/$/, '');
const EMAIL = process.env.CYBERCLAIMS_EMAIL || '';
const PASSWORD = process.env.CYBERCLAIMS_PASSWORD || '';

// ── API client ──────────────────────────────────────────────────────────────
// A tiny cookie jar + CSRF handler over fetch. The admin session is a 12h JWT cookie;
// on a 401 we log in again once and retry, so a long-lived MCP process just keeps working.
class CyberclaimsClient {
  constructor(baseUrl, email, password) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.password = password;
    this.cookies = {}; // name -> value
  }

  _storeCookies(res) {
    const list = res.headers.getSetCookie?.() ?? [];
    for (const raw of list) {
      const [pair] = raw.split(';');
      const idx = pair.indexOf('=');
      if (idx > 0) this.cookies[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }

  _cookieHeader() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  async login() {
    if (!this.email || !this.password) {
      throw new Error(
        'Missing credentials. Set CYBERCLAIMS_EMAIL and CYBERCLAIMS_PASSWORD in the MCP config.'
      );
    }
    const res = await fetch(`${this.baseUrl}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || `Login failed (HTTP ${res.status}) at ${this.baseUrl}`);
    }
    this._storeCookies(res);
    if (!this.cookies.cc_csrf || !this.cookies.cc_session) {
      throw new Error('Login succeeded but no session cookies were returned.');
    }
    return data.admin;
  }

  /** method: GET/POST/PUT/DELETE. body: {json} or {form: FormData}. Retries once on 401. */
  async request(method, path, { json, form } = {}, _retried = false) {
    if (!this.cookies.cc_session) await this.login();

    const headers = { Cookie: this._cookieHeader() };
    if (method !== 'GET') headers['x-csrf-token'] = this.cookies.cc_csrf;
    let body;
    if (json !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(json);
    } else if (form !== undefined) {
      body = form; // fetch sets the multipart Content-Type + boundary itself
    }

    const res = await fetch(`${this.baseUrl}${path}`, { method, headers, body });

    if (res.status === 401 && !_retried) {
      this.cookies = {};
      await this.login();
      return this.request(method, path, { json, form }, true);
    }

    const data = await res.json().catch(() => null);
    if (!res.ok || (data && data.success === false)) {
      const msg =
        data?.errors?.map?.((e) => `${e.field}: ${e.message}`).join('; ') ||
        data?.message ||
        `HTTP ${res.status} on ${method} ${path}`;
      throw new Error(msg);
    }
    return data;
  }

  get = (p) => this.request('GET', p);
  post = (p, json) => this.request('POST', p, { json });
  put = (p, json) => this.request('PUT', p, { json });
  del = (p) => this.request('DELETE', p);
}

const client = new CyberclaimsClient(BASE_URL, EMAIL, PASSWORD);

// ── helpers ───────────────────────────────────────────────────────────────────
const LOCALES = ['en', 'nl', 'fr', 'de', 'it', 'es', 'pt'];

/** Markdown -> the HTML subset the site allows. Downgrades h1/h5/h6 to h2/h4 because the
 *  server's sanitiser only keeps h2–h4 (h1 is the page's own title). */
function markdownToHtml(md) {
  const html = marked.parse(md, { async: false, gfm: true, breaks: false });
  return String(html)
    .replace(/<(\/?)h1(\s[^>]*)?>/gi, '<$1h2>')
    .replace(/<(\/?)h[56](\s[^>]*)?>/gi, '<$1h4>')
    .trim();
}

/** Resolve a category reference (numeric id, key_slug, or display name) to its id. */
async function resolveCategoryId(ref) {
  if (ref == null || ref === '') return null;
  if (/^\d+$/.test(String(ref))) return Number(ref);
  const { categories } = await client.get('/api/admin/categories?locale=en');
  const needle = String(ref).toLowerCase();
  const hit = categories.find(
    (c) => c.key_slug?.toLowerCase() === needle || c.name?.toLowerCase() === needle
  );
  if (!hit) {
    throw new Error(
      `No category matching "${ref}". Available: ${categories.map((c) => `${c.name} (${c.key_slug}, id ${c.id})`).join('; ')}`
    );
  }
  return hit.id;
}

/** Resolve an author reference (numeric id or name) to its id. */
async function resolveAuthorId(ref) {
  if (ref == null || ref === '') return null;
  if (/^\d+$/.test(String(ref))) return Number(ref);
  const { authors } = await client.get('/api/admin/authors');
  const hit = authors.find((a) => a.name?.toLowerCase() === String(ref).toLowerCase());
  if (!hit) {
    throw new Error(
      `No author matching "${ref}". Available: ${authors.map((a) => `${a.name} (id ${a.id})`).join('; ')}`
    );
  }
  return hit.id;
}

/** Upload an image from a public URL or a local file path. Returns the media record. */
async function uploadImage(source) {
  let buffer;
  let name;
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Could not download image: HTTP ${res.status} for ${source}`);
    buffer = Buffer.from(await res.arrayBuffer());
    name = basename(new URL(source).pathname) || 'image';
  } else {
    buffer = await readFile(source);
    name = basename(source);
  }
  const form = new FormData();
  form.append('file', new Blob([buffer]), name);
  const { media } = await client.request('POST', '/api/admin/media', { form });
  return media;
}

function ok(text) {
  return { content: [{ type: 'text', text }] };
}
function j(obj) {
  return ok(JSON.stringify(obj, null, 2));
}

// ── MCP server ──────────────────────────────────────────────────────────────
const server = new McpServer({ name: 'cyberclaims-blog', version: '1.0.0' });

server.tool(
  'whoami',
  'Verify the connection and show which Cyberclaims account and site this server is using. Run this first if anything seems off.',
  {},
  async () => {
    const me = await client.get('/api/admin/auth/me');
    return j({ site: BASE_URL, account: me.admin });
  }
);

server.tool(
  'list_categories',
  'List the blog categories (with their ids and slugs) so you can assign a post to one.',
  {},
  async () => {
    const { categories } = await client.get('/api/admin/categories?locale=en');
    return j(categories.map((c) => ({ id: c.id, key_slug: c.key_slug, name: c.name })));
  }
);

server.tool(
  'list_authors',
  'List the blog authors (with their ids) so you can attribute a post.',
  {},
  async () => {
    const { authors } = await client.get('/api/admin/authors');
    return j(authors.map((a) => ({ id: a.id, name: a.name, role: a.role })));
  }
);

server.tool(
  'list_posts',
  'List blog posts, most recently updated first. Optionally filter by status or search the title.',
  {
    status: z.enum(['draft', 'published', 'archived']).optional().describe('Filter by status.'),
    search: z.string().optional().describe('Search post titles.'),
    limit: z.number().int().min(1).max(100).default(25).optional(),
  },
  async ({ status, search, limit = 25 }) => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    if (search) qs.set('q', search);
    qs.set('limit', String(limit));
    const { posts, total } = await client.get(`/api/admin/posts?${qs}`);
    return j({
      total,
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        featured: !!p.featured,
        locales: p.locales,
        published_at: p.published_at,
        updated_at: p.updated_at,
      })),
    });
  }
);

server.tool(
  'get_post',
  'Get one post in full, including its body and every translation. Use the id from list_posts.',
  { id: z.number().int().positive() },
  async ({ id }) => {
    const { post } = await client.get(`/api/admin/posts/${id}`);
    return j(post);
  }
);

server.tool(
  'create_post',
  [
    'Create a new blog post on the Cyberclaims site.',
    'Provide the body as Markdown (recommended) or raw HTML. Content is sanitised server-side to',
    'the allowed tags (headings h2–h4, bold/italic, lists, links, images, tables, blockquotes).',
    'By default the post is created as a DRAFT — call publish_post (or pass status:"published") to make it live.',
    'category/author accept a name, slug, or numeric id. cover_image accepts a public URL or a local file path.',
  ].join(' '),
  {
    title: z.string().min(3).max(255),
    body_markdown: z.string().optional().describe('Post body as Markdown. Preferred.'),
    body_html: z.string().optional().describe('Post body as raw HTML (alternative to body_markdown).'),
    excerpt: z.string().max(500).optional().describe('Short summary for cards/SEO. Auto-generated if omitted.'),
    category: z.string().optional().describe('Category name, slug, or id.'),
    author: z.string().optional().describe('Author name or id.'),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    featured: z.boolean().default(false).describe('Make this the single featured hero post.'),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().max(320).optional(),
    keywords: z.array(z.string().max(60)).max(20).optional(),
    cover_image: z.string().optional().describe('Public image URL or local file path for the cover.'),
    cover_media_id: z.number().int().positive().optional().describe('Existing media id for the cover.'),
    locale: z.enum(LOCALES).default('en').describe('Content language.'),
    slug: z.string().max(255).optional().describe('URL slug. Derived from the title if omitted.'),
    published_at: z
      .string()
      .datetime()
      .optional()
      .describe('ISO 8601 date to schedule/backdate publication (only applies when status is published).'),
  },
  async (args) => {
    const body_html = args.body_html || (args.body_markdown ? markdownToHtml(args.body_markdown) : '');
    if (!body_html) throw new Error('Provide body_markdown or body_html.');

    let cover_media_id = args.cover_media_id ?? null;
    if (!cover_media_id && args.cover_image) {
      const media = await uploadImage(args.cover_image);
      cover_media_id = media.id;
    }

    const payload = {
      category_id: await resolveCategoryId(args.category),
      author_id: await resolveAuthorId(args.author),
      cover_media_id,
      featured: args.featured,
      status: args.status,
      published_at: args.published_at || undefined,
      translations: {
        [args.locale]: {
          title: args.title,
          slug: args.slug || undefined,
          excerpt: args.excerpt || undefined,
          body_html,
          seo_title: args.seo_title || undefined,
          seo_description: args.seo_description || undefined,
          keywords: args.keywords || [],
        },
      },
    };

    const { id } = await client.post('/api/admin/posts', payload);
    // Fetch back to return the real slug + public URL.
    const { post } = await client.get(`/api/admin/posts/${id}`);
    const slug = post.translations?.[args.locale]?.slug;
    const url = slug ? `${BASE_URL}/${slug}/` : null;
    return j({
      created: true,
      id,
      status: post.status,
      slug,
      url,
      note: post.status === 'published' ? 'Live now.' : 'Saved as draft — call publish_post to make it live.',
    });
  }
);

server.tool(
  'update_post',
  'Update an existing post. Only the fields you pass are changed; the rest are preserved. Targets the given locale (default en).',
  {
    id: z.number().int().positive(),
    locale: z.enum(LOCALES).default('en'),
    title: z.string().min(3).max(255).optional(),
    body_markdown: z.string().optional(),
    body_html: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    category: z.string().optional(),
    author: z.string().optional(),
    featured: z.boolean().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().max(320).optional(),
    keywords: z.array(z.string().max(60)).max(20).optional(),
    cover_image: z.string().optional(),
    cover_media_id: z.number().int().positive().optional(),
    slug: z.string().max(255).optional(),
  },
  async (args) => {
    const { post } = await client.get(`/api/admin/posts/${args.id}`);
    if (!post) throw new Error(`No post with id ${args.id}.`);

    const existing = post.translations?.[args.locale] ?? {};
    const body_html = args.body_html || (args.body_markdown ? markdownToHtml(args.body_markdown) : existing.body_html);

    let cover_media_id = post.cover_media_id ?? null;
    if (args.cover_media_id) cover_media_id = args.cover_media_id;
    else if (args.cover_image) cover_media_id = (await uploadImage(args.cover_image)).id;

    const payload = {
      category_id: args.category !== undefined ? await resolveCategoryId(args.category) : post.category_id,
      author_id: args.author !== undefined ? await resolveAuthorId(args.author) : post.author_id,
      cover_media_id,
      featured: args.featured ?? !!post.featured,
      status: post.status, // status is changed via set_post_status, not here
      published_at: post.published_at || undefined,
      translations: {
        ...post.translations,
        [args.locale]: {
          title: args.title ?? existing.title,
          slug: args.slug ?? existing.slug ?? undefined,
          excerpt: args.excerpt ?? existing.excerpt ?? undefined,
          body_html,
          seo_title: args.seo_title ?? existing.seo_title ?? undefined,
          seo_description: args.seo_description ?? existing.seo_description ?? undefined,
          keywords: args.keywords ?? existing.keywords ?? [],
        },
      },
    };

    await client.put(`/api/admin/posts/${args.id}`, payload);
    return j({ updated: true, id: args.id, locale: args.locale });
  }
);

server.tool(
  'publish_post',
  'Publish a post (make it live). Shortcut for set_post_status with status "published".',
  { id: z.number().int().positive() },
  async ({ id }) => {
    await client.post(`/api/admin/posts/${id}/status`, { status: 'published' });
    const { post } = await client.get(`/api/admin/posts/${id}`);
    const slug = post.translations?.en?.slug || Object.values(post.translations || {})[0]?.slug;
    return j({ published: true, id, url: slug ? `${BASE_URL}/${slug}/` : null });
  }
);

server.tool(
  'set_post_status',
  'Set a post\'s status: "published" (live), "draft" (hidden), or "archived".',
  {
    id: z.number().int().positive(),
    status: z.enum(['draft', 'published', 'archived']),
  },
  async ({ id, status }) => {
    await client.post(`/api/admin/posts/${id}/status`, { status });
    return j({ id, status });
  }
);

server.tool(
  'delete_post',
  'Permanently delete a post. This cannot be undone — prefer set_post_status "archived" unless you are sure.',
  { id: z.number().int().positive() },
  async ({ id }) => {
    await client.del(`/api/admin/posts/${id}`);
    return j({ deleted: true, id });
  }
);

server.tool(
  'upload_image',
  'Upload an image (from a public URL or a local file path) to the media library. Returns its id and public path — use the id as cover_media_id, or the path as an <img src> in a post body.',
  { source: z.string().describe('A public image URL or a local file path.') },
  async ({ source }) => {
    const media = await uploadImage(source);
    return j({ id: media.id, path: media.path, url: `${BASE_URL}${media.path}`, filename: media.filename });
  }
);

// ── boot ──────────────────────────────────────────────────────────────────────
// `--check` verifies credentials from the command line WITHOUT starting the MCP loop.
if (process.argv.includes('--check')) {
  try {
    const admin = await client.login();
    console.log(`OK — connected to ${BASE_URL} as ${admin.email} (${admin.role}).`);
  } catch (err) {
    console.error(`FAILED — ${err.message}`);
    process.exitCode = 1;
  } finally {
    // Let the process exit on its own: close undici's keep-alive pool so the event loop
    // drains, then a short unref'd timer forces exit if anything still lingers. Calling
    // process.exit() synchronously here races open handles and trips a benign libuv
    // assertion on Windows, so we avoid it.
    try {
      await globalThis[Symbol.for('undici.globalDispatcher.1')]?.close?.();
    } catch {
      /* older Node, nothing to close */
    }
    setTimeout(() => process.exit(process.exitCode ?? 0), 250).unref();
  }
} else {
  // Normal run: speak MCP over stdio.
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`cyberclaims-blog MCP ready → ${BASE_URL}`);
}
