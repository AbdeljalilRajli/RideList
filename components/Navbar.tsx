"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./auth/LoginModal";
import UserDropdown from "./auth/UserDropdown";
import { usePathname } from "next/navigation";
import { AGENCY_CONFIG } from "@/constants/agency";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, userData, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const rawFullName =
    (userData?.displayName as string) ||
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";

  const fullName = rawFullName.trim() || "User";
  const firstName = fullName.split(/\s+/)[0] || fullName;
  const avatarLetter = (firstName.charAt(0) || "U").toUpperCase();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Fleet", href: "/fleet" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Booking", href: "/track" },
  ];

  // Do not render public Navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

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

        {/* Right Section: Support badge + Shared UserDropdown */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Support Phone badge */}
          <a
            href={AGENCY_CONFIG.phoneTel}
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
              <p className="text-[14px] font-bold text-black">{AGENCY_CONFIG.phoneDisplay}</p>
            </div>
          </a>

          {/* Shared User Dropdown Component */}
          <UserDropdown onOpenLogin={() => setIsLoginModalOpen(true)} />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="lg:hidden p-2 text-black hover:text-[#5937E0] transition-colors"
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
        <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-6 py-6 shadow-xl animate-fadeIn">
          {/* User profile card in mobile drawer if logged in */}
          {user && (
            <div className="mb-4 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5937E0] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-2xs">
                  {avatarLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-black truncate">{fullName}</p>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-[10px] font-extrabold uppercase">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6C757D] truncate">{user.email}</p>
                </div>
              </div>

              {/* Role specific links for mobile */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {isAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/admin/cars"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      Manage Cars
                    </Link>
                    <Link
                      href="/admin/bookings"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      Manage Bookings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsNavOpen(false)}
                      className="px-3 py-2 rounded-xl bg-[#F8F8FB] text-xs font-bold text-black text-center hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    >
                      My Profile
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Site navigation links */}
          <div className="flex flex-col gap-2">
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
          </div>

          {/* User Sign In / Out */}
          <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsNavOpen(false);
                }}
                className="w-full py-2.5 rounded-full border border-red-200 bg-red-50 text-red-600 text-xs font-bold text-center cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsNavOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="w-full py-2.5 rounded-full bg-[#5937E0] text-white text-xs font-bold text-center shadow-sm cursor-pointer"
              >
                Sign In / Register
              </button>
            )}

            <a href={AGENCY_CONFIG.phoneTel} className="flex items-center gap-3 text-black pt-2">
              <div className="w-8 h-8 rounded-full bg-[#5937E0] flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <span className="text-xs text-[#6C757D] block">Need help?</span>
                <span className="text-sm font-bold block">{AGENCY_CONFIG.phoneDisplay}</span>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Navbar;
