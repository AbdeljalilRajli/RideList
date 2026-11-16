import type { Metadata } from "next";
import { getRobotsMetadata } from "@/constants/agency";

export const metadata: Metadata = {
  title: "Track Booking",
  description:
    "Track the live status of your Ridelist car reservation in real-time using your booking reference code and contact details.",
  robots: getRobotsMetadata(),
  alternates: {
    canonical: "/track",
  },
  openGraph: {
    title: "Track Booking | Ridelist",
    description:
      "Track the live status of your Ridelist car reservation in real-time using your booking reference code and contact details.",
    url: "/track",
  },
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
