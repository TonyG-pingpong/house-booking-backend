import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} from '../api';
import { useAuth } from '../AuthContext';
import type { Listing } from '../types';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  location: '',
};

export function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMyListings()
      .then(setListings)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setError('');
  };

  const openEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      location: listing.location,
    });
    setFormOpen(true);
    setError('');
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a positive number');
      return;
    }
    setError('');
    setSubmitLoading(true);
    try {
      if (editingId) {
        await updateListing(editingId, {
          title: form.title,
          description: form.description,
          price,
          location: form.location,
        });
      } else {
        await createListing({
          title: form.title,
          description: form.description,
          price,
          location: form.location,
        });
      }
      closeForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteListing(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!user) {
    return (
      <div className="page-message">
        <p>Log in to manage your listings.</p>
      </div>
    );
  }

  if (loading) return <div className="page-loading">Loading your listings…</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Host dashboard</h1>
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          Add listing
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {formOpen && (
        <form className="dashboard-form card" onSubmit={submit}>
          <h3>{editingId ? 'Edit listing' : 'New listing'}</h3>
          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label>
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              required
            />
          </label>
          <label>
            Price per night ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              required
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? '…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="dashboard-list">
        {listings.map((listing) => (
          <div key={listing.id} className="dashboard-card card">
            <div className="dashboard-card-main">
              <h3>{listing.title}</h3>
              <p className="dashboard-card-location">{listing.location}</p>
              <p className="dashboard-card-price">${listing.price} / night</p>
              <p className="dashboard-card-desc">{listing.description}</p>
            </div>
            <div className="dashboard-card-actions">
              <Link to={`/listings/${listing.id}`} className="btn btn-ghost">
                View
              </Link>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => openEdit(listing)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleDelete(listing.id, listing.title)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && !formOpen && (
        <p className="empty-state">
          You have no listings yet. Click <strong>Add listing</strong> to create one.
        </p>
      )}
    </div>
  );
}
