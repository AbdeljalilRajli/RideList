"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Hero from "../components/Hero";
import SearchBar from "@/components/SearchBar";
import CustomFilter from "@/components/CustomFilter";
import CarCard from "@/components/CarCard";
import AboutSection from "@/components/AboutSection";
import { HoverEffect } from "@/components/HoverEffect";
import { projects } from "@/components/CardHoverEffect";
import { fuels, yearsOfProduction, cars } from "@/constants";
import ShowMore from "@/components/ShowMore";
import { CarProps } from "@/types/index";
import { FeaturesCards } from "@/components/FeaturesCards";
import { NewsLetter } from "@/components/NewsLetter";


export default function Home() {
  const [allCars, setAllCars] = useState<CarProps[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(false);

  // search states
  const [manufacturer, setManuFacturer] = useState("");
  const [model, setModel] = useState("");

  // filter state
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState(0);

  // limit state
  const [limit, setLimit] = useState(12);

  const filterCars = () => {
    setLoading(true);
    
    let filtered = cars;
    
    // Filter by manufacturer
    if (manufacturer) {
      filtered = filtered.filter(car => 
        car.make.toLowerCase().includes(manufacturer.toLowerCase())
      );
    }
    
    // Filter by model
    if (model) {
      filtered = filtered.filter(car => 
        car.model.toLowerCase().includes(model.toLowerCase())
      );
    }
    
    // Filter by fuel type
    if (fuel) {
      filtered = filtered.filter(car => 
        car.fuel_type.toLowerCase() === fuel.toLowerCase()
      );
    }
    
    // Filter by year
    if (year && year > 0) {
      filtered = filtered.filter(car => car.year === year);
    }
    
    // Apply limit
    const limitedCars = filtered.slice(0, limit);
    
    setFilteredCars(limitedCars);
    setAllCars(cars);
    setLoading(false);
  };

  useEffect(() => {
    filterCars();
  }, [fuel, year, limit, manufacturer, model]);
  
  useEffect(() => {
    setAllCars(cars);
    setFilteredCars(cars.slice(0, limit));
  }, []);

  return (
    <main className="overflow-hidden pt-20">
      <Hero />

      <div className="mt-20 lg:mt-16 padding-x padding-y max-width" id="discover">
        <div className="home__text-container">
          <h1 className="text-4xl font-extrabold">About Us</h1>
          <AboutSection />
          <HoverEffect items={projects} />
        </div>
      </div>

      <div className="mt-12 padding-x padding-y max-width" id="fleet">
        <div className="home__text-container">
          <h1 className="text-4xl font-extrabold">Car Catalogue</h1>
          <p>Explore the cars you might like</p>
        </div>

        {/* Featured Cars Preview */}
        <div className="mt-8">
          <div className="home__cars-wrapper">
            {cars.slice(0, 8).map((car, index) => (
              <CarCard key={`featured-car-${index}`} car={car} index={index} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Link href="/fleet">
              <button className="w-fit py-[16px] px-8 rounded-full bg-blue-900 text-white text-[14px] leading-[17px] font-bold hover:bg-blue-800 transition-colors [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]">
                View All Cars
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20 padding-x padding-y max-width" id="deals">
        <div className="home__text-container">
          <FeaturesCards />
        </div>
      </div>

      <div className="mt-20 mb-10 padding-x padding-y max-width" id="contact">
        <div className="home__text-container">
          <NewsLetter />
        </div>
      </div>

    </main>
  );
}
