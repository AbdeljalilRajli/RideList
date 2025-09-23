import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import Font Awesome CSS


export const metadata: Metadata = {
  title: "RideList - Premium Car Rental Service",
  description: "Discover and rent the best cars in the world. From luxury vehicles to economy cars, find your perfect ride with RideList.",
  keywords: "car rental, luxury cars, vehicle rental, car booking, premium cars",
  authors: [{ name: "RideList Team" }],
  openGraph: {
    title: "RideList - Premium Car Rental Service",
    description: "Discover and rent the best cars in the world. From luxury vehicles to economy cars, find your perfect ride with RideList.",
    url: "https://ridelist.com",
    siteName: "RideList",
    images: [
      {
        url: "/ridelist-mockup.webp",
        width: 1200,
        height: 630,
        alt: "RideList - Premium Car Rental Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RideList - Premium Car Rental Service",
    description: "Discover and rent the best cars in the world. From luxury vehicles to economy cars, find your perfect ride with RideList.",
    images: ["/ridelist-mockup.webp"],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <meta name="theme-color" content="#3730a3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="relative">
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
