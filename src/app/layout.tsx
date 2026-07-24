import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AppProviders } from "@/providers/app-providers";
import { PwaRegister } from "@/components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://xpay.expert";
const APP_NAME = "XPay.Expert";
const APP_DESCRIPTION =
  "Enterprise payments infrastructure — accept cards, Pix, MBWay and crypto with one unified API. Treasury, FX, merchant payouts and risk management.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XPay.Expert — Enterprise Payments Infrastructure",
    template: "%s · XPay.Expert",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "XPay.Expert",
    "XPay",
    "payments",
    "fintech",
    "payment API",
    "Pix",
    "MBWay",
    "Apple Pay",
    "Google Pay",
    "crypto payments",
    "USDT",
    "Bitcoin",
    "treasury",
    "FX",
    "merchant payouts",
    "SEPA",
    "enterprise payments",
    "payment gateway",
    "payout wizard",
    "multi-currency",
    "subscription billing",
    "payment links",
  ],
  authors: [{ name: "XPay Expert, Inc.", url: SITE_URL }],
  creator: "XPay Expert, Inc.",
  publisher: "XPay Expert, Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: APP_NAME,
    title: "XPay.Expert — Enterprise Payments Infrastructure",
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XPay.Expert — Enterprise Payments Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XPay.Expert — Enterprise Payments Infrastructure",
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@XPay_Expert",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B1220" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="XPay" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
        <Toaster />
        <SonnerToaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans",
          }}
        />
        <PwaRegister />
      </body>
    </html>
  );
}