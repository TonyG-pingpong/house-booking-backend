import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePolling } from './usePolling';

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback immediately when enabled', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000, true));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls callback again after interval when enabled', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000, true));
    expect(callback).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    renderHook(() => usePolling(callback, 5000, false));
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('stops polling when unmounted', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePolling(callback, 5000, true));
    expect(callback).toHaveBeenCalledTimes(1);
    unmount();
    vi.advanceTimersByTime(10000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
