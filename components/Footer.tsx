"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { usePathname } from "next/navigation";
import { AGENCY_CONFIG } from "@/constants/agency";
import { supabase } from "@/lib/supabase";
import { cars as fallbackCars } from "@/constants";
import { formatBodyType } from "@/lib/carTaxonomy";

const Footer = () => {
  const pathname = usePathname();

  // Pre-compute body types present in fallbackCars for instant SSR / initial hydration
  const [fleetTypes, setFleetTypes] = useState<string[]>(() => {
    const counts: Record<string, number> = {};
    (fallbackCars as any[]).forEach((c) => {
      const type = (c.body_type || (c.class?.toLowerCase().includes("suv") ? "suv" : "sedan")).toLowerCase();
      counts[type] = (counts[type] || 0) + 1;
    });
    const standardOrder = ["sedan", "hatchback", "suv", "minivan", "pickup", "convertible", "coupe", "van"];
    return standardOrder.filter((type) => (counts[type] || 0) > 0);
  });

  useEffect(() => {
    let isCancelled = false;
    async function loadFleetBodyTypes() {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("body_type, class")
          .neq("status", "hidden");

        if (!error && data && data.length > 0 && !isCancelled) {
          const counts: Record<string, number> = {};
          data.forEach((c) => {
            const type = (c.body_type || (c.class?.toLowerCase().includes("suv") ? "suv" : "sedan")).toLowerCase();
            counts[type] = (counts[type] || 0) + 1;
          });
          const standardOrder = ["sedan", "hatchback", "suv", "minivan", "pickup", "convertible", "coupe", "van"];
          const available = standardOrder.filter((type) => (counts[type] || 0) > 0);
          Object.keys(counts).forEach((t) => {
            if (!standardOrder.includes(t) && counts[t] > 0 && !available.includes(t)) {
              available.push(t);
            }
          });
          setFleetTypes(available);
        }
      } catch (err) {
        // Fallback already pre-loaded
      }
    }
    loadFleetBodyTypes();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Do not render public Footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Social media items: only render those with an active URL in AGENCY_CONFIG (no dead '#' links)
  const socialItems = [
    {
      key: "facebook",
      label: "Facebook",
      url: AGENCY_CONFIG.socials?.facebook,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      label: "Instagram",
      url: AGENCY_CONFIG.socials?.instagram,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      url: AGENCY_CONFIG.socials?.twitter,
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "youtube",
      label: "YouTube",
      url: AGENCY_CONFIG.socials?.youtube,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      url: AGENCY_CONFIG.socials?.linkedin,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      label: "TikTok",
      url: AGENCY_CONFIG.socials?.tiktok,
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    },
  ].filter((item) => Boolean(item.url && item.url.trim() !== "" && item.url !== "#"));

  return (
    <footer className="w-full bg-white text-black pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-[72px]">
        {/* 1. Top Contact Info Strip (Left-aligned column on mobile, centered row on desktop) */}
        <Reveal delay={0}>
          <div className="flex flex-col items-start gap-6 w-full sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-14 lg:gap-24 pb-12 border-b border-[#E5E7EB]">
            {/* Item 1: Address */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif] leading-[26px] min-w-0 flex-1 sm:flex-initial text-left">
                <span className="text-[14px] sm:text-[16px] font-normal text-[#6C757D] block">Address</span>
                <a
                  href={AGENCY_CONFIG.addressMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] sm:text-[16px] font-semibold text-black block hover:text-[#5937E0] transition-colors break-words"
                >
                  {AGENCY_CONFIG.address}
                </a>
              </div>
            </div>

            {/* Item 2: Email */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif] leading-[26px] min-w-0 flex-1 sm:flex-initial text-left">
                <span className="text-[14px] sm:text-[16px] font-normal text-[#6C757D] block">Email</span>
                <a
                  href={AGENCY_CONFIG.emailMailto}
                  className="text-[15px] sm:text-[16px] font-semibold text-black block hover:text-[#5937E0] transition-colors break-all"
                >
                  {AGENCY_CONFIG.email}
                </a>
              </div>
            </div>

            {/* Item 3: Phone */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="font-['Work_Sans',sans-serif] leading-[26px] min-w-0 flex-1 sm:flex-initial text-left">
                <span className="text-[14px] sm:text-[16px] font-normal text-[#6C757D] block">Phone</span>
                <a
                  href={AGENCY_CONFIG.phoneTel}
                  className="text-[15px] sm:text-[16px] font-semibold text-black block hover:text-[#5937E0] transition-colors whitespace-nowrap"
                >
                  {AGENCY_CONFIG.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 2. Main 4-Column Footer (Figma Equal-Spacing justify-between across 1296px) */}
        <Reveal delay={0}>
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-0 py-12 border-b border-[#E5E7EB]">
            {/* Col 1: About & Configured Socials (Figma w-[280px]) */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="flex flex-col gap-6">
                <Link href="/" className="flex items-center shrink-0">
                  <Image
                    src="/logo.png"
                    alt="RideList Logo"
                    width={1000}
                    height={350}
                    unoptimized
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                </Link>

                <p className="font-['Work_Sans',sans-serif] font-normal text-[15px] sm:text-[16px] leading-[26px] text-[#6C757D]">
                  RideList is your premier modern car rental platform, providing transparent daily rates in MAD, hand-inspected vehicles, and smooth in-person key handover for memorable road trips.
                </p>

                {/* Social Buttons - Only render icons with defined URLs in config */}
                {socialItems.length > 0 && (
                  <div className="flex items-center gap-3 pt-1">
                    {socialItems.map((item) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="w-10 h-10 rounded-full bg-[#5937E0] hover:bg-[#4828C9] hover:-translate-y-0.5 text-white flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        {item.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Col 2: Useful Links (Figma w-[180px]) */}
            <div className="w-full sm:w-[180px] shrink-0">
              <div className="flex flex-col gap-6">
                <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
                  Useful links
                </h4>
                <div className="flex flex-col gap-4 font-['Work_Sans',sans-serif] text-[16px] leading-[26px] text-[#6C757D]">
                  <Link href="/about" className="hover:text-[#5937E0] transition-colors">About us</Link>
                  <Link href="/contact" className="hover:text-[#5937E0] transition-colors">Contact us</Link>
                  <Link href="/track" className="hover:text-[#5937E0] transition-colors">Track Booking</Link>
                </div>
              </div>
            </div>

            {/* Col 3: Fleet (Dynamic body types with active cars, preselecting via URL query) */}
            <div className="w-full sm:w-[180px] shrink-0">
              <div className="flex flex-col gap-6">
                <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
                  Fleet
                </h4>
                <div className="flex flex-col gap-4 font-['Work_Sans',sans-serif] text-[16px] leading-[26px] text-[#6C757D]">
                  <Link href="/fleet" className="hover:text-[#5937E0] transition-colors font-medium">
                    All Vehicles
                  </Link>
                  {fleetTypes.map((type) => (
                    <Link
                      key={type}
                      href={`/fleet?type=${encodeURIComponent(type)}`}
                      className="hover:text-[#5937E0] transition-colors"
                    >
                      {formatBodyType(type)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 4: Customer Support / WhatsApp (Figma w-[240px]) */}
            <div className="w-full sm:w-[240px] shrink-0">
              <div className="flex flex-col gap-6">
                <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
                  Customer Support
                </h4>
                <div className="flex flex-col gap-4">
                  <p className="font-['Work_Sans',sans-serif] font-normal text-[15px] leading-[24px] text-[#6C757D]">
                    Need assistance, custom quotes, or confirmation on WhatsApp? Chat with our team.
                  </p>
                  <a
                    href={AGENCY_CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-[15px] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 w-fit"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.155.57 4.178 1.564 5.926l-1.636 5.975 6.136-1.609c1.704.931 3.659 1.469 5.736 1.469 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
                    </svg>
                    <span>Contact on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 3. Bottom Centered Copyright (Figma Work Sans 14px) */}
        <Reveal delay={0}>
          <div className="pt-8 text-center font-['Work_Sans',sans-serif] text-[14px] leading-[26px] text-[#6C757D]">
            <p>© Copyright RideList {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

export default Footer;
