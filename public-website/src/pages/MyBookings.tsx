import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookings, getListings } from '../api';
import { useAuth } from '../AuthContext';
import type { Booking } from '../types';
import type { Listing } from '../types';

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([getBookings(), getListings()])
      .then(([b, l]) => {
        setBookings(b);
        setListings(l);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  const myBookings = user ? bookings.filter((b) => b.userId === user.userId) : [];
  const getListing = (id: number) => listings.find((l) => l.id === id);

  if (!user) {
    return (
      <div className="page-message">
        <p>Log in to see your bookings.</p>
      </div>
    );
  }
  if (loading) return <div className="page-loading">Loading your bookings…</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="my-bookings-page">
      <h1>My Bookings</h1>
      <div className="bookings-list">
        {myBookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-card-main">
              <span className="booking-dates">
                {new Date(booking.startDate).toLocaleDateString()} –{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </span>
              {(() => {
                const listing = getListing(booking.listingId);
                return listing ? (
                  <>
                    <h3>{listing.title}</h3>
                    <p className="booking-location">{listing.location}</p>
                    <p className="booking-price">${listing.price} / night</p>
                    <Link to={`/listings/${booking.listingId}`} className="btn btn-ghost">
                      View listing
                    </Link>
                  </>
                ) : (
                  <p>
                    <Link to={`/listings/${booking.listingId}`}>View listing #{booking.listingId}</Link>
                  </p>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
      {myBookings.length === 0 && (
        <p className="empty-state">You have no bookings yet. <Link to="/">Browse listings</Link>.</p>
      )}
    </div>
  );
}
