const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json();
}

export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

// Auth
export async function signup(email: string, password: string) {
  return api<{ access_token: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return api<{ access_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return api<{ userId: number; email: string }>('/auth/profile', {
    method: 'POST',
  });
}

// Listings
export async function getListings() {
  return api<import('./types').Listing[]>('/listings');
}

export async function getListing(id: number) {
  return api<import('./types').Listing>(`/listings/${id}`);
}

export async function getMyListings() {
  return api<import('./types').Listing[]>('/listings/my');
}

export async function uploadListingImage(file: File): Promise<{ url: string }> {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/listings/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? res.statusText);
  }
  return res.json();
}

export async function createListing(data: {
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl?: string;
}) {
  return api<import('./types').Listing>('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateListing(
  id: number,
  data: { title?: string; description?: string; price?: number; location?: string; imageUrl?: string }
) {
  return api<import('./types').Listing>(`/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: number) {
  return api<void>(`/listings/${id}`, { method: 'DELETE' });
}

// Bookings
export async function getBookings() {
  return api<import('./types').Booking[]>('/bookings');
}

export async function createBooking(data: {
  listingId: number;
  startDate: string;
  endDate: string;
  userId: number;
}) {
  return api<import('./types').Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
