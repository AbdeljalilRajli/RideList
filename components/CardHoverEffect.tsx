"use client";

import { HoverEffect } from "./HoverEffect";

export const projects = [
  {
    title: "Explore Ride Options",
    description: "Discover a diverse range of ride options tailored to your needs. Whether you're looking for a casual ride, a business trip, or a long-distance journey, RideList has you covered.",
    link: "#", // Link to the relevant page
  },
  {
    title: "User-Friendly Interface",
    description: "Navigate through our intuitive interface designed for a seamless user experience. Easily browse, book, and manage your rides with just a few clicks.",
    link: "#", // Link to the relevant page
  },
  {
    title: "Real-Time Tracking",
    description: "Stay updated with real-time tracking of your rides. Receive notifications and know exactly when to expect your driver, ensuring a hassle-free experience.",
    link: "#", // Link to the relevant page
  },
  {
    title: "Affordable Pricing",
    description: "Enjoy competitive pricing without compromising on quality. RideList offers transparent pricing and no hidden fees, making it easier to budget your rides.",
    link: "#", // Link to the relevant page
  },
  {
    title: "Secure Payments",
    description: "Experience secure and convenient payment options. RideList supports multiple payment methods, ensuring your transactions are safe and straightforward.",
    link: "#", // Link to the relevant page
  },
  {
    title: "Customer Support",
    description: "Our dedicated customer support team is here to help you 24/7. Whether you have questions or need assistance, we're just a message away.",
    link: "#", // Link to the relevant page
  },
];


export function CardHoverEffect() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
