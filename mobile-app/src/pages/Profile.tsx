import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>
      <div className="profile-card">
        <p className="profile-email">{user?.email}</p>
        <p className="profile-id">User ID: {user?.userId}</p>
      </div>
      <button type="button" className="profile-logout" onClick={() => logout()}>
        Log out
      </button>
    </div>
  );
}
