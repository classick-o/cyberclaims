import { useState } from 'react';
import { post } from '../api.js';
import Brand from '../components/Brand.jsx';

export default function Login({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { admin } = await post('/admin/auth/login', { email, password });
      onSignedIn(admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* The homepage hero, in miniature: aurora, glow, and a frosted card. */}
      <div className="aurora" aria-hidden="true" />
      <div
        className="glow-blob"
        aria-hidden="true"
        style={{ background: '#6b3fa0', width: '38rem', height: '38rem', top: '-14rem', left: '-10rem' }}
      />
      <div
        className="glow-blob"
        aria-hidden="true"
        style={{
          background: '#8b5bbd',
          width: '28rem',
          height: '28rem',
          bottom: '-10rem',
          right: '-6rem',
          opacity: 0.3,
        }}
      />

      <div className="login">
        <form className="login-card" onSubmit={submit}>
          <div className="login-brand">
            <Brand size="2.4rem" />
          </div>

          <h1>Sign in</h1>
          <p className="sub">Manage articles, media and the cases coming in from the site.</p>

          {error && <div className="banner error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
}
