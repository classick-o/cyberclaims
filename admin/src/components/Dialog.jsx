import { useCallback, useEffect, useRef, useState } from 'react';

// Replaces window.prompt and window.confirm.
//
// The native ones are drawn by the browser: a grey chrome box, pinned to the top of
// the screen, saying "localhost:3000 says". It is the one part of the admin the design
// system cannot reach, and it shows up at the exact moments the editor is doing
// something deliberate — naming a link, describing an image, deleting an article.

function Dialog({
  title,
  message,
  label,
  defaultValue = '',
  placeholder,
  multiline = false,
  confirmLabel = 'Save',
  danger = false,
  required = false,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);
  const field = useRef(null);

  useEffect(() => {
    field.current?.focus();
    field.current?.select?.();

    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const submit = (e) => {
    e.preventDefault();
    // A prompt returns its text; a confirm returns true. Both return null on cancel,
    // so `=== null` means "the user backed out" in every caller.
    onConfirm(label === undefined ? true : value);
  };

  const asks = label !== undefined;

  return (
    // mousedown, not click: releasing a drag that started inside the field must not
    // count as clicking the backdrop.
    <div className="modal-back" onMouseDown={onCancel}>
      <form
        className="modal modal-sm"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-head">
          <h2>{title}</h2>
        </div>

        <div className="modal-body">
          {message && <p className="modal-msg">{message}</p>}

          {asks && (
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="dialog-field">{label}</label>
              {multiline ? (
                <textarea
                  id="dialog-field"
                  ref={field}
                  rows={3}
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) => setValue(e.target.value)}
                />
              ) : (
                <input
                  id="dialog-field"
                  ref={field}
                  type="text"
                  value={value}
                  placeholder={placeholder}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn${danger ? ' danger' : ''}`}
            disabled={asks && required && !value.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * const [ask, dialog] = useDialog();
 *
 *   const alt = await ask({ title: 'Alt text', label: 'Describe the image' });
 *   if (alt === null) return;              // cancelled
 *
 *   const ok = await ask({ title: 'Delete?', confirmLabel: 'Delete', danger: true });
 *   if (!ok) return;                        // no `label` -> it's a confirm
 *
 * ...then render {dialog} somewhere in the component.
 */
export function useDialog() {
  const [state, setState] = useState(null);

  const ask = useCallback(
    (options) =>
      new Promise((resolve) => {
        setState({
          ...options,
          onConfirm: (value) => {
            setState(null);
            resolve(value);
          },
          onCancel: () => {
            setState(null);
            resolve(null);
          },
        });
      }),
    []
  );

  return [ask, state ? <Dialog key="dialog" {...state} /> : null];
}
