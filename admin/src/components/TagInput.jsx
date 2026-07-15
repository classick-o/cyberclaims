import { useRef, useState } from 'react';

// Keywords as chips.
//
// This replaces a comma-separated text field that could not accept a comma. Its value
// was derived from the array — `keywords.join(', ')` — and every keystroke re-parsed it
// with `split(',').filter(Boolean)`. So the instant you typed a comma it produced an
// empty trailing entry, the filter dropped it, the array round-tripped back to the same
// string, and the comma vanished. The one character the field existed to accept was the
// one character it silently ate.
//
// Chips avoid the round-trip entirely: what you type lives in its own state until you
// commit it, and the array only ever holds finished keywords.

export default function TagInput({ value = [], onChange, placeholder, id }) {
  const [draft, setDraft] = useState('');
  const input = useRef(null);

  const commit = (raw) => {
    // Pasting "a, b, c" should give three chips, not one.
    const added = raw
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .filter((k) => !value.includes(k));

    if (added.length) onChange([...value, ...added]);
    setDraft('');
  };

  const remove = (keyword) => onChange(value.filter((k) => k !== keyword));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
      return;
    }
    // Backspace in an empty box takes back the last chip — the thing everyone tries.
    if (e.key === 'Backspace' && draft === '' && value.length) {
      e.preventDefault();
      remove(value[value.length - 1]);
    }
  };

  return (
    <div className="tags" onClick={() => input.current?.focus()}>
      {value.map((keyword) => (
        <span key={keyword} className="tag">
          {keyword}
          <button
            type="button"
            className="tag-x"
            aria-label={`Remove ${keyword}`}
            onClick={(e) => {
              e.stopPropagation();
              remove(keyword);
            }}
          >
            ×
          </button>
        </span>
      ))}

      <input
        ref={input}
        id={id}
        type="text"
        className="tag-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        // Losing focus with something half-typed should keep it, not bin it.
        onBlur={() => commit(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData('text');
          if (!text.includes(',')) return;
          e.preventDefault();
          commit(text);
        }}
        placeholder={value.length ? '' : placeholder}
      />
    </div>
  );
}
