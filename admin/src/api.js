// API client.
//
// Same origin as the site, so the session cookie rides along with `credentials:
// same-origin` and there is no token to store in localStorage (where XSS could read
// it). Mutations echo the CSRF cookie back in a header — a cross-origin form can set
// neither, which is the point.

const csrf = () =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith('cc_csrf='))
    ?.slice('cc_csrf='.length) ?? '';

export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.status = status;
    this.errors = errors ?? [];
  }

  /** The message for a given field, if the server flagged one. */
  for(field) {
    return this.errors.find((e) => e.field === field)?.message;
  }
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (method !== 'GET') headers['x-csrf-token'] = csrf();
  if (body && !form) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.errors?.[0]?.message ?? data?.message ?? 'Something went wrong.',
      { status: res.status, errors: data?.errors }
    );
  }
  return data;
}

export const get = (p) => api(p);
export const post = (p, body) => api(p, { method: 'POST', body });
export const put = (p, body) => api(p, { method: 'PUT', body });
export const patch = (p, body) => api(p, { method: 'PATCH', body });
export const del = (p) => api(p, { method: 'DELETE' });
export const upload = (p, formData) => api(p, { method: 'POST', form: formData });
