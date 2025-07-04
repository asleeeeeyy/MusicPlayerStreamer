import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourdomain.musify',   
  appName: 'Musify',
  webDir: 'www',
  plugins: {
    SplashScreen: {
  launchShowDuration: 2000,
  splashFullScreen: true,
  splashImmersive: true,
  androidScaleType: "CENTER_CROP",
  showSpinner: false,
  backgroundColor: "#18002b"
}
  }
};

export default config;
