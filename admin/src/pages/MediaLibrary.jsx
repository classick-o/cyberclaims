import { useEffect, useRef, useState } from 'react';
import { get, patch, del, upload } from '../api.js';
import { DEFAULT_LOCALE } from '../locales.js';

const kb = (b) => (b ? `${Math.round(b / 1024)} KB` : '');

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const fileInput = useRef(null);

  const load = () =>
    get('/admin/media?limit=200')
      .then((r) => setItems(r.media))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const send = async (file) => {
    if (!file) return;
    const alt = window.prompt(`Describe "${file.name}" for screen readers and search engines:`);
    if (alt === null) return;

    setError('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      await upload('/admin/media', form);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const editAlt = async (m) => {
    const alt = window.prompt('Alt text', m.alt ?? '');
    if (alt === null) return;
    await patch(`/admin/media/${m.id}`, { alt, locale: DEFAULT_LOCALE }).catch((e) => setError(e.message));
    load();
  };

  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.filename}"? Any article using it will show a broken image.`)) return;
    await del(`/admin/media/${m.id}`).catch((e) => setError(e.message));
    load();
  };

  return (
    <>
      <div className="head">
        <div>
          <h1>Media</h1>
          <p className="sub">Uploads are converted to WebP at three sizes.</p>
        </div>
      </div>

      {error && <div className="banner error">{error}</div>}

      <label
        className={`drop${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          send(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => send(e.target.files[0])}
        />
        {busy ? 'Uploading...' : 'Drop an image here, or click to choose one'}
      </label>

      {items === null ? (
        <div className="empty">Loading...</div>
      ) : items.length === 0 ? (
        <div className="empty">No images yet.</div>
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <div key={m.id} className="media-item">
              <img src={m.variants?.['480'] ?? m.path} alt={m.alt ?? ''} loading="lazy" />
              <div className="media-meta">
                <div className="name" title={m.filename}>
                  {m.filename}
                </div>
                <div>
                  {m.width}×{m.height} · {kb(m.bytes)}
                </div>
                {m.alt ? (
                  <div title={m.alt} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.alt}
                  </div>
                ) : (
                  <div className="media-noalt">No alt text</div>
                )}
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.4rem' }}>
                  <button className="btn ghost sm" onClick={() => editAlt(m)}>
                    Alt
                  </button>
                  <button className="btn danger sm" onClick={() => remove(m)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
