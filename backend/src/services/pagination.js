// LIMIT / OFFSET that survive hostile input.
//
// `pool.query('... LIMIT ? OFFSET ?', [Number(req.query.limit), ...])` blows up on
// anything non-numeric: Number('abc') is NaN, and mysql2 interpolates NaN into the SQL
// as a bare identifier, so MySQL answers `ER_SP_UNDECLARED_VAR: Undeclared variable: NaN`
// — a 500 that any caller could trigger with `?limit=abc`. Every list endpoint had it.
//
// These coerce to a safe range instead: a positive, capped integer for the limit; a
// non-negative integer for the offset; the default whenever the input isn't usable.

/** @param {unknown} value @param {{ def?: number, max?: number }} [opts] */
export function toLimit(value, { def = 50, max = 200 } = {}) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}

/** @param {unknown} value */
export function toOffset(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
