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
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userData, logout } = useAuth();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on the homepage
  const isHomepage = pathname === '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll for glassy navbar effect on homepage
  useEffect(() => {
    if (!isHomepage) {
      setIsScrolled(false);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setIsScrolled(scrollTop > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Handle hash navigation when page loads
  useEffect(() => {
    if (isHomepage && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const elementTop = targetElement.offsetTop;
        if (elementTop > 50) {
          setIsScrolled(true);
        }
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, [isHomepage]);

  // Check initial scroll position
  useEffect(() => {
    if (isHomepage) {
      if (window.location.hash) {
        setIsScrolled(true);
      } else {
        const scrollTop = window.scrollY;
        setIsScrolled(scrollTop > 50);
      }
    }
  }, [isHomepage]);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsNavOpen(false);

    if (isHomepage) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      setIsScrolled(true);
      window.location.href = `/#${targetId}`;
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Navbar background and styling
  const navbarBg = isScrolled
    ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(15,15,26,0.06)] border-b border-[#E5E7EB]'
    : 'bg-[#F8F8FB]/90 backdrop-blur-md border-b border-[#E5E7EB]/50';

  const linkColor = 'text-[#6B7280]';
  const logoFilter = '';

  const navLinks = [
    { label: 'About', targetId: 'discover', href: null },
    { label: 'Fleet', targetId: null, href: '/fleet' },
    { label: 'Deals', targetId: 'deals', href: null },
    { label: 'Contact', targetId: 'contact', href: null },
  ];

  return (
    <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarBg}`}>
      <nav className="max-w-[1280px] mx-auto h-20 flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="RideList Logo"
            width={118}
            height={18}
            className={`object-contain transition-all ${logoFilter}`}
          />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                  ${pathname === link.href
                    ? 'bg-[#3730A3] text-white'
                    : `${linkColor} hover:bg-[#EEEDF9] hover:text-[#3730A3]`
                  }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={`#${link.targetId}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${linkColor} hover:bg-[#EEEDF9] hover:text-[#3730A3]`}
                onClick={(e) => handleNavigation(e, link.targetId!)}
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right side: User / Sign In + Mobile toggle */}
        <div className="flex items-center gap-3">
          {/* Desktop user controls */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 pl-1 pr-4 py-1 rounded-full border border-[#E5E7EB] bg-white hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 bg-[#3730A3] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.displayName?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[#0F0F1A] font-semibold text-sm leading-tight">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-[#9CA3AF] text-xs">
                      {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#9CA3AF] transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E5E7EB] py-2 z-[100]">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]">
                      <p className="text-sm font-semibold text-[#0F0F1A] truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-[#6B7280] break-all leading-relaxed">{user.email}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${
                        userData?.role === 'admin'
                          ? 'bg-[#EEEDF9] text-[#3730A3]'
                          : 'bg-[#DCFCE7] text-[#16A34A]'
                      }`}>
                        {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        className="flex items-center px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F1F1F6] hover:text-[#0F0F1A] transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </Link>

                      {userData?.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F1F1F6] hover:text-[#0F0F1A] transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-[#E5E7EB] pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-[#BA1A1A] hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="h-11 px-6 rounded-full bg-[#3730A3] text-white font-semibold text-sm hover:bg-[#312E81] active:scale-[0.98] transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile: user avatar + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-9 h-9 bg-[#3730A3] rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#E5E7EB] py-2 z-[100]">
                    <div className="px-4 py-3 border-b border-[#E5E7EB]">
                      <p className="text-sm font-semibold text-[#0F0F1A] truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-[#6B7280] break-all leading-relaxed">{user.email}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-2 ${
                        userData?.role === 'admin'
                          ? 'bg-[#EEEDF9] text-[#3730A3]'
                          : 'bg-[#DCFCE7] text-[#16A34A]'
                      }`}>
                        {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link
                        href={userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                        className="flex items-center px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F1F1F6] hover:text-[#0F0F1A] transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      {userData?.role === 'admin' && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-4 py-2.5 text-sm text-[#6B7280] hover:bg-[#F1F1F6] hover:text-[#0F0F1A] transition-colors"
                          onClick={() => setIsUserDropdownOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-3 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-[#BA1A1A] hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleNav}
              className="p-2 rounded-full text-[#0F0F1A] hover:bg-[#F1F1F6] transition-colors"
              aria-label="Toggle navigation"
            >
              {isNavOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isNavOpen && (
        <div className="md:hidden bg-[#F8F8FB] border-t border-[#E5E7EB] px-6 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                className={`px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                  pathname === link.href
                    ? 'bg-[#3730A3] text-white'
                    : 'text-[#6B7280] hover:bg-[#EEEDF9] hover:text-[#3730A3]'
                }`}
                onClick={() => setIsNavOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={`#${link.targetId}`}
                className="px-4 py-3 rounded-full text-sm font-semibold text-[#6B7280] hover:bg-[#EEEDF9] hover:text-[#3730A3] transition-all"
                onClick={(e) => handleNavigation(e, link.targetId!)}
              >
                {link.label}
              </a>
            )
          )}
          {!user && (
            <button
              onClick={() => {
                setIsNavOpen(false);
                setIsLoginModalOpen(true);
              }}
              className="mt-2 h-11 px-6 rounded-full bg-[#3730A3] text-white font-semibold text-sm hover:bg-[#312E81] transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}

export default Navbar;
