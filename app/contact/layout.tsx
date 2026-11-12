import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Ridelist in Marrakech. Contact our support team via WhatsApp, phone, or email for reservations, airport pickup, and inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Ridelist",
    description:
      "Get in touch with Ridelist in Marrakech. Contact our support team via WhatsApp, phone, or email for reservations, airport pickup, and inquiries.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
