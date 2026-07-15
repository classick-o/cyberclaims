import { useEffect, useRef, useState } from 'react';
import { get, patch, del, upload } from '../api.js';
import { DEFAULT_LOCALE } from '../locales.js';
import { useDialog } from '../components/Dialog.jsx';
import Pager from '../components/Pager.jsx';

const PAGE_SIZE = 50;
const kb = (b) => (b ? `${Math.round(b / 1024)} KB` : '');

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const fileInput = useRef(null);
  const [ask, dialog] = useDialog();

  const load = () =>
    get(`/admin/media?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`)
      .then((r) => {
        setItems(r.media);
        setTotal(r.total ?? 0);
        // A delete may have emptied the last page — step back onto a real one.
        const last = Math.max(1, Math.ceil((r.total ?? 0) / PAGE_SIZE));
        if (page > last) setPage(last);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const send = async (file) => {
    if (!file) return;

    // Alt text is demanded at upload, not offered as an optional field afterwards.
    // Asked later, it never happens — and a blog of unlabelled images is an
    // accessibility failure and an SEO one.
    const alt = await ask({
      title: 'Describe this image',
      message: 'Screen readers read this aloud, and search engines index it.',
      label: 'Alt text',
      placeholder: `What is in "${file.name}"?`,
      confirmLabel: 'Upload',
      required: true,
    });
    if (alt === null) return;

    setError('');
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('alt', alt);
      await upload('/admin/media', form);
      // A new upload lands at the top (newest first), so return to page 1 to show it.
      if (page === 1) await load();
      else setPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const editAlt = async (m) => {
    const alt = await ask({
      title: 'Alt text',
      message: 'Screen readers read this aloud, and search engines index it.',
      label: `Describe "${m.filename}"`,
      defaultValue: m.alt ?? '',
      confirmLabel: 'Save',
      required: true,
    });
    if (alt === null) return;

    await patch(`/admin/media/${m.id}`, { alt, locale: DEFAULT_LOCALE }).catch((e) =>
      setError(e.message)
    );
    load();
  };

  const remove = async (m) => {
    const ok = await ask({
      title: 'Delete this image?',
      message: `"${m.filename}" will be removed. Any article still using it will show a broken image.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;

    await del(`/admin/media/${m.id}`).catch((e) => setError(e.message));
    load();
  };

  return (
    <>
      <div className="head">
        <div>
          <span className="eyebrow">Library</span>
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
                  <div
                    title={m.alt}
                    style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
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

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />

      {dialog}
    </>
  );
}
