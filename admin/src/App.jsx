import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { get } from './api.js';
import Shell from './components/Shell.jsx';
import Login from './pages/Login.jsx';
import Posts from './pages/Posts.jsx';
import PostEditor from './pages/PostEditor.jsx';
import MediaLibrary from './pages/MediaLibrary.jsx';
import Leads from './pages/Leads.jsx';
import Subscribers from './pages/Subscribers.jsx';
import Taxonomy from './pages/Taxonomy.jsx';

export default function App() {
  const [admin, setAdmin] = useState(undefined); // undefined = still checking

  useEffect(() => {
    get('/admin/auth/me')
      .then((r) => setAdmin(r.admin))
      .catch(() => setAdmin(null));
  }, []);

  // Don't flash the login form at someone who is already signed in.
  if (admin === undefined) return null;
  if (!admin) return <Login onSignedIn={setAdmin} />;

  return (
    <Shell admin={admin} onSignedOut={() => setAdmin(null)}>
      <Routes>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/new" element={<PostEditor />} />
        <Route path="/posts/:id" element={<PostEditor />} />
        <Route path="/media" element={<MediaLibrary />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/taxonomy" element={<Taxonomy />} />
        <Route path="*" element={<Navigate to="/posts" replace />} />
      </Routes>
    </Shell>
  );
}
