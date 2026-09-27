import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.grindlog.app",
  appName: "GrindLog",
  webDir: "public",
  server: {
    url: "https://www.grindlog.in/auth/signin",
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
      launchShowDuration: 0,
      launchAutoHide: true,
    },
    Keyboard: {
      resize: "none",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
