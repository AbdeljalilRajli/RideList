import type { Metadata } from "next";
import { getCarForMetadata } from "@/lib/getCarForMetadata";
import { AGENCY_CONFIG } from "@/constants/agency";

export const revalidate = 3600; // Sensible cache: 1 hour

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const car = await getCarForMetadata(params.id);

  // Hidden or unknown cars must never leak: fall back to default site preview
  if (!car) {
    return {
      title: "Ridelist | Premium Car Rental in Morocco",
      description:
        "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
      alternates: {
        canonical: `/car/${params.id}`,
      },
      openGraph: {
        type: "website",
        siteName: "Ridelist",
        url: `${AGENCY_CONFIG.siteUrl}/car/${params.id}`,
        title: "Ridelist | Premium Car Rental in Morocco",
        description:
          "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
      },
      twitter: {
        card: "summary_large_image",
        title: "Ridelist | Premium Car Rental in Morocco",
        description:
          "Discover and rent the best cars across Morocco. Premium fleet, instant WhatsApp confirmation, transparent pricing, and doorstep delivery.",
      },
    };
  }

  const carName = `${car.make} ${car.model}`;
  const transmission =
    car.transmission === "a" || car.transmission === "automatic"
      ? "Automatic"
      : "Manual";
  const fuel = car.fuel_type
    ? car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1)
    : "Petrol";
  const seats = `${car.seats || 5} seats`;
  const price = car.price_per_day || (car as any).price || 500;

  const title = `${carName} for rent in Morocco | Ridelist`;
  const description = `Rent the ${carName} in Morocco from ${price} DH/day. Features ${seats}, ${transmission} transmission, and ${fuel} engine. Instant booking with WhatsApp confirmation.`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `/car/${params.id}`,
    },
    openGraph: {
      type: "website",
      siteName: "Ridelist",
      url: `${AGENCY_CONFIG.siteUrl}/car/${params.id}`,
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
