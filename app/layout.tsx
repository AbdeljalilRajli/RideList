import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import '@fortawesome/fontawesome-svg-core/styles.css';
import { AGENCY_CONFIG } from "@/constants/agency";

export const metadata: Metadata = {
  metadataBase: new URL(AGENCY_CONFIG.siteUrl),
  title: {
    default: "Ridelist | Premium Car Rental in Morocco",
    template: "%s | Ridelist",
  },
  description: "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
  keywords: "car rental, luxury cars, vehicle rental, car booking, premium cars, Morocco car rental, Marrakech car rental, Casablanca car rental",
  authors: [{ name: "Ridelist Team" }],
  openGraph: {
    type: "website",
    siteName: "Ridelist",
    url: AGENCY_CONFIG.siteUrl,
    title: "Ridelist | Premium Car Rental in Morocco",
    description: "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ridelist | Premium Car Rental in Morocco",
    description: "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
  },
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
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#3730a3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .reveal-base,
                .reveal-fade-up,
                .reveal-fade-scale,
                .reveal-fade {
                  opacity: 1 !important;
                  transform: none !important;
                }
              `,
            }}
          />
        </noscript>
      </head>
      <body className="relative bg-[#F8F8FB]">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
