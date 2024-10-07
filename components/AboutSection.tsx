"use client";
import { TextGenerateEffect } from "./ui/TextGenerateEffect"; 


const words = `Welcome to RideList, the ultimate platform for booking, renting, and selling cars. Whether you're searching for the perfect car for your next adventure, need a reliable rental for business or leisure, or are looking to sell your vehicle to interested buyers, RideList has everything you need. Our platform is designed to make the process fast, easy, and transparent. 

With just a few clicks, you can explore a wide selection of vehicles, compare prices, and find the best deals available. Need a rental for a weekend getaway or a long-term solution? We offer flexible rental options to suit your needs. Want to sell your car? List it effortlessly and connect with potential buyers in your area.

At RideList, we prioritize convenience and trust, ensuring that every transaction is secure and seamless. From booking your dream car to closing a sale, our platform simplifies the entire experience. RideList – driving you towards better choices, every mile of the way.`;



const TextGenerateEffectDemo = () => {
  return <TextGenerateEffect words={words} />;
};

// Default export to use in page.tsx or elsewhere
export default TextGenerateEffectDemo;
