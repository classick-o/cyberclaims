import { NavLink } from 'react-router-dom';
import { post } from '../api.js';

const NAV = [
  { to: '/posts', label: 'Articles' },
  { to: '/media', label: 'Media' },
  { to: '/taxonomy', label: 'Categories & Authors' },
  { to: '/leads', label: 'Leads' },
  { to: '/subscribers', label: 'Newsletter' },
];

export default function Shell({ admin, onSignedOut, children }) {
  const signOut = async () => {
    await post('/admin/auth/logout').catch(() => {});
    onSignedOut();
  };

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="brand">
          Cyber<span>claims</span>
        </div>

        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
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
  );
}
