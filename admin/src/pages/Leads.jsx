import { useEffect, useState } from 'react';
import { get, patch, del } from '../api.js';
import { useDialog } from '../components/Dialog.jsx';
import { useToast } from '../components/Toast.jsx';
import Pager from '../components/Pager.jsx';

const PAGE_SIZE = 50;
const STATUSES = ['new', 'contacted', 'qualified', 'closed'];
const SOURCES = {
  hero: 'Homepage',
  contact: 'Contact page',
  start_process: 'Start Process',
  url_checker: 'URL Checker',
};

const when = (v) =>
  new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');
  const [ask, dialog] = useDialog();
  const toast = useToast();

  const load = () => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String((page - 1) * PAGE_SIZE) });
    if (status) params.set('status', status);
    if (source) params.set('source', source);
    if (q) params.set('q', q);
    get(`/admin/leads?${params}`)
      .then((r) => {
        setLeads(r.leads);
        setTotal(r.total);
        const last = Math.max(1, Math.ceil((r.total ?? 0) / PAGE_SIZE));
        if (page > last) setPage(last);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, source, q, page]);

  // A new filter is a new result set — start it at page 1.
  const filter = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  const move = async (id, name, next) => {
    try {
      await patch(`/admin/leads/${id}`, { status: next });
      toast.success(`${name} moved to "${next}".`);
    } catch (e) {
      toast.error(e.message);
    }
    load();
  };

  const erase = async (lead) => {
    const ok = await ask({
      title: `Delete the lead from ${lead.full_name}?`,
      message:
        'This is a GDPR erasure. The row is destroyed, not flagged — everything they told us ' +
        'about their case goes with it, and it cannot be undone.',
      confirmLabel: 'Delete permanently',
      danger: true,
    });
    if (!ok) return;

    try {
      await del(`/admin/leads/${lead.id}`);
      toast.success(`The lead from ${lead.full_name} was erased.`);
    } catch (e) {
      toast.error(e.message);
    }
    setOpen(null);
    load();
  };

  return (
    <>
      <div className="head">
        <div>
          <span className="eyebrow">Cases</span>
          <h1>Leads</h1>
          <p className="sub">{total} in total. Everything the three forms have captured.</p>
        </div>
        <a className="btn ghost" href="/api/admin/leads/export.csv">
          Export CSV
        </a>
      </div>

      {error && <div className="banner error">{error}</div>}

      <div className="toolbar">
        <select value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={source} onChange={(e) => filter(setSource)(e.target.value)}>
          <option value="">All forms</option>
          {Object.entries(SOURCES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input type="search" placeholder="Name, email, platform..." value={q} onChange={(e) => filter(setQ)(e.target.value)} />
      </div>

      <div className="card flush">
        {leads === null ? (
          <div className="empty">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="empty">No leads match.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Email</th>
                <th>Form</th>
                <th>Amount lost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => setOpen(l)}>
                  <td style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{when(l.created_at)}</td>
                  <td style={{ fontWeight: 600 }}>{l.full_name}</td>
                  <td style={{ color: 'var(--muted)' }}>{l.email}</td>
                  <td style={{ color: 'var(--muted)' }}>{SOURCES[l.source] ?? l.source}</td>
                  <td>{l.amount_lost ?? '—'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={l.status}
                      onChange={(e) => move(l.id, l.full_name, e.target.value)}
                      style={{ padding: '0.25rem 0.4rem', fontSize: '0.78rem' }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pager page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />

      {open && (
        <div className="modal-back" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{open.full_name}</h2>
              <span className={`pill ${open.status}`}>{open.status}</span>
            </div>
            {/* The message goes last, on purpose. It is the only free-text field, so it is
                the only one whose height you cannot predict — with it in the middle, the
                facts underneath it moved around depending on how much the person wrote.
                No IP: this panel is for working a real case, and there the IP is noise.
                It is still recorded, and still shown in the notification email, which is
                where you would actually look at it — when triaging a suspect submission. */}
            <div className="modal-body">
              <Detail label="Email" value={<a href={`mailto:${open.email}`}>{open.email}</a>} />
              <Detail label="Phone" value={open.phone} />
              <Detail label="Country" value={open.country} />
              <Detail label="Form" value={SOURCES[open.source] ?? open.source} />
              <Detail label="Amount lost" value={open.amount_lost} />
              <Detail label="Platform" value={open.platform_name} />
              <Detail label="Platform site" value={open.platform_website} />
              <Detail label="First transaction" value={open.first_transaction?.slice(0, 10)} />
              <Detail label="Last transaction" value={open.last_transaction?.slice(0, 10)} />
              <Detail label="Received" value={when(open.created_at)} />
              <Detail
                label="Message"
                value={open.message && <span style={{ whiteSpace: 'pre-wrap' }}>{open.message}</span>}
              />
            </div>
            <div className="modal-foot">
              <button className="btn danger" onClick={() => erase(open)}>
                Delete (GDPR)
              </button>
              <button className="btn ghost" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog}
    </>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '9rem 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{label}</div>
      <div>{value}</div>
    </div>
  );
}
