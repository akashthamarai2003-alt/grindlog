import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { InstallModal } from "@/components/pwa/install-modal";
import { InstallPopup } from "@/components/pwa/install-popup";
import { AndroidBackButtonHandler } from "@/components/capacitor/android-back-button-handler";
import { AndroidAuthHandler } from "@/components/capacitor/android-auth-handler";



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
  applicationName: "GrindLog",
  title: "GrindLog | AI-Powered Fitness OS",
  description:
    "Smart hyper-personalized workouts, Indian nutrition engine, progressive overload tracking, and real-time AI coaching.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GrindLog Fitness",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=4", sizes: "any" },
      { url: "/icons/icon-192.png?v=4", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png?v=4",
    other: [{ rel: "mask-icon", url: "/icons/notification-badge.svg?v=4", color: "#ADFF00" }],
  },
  openGraph: {
    title: "GrindLog | AI-Powered Fitness OS",
    description:
      "Smart hyper-personalized workouts, Indian nutrition engine, progressive overload tracking, and real-time AI coaching.",
    type: "website",
    siteName: "GrindLog Fitness",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('grindlog_fitness_theme');
                  if (t === 'white') {
                    document.documentElement.classList.add('theme-white');
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('theme-white');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <InstallModal />
        <InstallPopup />
        <AndroidBackButtonHandler />
        <AndroidAuthHandler />
      </body>

    </html>
  );
}
