import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.grindlog.app",
  appName: "GrindLog",
  webDir: "public",
  server: {
    url: "https://www.grindlog.in",
    cleartext: false,
    allowNavigation: [
      "www.grindlog.in",
      "grindlog.in",
      "*.supabase.co",
      "checkout.razorpay.com",
      "api.razorpay.com",
      "*.razorpay.com",
      "razorpay.com",
    ],

  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0A1108",
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      launchFadeOutDuration: 400,
      backgroundColor: "#0A1108",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: "none",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
