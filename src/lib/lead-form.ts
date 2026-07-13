// Client-side submit for every form on the site: the three lead forms (hero, contact,
// start-process) and the newsletter strip.
//
// All of them are same-origin, so there is no CORS and no absolute URL to keep in
// sync with the backend.

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

type FieldError = { field: string; message: string };

type Options = {
  /** Where to POST. Same-origin path. */
  endpoint: string;
  /** Which form this is — the lead endpoint stores it, the newsletter ignores it. */
  source?: 'hero' | 'contact' | 'start_process' | 'url_checker';
  /** Called only once the server confirms. Never on a failure. */
  onSuccess: () => void;
};

const GENERIC =
  'Something went wrong on our side. Please try again, or email contact@cyberclaims.net.';

export function initForm(form: HTMLFormElement, { endpoint, source, onSuccess }: Options): void {
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

    const payload: Record<string, string> = source ? { source } : {};
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string') payload[key] = value;
    });

    try {
      const res = await fetch(endpoint, {
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

/** The three lead forms. */
export function initLeadForm(
  form: HTMLFormElement,
  source: 'hero' | 'contact' | 'start_process',
  onSuccess: () => void
): void {
  initForm(form, { endpoint: '/api/lead', source, onSuccess });
}
