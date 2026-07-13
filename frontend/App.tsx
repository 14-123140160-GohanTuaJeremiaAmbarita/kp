import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('auth:expired', handleExpiredSession);

    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse active session user', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={(u) => setUser(u)} />;
  }

  return <Home user={user} onLogout={handleLogout} />;
}
