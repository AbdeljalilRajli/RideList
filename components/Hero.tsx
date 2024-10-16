"use client";

import Image from "next/image";
import { CustomButton } from "./CustomButton";
import { AnimatedTooltipPreview } from "./AnimatedTooltipPreview";
import { FlipWords } from "./ui/FlipWords";

const Hero = () => {

  const words = ["Fast", "Comfy", "Luxe", "Cheap"];

  const handleScroll = () => {}

  return (
    <div className="hero">
      <div className="flex-1 lg:pt-56 md:pt-36 pt-36 padding-x">
        <h1 className="hero__title">
          Book, or Rent a Car That’s
          <FlipWords words={words} /> <br />
        </h1>
        
        <p className="hero__subtitle">The ultimate platform for convenient, stress-free car rentals at unbeatable prices.</p>

        <div className="mt-10">
          <AnimatedTooltipPreview />
        </div>
        
        <CustomButton 
          title="Explore Cars"
          containerStyles="bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] text-white rounded-full mt-8"
          handleClick={handleScroll}
        />

      </div>

      {/* Tailwind classes directly */}
      <div className="hidden sm:flex xl:flex-[1.5] justify-end items-end w-full xl:h-screen">
        <div className="hero__image">
          <Image src="/hero.webp" alt="hero" fill className="object-contain" />
        </div>

        <div className="hero__image-overlay"></div>      
      </div>
    </div>
  )
}

export default Hero;
