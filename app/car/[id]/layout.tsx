import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import { AGENCY_CONFIG, getRobotsMetadata } from "@/constants/agency";
import { normalizeFuel, normalizeTransmission } from "@/lib/carTaxonomy";

export const revalidate = 3600; // Sensible cache: 1 hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarForMetadata(id);

  // Hidden or unknown cars must never leak: fall back to default site preview
  if (!car) {
    return {
      title: "Ridelist | Premium Car Rental in Morocco",
      description:
        "Discover and rent quality cars across Morocco. Verified fleet, booking request with confirmation on WhatsApp, transparent pricing, and convenient delivery.",
      robots: getRobotsMetadata(),
      alternates: {
        canonical: `/car/${id}`,
      },
      openGraph: {
        type: "website",
        siteName: "Ridelist",
        url: `${AGENCY_CONFIG.siteUrl}/car/${id}`,
        title: "Ridelist | Premium Car Rental in Morocco",
        description:
          "Discover and rent quality cars across Morocco. Verified fleet, booking request with confirmation on WhatsApp, transparent pricing, and convenient delivery.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Ridelist | Premium Car Rental in Morocco",
        description:
          "Discover and rent quality cars across Morocco. Verified fleet, booking request with confirmation on WhatsApp, transparent pricing, and convenient delivery.",
      },
    };
  }

  const carName = `${car.make} ${car.model}`;
  const transmission = normalizeTransmission(car.transmission);
  const fuel = normalizeFuel(car.fuel_type);
  const seats = `${car.seats || 5} seats`;
  const price = car.price_per_day || (car as any).price || 500;

  const title = `${carName} for rent in Morocco | Ridelist`;
  const description = `Rent the ${carName} in Morocco from ${price} DH/day. Features ${seats}, ${transmission} transmission, and ${fuel} engine. Booking request with confirmation on WhatsApp.`;

  return {
    title: {
      absolute: title,
    },
    description,
    robots: getRobotsMetadata(),
    alternates: {
      canonical: `/car/${id}`,
    },
    openGraph: {
      type: "website",
      siteName: "Ridelist",
      url: `${AGENCY_CONFIG.siteUrl}/car/${id}`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CarDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
