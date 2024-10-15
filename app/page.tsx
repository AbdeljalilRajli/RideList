"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Hero from "../components/Hero";
import SearchBar from "@/components/SearchBar";
import CustomFilter from "@/components/CustomFilter";
import { fetchCars } from "@/utils";
import CarCard from "@/components/CarCard";
import AboutSection from "@/components/AboutSection";
import { HoverEffect } from "@/components/HoverEffect";
import { projects } from "@/components/CardHoverEffect";
import { fuels, yearsOfProduction } from "@/constants";
import ShowMore from "@/components/ShowMore";
import { CarState } from "@/types/index";
import { FeaturesCards } from "@/components/FeaturesCards";
import { NewsLetter } from "@/components/NewsLetter";


export default function Home() {
  const [allCars, setAllCars] = useState<CarState>([]);
  const [loading, setLoading] = useState(false);

  // search states
  const [manufacturer, setManuFacturer] = useState("");
  const [model, setModel] = useState("");

  // filter state
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState(2022);

  // limit state
  const [limit, setLimit] = useState(12);

  const getCars = async () => {
    setLoading(true);
    try {
      const result = await fetchCars({
        manufacturer: manufacturer.toLowerCase() || "",
        model: model.toLowerCase() || "",
        fuel: fuel.toLowerCase() || "",
        year: year || 2022,
        limit: limit || 12,
      });

      setAllCars(result);
    } catch {
      console.error();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCars();
  }, [fuel, year, limit, manufacturer, model]);

  return (
    <div className="overflow-hidden">
      <Hero />

      <div className="mt-15 padding-x padding-y max-width" id="discover">
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

        <div className="home__filters">
          <div className="z-50">
            <SearchBar
              setManuFacturer={setManuFacturer}
              setModel={setModel}
            />
          </div>
          
          <div className="home__filter-container">
            <CustomFilter options={fuels} setFilter={setFuel} />
            <CustomFilter options={yearsOfProduction} setFilter={setYear} />
          </div>
        </div>

        {allCars.length > 0 ? (
          <section>
            <div className="home__cars-wrapper">
              {allCars?.map((car, index) => (
                <CarCard key={`car-${index}`} car={car} />
              ))}
            </div>

            {loading && (
              <div className="mt-16 w-full flex-center">
                <Image 
                  src="./loader.svg"
                  alt="loader"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}

            <ShowMore 
              pageNumber={limit / 12}
              isNext={limit > allCars.length}
              setLimit={setLimit}
            />
          </section>
        ) : (
          !loading && (
            <div className="home__error-container">
              <h2 className="text-black text-xlfont-bold">Oops, no results</h2>
              <p>{allCars?.message}</p>
            </div>
          )
        )}
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

    </div>
  );
}
