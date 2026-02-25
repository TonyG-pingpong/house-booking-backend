/**
 * Token storage: uses Capacitor Preferences when running in native app,
 * localStorage when in browser (dev or PWA). Replace with secure storage plugin for production if needed.
 */
const TOKEN_KEY = 'access_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: TOKEN_KEY });
      return value;
    }
  } catch {
    // Fallback if Capacitor not available (e.g. during SSR or before load)
  }
  return localStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: TOKEN_KEY, value: token });
      return;
    }
  } catch {
    // ignore
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export async function clearStoredToken(): Promise<void> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.remove({ key: TOKEN_KEY });
      return;
    }
  } catch {
    // ignore
  }
  localStorage.removeItem(TOKEN_KEY);
}
