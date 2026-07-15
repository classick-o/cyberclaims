// Server-side pagination control.
//
// The list it sits under fetches one page at a time (LIMIT/OFFSET on the server), so
// this never holds the whole collection — only the current page number and the total
// count the server reported. It renders nothing when everything fits on one page, so a
// screen with three rows shows no chrome.

/** [1, '…', 4, 5, 6, '…', 20] — first and last, plus a window around the current page. */
function windowed(current, pages, span = 1) {
  const keep = new Set([1, pages]);
  for (let p = current - span; p <= current + span; p++) {
    if (p >= 1 && p <= pages) keep.add(p);
  }
  const sorted = [...keep].sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('…');
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pager({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className="pager" aria-label="Pagination">
      <span className="pager-count">
        {from}&ndash;{to} of {total}
      </span>
      <div className="pager-nav">
        <button
          type="button"
          className="pager-btn"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          &lsaquo;
        </button>
        {windowed(page, pages).map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} className="pager-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              type="button"
              key={n}
              className={`pager-btn${n === page ? ' on' : ''}`}
              aria-current={n === page ? 'page' : undefined}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          )
        )}
        <button
          type="button"
          className="pager-btn"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          &rsaquo;
        </button>
      </div>
    </nav>
  );
}
