// Client-side submit for every form on the site: hero, contact, start-process.
//
// All of them are same-origin, so there is no CORS and no absolute URL to keep in
// sync with the backend.

declare global {
  interface Window {
    turnstile?: {
      execute: (container: string | HTMLElement, options?: unknown) => void;
      reset: (container?: string | HTMLElement) => void;
      getResponse: (container?: string | HTMLElement) => string | undefined;
    };
    __ccTurnstileDone?: (token: string) => void;
    __ccTurnstileFail?: () => void;
  }
}

type FieldError = { field: string; message: string };

type Options = {
  /** Where to POST. Same-origin path. */
  endpoint: string;
  /** Which form this is - the lead endpoint stores it, so we know where a case came from. */
  source?:
    | 'hero'
    | 'contact'
    | 'start_process'
    | 'url_checker'
    | 'landing'
    | 'investigator'
    | 'scam_report';
  /** Called only once the server confirms. Never on a failure. */
  onSuccess: () => void;
};

const GENERIC =
  'Something went wrong on our side. Please try again, or email contact@cyberclaims.net.';

// captcha
//
// The challenge runs when the user presses the button, not when the page loads. So
// the form is just a form until they commit to sending it - and for a real person it
// resolves silently in milliseconds, with nothing to click.
//
// One form per page, so a single pending resolver is enough. Turnstile's callbacks are
// looked up by name on `window`, and they carry no widget reference, which is exactly
// why more than one form on a page would need explicit rendering instead.

let pending: { resolve: (token: string | null) => void; timer: number } | null = null;

function settle(token: string | null) {
  if (!pending) return;
  clearTimeout(pending.timer);
  const { resolve } = pending;
  pending = null;
  resolve(token);
}

if (typeof window !== 'undefined') {
  window.__ccTurnstileDone = (token) => settle(token);
  window.__ccTurnstileFail = () => settle(null);
}

function solveCaptcha(form: HTMLFormElement): Promise<string | null> {
  const widget = form.querySelector<HTMLElement>('.cf-turnstile');
  if (!widget || !window.turnstile) return Promise.resolve(null);

  // Already solved (a retry after a validation error, say).
  try {
    const existing = window.turnstile.getResponse(widget);
    if (existing) return Promise.resolve(existing);
  } catch {
    // getResponse throws if the widget isn't rendered yet. Fall through and execute.
  }

  return new Promise((resolve) => {
    pending = {
      resolve,
      // Never hold the form hostage to Cloudflare. If the challenge doesn't come back,
      // send without a token - the server fails open on an unreachable Turnstile for
      // exactly the same reason, and losing a fraud victim's case because a captcha
      // stalled is the worse failure.
      timer: window.setTimeout(() => settle(null), 20_000),
    };

    try {
      window.turnstile!.execute(widget);
    } catch {
      settle(null);
    }
  });
}

// submit


// identity fields
//
// Country of residence, the dial code and the phone number are three inputs describing
// one person, so they are wired together in one place rather than in each of the six
// forms that carry them.

function initIdentityFields(form: HTMLFormElement): void {
  const country = form.querySelector<HTMLSelectElement>('select[name="country_code"]');
  const dial = form.querySelector<HTMLSelectElement>('select[name="phone_dial"]');
  const phone = form.querySelector<HTMLInputElement>('input[name="phone"]');

  // Picking a country fills in the matching dial code - the common case is a visitor
  // whose number belongs to where they live, so make that the zero-click path. It stays
  // a real select, so anyone with a foreign number can still change it.
  if (country && dial) {
    const sync = () => {
      const chosen = country.selectedOptions[0]?.dataset.dial;
      if (!chosen) return;
      // Only move the dial code while the visitor hasn't set it themselves.
      if (dial.dataset.touched === '1') return;
      const match = Array.from(dial.options).find((o) => o.value === chosen);
      if (match) dial.value = match.value;
    };
    country.addEventListener('change', sync);
    dial.addEventListener('change', () => {
      dial.dataset.touched = '1';
    });
    sync();
  }

  // Digits only. Typed spaces are kept while typing (people group numbers) and the
  // server strips them when it builds E.164.
  phone?.addEventListener('input', () => {
    const cleaned = phone.value.replace(/[^\d\s]/g, '');
    if (cleaned !== phone.value) {
      const at = phone.selectionStart ?? cleaned.length;
      phone.value = cleaned;
      phone.setSelectionRange(at - 1, at - 1);
    }
  });

  // A select with a placeholder option shows the hint colour until a real choice is
  // made; the attribute is what the stylesheet keys off.
  for (const select of [country, dial]) {
    if (!select) continue;
    const paint = () => {
      if (select.value) select.removeAttribute('data-placeholder');
      else select.setAttribute('data-placeholder', '');
    };
    select.addEventListener('change', paint);
    paint();
  }
}

export function initForm(form: HTMLFormElement, { endpoint, source, onSuccess }: Options): void {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  let sending = false;

  // Every lead form on the site goes through initForm, so wiring the identity fields
  // here covers all of them at once.
  initIdentityFields(form);

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
      submit.textContent = 'Verifying...';
    }

    try {
      const token = await solveCaptcha(form);

      if (submit) submit.textContent = 'Sending...';

      const payload: Record<string, string> = source ? { source } : {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === 'string') payload[key] = value;
      });
      // Set it from the token we were handed rather than trusting the hidden input to
      // exist yet - the widget writes it, but only after its callback has fired.
      if (token) payload['cf-turnstile-response'] = token;

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
      // A Turnstile token is single-use. Without this reset, someone who hits a
      // validation error and resubmits is rejected by the captcha instead.
      const widget = form.querySelector<HTMLElement>('.cf-turnstile');
      if (widget) {
        try {
          window.turnstile?.reset(widget);
        } catch {
          /* not rendered; nothing to reset */
        }
      }
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
