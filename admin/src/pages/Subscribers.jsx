import { useEffect, useState } from 'react';
import { get, del } from '../api.js';

const when = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export default function Subscribers() {
  const [subs, setSubs] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    get(`/admin/subscribers?limit=500${status ? `&status=${status}` : ''}`)
      .then((r) => setSubs(r.subscribers))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.email} from the list?`)) return;
    await del(`/admin/subscribers/${s.id}`).catch((e) => setError(e.message));
    load();
  };

  const pending = subs?.filter((s) => s.status === 'pending').length ?? 0;

  return (
    <>
      <div className="head">
        <div>
          <h1>Newsletter</h1>
          <p className="sub">
            {subs?.filter((s) => s.status === 'confirmed').length ?? 0} confirmed
            {pending > 0 && ` · ${pending} awaiting confirmation`}
          </p>
        </div>
        <a className="btn ghost" href="/api/admin/subscribers/export.csv">
          Export confirmed
        </a>
      </div>

      {error && <div className="banner error">{error}</div>}

      {pending > 0 && (
        <div className="banner ok">
          Pending addresses have not confirmed their subscription. They are not in the export and must
          not be mailed — under GDPR that consent is what makes the subscription lawful.
        </div>
      )}

      <div className="toolbar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {subs === null ? (
          <div className="empty">Loading...</div>
        ) : subs.length === 0 ? (
          <div className="empty">Nobody has subscribed yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Language</th>
                <th>Signed up</th>
                <th>Confirmed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.email}</td>
                  <td>
                    <span className={`pill ${s.status === 'confirmed' ? 'published' : s.status === 'pending' ? 'new' : 'archived'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{s.locale}</td>
                  <td style={{ color: 'var(--muted)' }}>{when(s.created_at)}</td>
                  <td style={{ color: 'var(--muted)' }}>{when(s.confirmed_at)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn danger sm" onClick={() => remove(s)}>
                      Remove
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
