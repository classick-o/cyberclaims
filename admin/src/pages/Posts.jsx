import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, post, del } from '../api.js';
import { useDialog } from '../components/Dialog.jsx';
import { useToast } from '../components/Toast.jsx';
import Pager from '../components/Pager.jsx';
import { LOCALES } from '../locales.js';

const PAGE_SIZE = 25;
const date = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [ask, dialog] = useDialog();
  const toast = useToast();

  const load = () => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) });
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    get(`/admin/posts?${params}`)
      .then((r) => {
        setPosts(r.posts);
        setTotal(r.total ?? 0);
        // If deletions shrank the list below the current page, step back onto a real one.
        const last = Math.max(1, Math.ceil((r.total ?? 0) / PAGE_SIZE));
        if (page > last) setPage(last);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // debounce the search box only
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q, page]);

  // A filter change is a new result set — go back to its first page, never leave the
  // reader stranded on page 4 of a set that now has one page.
  const filter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const setPostStatus = async (id, title, next) => {
    try {
      await post(`/admin/posts/${id}/status`, { status: next });
      toast.success(
        next === 'published' ? `"${title}" is live on the site.` : `"${title}" is no longer on the site.`
      );
    } catch (e) {
      toast.error(e.message);
    }
    load();
  };

  const remove = async (id, title) => {
    const ok = await ask({
      title: 'Delete this article?',
      message: `"${title}" will be removed from the site and the database. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    try {
      await del(`/admin/posts/${id}`);
      toast.success(`"${title}" was deleted.`);
    } catch (e) {
      toast.error(e.message);
    }
    load();
  };

  return (
    <>
      <div className="head">
        <div>
          <span className="eyebrow">Content</span>
          <h1>Articles</h1>
          <p className="sub">Everything under /news/.</p>
        </div>
        <button className="btn" onClick={() => navigate('/posts/new')}>
          New article
        </button>
      </div>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <select value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="search"
          placeholder="Search titles..."
          value={q}
          onChange={(e) => filter(setQ)(e.target.value)}
        />
      </div>

      <div className="card flush">
        {posts === null ? (
          <div className="empty">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="empty">
            No articles yet. <Link to="/posts/new">Write the first one.</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: '3.5rem' }} />
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                {LOCALES.length > 1 && <th>Languages</th>}
                <th>Published</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.cover_path ? (
                      <img
                        src={p.cover_path}
                        alt=""
                        style={{ width: '3rem', height: '2rem', objectFit: 'cover', borderRadius: '0.25rem', display: 'block' }}
                      />
                    ) : null}
                  </td>
                  <td>
                    <Link to={`/posts/${p.id}`} style={{ fontWeight: 600, color: 'var(--mist)' }}>
                      {p.title}
                    </Link>
                    {Boolean(p.featured) && (
                      <span className="pill new" style={{ marginLeft: '0.5rem' }}>
                        Featured
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`pill ${p.status}`}>{p.status}</span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{p.category_key ?? '—'}</td>
                  {LOCALES.length > 1 && (
                    <td>
                      {LOCALES.map((l) => (
                        <span
                          key={l.code}
                          className={`pill ${p.locales.includes(l.code) ? 'published' : 'warn'}`}
                          style={{ marginRight: '0.25rem' }}
                        >
                          {l.code}
                        </span>
                      ))}
                    </td>
                  )}
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{date(p.published_at)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {p.status === 'published' ? (
                      <button className="btn ghost sm" onClick={() => setPostStatus(p.id, p.title, 'draft')}>
                        Unpublish
                      </button>
                    ) : (
                      <button className="btn ghost sm" onClick={() => setPostStatus(p.id, p.title, 'published')}>
                        Publish
                      </button>
                    )}{' '}
                    <button className="btn danger sm" onClick={() => remove(p.id, p.title)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />

      {dialog}
    </>
  );
}
