import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getAppUrl } from "@/lib/api";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicOnly } from "@/components/layout/public-only";
import { AnimatedBackground } from "@/components/shared/animated-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Vedam Events | School of Technology",
    template: "%s | Vedam Events",
  },
  description:
    "Premium workshops, AI bootcamps, hackathons, and founder talks. Join Vedam School of Technology's builder community.",
  keywords: [
    "Vedam",
    "events",
    "AI bootcamp",
    "hackathon",
    "workshop",
    "technology",
    "startup",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Vedam Events",
    title: "Vedam Events | School of Technology",
    description:
      "Learn tech by building it. Premium events for builders and founders.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedam Events",
    description: "Premium tech events by Vedam School of Technology",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/vedam-logo.webp",
    apple: "/vedam-logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AnimatedBackground />
        <PublicOnly>
          <Header />
        </PublicOnly>
        <main className="min-h-screen">{children}</main>
        <PublicOnly>
          <Footer />
        </PublicOnly>
      </body>
    </html>
  );
}
