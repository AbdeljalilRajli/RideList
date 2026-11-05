import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="w-full bg-white text-black pt-16 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-[72px]">
        {/* 1. Top Contact Info Strip (3 Items Centered, Figma Work Sans 16px) */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 lg:gap-24 pb-12 border-b border-[#E5E7EB]">
          {/* Item 1: Address */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="font-['Work_Sans',sans-serif] leading-[26px]">
              <span className="text-[16px] font-normal text-[#6C757D] block">Address</span>
              <span className="text-[16px] font-semibold text-black block">Oxford Ave. Cary, NC 27511</span>
            </div>
          </div>

          {/* Item 2: Email */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="font-['Work_Sans',sans-serif] leading-[26px]">
              <span className="text-[16px] font-normal text-[#6C757D] block">Email</span>
              <span className="text-[16px] font-semibold text-black block">nwiger@yahoo.com</span>
            </div>
          </div>

          {/* Item 3: Phone */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FFA000] flex items-center justify-center text-white shrink-0 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="font-['Work_Sans',sans-serif] leading-[26px]">
              <span className="text-[16px] font-normal text-[#6C757D] block">Phone</span>
              <a href="tel:+212600000000" className="text-[16px] font-semibold text-black block hover:text-[#5937E0] transition-colors">
                +212 6 000 000 00
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main 4-Column Footer (Figma Equal-Spacing justify-between across 1296px) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-0 py-12 border-b border-[#E5E7EB]">
          {/* Col 1: About & Colored Socials (Figma w-[280px]) */}
          <div className="flex flex-col gap-6 w-full lg:w-[280px] shrink-0">
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

            <p className="font-['Work_Sans',sans-serif] font-normal text-[16px] leading-[26px] text-[#6C757D]">
              RideList is your premier modern car rental platform, providing transparent daily rates, hand-inspected vehicles, and effortless contactless pickup for memorable road trips.
            </p>

            {/* Social Buttons with Website Purple Background */}
            <div className="flex items-center gap-3 pt-1">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-[#5937E0] hover:bg-[#4828C9] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-[#5937E0] hover:bg-[#4828C9] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-10 h-10 rounded-full bg-[#5937E0] hover:bg-[#4828C9] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="w-10 h-10 rounded-full bg-[#5937E0] hover:bg-[#4828C9] text-white flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Useful Links (Figma w-[180px]) */}
          <div className="flex flex-col gap-6 w-full sm:w-[180px] shrink-0">
            <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
              Useful links
            </h4>
            <div className="flex flex-col gap-4 font-['Work_Sans',sans-serif] text-[16px] leading-[26px] text-[#6C757D]">
              <Link href="/#about" className="hover:text-[#5937E0] transition-colors">About us</Link>
              <Link href="/#contact" className="hover:text-[#5937E0] transition-colors">Contact us</Link>
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">Gallery</Link>
              <Link href="/#about" className="hover:text-[#5937E0] transition-colors">Blog</Link>
              <Link href="/#how-it-works" className="hover:text-[#5937E0] transition-colors">F.A.Q</Link>
            </div>
          </div>

          {/* Col 3: Fleet (Figma w-[180px]) */}
          <div className="flex flex-col gap-6 w-full sm:w-[180px] shrink-0">
            <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
              Fleet
            </h4>
            <div className="flex flex-col gap-4 font-['Work_Sans',sans-serif] text-[16px] leading-[26px] text-[#6C757D]">
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">Sedan</Link>
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">Cabriolet</Link>
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">Pickup</Link>
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">Minivan</Link>
              <Link href="/fleet" className="hover:text-[#5937E0] transition-colors">SUV</Link>
            </div>
          </div>

          {/* Col 4: Download App (Figma w-[180px]) */}
          <div className="flex flex-col gap-6 w-full sm:w-[180px] shrink-0">
            <h4 className="font-['Work_Sans',sans-serif] font-semibold text-[20px] text-black">
              Download App
            </h4>
            <div className="flex flex-col gap-4">
              {/* App Store Button */}
              <a
                href="#"
                className="hover:opacity-90 active:scale-95 transition-all w-fit"
              >
                <Image
                  src="/app-store.svg"
                  alt="Download on the App Store"
                  width={173}
                  height={50}
                  unoptimized
                  className="h-[50px] w-[173px] object-contain"
                />
              </a>

              {/* Google Play Button */}
              <a
                href="#"
                className="hover:opacity-90 active:scale-95 transition-all w-fit"
              >
                <Image
                  src="/google-play-store.svg"
                  alt="Get it on Google Play"
                  width={173}
                  height={50}
                  unoptimized
                  className="h-[50px] w-[173px] object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Bottom Centered Copyright (Figma Work Sans 14px) */}
        <div className="pt-8 text-center font-['Work_Sans',sans-serif] text-[14px] leading-[26px] text-[#6C757D]">
          <p>© Copyright RideList {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
