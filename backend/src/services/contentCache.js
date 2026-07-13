// In-process cache for the blog's SSR queries.
//
// Blog pages render on demand, so without this every visitor costs a MySQL round
// trip for content that changes a few times a month. The whole cache is dropped on
// any write — no key-level invalidation, because working out which cached listings a
// given post appears in (featured? related? which category tab? which locale?) is
// exactly the kind of cleverness that eventually serves a stale article and nobody
// notices for a week. Blowing away a few dozen entries costs nothing.

const TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 200;

const store = new Map();

export function cached(key, fn) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = fn();

  // Cache the promise, not the resolved value: two concurrent requests for a cold
  // key would otherwise both hit the database.
  store.set(key, { value, expires: Date.now() + TTL_MS });

  // A rejected promise must not be cached, or one blip poisons the key for 5 minutes.
  Promise.resolve(value).catch(() => store.delete(key));

  if (store.size > MAX_ENTRIES) {
    store.delete(store.keys().next().value); // oldest insert wins the eviction
  }
  return value;
}

export function invalidateContent() {
  store.clear();
}
