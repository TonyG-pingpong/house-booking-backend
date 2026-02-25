import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import type { Listing } from '../types';
import './Listings.css';

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getListings()
      .then(setListings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="listings-loading">Loading listings…</p>;
  if (error) return <p className="listings-error">{error}</p>;

  return (
    <div className="listings-page">
      <h1 className="listings-title">Listings</h1>
      {listings.length === 0 ? (
        <p className="listings-empty">No listings yet.</p>
      ) : (
        <ul className="listings-list">
          {listings.map((l) => (
            <li key={l.id}>
              <Link to={`/listings/${l.id}`} className="listings-card">
                {l.imageUrl && (
                  <img src={api.getImageUrl(l.imageUrl)} alt="" className="listings-card-img" />
                )}
                <div className="listings-card-body">
                  <strong>{l.title}</strong>
                  <span className="listings-card-location">{l.location}</span>
                  <span className="listings-card-price">${l.price}/night</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
