import { useEffect, useState } from 'react';
import { get, post, put, del } from '../api.js';
import { DEFAULT_LOCALE } from '../locales.js';
import { useDialog } from '../components/Dialog.jsx';
import { useToast } from '../components/Toast.jsx';

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
          <span className="eyebrow">Taxonomy</span>
          <h1>Categories &amp; Authors</h1>
          <p className="sub">The filter tabs on /news/, and the bylines.</p>
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      {/* Stacked, not side by side. Two tables of unrelated things in adjacent columns
          made each one narrow enough to crowd its own buttons, and neither is long
          enough to be worth the squeeze. */}
      <div className="stack">
        <Categories items={categories} reload={load} onError={setError} />
        <Authors items={authors} reload={load} onError={setError} />
      </div>
    </>
  );
}

function Categories({ items, reload, onError }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5bbd');
  const [ask, dialog] = useDialog();
  const toast = useToast();

  const add = async (e) => {
    e.preventDefault();
    // key_slug is derived once, from the English name, and then never changes even if
    // the display name is edited or translated. It is the stable identity of the
    // category — keying anything on translatable display text is how mappings break
    // silently the moment someone translates them.
    const key_slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (!key_slug) return;

    try {
      await post('/admin/categories', {
        key_slug,
        color,
        translations: { [DEFAULT_LOCALE]: { name: name.trim() } },
      });
      toast.success(`Category "${name.trim()}" added.`);
      setName('');
      reload();
    } catch (err) {
      onError(err.message);
      toast.error(err.message);
    }
  };

  const rename = async (c) => {
    const next = await ask({
      title: 'Rename category',
      message: 'The URL stays the same — only the label on the filter tab changes.',
      label: 'Name',
      defaultValue: c.name,
      confirmLabel: 'Rename',
      required: true,
    });
    if (next === null) return;

    try {
      await put(`/admin/categories/${c.id}`, {
        key_slug: c.key_slug,
        color: c.color ?? '',
        sort_order: c.sort_order ?? 0,
        translations: { [DEFAULT_LOCALE]: { name: next.trim() } },
      });
      toast.success(`Renamed to "${next.trim()}".`);
      reload();
    } catch (err) {
      onError(err.message);
      toast.error(err.message);
    }
  };

  const remove = async (c) => {
    const ok = await ask({
      title: 'Delete this category?',
      message: `"${c.name}" will be removed. Articles in it stay published, but lose their category.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    try {
      await del(`/admin/categories/${c.id}`);
      toast.success(`Category "${c.name}" was deleted.`);
    } catch (e) {
      onError(e.message);
      toast.error(e.message);
    }
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

      <form onSubmit={add} className="inline-add">
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
          title="Colour of the filter tab"
        />
        <button className="btn">Add</button>
      </form>

      {dialog}
    </div>
  );
}

function Authors({ items, reload, onError }) {
  // Name and role only. An author here is a byline, not a profile — nothing on the
  // site renders a bio or a portrait, and a field that feeds nothing is a field that
  // gets filled in once and then quietly rots.
  const [form, setForm] = useState({ name: '', role: '' });
  const [editing, setEditing] = useState(null);
  const [ask, dialog] = useDialog();
  const toast = useToast();

  const reset = () => {
    setForm({ name: '', role: '' });
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const name = form.name.trim();
    try {
      if (editing) await put(`/admin/authors/${editing}`, form);
      else await post('/admin/authors', form);
      toast.success(editing ? `Saved changes to ${name}.` : `${name} added as an author.`);
      reset();
      reload();
    } catch (err) {
      onError(err.message);
      toast.error(err.message);
    }
  };

  const edit = (a) => {
    setEditing(a.id);
    setForm({ name: a.name, role: a.role ?? '' });
  };

  const remove = async (a) => {
    const ok = await ask({
      title: 'Delete this author?',
      message: `${a.name} will be removed. Their articles stay published, but lose the byline.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    try {
      await del(`/admin/authors/${a.id}`);
      toast.success(`${a.name} was deleted.`);
    } catch (e) {
      onError(e.message);
      toast.error(e.message);
    }
    if (editing === a.id) reset();
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

      <form onSubmit={submit} style={{ marginTop: '1.25rem' }}>
        <div className="field-row">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="author-name">Name</label>
            <input
              id="author-name"
              type="text"
              placeholder="Julia Blokhina"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="author-role">Role</label>
            <input
              id="author-role"
              type="text"
              placeholder="Head of Blockchain Forensics"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          {editing && (
            <button type="button" className="btn ghost sm" onClick={reset}>
              Cancel
            </button>
          )}
          <button className="btn sm">{editing ? 'Save changes' : 'Add author'}</button>
        </div>
      </form>

      {dialog}
    </div>
  );
}
