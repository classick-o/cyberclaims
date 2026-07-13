// Client-side submit for the three lead forms (hero, contact, start-process).
//
// All three POST the same shape to /api/lead; `source` tells the backend which form
// it came from. Same-origin, so no CORS and no absolute URL to keep in sync.

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

type Source = 'hero' | 'contact' | 'start_process';
type FieldError = { field: string; message: string };

const GENERIC =
  'Something went wrong on our side. Please try again, or email contact@cyberclaims.net.';

export function initLeadForm(form: HTMLFormElement, source: Source, onSuccess: () => void): void {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  let sending = false;

  const setStatus = (message: string) => {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStatus('');
    sending = true;
    const label = submit?.textContent ?? '';
    if (submit) {
      submit.disabled = true;
      submit.textContent = 'Sending...';
    }

    const payload: Record<string, string> = { source };
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string') payload[key] = value;
    });

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);

      if (res.ok && body?.success) {
        onSuccess();
        return;
      }

      if (res.status === 400 && Array.isArray(body?.errors)) {
        setStatus((body.errors as FieldError[]).map((e) => e.message).join(' '));
      } else {
        setStatus(body?.message ?? GENERIC);
      }
    } catch {
      setStatus('Could not reach the server. Please check your connection and try again.');
    } finally {
      sending = false;
      if (submit) {
        submit.disabled = false;
        submit.textContent = label;
      }
      // A Turnstile token is single-use. Without this reset, a user who hits a
      // validation error and resubmits gets rejected by the captcha instead.
      window.turnstile?.reset();
    }
  });
}
