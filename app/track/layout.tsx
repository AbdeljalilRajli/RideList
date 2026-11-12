import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Booking",
  description:
    "Track the live status of your Ridelist car reservation in real-time using your booking reference code and contact details.",
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
