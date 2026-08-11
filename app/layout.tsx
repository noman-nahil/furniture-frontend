import { APP_NAME, LOGO_PATH } from "@/lib/config";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  getSiteUrl,
  SITE_KEYWORDS,
  SITE_NAME,
} from "@/lib/seo/site";

// ─────────────────────────────────────────────
// Fonts
// ─────────────────────────────────────────────

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  applicationName: APP_NAME,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/Logo.png", type: "image/png" }],
    apple: [{ url: "/Logo.png", type: "image/png" }],
    shortcut: ["/Logo.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "og:logo": LOGO_PATH,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

// ─────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <AuthProvider>
          {children}

          <Toaster
              position="top-right"
              toastOptions={{
                duration: 2500,
                style: {
                  background: "#FAFAF8",
                  color: "#1A1A1A",
                  border: "1px solid #E8E2D9",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  marginTop: "70px",
                  boxShadow: "0 8px 24px rgba(26,26,26,0.10), 0 2px 6px rgba(26,26,26,0.06)",
                  fontSize: "14px",
                  fontWeight: "500",
                  maxWidth: "380px",
                },
                success: {
                  style: {
                    background: "#F0FAF4",
                    border: "1px solid #A7D7B8",
                    color: "#1A3D2B",
                  },
                  iconTheme: {
                    primary: "#2D6A4F",
                    secondary: "#F0FAF4",
                  },
                },
                error: {
                  style: {
                    background: "#FDF2F2",
                    border: "1px solid #F5C0BB",
                    color: "#7A1F1F",
                  },
                  iconTheme: {
                    primary: "#C0392B",
                    secondary: "#FDF2F2",
                  },
                },
              }}
            />
        </AuthProvider>
      </body>
    </html>
  );
}
