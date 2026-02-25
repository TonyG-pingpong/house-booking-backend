import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.housebooking.app',
  appName: 'House Booking',
  webDir: 'dist',
  server: {
    // Use https so Capacitor allows requests to http backend when configured (e.g. dev)
    androidScheme: 'https',
  },
};

export default config;
