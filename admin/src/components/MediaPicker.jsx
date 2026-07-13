import { useEffect, useState } from 'react';
import { get, upload } from '../api.js';

/** Modal image browser + uploader. Used for post covers, author avatars and inline images. */
export default function MediaPicker({ onPick, onClose }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  const load = () =>
    get('/admin/media?limit=60')
      .then((r) => setItems(r.media))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const send = async (file) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      // Alt text is required on the way in. Asking for it later means it never
      // happens, and a blog full of unlabelled images is an accessibility problem
      // and an SEO one.
      const alt = window.prompt(`Describe "${file.name}" for screen readers and search engines:`);
      if (alt === null) return setBusy(false);
      form.append('alt', alt);

      const { media } = await upload('/admin/media', form);
      setItems((prev) => [media, ...prev]);
      onPick({ ...media, alt });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Choose an image</h2>
          <button className="btn ghost sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-body">
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
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => send(e.target.files[0])}
            />
            {busy ? 'Uploading...' : 'Drop an image here, or click to choose one'}
            <div className="hint">Converted to WebP at three sizes. JPEG, PNG, WebP, AVIF, GIF.</div>
          </label>

          {items.length === 0 ? (
            <div className="empty">No images yet.</div>
          ) : (
            <div className="media-grid">
              {items.map((m) => (
                <div
                  key={m.id}
                  className="media-item"
                  onClick={() => {
                    onPick(m);
                    onClose();
                  }}
                >
                  <img src={m.variants?.['480'] ?? m.path} alt={m.alt ?? ''} loading="lazy" />
                  <div className="media-meta">
                    <div className="name">{m.filename}</div>
                    {!m.alt && <div className="media-noalt">No alt text</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
