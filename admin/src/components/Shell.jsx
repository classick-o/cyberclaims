import { NavLink } from 'react-router-dom';
import { post } from '../api.js';
import Brand, { Icons } from './Brand.jsx';

const NAV = [
  { to: '/posts', label: 'Articles', icon: Icons.articles },
  { to: '/media', label: 'Media', icon: Icons.media },
  { to: '/taxonomy', label: 'Categories & Authors', icon: Icons.taxonomy },
  { to: '/leads', label: 'Leads', icon: Icons.leads },
  { to: '/subscribers', label: 'Newsletter', icon: Icons.newsletter },
];

export default function Shell({ admin, onSignedOut, children }) {
  const signOut = async () => {
    await post('/admin/auth/logout').catch(() => {});
    onSignedOut();
  };

  return (
    <>
      {/* The site's aurora and glow, so /admin doesn't read as a different product. */}
      <div className="aurora" aria-hidden="true" />
      <div
        className="glow-blob"
        aria-hidden="true"
        style={{ background: '#6b3fa0', width: '34rem', height: '34rem', top: '-12rem', left: '-8rem' }}
      />
      <div
        className="glow-blob"
        aria-hidden="true"
        style={{
          background: '#8b5bbd',
          width: '26rem',
          height: '26rem',
          bottom: '-10rem',
          right: '-6rem',
          opacity: 0.28,
        }}
      />

      <div className="shell">
        <nav className="sidebar">
          <a href="/" title="Open the site">
            <Brand />
          </a>

          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="sidebar-foot">
            <div className="who">
              <strong>{admin.name}</strong>
              {admin.role}
            </div>
            <button className="btn ghost sm" onClick={signOut} style={{ width: '100%' }}>
              Sign out
            </button>
          </div>
        </nav>

        <main className="main">{children}</main>
      </div>
    </>
  );
}
