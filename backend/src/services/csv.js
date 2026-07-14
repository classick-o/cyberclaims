// CSV export.
//
// The escaping matters more than it looks. A cell that begins with =, +, -, or @ is
// interpreted as a FORMULA by Excel and Google Sheets - so a lead who types
// `=cmd|'/c calc'!A1` into the "Platform Name" box executes it on the machine of
// whoever opens the export. That's CSV injection, and it turns our own lead form into
// a delivery mechanism aimed at our own staff. Prefix those cells with a quote.

const RISKY_START = /^[=+\-@\t\r]/;

function cell(value) {
  if (value === null || value === undefined) return '';

  let s = String(value);
  if (value instanceof Date) s = value.toISOString();

  if (RISKY_START.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(rows, columns) {
  const keys = columns ?? Object.keys(rows[0] ?? {});
  const lines = [keys.map(cell).join(',')];
  for (const row of rows) lines.push(keys.map((k) => cell(row[k])).join(','));
  // BOM so Excel opens UTF-8 correctly instead of mangling every accented name.
  return '﻿' + lines.join('\r\n');
}

export function sendCsv(res, filename, rows, columns) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(toCsv(rows, columns));
}
