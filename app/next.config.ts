import type { NextConfig } from "next";
import withPWA, { runtimeCaching } from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 300,
      static: 180,
    },
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-day-picker",
      "date-fns",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "accelerometer=(self \"https://api.razorpay.com\" \"https://checkout.razorpay.com\"), payment=(self \"https://api.razorpay.com\" \"https://checkout.razorpay.com\")",
          },
        ],
      },
    ];
  },
};

const filteredRuntimeCaching = runtimeCaching.filter(
  (entry) => entry.options?.cacheName !== "cross-origin"
);

const config = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: filteredRuntimeCaching,
  },
})(nextConfig);

export default config;
