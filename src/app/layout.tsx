import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Breathe Easy | Home Air Filter Delivery & Installation in Atlanta",
  description:
    "Never think about your air filters again. Breathe Easy delivers and installs HVAC filters on your schedule. Serving the Greater Atlanta Area. Plans starting at $39/month.",
  keywords: [
    "air filter delivery",
    "HVAC filter installation",
    "home maintenance subscription",
    "Atlanta air filter service",
    "filter replacement service",
    "home air quality",
  ],
  authors: [{ name: "Breathe Easy" }],
  openGraph: {
    title: "Breathe Easy | Home Air Filter Delivery & Installation",
    description:
      "Never think about your air filters again. Hassle-free filter delivery and installation in the Greater Atlanta Area.",
    type: "website",
    locale: "en_US",
    siteName: "Breathe Easy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Breathe Easy | Home Air Filter Delivery & Installation",
    description:
      "Never think about your air filters again. Hassle-free filter delivery and installation in the Greater Atlanta Area.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0891b2" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
