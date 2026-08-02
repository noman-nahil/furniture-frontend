import { APP_NAME } from "@/lib/config";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// ─────────────────────────────────────────────
// Fonts
// ─────────────────────────────────────────────

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // ✅ Preload only the weights you actually use — reduces font payload
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
// Site URL
// ─────────────────────────────────────────────

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

// ─────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Premium furniture and home décor. Discover curated pieces crafted for lasting elegance.",
  keywords: ["furniture", "home décor", "premium furniture", APP_NAME],
  authors: [{ name: APP_NAME }],
  // ✅ Tells browsers this is a web app — enables standalone mode on iOS
  applicationName: APP_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: APP_NAME,
    title: APP_NAME,
    description:
      "Premium furniture and home décor. Discover curated pieces crafted for lasting elegance.",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "Premium furniture and home décor. Discover curated pieces crafted for lasting elegance.",
  },
  // ✅ Prevents iOS from auto-linking phone numbers / emails in content
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

// `themeColor` moved out of `metadata` and into a dedicated `viewport` export —
// Next.js has deprecated it on the Metadata object and logs a build warning
// otherwise. Functionally identical, just the correct current API.
export const viewport: Viewport = {
  themeColor: "#FAFAF8",
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
    // ✅ suppressHydrationWarning: prevents mismatch warning from browser
    //    extensions that inject attributes onto <html> (e.g. password managers)
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}

          <Toaster
              position="top-right"
              toastOptions={{
                duration: 2500,
                // ─── Default toast style ──────────────────────────────
                style: {
                  // Matches the warm palette from globals.css
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
                // ─── Per-type overrides ───────────────────────────────
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