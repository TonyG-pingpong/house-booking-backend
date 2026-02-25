import { useAuth } from '../contexts/AuthContext';
import './Home.css';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <h1>House Booking</h1>
      <p className="home-welcome">Welcome, {user?.email ?? 'Guest'}.</p>
      <p className="home-placeholder">Dashboard and navigation will go here (Phase 3: Listings, Bookings, Messages).</p>
      <button type="button" className="home-logout" onClick={() => logout()}>
        Log out
      </button>
    </div>
  );
}
