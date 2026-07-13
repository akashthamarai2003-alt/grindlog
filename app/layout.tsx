import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
  ],
};

export const metadata: Metadata = {
  title: "GrindLog — Personal Growth OS",
  description:
    "Transform your habits into a living, breathing tree. The most beautiful mobile AI habit tracker. Grow with every action.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrindLog",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "GrindLog — Personal Growth OS",
    description:
      "Transform your habits into a living, breathing tree. AI-powered, beautifully designed.",
    type: "website",
    siteName: "GrindLog",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
