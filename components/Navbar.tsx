"use client";

import Link from "next/link";
import Image from "next/image";
import { CustomButton } from "./CustomButton";
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

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);

  // Handle hash navigation when page loads
  useEffect(() => {
    if (isHomepage && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        // Immediately set navbar style based on target element position
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

  // Check initial scroll position when component mounts on homepage
  useEffect(() => {
    if (isHomepage) {
      // Immediate check for hash navigation
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
    
    // If we're on the homepage, just scroll to the section
    if (isHomepage) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Set scrolled state immediately before navigation since we know we'll be scrolling to a section
      setIsScrolled(true);
      // If we're on a different page, navigate to home with the hash
      window.location.href = `/#${targetId}`;
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${
      isHomepage 
        ? (isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent')
        : 'bg-white shadow-sm'
    }`}>
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center sm:px-16 px-6 py-4">
        {/* Logo Image - Visible in both mobile and desktop */}
        <Link href="/" className="flex justify-center items-center">
          <Image src="/logo.svg" alt="RideList Logo" width={118} height={18} className="object-contain" />
        </Link>

        <div className="sm:hidden flex items-center space-x-2">
          {user && (
            <div className="relative" ref={mobileDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className={`flex items-center p-2 rounded-full transition-colors ${
                  isHomepage 
                    ? 'bg-white/90 hover:bg-white shadow-lg' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                </div>
              </button>

              {/* Mobile Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 py-2 z-[100]">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 break-all leading-relaxed">{user.email}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                      userData?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link 
                      href={userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Dashboard
                    </Link>
                    
                    {userData?.role === 'admin' && (
                      <Link 
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          
          <button onClick={toggleNav} className="text-gray-700 focus:outline-none">
            {isNavOpen ? '✖️' : '☰'}
          </button>
        </div>

        {/* Main navigation */}
        <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 ${isNavOpen ? 'block' : 'hidden'} sm:block absolute sm:static ${
          isHomepage ? 'bg-white sm:bg-transparent' : 'bg-white sm:bg-transparent'
        } w-full sm:w-auto top-full left-0 shadow-lg sm:shadow-none p-6 rounded-lg transition-all duration-300 ease-in-out`}>
          <a href="#discover" className={`${
            isHomepage ? 'text-gray-700 hover:text-primary-blue' : 'text-gray-700 hover:text-indigo-800'
          }`} onClick={(e) => handleNavigation(e, "discover")}>About</a>
          <Link href="/fleet" className={`${
            isHomepage ? 'text-gray-700 hover:text-primary-blue' : 'text-gray-700 hover:text-indigo-800'
          }`}>Fleet</Link>
          <a href="#deals" className={`${
            isHomepage ? 'text-gray-700 hover:text-primary-blue' : 'text-gray-700 hover:text-indigo-800'
          }`} onClick={(e) => handleNavigation(e, "deals")}>Deals</a>
          <a href="#contact" className={`${
            isHomepage ? 'text-gray-700 hover:text-primary-blue' : 'text-gray-700 hover:text-indigo-800'
          }`} onClick={(e) => handleNavigation(e, "contact")}>Contact</a>
        </div>

        {user ? (
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`flex items-center space-x-3 p-2 rounded-full transition-colors ${
                isHomepage 
                  ? 'bg-white/90 hover:bg-white shadow-lg' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.displayName?.charAt(0) || user.email?.charAt(0)}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-gray-900 font-medium text-sm">
                  {user.displayName || 'User'}
                </p>
                <p className="text-gray-500 text-xs">
                  {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                </p>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 sm:w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 py-2 z-[100]">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-500 break-all leading-relaxed">{user.email}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    userData?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userData?.role === 'admin' ? 'Administrator' : 'Member'}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link 
                    href={userData?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                  
                  {userData?.role === 'admin' && (
                    <Link 
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          <CustomButton 
            title="Sign In"
            btnType="button"
            containerStyles={`rounded-full font-medium transition-all duration-300 ${
              isHomepage 
                ? 'bg-white text-primary-blue hover:bg-gray-50 shadow-lg' 
                : 'bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] text-white'
            }`}
            handleClick={() => setIsLoginModalOpen(true)}
          />
        )}
      </nav>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}

export default Navbar;
