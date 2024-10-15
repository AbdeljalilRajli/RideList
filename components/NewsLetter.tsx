"use client";

import React, { useState } from "react";
import { CustomButton } from "@/components/CustomButton"; // Ensure the path is correct

export function NewsLetter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    // Handle subscription logic here (e.g., API call)
    console.log(`Subscribed: ${email}`);
    setEmail(""); // Reset the email input after subscription
  };

  return (
    <div className="flex flex-col items-center justify-center h-[15rem] mb-10 w-full antialiased">
      <div className="max-w-2xl w-full p-4 text-center flex flex-col items-center">
        <h1 className="hero__title text-center mb-4">Join the RideList Waitlist</h1>
        <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
          Welcome to RideList, the ultimate car listing platform. 
          Discover reliable, affordable, and high-quality vehicles tailored for your needs. 
          Whether you're buying, selling, or just browsing, RideList is here to help you find your perfect ride.
        </p>

        <div className="flex items-center justify-center mt-4">
          <input
            type="text"
            placeholder="info@ridelist.com"
            className="rounded-lg border py-2 px-4 border-indigo-800 focus:ring-2 focus:ring-indigo-800 w-1/2 mr-2 placeholder:text-neutral-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <CustomButton 
            title="Subscribe"
            containerStyles="bg-indigo-800 text-white rounded-lg px-4 py-2"
            handleClick={handleSubscribe}
          />
        </div>
      </div>
    </div>
  );
}
