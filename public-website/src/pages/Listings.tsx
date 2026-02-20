import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getListings } from '../api';
import type { Listing } from '../types';

export function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getListings()
      .then(setListings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading listings…</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="listings-page">
      <h1>Holiday homes</h1>
      <div className="listings-grid">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            to={`/listings/${listing.id}`}
            className="listing-card"
          >
            <div className="listing-card-image" />
            <div className="listing-card-body">
              <span className="listing-location">{listing.location}</span>
              <h3>{listing.title}</h3>
              <p className="listing-price">
                <strong>${listing.price}</strong> / night
              </p>
            </div>
          </Link>
        ))}
      </div>
      {listings.length === 0 && (
        <p className="empty-state">No listings yet. Check back later.</p>
      )}
    </div>
  );
}
