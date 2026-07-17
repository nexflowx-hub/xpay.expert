import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AppProviders } from "@/providers/app-providers";

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
  "XPay.Expert is the enterprise fintech platform for global payments, FX, treasury and risk.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XPay.Expert — Enterprise Payments Infrastructure",
    template: "%s · XPay.Expert",
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "XPay.Expert", "XPay", "payments", "fintech", "payment API",
    "Pix", "MBWay", "crypto payments", "treasury", "FX",
  ],
  authors: [{ name: "XPay Expert, Inc.", url: SITE_URL }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1220",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
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
      </body>
    </html>
  );
}