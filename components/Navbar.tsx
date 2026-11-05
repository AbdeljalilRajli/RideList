"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./auth/LoginModal";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/fleet" },
    { label: "About Us", href: "/#about" },
    { label: "Contact Us", href: "/#contact" },
  ];

  return (
    <header className="w-full bg-white fixed top-0 left-0 right-0 z-50">
      <nav className="max-w-[1440px] mx-auto h-[104px] flex items-center justify-between px-6 lg:px-16">
        {/* Brand Logo: RideList */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="RideList Logo"
            width={1000}
            height={350}
            priority
            unoptimized
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[16px] font-medium transition-colors ${
                  isActive
                    ? "text-[#5937E0] font-bold"
                    : "text-black hover:text-[#5937E0]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Support badge + Auth */}
        <div className="flex items-center gap-5">
          {/* Support Phone badge (Exact Figma component) */}
          <a
            href="tel:+212600000000"
            className="hidden sm:flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-[#5937E0] flex items-center justify-center text-white shrink-0 group-hover:bg-[#4A2CC7] transition-colors shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-[12px] font-normal text-[#6C757D]">Need help?</p>
              <p className="text-[14px] font-bold text-black">+212 6 000 000 00</p>
            </div>
          </a>

          {/* User Authentication Profile / Sign In */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8F8FB] hover:bg-white transition-all"
              >
                <div className="w-8 h-8 bg-[#5937E0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </div>
                <span className="text-xs font-bold text-black hidden md:inline">
                  {user.displayName || "User"}
                </span>
                <svg className="w-3.5 h-3.5 text-[#6C757D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-[100]">
                  <div className="px-4 py-3 border-b border-[#E5E7EB]">
                    <p className="text-sm font-bold text-black truncate">{user.displayName || "User"}</p>
                    <p className="text-xs text-[#6C757D] truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={userData?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                      className="block px-4 py-2 text-sm text-black hover:bg-[#F8F8FB]"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </div>
                  <div className="border-t border-[#E5E7EB] pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="h-10 px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-semibold text-xs shadow-sm transition-all"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="lg:hidden p-2 text-black"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isNavOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isNavOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 shadow-xl">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsNavOpen(false)}
                className="py-2 text-base font-semibold text-black hover:text-[#5937E0]"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <a href="tel:+212600000000" className="flex items-center gap-3 text-black">
                <div className="w-8 h-8 rounded-full bg-[#5937E0] flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[#6C757D] block">Need help?</span>
                  <span className="text-sm font-bold block">+212 6 000 000 00</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Navbar;
