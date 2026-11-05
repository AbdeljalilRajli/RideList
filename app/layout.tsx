import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import '@fortawesome/fontawesome-svg-core/styles.css';


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
        <link rel="icon" href="/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo-icon.png" />
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
