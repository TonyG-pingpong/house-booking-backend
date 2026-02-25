import { useEffect, useState } from 'react';
import * as api from '../api';
import type { Booking } from '../types';
import './Bookings.css';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getBookings()
      .then(setBookings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="bookings-loading">Loading bookings…</p>;
  if (error) return <p className="bookings-error">{error}</p>;

  return (
    <div className="bookings-page">
      <h1 className="bookings-title">My Bookings</h1>
      {bookings.length === 0 ? (
        <p className="bookings-empty">No bookings yet.</p>
      ) : (
        <ul className="bookings-list">
          {bookings.map((b) => (
            <li key={b.id} className="bookings-card">
              {b.listing && <strong>{b.listing.title}</strong>}
              <span className="bookings-dates">
                {b.startDate} – {b.endDate}
              </span>
              {b.listing && <span className="bookings-location">{b.listing.location}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
