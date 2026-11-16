import type { Metadata } from "next";
import { getRobotsMetadata } from "@/constants/agency";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Ridelist, Morocco's modern car rental platform committed to transparent MAD pricing, verified vehicle quality, and convenient delivery.",
  robots: getRobotsMetadata(),
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Ridelist",
    description:
      "Learn about Ridelist, Morocco's modern car rental platform committed to transparent MAD pricing, verified vehicle quality, and convenient delivery.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
