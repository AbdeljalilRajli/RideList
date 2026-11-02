"use client";

import React, { useState } from "react";

export function NewsLetter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = () => {
    if (!email) return;
    console.log(`Subscribed: ${email}`);
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="w-full bg-[#EEEDF9] rounded-[24px] px-8 py-14 md:py-16">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3730A3]/10 text-[#3730A3] text-xs font-bold tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3730A3] animate-pulse" />
          Newsletter
        </span>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F0F1A] leading-tight">
          Join the RideList Waitlist
        </h2>

        {/* Subtitle */}
        <p className="text-[#6B7280] text-base leading-relaxed max-w-lg">
          Welcome to RideList, the ultimate car listing platform. Discover reliable, affordable, and high-quality vehicles tailored for your needs.
        </p>

        {/* Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 w-full h-12 px-5 rounded-full border border-[#E5E7EB] bg-white text-[#0F0F1A] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3730A3] focus:border-[#3730A3] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
          />
          <button
            onClick={handleSubscribe}
            className="h-12 px-7 rounded-full bg-[#3730A3] text-white font-semibold text-sm hover:bg-[#312E81] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap"
          >
            {submitted ? "Subscribed! ✓" : "Subscribe"}
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF]">No spam, ever. Unsubscribe at any time.</p>
      </div>
    </section>
  );
}
