
"use client";

import Image from "next/image";
import { CustomButton } from "./CustomButton";

const Hero = () => {

  const handleScroll = () => {}

  return (
    <div className="hero">
      <div className="flex-1 lg:pt-56 md:pt-36 pt-36 padding-x">
        <h1 className="hero__title">Find, book, or rent a car -- quickly and easily!</h1>
        
        <p className="hero__subtitle">Your go-to platform for fast, hassle-free car rentals at the best rates.</p>
        
        <CustomButton 
          title="Explore Cars"
          containerStyles="bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] text-white rounded-full mt-10"
          handleClick={handleScroll}
        />
      </div>

      <div className="hero__image-container">
        <div className="hero__image">
          <Image src="/hero.png" alt="hero" fill className="object-contain" />
        </div>

        <div className="hero__image-overlay"></div>      
      </div>
    </div>
  )
}

export default Hero