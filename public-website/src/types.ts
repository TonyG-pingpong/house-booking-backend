export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
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

export interface AuthProfile {
  userId: number;
  email: string;
}

export interface LoginResponse {
  access_token: string;
}
