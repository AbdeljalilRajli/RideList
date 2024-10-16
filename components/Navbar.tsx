"use client";

import Link from "next/link";
import Image from "next/image";
import { CustomButton } from "./CustomButton";
import { useState } from "react";

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <header className="w-full absolute z-10">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center sm:px-16 px-6 py-4">
        {/* Logo Image - Visible in both mobile and desktop */}
        <Link href="/" className="flex justify-center items-center">
          <Image src="/logo.svg" alt="RideList Logo" width={118} height={18} className="object-contain" />
        </Link>

        <div className="sm:hidden">
          <button onClick={toggleNav} className="text-gray-700 focus:outline-none">
            {isNavOpen ? '✖️' : '☰'}
          </button>
        </div>

        {/* Main navigation */}
        <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 ${isNavOpen ? 'block' : 'hidden'} sm:block absolute sm:static bg-white sm:bg-transparent w-full sm:w-auto top-full left-0 shadow-lg sm:shadow-none p-6 rounded-lg transition-all duration-300 ease-in-out`}>
          <a href="#discover" className="text-gray-700 hover:text-indigo-800" onClick={(e) => smoothScroll(e, "discover")}>About</a>
          <a href="#fleet" className="text-gray-700 hover:text-indigo-800" onClick={(e) => smoothScroll(e, "fleet")}>Fleet</a>
          <a href="#deals" className="text-gray-700 hover:text-indigo-800" onClick={(e) => smoothScroll(e, "deals")}>Deals</a>
          <a href="#contact" className="text-gray-700 hover:text-indigo-800" onClick={(e) => smoothScroll(e, "contact")}>Contact</a>
        </div>

        <CustomButton 
          title="Sign In"
          btnType="button"
          containerStyles="text-white bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:bg-blue-900 sm:text-white lg:bg-white lg:text-indigo-800 rounded-full min-w-[100px]"
        />
      </nav>
    </header>
  );
}

export default Navbar;
