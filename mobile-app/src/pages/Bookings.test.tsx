import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Bookings from './Bookings';

vi.mock('../api', () => ({
  getBookings: vi.fn(),
}));

const api = await import('../api');

describe('Bookings', () => {
  beforeEach(() => {
    vi.mocked(api.getBookings).mockReset();
  });

  it('shows loading then empty state when no bookings', async () => {
    vi.mocked(api.getBookings).mockResolvedValueOnce([]);
    render(<Bookings />);
    expect(screen.getByText(/Loading bookings/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No bookings yet.')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'My Bookings' })).toBeInTheDocument();
  });

  it('shows error when getBookings fails', async () => {
    vi.mocked(api.getBookings).mockRejectedValueOnce(new Error('Network error'));
    render(<Bookings />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('renders list of bookings with listing info', async () => {
    vi.mocked(api.getBookings).mockResolvedValueOnce([
      {
        id: 1,
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        userId: 1,
        listingId: 10,
        listing: {
          id: 10,
          title: 'Cozy Cabin',
          location: 'Lake View',
          description: '',
          price: 100,
          createdAt: '',
          hostId: 1,
        },
      } as import('../types').Booking,
    ]);
    render(<Bookings />);
    await waitFor(() => {
      expect(screen.getByText('Cozy Cabin')).toBeInTheDocument();
    });
    expect(screen.getByText(/2025-06-01 – 2025-06-03/)).toBeInTheDocument();
    expect(screen.getByText('Lake View')).toBeInTheDocument();
  });
});
