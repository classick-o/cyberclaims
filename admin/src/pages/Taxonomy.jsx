import { useEffect, useState } from 'react';
import { get, post, put, del } from '../api.js';
import { LOCALES, DEFAULT_LOCALE } from '../locales.js';
import MediaPicker from '../components/MediaPicker.jsx';

export default function Taxonomy() {
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    Promise.all([get('/admin/categories'), get('/admin/authors')])
      .then(([c, a]) => {
        setCategories(c.categories);
        setAuthors(a.authors);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="head">
        <div>
          <h1>Categories &amp; Authors</h1>
          <p className="sub">The filter tabs on /news/, and the bylines.</p>
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        <Categories items={categories} reload={load} onError={setError} />
        <Authors items={authors} reload={load} onError={setError} />
      </div>
    </>
  );
}

function Categories({ items, reload, onError }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5bbd');

  const add = async (e) => {
    e.preventDefault();
    // key_slug is derived once, from the English name, and then never changes even if
    // the display name is edited or translated. It is the stable identity of the
    // category — keying anything on translatable display text is how mappings break
    // silently the moment someone translates them.
    const key_slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!key_slug) return;

    try {
      await post('/admin/categories', {
        key_slug,
        color,
        translations: { [DEFAULT_LOCALE]: { name: name.trim() } },
      });
      setName('');
      reload();
    } catch (err) {
      onError(err.message);
    }
  };

  const rename = async (c) => {
    const next = window.prompt('Category name', c.name);
    if (!next?.trim()) return;
    try {
      await put(`/admin/categories/${c.id}`, {
        key_slug: c.key_slug,
        color: c.color ?? '',
        sort_order: c.sort_order ?? 0,
        translations: { [DEFAULT_LOCALE]: { name: next.trim() } },
      });
      reload();
    } catch (err) {
      onError(err.message);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? Articles in it stay, but lose their category.`)) return;
    await del(`/admin/categories/${c.id}`).catch((e) => onError(e.message));
    reload();
  };

  return (
    <div className="card">
      <h2>Categories</h2>

      {items.length === 0 ? (
        <div className="empty" style={{ padding: '1.5rem' }}>
          None yet.
        </div>
      ) : (
        <table>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td style={{ width: '1.5rem' }}>
                  <span
                    style={{
                      display: 'block',
                      width: '0.85rem',
                      height: '0.85rem',
                      borderRadius: '50%',
                      background: c.color ?? 'var(--purple-500)',
                    }}
                  />
                </td>
                <td>
                  <strong>{c.name}</strong>
                  <div className="hint">/news/?category={c.slug}</div>
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn ghost sm" onClick={() => rename(c)}>
                    Rename
                  </button>{' '}
                  <button className="btn danger sm" onClick={() => remove(c)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={add} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{ width: '2.6rem', padding: '0.2rem', cursor: 'pointer' }}
          title="Colour"
        />
        <button className="btn">Add</button>
      </form>
    </div>
  );
}

function Authors({ items, reload, onError }) {
  const [form, setForm] = useState({ name: '', role: '', bio: '', avatar_id: null });
  const [avatar, setAvatar] = useState(null);
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState(null);

  const reset = () => {
    setForm({ name: '', role: '', bio: '', avatar_id: null });
    setAvatar(null);
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editing) await put(`/admin/authors/${editing}`, form);
      else await post('/admin/authors', form);
      reset();
      reload();
    } catch (err) {
      onError(err.message);
    }
  };

  const edit = (a) => {
    setEditing(a.id);
    setForm({ name: a.name, role: a.role ?? '', bio: a.bio ?? '', avatar_id: a.avatar_id });
    setAvatar(a.avatar_url ? { path: a.avatar_url } : null);
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete ${a.name}? Their articles stay, but lose the byline.`)) return;
    await del(`/admin/authors/${a.id}`).catch((e) => onError(e.message));
    reload();
  };

  return (
    <div className="card">
      <h2>Authors</h2>

      {items.length === 0 ? (
        <div className="empty" style={{ padding: '1.5rem' }}>
          None yet.
        </div>
      ) : (
        <table>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td style={{ width: '2.5rem' }}>
                  {a.avatar_url && (
                    <img
                      src={a.avatar_url}
                      alt=""
                      style={{ width: '2rem', height: '2rem', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </td>
                <td>
                  <strong>{a.name}</strong>
                  {a.role && <div className="hint">{a.role}</div>}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <button className="btn ghost sm" onClick={() => edit(a)}>
                    Edit
                  </button>{' '}
                  <button className="btn danger sm" onClick={() => remove(a)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={submit} style={{ marginTop: '1rem' }}>
        <div className="field">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="field">
          <input
            type="text"
            placeholder="Role — e.g. Head of Blockchain Forensics"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
        </div>
        <div className="field">
          <textarea
            rows={2}
            placeholder="Short bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {avatar && (
            <img
              src={avatar.path}
              alt=""
              style={{ width: '2.2rem', height: '2.2rem', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <button type="button" className="btn ghost sm" onClick={() => setPicker(true)}>
            {avatar ? 'Change photo' : 'Add photo'}
          </button>
          <div className="spacer" />
          {editing && (
            <button type="button" className="btn ghost sm" onClick={reset}>
              Cancel
            </button>
          )}
          <button className="btn sm">{editing ? 'Save' : 'Add author'}</button>
        </div>
      </form>

      {picker && (
        <MediaPicker
          onPick={(m) => {
            setAvatar(m);
            setForm((f) => ({ ...f, avatar_id: m.id }));
          }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}
