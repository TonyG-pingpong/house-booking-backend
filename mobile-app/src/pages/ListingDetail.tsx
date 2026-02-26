import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Listing } from '../types';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getListing(Number(id))
      .then(setListing)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing || !user) return;
    setBookingError(null);
    setBookingLoading(true);
    try {
      await api.createBooking({
        listingId: listing.id,
        startDate,
        endDate,
        userId: user.userId,
      });
      navigate('/bookings');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <p className="detail-loading">Loading…</p>;
  if (error) return <p className="detail-error">{error}</p>;
  if (!listing) return <p className="detail-error">Listing not found.</p>;

  const today = new Date().toISOString().slice(0, 10);
  const isHost = user && user.userId === listing.hostId;

  return (
    <div className="listing-detail">
      <Link to="/listings" className="detail-back">← Listings</Link>
      {listing.imageUrl && (
        <img src={api.getImageUrl(listing.imageUrl)} alt="" className="detail-img" />
      )}
      <h1 className="detail-title">{listing.title}</h1>
      <p className="detail-location">{listing.location}</p>
      <p className="detail-price">${listing.price} / night</p>
      <p className="detail-description">{listing.description}</p>

      {user && !isHost && (
        <Link
          to="/messages"
          state={{
            receiverId: listing.hostId,
            listingId: listing.id,
            listingTitle: listing.title,
          }}
          className="detail-contact-host"
        >
          Contact host
        </Link>
      )}

      {user && !isHost && (
        <form className="detail-booking-form" onSubmit={handleBook}>
          <h3 className="detail-booking-title">Book this place</h3>
          <label className="detail-booking-label">
            Check-in
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="detail-booking-input"
            />
          </label>
          <label className="detail-booking-label">
            Check-out
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="detail-booking-input"
            />
          </label>
          {bookingError && <p className="detail-booking-error">{bookingError}</p>}
          <button
            type="submit"
            className="detail-booking-btn"
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Booking…' : 'Request to book'}
          </button>
        </form>
      )}
    </div>
  );
}
