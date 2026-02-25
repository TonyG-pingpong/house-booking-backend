import { NavLink, Outlet } from 'react-router-dom';
import './TabLayout.css';

export default function TabLayout() {
  return (
    <div className="tab-layout">
      <main className="tab-main">
        <Outlet />
      </main>
      <nav className="tab-nav">
        <NavLink to="/listings" className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')} end>
          Listings
        </NavLink>
        <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}>
          Bookings
        </NavLink>
        <NavLink to="/messages" className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}>
          Messages
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'tab-link active' : 'tab-link')}>
          Profile
        </NavLink>
      </nav>
    </div>
  );
}
