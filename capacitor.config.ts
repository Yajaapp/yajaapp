import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAPACITOR_ANDROID_SERVER_URL || 'https://yajaasistencia.com/driver-app';

const config: CapacitorConfig = {
  appId: 'com.yajaasistencia.driver',
  appName: 'YAJA Conductor',
  webDir: 'capacitor-shell',
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
  },
  plugins: {
    Geolocation: {
      enableBackgroundTracking: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
    allowsLinkPreview: false,
    scheme: 'yaja',
    path: 'ios',
    useLiveReload: false,
    cordovaLinkerFlags: ['-ObjC'],
    prefersStatusBarHidden: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: false,
    handleApplicationNotifications: true,
    capacitorSettings: {
      hideLogs: false,
      iosScheme: 'yaja',
    },
    plugins: {
      Geolocation: {
        enableBackgroundTracking: true,
      },
      PushNotifications: {
        presentationOptions: ["badge", "sound", "alert"],
      },
    },
  },
};

export default config;
