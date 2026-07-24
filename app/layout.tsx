import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { InstallModal } from "@/components/pwa/install-modal";



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
  title: "GrindLog",
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
    other: [{ rel: "mask-icon", url: "/icons/notification-badge.svg", color: "#34C759" }],
  },
  openGraph: {
    title: "GrindLog",
    description:
      "Transform your habits into a living, breathing tree. AI-powered, beautifully designed.",
    type: "website",
    siteName: "GrindLog",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  let equippedTheme = "default";
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("equipped_theme")
      .eq("id", user.id)
      .single();
      
    if (profile?.equipped_theme) {
      equippedTheme = profile.equipped_theme;
    }
  }

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
        <Providers initialTheme={equippedTheme}>{children}</Providers>
        <InstallModal />
      </body>
    </html>
  );
}
