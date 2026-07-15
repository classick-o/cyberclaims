import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// Tell the editor how the action went.
//
// Every write in this admin used to end the same way: the row quietly changed, or an
// error banner appeared at the top of a page you had already scrolled past. Publishing
// an article — the one action with a public consequence — gave no more feedback than
// the word "saved" appended to a subtitle. So: one toast, bottom-centre, for every
// action that touches the database.
//
// Errors do NOT auto-dismiss. A success you miss costs you nothing; a failure you miss
// means you walk away believing the article is live when it is not.

const ToastCtx = createContext(null);

/** `const toast = useToast()` → `toast.success(msg)` / `toast.error(msg)`. */
export function useToast() {
  const api = useContext(ToastCtx);
  if (!api) throw new Error('useToast() needs a <ToastProvider> above it.');
  return api;
}

const LIFETIME = 4200;
// Must match the .toast.leaving animation in styles.css — unmounting before it has
// played would make the toast disappear mid-slide.
const EXIT = 260;
const MAX = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const seq = useRef(0);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((list) => list.filter((t) => t.id !== id));
      }, EXIT)
    );
  }, []);

  const push = useCallback(
    (tone, message) => {
      const text = String(message ?? '').trim();
      if (!text) return;

      const id = (seq.current += 1);
      setToasts((list) => [...list.slice(-(MAX - 1)), { id, tone, message: text, leaving: false }]);

      if (tone !== 'error') {
        timers.current.set(id, setTimeout(() => dismiss(id), LIFETIME));
      }
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m ?? 'Something went wrong.'),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* aria-live so a screen reader hears the outcome; the toasts themselves are the
          only thing here that takes pointer events, so the layer never blocks a click. */}
      <div className="toaster" role="status" aria-live="polite">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`toast ${t.tone}${t.leaving ? ' leaving' : ''}`}
            onClick={() => dismiss(t.id)}
            title="Dismiss"
          >
            <span className="toast-icon" aria-hidden="true" />
            <span className="toast-msg">{t.message}</span>
          </button>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
