import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, post, del } from '../api.js';
import { LOCALES } from '../locales.js';

const date = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(null);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    get(`/admin/posts?${params}`)
      .then((r) => setPosts(r.posts))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0); // debounce the search box only
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  const setPostStatus = async (id, next) => {
    await post(`/admin/posts/${id}/status`, { status: next }).catch((e) => setError(e.message));
    load();
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await del(`/admin/posts/${id}`).catch((e) => setError(e.message));
    load();
  };

  return (
    <>
      <div className="head">
        <div>
          <h1>Articles</h1>
          <p className="sub">Everything under /news/.</p>
        </div>
        <button className="btn" onClick={() => navigate('/posts/new')}>
          New article
        </button>
      </div>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <input
          type="search"
          placeholder="Search titles..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                      <button className="btn ghost sm" onClick={() => setPostStatus(p.id, 'draft')}>
                        Unpublish
                      </button>
                    ) : (
                      <button className="btn ghost sm" onClick={() => setPostStatus(p.id, 'published')}>
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
    </>
  );
}
