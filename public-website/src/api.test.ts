import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getImageUrl, getMessages } from './api';

describe('getImageUrl', () => {
  it('returns empty string for null or undefined', () => {
    expect(getImageUrl(null)).toBe('');
    expect(getImageUrl(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getImageUrl('')).toBe('');
  });

  it('returns URL as-is when it already starts with http', () => {
    const url = 'https://example.com/image.jpg';
    expect(getImageUrl(url)).toBe(url);
  });

  it('prepends API base to relative path', () => {
    const result = getImageUrl('/uploads/photo.jpg');
    expect(result).toContain('/uploads/photo.jpg');
    expect(result).toMatch(/^https?:\/\//);
  });

  it('handles path without leading slash', () => {
    const result = getImageUrl('uploads/photo.jpg');
    expect(result).toContain('uploads/photo.jpg');
  });
});

describe('getMessages (instant chat)', () => {
  const mockMessages = [{ id: 1, content: 'Hi', createdAt: '2025-06-01T12:00:00Z', senderId: 1, receiverId: 2, listingId: null }];

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => 'fake-token'), setItem: vi.fn(), removeItem: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls /messages when no since param', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMessages),
    });
    await getMessages();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages'),
      expect.any(Object)
    );
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).not.toContain('since=');
  });

  it('calls /messages?since= when since param provided (instant chat polling)', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMessages),
    });
    const since = '2025-06-01T12:00:00.000Z';
    await getMessages(since);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/messages\?since=/),
      expect.any(Object)
    );
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
      encodeURIComponent(since)
    );
  });
});
