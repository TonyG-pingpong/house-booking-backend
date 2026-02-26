import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../contexts/AuthContext';
import type { Listing } from '../types';
import './Dashboard.css';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  location: '',
  imageUrl: '',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const load = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .getMyListings()
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
    setError(null);
  };

  const openEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      description: listing.description,
      price: String(listing.price),
      location: listing.location,
      imageUrl: listing.imageUrl ?? '',
    });
    setFormOpen(true);
    setError(null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setError(null);
    try {
      const { url } = await api.uploadListingImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a positive number');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    try {
      const imageUrl = form.imageUrl.trim() || undefined;
      if (editingId) {
        await api.updateListing(editingId, {
          title: form.title,
          description: form.description,
          price,
          location: form.location,
          imageUrl,
        });
      } else {
        await api.createListing({
          title: form.title,
          description: form.description,
          price,
          location: form.location,
          imageUrl,
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
      await api.deleteListing(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-empty">Log in to manage your listings.</p>
      </div>
    );
  }

  if (loading) return <p className="dashboard-loading">Loading your listings…</p>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Host dashboard</h1>
        <button type="button" className="dashboard-add-btn" onClick={openAdd}>
          Add listing
        </button>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      {formOpen && (
        <form className="dashboard-form" onSubmit={submit}>
          <h3 className="dashboard-form-title">{editingId ? 'Edit listing' : 'New listing'}</h3>
          <label className="dashboard-form-label">
            Title
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="dashboard-form-input"
            />
          </label>
          <label className="dashboard-form-label">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              required
              className="dashboard-form-input"
            />
          </label>
          <label className="dashboard-form-label">
            Price per night ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              className="dashboard-form-input"
            />
          </label>
          <label className="dashboard-form-label">
            Image (URL or upload)
            <div className="dashboard-form-image">
              <input
                type="text"
                placeholder="Paste URL or upload below"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="dashboard-form-input"
              />
              <label className="dashboard-form-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageFile}
                  disabled={imageUploading}
                />
                {imageUploading ? 'Uploading…' : 'Upload image'}
              </label>
              {form.imageUrl && (
                <img
                  src={api.getImageUrl(form.imageUrl)}
                  alt="Preview"
                  className="dashboard-form-preview"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              )}
            </div>
          </label>
          <label className="dashboard-form-label">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={3}
              className="dashboard-form-input dashboard-form-textarea"
            />
          </label>
          <div className="dashboard-form-actions">
            <button type="submit" className="dashboard-form-submit" disabled={submitLoading}>
              {submitLoading ? '…' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" className="dashboard-form-cancel" onClick={closeForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="dashboard-list">
        {listings.map((listing) => (
          <div key={listing.id} className="dashboard-card">
            {listing.imageUrl && (
              <img
                src={api.getImageUrl(listing.imageUrl)}
                alt=""
                className="dashboard-card-img"
              />
            )}
            <div className="dashboard-card-body">
              <h3 className="dashboard-card-title">{listing.title}</h3>
              <p className="dashboard-card-location">{listing.location}</p>
              <p className="dashboard-card-price">${listing.price} / night</p>
              <p className="dashboard-card-desc">{listing.description}</p>
            </div>
            <div className="dashboard-card-actions">
              <Link to={`/listings/${listing.id}`} className="dashboard-card-link">
                View
              </Link>
              <button type="button" className="dashboard-card-link" onClick={() => openEdit(listing)}>
                Edit
              </button>
              <button
                type="button"
                className="dashboard-card-link dashboard-card-delete"
                onClick={() => handleDelete(listing.id, listing.title)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && !formOpen && (
        <p className="dashboard-empty">
          You have no listings yet. Tap <strong>Add listing</strong> to create one.
        </p>
      )}
    </div>
  );
}
