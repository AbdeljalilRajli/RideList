"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UserDropdownProps {
  onOpenLogin?: () => void;
  className?: string;
}

function UserDropdownContent({ onOpenLogin, className = "" }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const { user, userData, isAdmin, loading, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Close dropdown on navigation / route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, searchParams]);

  // Name Resolution:
  const rawFullName =
    (userData?.displayName as string) ||
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email?.split("@")[0] ||
    "User";

  const fullName = rawFullName.trim() || "User";
  const firstName = fullName.split(/\s+/)[0] || fullName;
  const avatarLetter = (firstName.charAt(0) || "U").toUpperCase();

  // 1. Loading state: Fixed-size skeleton placeholder to eliminate any flicker/layout jump
  if (loading) {
    return (
      <div
        className="h-10 w-28 sm:w-36 rounded-full bg-[#F1F1F6] animate-pulse border border-[#E5E7EB]"
        aria-hidden="true"
      />
    );
  }

  // 2. Logged out state: Sign In trigger
  if (!user) {
    if (onOpenLogin) {
      return (
        <button
          onClick={onOpenLogin}
          className="h-10 px-5 sm:px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          Sign In
        </button>
      );
    }
    return (
      <Link
        href="/login"
        className="h-10 px-5 sm:px-6 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center shrink-0"
      >
        Sign In
      </Link>
    );
  }

  // Active route helpers
  const isManageBookingsActive = pathname === "/admin/bookings" || (pathname === "/admin" && tabParam === "bookings");
  const isManageCarsActive = pathname === "/admin/cars" || (pathname === "/admin" && tabParam === "fleet");
  const isAdminDashboardActive = pathname === "/admin" && !tabParam;
  const isProfileActive = pathname === "/profile";
  const isPublicSiteActive = pathname === "/";
  const isMyBookingsActive = pathname === "/dashboard";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Unified Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User Account Menu"
        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8F8FB] hover:bg-white hover:border-[#5937E0]/40 transition-all cursor-pointer shadow-2xs group max-w-[130px] sm:max-w-[170px]"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#5937E0] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
          {avatarLetter}
        </div>
        <span className="text-xs font-bold text-black truncate text-left">
          {firstName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-[#6C757D] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#5937E0]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Shared Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-[100] animate-fadeIn"
        >
          {/* Top user header */}
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-black truncate" title={fullName}>
                {fullName}
              </p>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full bg-[#EEEDF9] text-[#5937E0] text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#6C757D] truncate mt-0.5" title={user.email || ""}>
              {user.email}
            </p>
          </div>

          {/* Menu Items depending on role */}
          <div className="p-1 space-y-0.5">
            {isAdmin ? (
              <>
                {/* 1. Admin Dashboard */}
                <Link
                  href="/admin"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isAdminDashboardActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Admin Dashboard</span>
                  </div>
                  {isAdminDashboardActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>

                {/* 2. Manage Cars */}
                <Link
                  href="/admin/cars"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isManageCarsActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
                      <circle cx="7" cy="17" r="2" />
                      <circle cx="17" cy="17" r="2" />
                    </svg>
                    <span>Manage Cars</span>
                  </div>
                  {isManageCarsActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>

                {/* 3. Manage Bookings */}
                <Link
                  href="/admin/bookings"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isManageBookingsActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Manage Bookings</span>
                  </div>
                  {isManageBookingsActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>

                {/* 4. My Profile */}
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isProfileActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </div>
                  {isProfileActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>

                {/* 5. View Public Site */}
                <Link
                  href="/"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isPublicSiteActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>View Public Site</span>
                  </div>
                  {isPublicSiteActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>
              </>
            ) : (
              <>
                {/* 1. My Bookings */}
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isMyBookingsActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>My Bookings</span>
                  </div>
                  {isMyBookingsActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>

                {/* 2. My Profile */}
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                    isProfileActive
                      ? "bg-[#EEEDF9] text-[#5937E0] font-bold"
                      : "text-black hover:bg-[#F8F8FB] hover:text-[#5937E0] font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>My Profile</span>
                  </div>
                  {isProfileActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5937E0]"></span>
                  )}
                </Link>
              </>
            )}
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-[#E5E7EB] pt-1 px-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UserDropdown(props: UserDropdownProps) {
  return (
    <React.Suspense
      fallback={
        <div className={`h-9 w-24 bg-[#EEEDF9] rounded-full animate-pulse ${props.className || ""}`} />
      }
    >
      <UserDropdownContent {...props} />
    </React.Suspense>
  );
}
