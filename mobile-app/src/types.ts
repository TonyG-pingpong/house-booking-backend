export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl?: string | null;
  createdAt: string;
  hostId: number;
}

export interface Booking {
  id: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  userId: number;
  listingId: number;
  listing?: Listing;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  receiverId: number;
  listingId: number | null;
  sender?: { id: number; email: string };
  receiver?: { id: number; email: string };
  listing?: { id: number; title: string } | null;
}

export interface AuthProfile {
  userId: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}
