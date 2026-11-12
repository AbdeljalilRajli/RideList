import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Ridelist, Morocco's modern car rental platform committed to transparent MAD pricing, premium vehicle quality, and seamless doorstep delivery.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Ridelist",
    description:
      "Learn about Ridelist, Morocco's modern car rental platform committed to transparent MAD pricing, premium vehicle quality, and seamless doorstep delivery.",
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
