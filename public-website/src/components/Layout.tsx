import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function Layout() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          Stay & Book
        </Link>
        <nav className="nav">
          <Link to="/">Listings</Link>
          {user ? (
            <>
              <Link to="/my-bookings">My Bookings</Link>
              <span className="user-email">{user.email}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAuthOpen(true)}
            >
              Log in
            </button>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
