import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, post, put } from '../api.js';
import { LOCALES, DEFAULT_LOCALE } from '../locales.js';
import RichText from '../components/RichText.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import TagInput from '../components/TagInput.jsx';
import { useToast } from '../components/Toast.jsx';

const emptyTranslation = () => ({
  title: '',
  slug: '',
  excerpt: '',
  body_html: '',
  seo_title: '',
  seo_description: '',
  keywords: [],
});

// Mirrors slugify() in backend/src/services/content.js. Duplicated on purpose: the
// server must never trust a slug the client computed, and the editor must be able to
// show the real URL before they hit Publish rather than a row of dots.
const previewSlug = (input) =>
  String(input ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isNew = !id;

  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [meta, setMeta] = useState({
    category_id: '',
    author_id: '',
    cover_media_id: null,
    featured: false,
    status: 'draft',
  });
  const [translations, setTranslations] = useState({ [DEFAULT_LOCALE]: emptyTranslation() });
  const [cover, setCover] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [picker, setPicker] = useState(null); // a callback, when open
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([get('/admin/categories'), get('/admin/authors')])
      .then(([c, a]) => {
        setCategories(c.categories);
        setAuthors(a.authors);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (isNew) return;
    get(`/admin/posts/${id}`)
      .then(({ post: p }) => {
        setMeta({
          category_id: p.category_id ?? '',
          author_id: p.author_id ?? '',
          cover_media_id: p.cover_media_id,
          featured: Boolean(p.featured),
          status: p.status,
        });
        setTranslations(
          Object.keys(p.translations).length ? p.translations : { [DEFAULT_LOCALE]: emptyTranslation() }
        );
        if (p.cover_media_id) {
          get('/admin/media?limit=200')
            .then((r) => setCover(r.media.find((m) => m.id === p.cover_media_id) ?? null))
            .catch(() => {});
        }
      })
      .catch((e) => setError(e.message));
  }, [id, isNew]);

  const t = translations[locale] ?? emptyTranslation();
  const setT = (patch) =>
    setTranslations((prev) => ({ ...prev, [locale]: { ...(prev[locale] ?? emptyTranslation()), ...patch } }));

  const save = async (status) => {
    setError('');
    setFieldErrors({});
    setSaved(false);
    setBusy(true);

    // Never POST an empty language. A locale tab the editor opened and left blank
    // would otherwise create a translation row with no title and no body, and that
    // post would then be "translated" into a language it isn't written in.
    const filled = Object.fromEntries(
      Object.entries(translations).filter(([, v]) => v.title?.trim() && v.body_html?.trim())
    );

    if (Object.keys(filled).length === 0) {
      setBusy(false);
      const msg = 'Give the article a title and some content before saving.';
      setError(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      ...meta,
      status,
      category_id: meta.category_id || null,
      author_id: meta.author_id || null,
      translations: filled,
    };

    // Publishing has a public consequence, so say plainly what just happened to the
    // article — the previous feedback was the word "saved" appended to a subtitle
    // above the fold, which you never see if you scrolled down to write.
    const wasPublished = meta.status === 'published';

    try {
      if (isNew) {
        const { id: newId } = await post('/admin/posts', payload);
        navigate(`/posts/${newId}`, { replace: true });
      } else {
        await put(`/admin/posts/${id}`, payload);
      }
      setMeta((m) => ({ ...m, status }));
      setSaved(true);

      if (status === 'published') {
        toast.success(wasPublished ? 'Changes are live on the site.' : 'Article published. It is live on the site.');
      } else {
        toast.success(wasPublished ? 'Saved as a draft. It is no longer on the site.' : 'Draft saved.');
      }
    } catch (err) {
      setError(err.message);
      // The server addresses a field by its full path — "translations.en.slug" — but the
      // inputs on this page are keyed by the bare name. Take the last segment so a zod
      // error lands under the box that caused it, not only in the banner.
      setFieldErrors(
        Object.fromEntries((err.errors ?? []).map((e) => [String(e.field).split('.').at(-1), e.message]))
      );
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  // The draft preview renders on the real site with the real CSS, via an SSR route —
  // a static build could only have offered a fake preview inside this panel.
  const previewUrl =
    !isNew && t.slug
      ? `/${t.slug}/?preview=1`
      : null;

  return (
    <>
      <div className="head">
        <div>
          <span className="eyebrow">{isNew ? 'Write' : 'Edit'}</span>
          <h1>{isNew ? 'New article' : 'Edit article'}</h1>
          <p className="sub">
            {meta.status === 'published' ? 'Live on the site' : 'Not published'}
            {saved && ' · saved'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn ghost" onClick={() => navigate('/posts')}>
            Back
          </button>
          {previewUrl && (
            <a className="btn ghost" href={previewUrl} target="_blank" rel="noreferrer">
              Preview
            </a>
          )}
          <button className="btn ghost" disabled={busy} onClick={() => save('draft')}>
            Save draft
          </button>
          <button className="btn" disabled={busy} onClick={() => save('published')}>
            {busy ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      {LOCALES.length > 1 && (
        <div className="locale-tabs">
          {LOCALES.map((l) => {
            const done = translations[l.code]?.title?.trim() && translations[l.code]?.body_html?.trim();
            return (
              <button
                key={l.code}
                className={`locale-tab${locale === l.code ? ' active' : ''}`}
                onClick={() => setLocale(l.code)}
              >
                {l.label}
                {!done && <span className="missing">•</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="editor-grid">
        <div>
          <div className="card">
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={t.title}
                onChange={(e) => setT({ title: e.target.value })}
                placeholder="Is Coinbase Wallet Safe? A 2026 Security Review"
              />
            </div>

            <div className="field">
              <label htmlFor="slug">URL slug</label>
              <input
                id="slug"
                type="text"
                value={t.slug}
                onChange={(e) => setT({ slug: e.target.value })}
                placeholder="Left blank, this is generated from the title"
              />
              {fieldErrors.slug && <div className="err">{fieldErrors.slug}</div>}
              {/* Articles live at the root of the site, not under /news/. */}
              <div className="hint">
                /{previewSlug(t.slug || t.title) || '…'}/
                {!t.slug && t.title && ' — from the title'}
              </div>
            </div>

            <div className="field">
              <label>Body</label>
              <RichText
                value={t.body_html}
                onChange={(html) => setT({ body_html: html })}
                onPickImage={(cb) => setPicker(() => cb)}
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                rows={2}
                value={t.excerpt ?? ''}
                onChange={(e) => setT({ excerpt: e.target.value })}
                placeholder="Left blank, the first 200 characters of the body are used."
              />
            </div>
          </div>

          <div className="card">
            <h2>Search engines</h2>
            <div className="field">
              <label htmlFor="seo_title">SEO title</label>
              <input
                id="seo_title"
                type="text"
                value={t.seo_title ?? ''}
                onChange={(e) => setT({ seo_title: e.target.value })}
                placeholder={t.title || 'Defaults to the article title'}
              />
            </div>
            <div className="field">
              <label htmlFor="seo_description">Meta description</label>
              <textarea
                id="seo_description"
                rows={2}
                maxLength={320}
                value={t.seo_description ?? ''}
                onChange={(e) => setT({ seo_description: e.target.value })}
              />
              <div className="hint">{(t.seo_description ?? '').length}/320</div>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="keywords">Keywords</label>
              <TagInput
                id="keywords"
                value={t.keywords ?? []}
                onChange={(keywords) => setT({ keywords })}
                placeholder="coinbase, wallet security, self-custody"
              />
              <div className="hint">
                Enter or a comma adds one. Used in the article's structured data.
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className="card">
            <h2>Cover image</h2>
            {cover ? (
              <div className="cover-preview">
                <img src={cover.variants?.['480'] ?? cover.path} alt={cover.alt ?? ''} />
                <button
                  className="btn ghost sm"
                  style={{ marginTop: '0.6rem', width: '100%' }}
                  onClick={() => {
                    setCover(null);
                    setMeta((m) => ({ ...m, cover_media_id: null }));
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                className="btn ghost sm"
                style={{ width: '100%' }}
                onClick={() =>
                  setPicker(() => (m) => {
                    setCover(m);
                    setMeta((prev) => ({ ...prev, cover_media_id: m.id }));
                  })
                }
              >
                Choose an image
              </button>
            )}
            {fieldErrors.cover_media_id && <div className="err">{fieldErrors.cover_media_id}</div>}
          </div>

          <div className="card">
            <h2>Details</h2>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={meta.category_id}
                onChange={(e) => setMeta({ ...meta, category_id: e.target.value })}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="author">Author</label>
              <select
                id="author"
                value={meta.author_id}
                onChange={(e) => setMeta({ ...meta, author_id: e.target.value })}
              >
                <option value="">None</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={meta.featured}
                  onChange={(e) => setMeta({ ...meta, featured: e.target.checked })}
                />
                Featured on /news/
              </label>
              <div className="hint">
                The large hero card at the top of /news/. Only one article can hold it —
                turning this on takes it from whichever article has it now.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {picker && (
        <MediaPicker
          onPick={picker}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}
