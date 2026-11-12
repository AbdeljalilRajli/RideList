import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Fleet",
  description:
    "Explore our wide range of premium rental cars in Morocco. From luxury sedans and family SUVs to economical city cars, find the ideal ride for your journey.",
  alternates: {
    canonical: "/fleet",
  },
  openGraph: {
    title: "Our Fleet | Ridelist",
    description:
      "Explore our wide range of premium rental cars in Morocco. From luxury sedans and family SUVs to economical city cars, find the ideal ride for your journey.",
    url: "/fleet",
  },
};

export default function FleetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
