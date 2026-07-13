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

// Anchored on globalThis, NOT a plain module-level `const`.
//
// Express and Astro share one process, but not one module graph: Astro's build
// BUNDLES this file into dist/server/, so `import { cached }` from an .astro page and
// `import { invalidateContent }` from an Express route resolve to two different
// module instances, each with its own Map.
//
// The failure that produced this comment: an anonymous visitor loaded a draft's URL,
// findBySlug cached `null`, the editor published — invalidateContent() cleared
// EXPRESS's Map — and the article stayed 404 for five minutes, because Astro was
// reading the other one. The cache was, in effect, never invalidated.
//
// There is exactly one globalThis per process, so this is the shared ground.
const STORE = Symbol.for('cyberclaims.contentCache');
const store = (globalThis[STORE] ??= new Map());

export function cached(key, fn) {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const value = fn();

  // Cache the promise, not the resolved value: two concurrent requests for a cold
  // key would otherwise both hit the database.
  store.set(key, { value, expires: Date.now() + TTL_MS });

  Promise.resolve(value).then(
    (resolved) => {
      // NEVER cache a miss.
      //
      // "This article does not exist" is a transient answer, not a fact. It is exactly
      // what a reader gets in the instant before a publish lands — and caching it turned
      // a sub-second race into a five-minute outage: the editor hit Publish, opened the
      // page, got a 404, and kept getting it. The lookup is a single indexed row; paying
      // for it on every 404 is nothing next to serving a stale one.
      if (resolved == null) store.delete(key);
    },
    // A rejected promise must not be cached either, or one blip poisons the key.
    () => store.delete(key)
  );

  if (store.size > MAX_ENTRIES) {
    store.delete(store.keys().next().value); // oldest insert wins the eviction
  }
  return value;
}

export function invalidateContent() {
  store.clear();
}
