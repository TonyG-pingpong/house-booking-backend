import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListing } from '../api';
import { useAuth } from '../AuthContext';
import { createBooking } from '../api';
import type { Listing } from '../types';
import { AuthModal } from '../components/AuthModal';

export function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListing(Number(id))
      .then(setListing)
      .catch((e) => setError(e instanceof Error ? e.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !user) return;
    setBookingError('');
    setBookingLoading(true);
    try {
      await createBooking({
        listingId: listing.id,
        startDate,
        endDate,
        userId: user.userId,
      });
      navigate('/my-bookings');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="page-loading">Loading…</div>;
  if (error || !listing) return <div className="page-error">{error || 'Listing not found'}</div>;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="listing-detail">
      <div className="listing-detail-hero" />
      <div className="listing-detail-content">
        <h1>{listing.title}</h1>
        <p className="listing-detail-location">{listing.location}</p>
        <p className="listing-detail-price">
          <strong>${listing.price}</strong> / night
        </p>
        <p className="listing-detail-desc">{listing.description}</p>

        {user ? (
          <form className="booking-form" onSubmit={handleBook}>
            <h3>Book this place</h3>
            <label>
              Check-in
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            <label>
              Check-out
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </label>
            {bookingError && <p className="form-error">{bookingError}</p>}
            <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
              {bookingLoading ? 'Booking…' : 'Request to book'}
            </button>
          </form>
        ) : (
          <div className="booking-cta">
            <p>Log in to book this place.</p>
            <button type="button" className="btn btn-primary" onClick={() => setAuthOpen(true)}>
              Log in
            </button>
          </div>
        )}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
