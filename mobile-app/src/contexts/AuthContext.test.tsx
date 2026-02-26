import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  getProfile: vi.fn(),
}));
vi.mock('../storage', () => ({
  getStoredToken: vi.fn(() => Promise.resolve(null)),
  setStoredToken: vi.fn(() => Promise.resolve()),
  clearStoredToken: vi.fn(() => Promise.resolve()),
}));

const api = await import('../api');
const storage = await import('../storage');

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user">{auth.user ? auth.user.email : 'none'}</span>
      <span data-testid="error">{auth.error ?? 'none'}</span>
      <button type="button" onClick={() => auth.login('a@b.com', 'pass').catch(() => {})}>
        Login
      </button>
      <button type="button" onClick={() => auth.logout()}>
        Logout
      </button>
      <button type="button" onClick={() => auth.clearError()}>
        Clear error
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.mocked(storage.getStoredToken).mockResolvedValue(null);
    vi.mocked(api.login).mockReset();
    vi.mocked(api.signup).mockReset();
    vi.mocked(api.getProfile).mockReset();
  });

  it('starts with loading true then false when no token', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('loading').textContent).toBe('true');
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('login sets user and clears error on success', async () => {
    vi.mocked(api.login).mockResolvedValueOnce({ access_token: 'token' });
    vi.mocked(api.getProfile).mockResolvedValueOnce({
      userId: 1,
      email: 'user@test.com',
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user@test.com');
    });
    expect(api.login).toHaveBeenCalledWith('a@b.com', 'pass');
    expect(storage.setStoredToken).toHaveBeenCalledWith('token');
  });

  it('logout clears user', async () => {
    vi.mocked(storage.getStoredToken).mockResolvedValue('token');
    vi.mocked(api.getProfile).mockResolvedValueOnce({
      userId: 1,
      email: 'user@test.com',
    });
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('user@test.com');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
    expect(storage.clearStoredToken).toHaveBeenCalled();
  });

  it('clearError clears error state', async () => {
    vi.mocked(api.login).mockRejectedValueOnce(new Error('Invalid credentials'));
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).not.toBe('none');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear error' }));
    expect(screen.getByTestId('error').textContent).toBe('none');
  });
});
