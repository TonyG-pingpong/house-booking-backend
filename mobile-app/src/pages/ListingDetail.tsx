import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api';
import type { Listing } from '../types';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getListing(Number(id))
      .then(setListing)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="detail-loading">Loading…</p>;
  if (error) return <p className="detail-error">{error}</p>;
  if (!listing) return <p className="detail-error">Listing not found.</p>;

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
    </div>
  );
}
