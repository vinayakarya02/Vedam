import type { Metadata } from "next";
import Script from "next/script";
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
      {/* Google Tag Manager */}
      <Script id="gtm-base" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K7ZDF4K4');`}
      </Script>
      {/* End Google Tag Manager */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K7ZDF4K4"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
