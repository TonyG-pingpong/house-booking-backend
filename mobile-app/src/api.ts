import type { Booking, Listing, Message } from './types';
import { getStoredToken } from './storage';

const DEFAULT_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** On Android use localhost:3000; run "adb reverse tcp:3000 tcp:3000" so emulator's port 3000 forwards to host. */
const ANDROID_API = 'http://127.0.0.1:3000';

/** API base URL. On Android we use 127.0.0.1:3000 with adb reverse so the emulator can reach the host backend. */
function getApiBase(): string {
  if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
    return ANDROID_API;
  }
  return DEFAULT_API;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const API_BASE = getApiBase();
  const token = await getStoredToken();
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
  return api<Listing[]>('/listings');
}

export async function getListing(id: number) {
  return api<Listing>(`/listings/${id}`);
}

export async function getMyListings() {
  return api<Listing[]>('/listings/my');
}

export async function uploadListingImage(file: File): Promise<{ url: string }> {
  const API_BASE = getApiBase();
  const token = await getStoredToken();
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
  return api<Listing>('/listings', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateListing(
  id: number,
  data: { title?: string; description?: string; price?: number; location?: string; imageUrl?: string }
) {
  return api<Listing>(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteListing(id: number) {
  return api<void>(`/listings/${id}`, { method: 'DELETE' });
}

// Messages
export async function getMessages(since?: string) {
  const path = since ? `/messages?since=${encodeURIComponent(since)}` : '/messages';
  return api<Message[]>(path);
}

export async function getMessage(id: number) {
  return api<Message>(`/messages/${id}`);
}

export async function createMessage(data: { content: string; receiverId: number; listingId?: number }) {
  return api<Message>('/messages', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMessage(id: number, data: { content?: string }) {
  return api<Message>(`/messages/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteMessage(id: number) {
  return api<void>(`/messages/${id}`, { method: 'DELETE' });
}

export async function deleteMessageThread(otherUserId: number, listingId?: number | null) {
  const params = new URLSearchParams({ otherUserId: String(otherUserId) });
  if (listingId != null && listingId !== 0) params.set('listingId', String(listingId));
  return api<{ deleted: number }>(`/messages/thread?${params}`, { method: 'DELETE' });
}

// Bookings
export async function getBookings() {
  return api<Booking[]>('/bookings');
}

export async function createBooking(data: {
  listingId: number;
  startDate: string;
  endDate: string;
  userId: number;
}) {
  return api<Booking>('/bookings', { method: 'POST', body: JSON.stringify(data) });
}
