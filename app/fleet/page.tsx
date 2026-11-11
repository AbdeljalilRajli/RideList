"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { cars as initialCars } from "@/constants";
import { CarProps } from "@/types";
import CarCard from "@/components/CarCard";
import { useSearchParams } from "next/navigation";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";
import {
  normalizeFuel,
  normalizeTransmission,
  formatBodyType,
} from "@/lib/carTaxonomy";

export default function FleetPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5937E0]"></div>
        </div>
      }
    >
      <FleetContent />
    </Suspense>
  );
}

const brandLogos = [
  { name: "BMW", src: "/Brands Logos/BMW.png", alt: "BMW logo", width: 110, height: 108, query: "BMW" },
  { name: "Mercedes-Benz", src: "/Brands Logos/Mercides.png", alt: "Mercedes-Benz logo", width: 110, height: 108, query: "Mercedes" },
  { name: "Audi", src: "/Brands Logos/Audi.png", alt: "Audi logo", width: 248, height: 84, query: "Audi" },
  { name: "Toyota", src: "/Brands Logos/Toyota.png", alt: "Toyota logo", width: 164, height: 108, query: "Toyota" },
  { name: "Ford", src: "/Brands Logos/Ford.png", alt: "Ford logo", width: 230, height: 88, query: "Ford" },
  { name: "Jeep", src: "/Brands Logos/Jeep.png", alt: "Jeep logo", width: 218, height: 88, query: "Jeep" },
];

function FleetContent() {
  const searchParams = useSearchParams();
  const initialFuel = searchParams.get("fuel") || "";
  const initialQuery = searchParams.get("query") || searchParams.get("city") || "";
  const initialType = searchParams.get("type") || "all";

  // Supabase Cars State
  const [carsList, setCarsList] = useState<CarProps[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<string>(initialType.toLowerCase());
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>(initialFuel ? normalizeFuel(initialFuel) : "all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function loadCars() {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .neq("status", "hidden")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setCarsList(data as CarProps[]);
        } else {
          // Fallback if network/supabase initial error
          setCarsList(initialCars as CarProps[]);
        }
      } catch (err) {
        console.error("Error loading cars from Supabase:", err);
        setCarsList(initialCars as CarProps[]);
      } finally {
        setLoadingCars(false);
      }
    }
    loadCars();
  }, []);

  // Visible (non-hidden) fleet
  const visibleCars = useMemo(() => {
    return carsList.filter((car) => car.status !== "hidden");
  }, [carsList]);

  // Body type chips derived from actual cars in database
  const dynamicBodyTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleCars.forEach((c) => {
      const type = (
        c.body_type ||
        (c.class?.toLowerCase().includes("suv") ? "suv" : "sedan")
      ).toLowerCase();
      counts[type] = (counts[type] || 0) + 1;
    });

    const standardOrder = [
      "sedan",
      "hatchback",
      "suv",
      "minivan",
      "pickup",
      "convertible",
      "coupe",
      "van",
    ];

    const chips: { label: string; value: string; count: number }[] = [
      { label: "All Vehicles", value: "all", count: visibleCars.length },
    ];

    standardOrder.forEach((type) => {
      const count = counts[type] || 0;
      if (count > 0) {
        chips.push({
          label: formatBodyType(type),
          value: type,
          count,
        });
      }
    });

    // Also include any other type not in standard list if present
    Object.keys(counts).forEach((type) => {
      if (!standardOrder.includes(type) && counts[type] > 0) {
        chips.push({
          label: formatBodyType(type),
          value: type,
          count: counts[type],
        });
      }
    });

    return chips;
  }, [visibleCars]);

  // Dynamic Transmission Options derived from data (normalized, no empty options)
  const availableTransmissions = useMemo(() => {
    const set = new Set<string>();
    visibleCars.forEach((c) => {
      set.add(normalizeTransmission(c.transmission));
    });
    return Array.from(set).sort();
  }, [visibleCars]);

  // Dynamic Fuel Options derived from data (normalized, no empty options)
  const availableFuels = useMemo(() => {
    const set = new Set<string>();
    visibleCars.forEach((c) => {
      set.add(normalizeFuel(c.fuel_type));
    });
    return Array.from(set).sort();
  }, [visibleCars]);

  // Combined In-Memory Filter with AND
  const filteredCars = useMemo(() => {
    return visibleCars.filter((car) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = `${car.make} ${car.model}`.toLowerCase();
        const bType = (car.body_type || "").toLowerCase();
        const cClass = (car.class || "").toLowerCase();
        const seg = (car.segment || "").toLowerCase();
        if (
          !name.includes(q) &&
          !bType.includes(q) &&
          !cClass.includes(q) &&
          !seg.includes(q)
        ) {
          return false;
        }
      }

      // 2. Body Type Chip
      if (selectedType !== "all") {
        const carType = (
          car.body_type ||
          (car.class?.toLowerCase().includes("suv") ? "suv" : "sedan")
        ).toLowerCase();
        if (carType !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // 3. Transmission (normalized)
      if (transmission !== "all") {
        if (normalizeTransmission(car.transmission) !== transmission) {
          return false;
        }
      }

      // 4. Fuel Type (normalized)
      if (fuelType !== "all") {
        if (normalizeFuel(car.fuel_type) !== fuelType) {
          return false;
        }
      }

      return true;
    });
  }, [visibleCars, searchQuery, selectedType, transmission, fuelType]);

  // Pagination (applied strictly after filtering)
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage) || 1;
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  }, [filteredCars, currentPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setTransmission("all");
    setFuelType("all");
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#000000] pt-[104px] pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-[#E5E7EB] py-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
          <Reveal triggerOnLoad delay={0}>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#000000] tracking-tight mb-3">
              Select a vehicle group
            </h1>
          </Reveal>
          <Reveal triggerOnLoad delay={80}>
            <p className="text-[#6C757D] text-sm sm:text-base font-normal">
              <Link href="/" className="hover:text-[#5937E0] transition-colors">
                Home
              </Link>{" "}
              / <span className="text-[#000000] font-semibold">Fleet</span>
            </p>
          </Reveal>

          {/* Dynamic Body Type Filter Chips */}
          <Reveal triggerOnLoad delay={140}>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {loadingCars && dynamicBodyTypes.length <= 1 ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-11 w-28 rounded-[50px] bg-gray-100 animate-pulse"
                    />
                  ))}
                </>
              ) : (
                dynamicBodyTypes.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setSelectedType(cat.value);
                      setCurrentPage(1);
                    }}
                    className={`px-5 py-2.5 rounded-[50px] text-xs font-bold transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 ${
                      selectedType === cat.value
                        ? "bg-[#5937E0] text-white shadow-[0_4px_16px_rgba(89,55,224,0.3)]"
                        : "bg-[#F8F8FB] border border-[#E5E7EB] text-[#000000] hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                        selectedType === cat.value
                          ? "bg-white/20 text-white"
                          : "bg-black/5 text-[#6C757D]"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Filter and Search Bar Strip */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-8">
        <Reveal delay={0}>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <svg
                className="w-4 h-4 text-[#6C757D] absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by make, model, or category..."
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-[#000000] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Result Count Indicator */}
              <span className="text-xs font-semibold text-[#6C757D] hidden lg:inline">
                {filteredCars.length}{" "}
                {filteredCars.length === 1 ? "vehicle available" : "vehicles available"}
              </span>

              {/* Transmission filter */}
              <select
                value={transmission}
                onChange={(e) => {
                  setTransmission(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#000000] focus:outline-none focus:border-[#5937E0] transition-colors cursor-pointer"
              >
                <option value="all">All Transmissions</option>
                {availableTransmissions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Fuel filter */}
              <select
                value={fuelType}
                onChange={(e) => {
                  setFuelType(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#000000] focus:outline-none focus:border-[#5937E0] transition-colors cursor-pointer"
              >
                <option value="all">All Fuel Types</option>
                {availableFuels.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* Reset Button */}
              {(searchQuery ||
                selectedType !== "all" ||
                transmission !== "all" ||
                fuelType !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-11 px-4 rounded-xl text-xs font-bold text-[#5937E0] hover:bg-[#EEEDF9] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Vehicles Grid */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-10">
        {loadingCars ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-[16px] bg-white border border-[#E5E7EB] p-6 animate-pulse"
              >
                <div className="w-full h-44 bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-5 w-3/4 bg-gray-100 rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : paginatedCars.length === 0 ? (
          <Reveal delay={0}>
            <div className="bg-white rounded-3xl p-16 text-center border border-[#E5E7EB] max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#000000] mb-2">
                No vehicles match your filters
              </h3>
              <p className="text-[#6C757D] text-sm mb-6 leading-relaxed">
                We couldn&apos;t find any vehicles matching your selected body type, fuel type, or search keywords.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-3 rounded-[50px] bg-[#5937E0] hover:bg-[#4A2CC7] hover:-translate-y-0.5 hover:shadow-md text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedCars.map((car, idx) => (
              <Reveal
                key={car.id || `${car.make}-${car.model}-${idx}`}
                delay={idx * 60}
              >
                <CarCard car={car} index={idx} />
              </Reveal>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loadingCars && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#000000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8FB] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              aria-label="Previous page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  currentPage === page
                    ? "bg-[#5937E0] text-white shadow-sm"
                    : "bg-white border border-[#E5E7EB] text-[#000000] hover:bg-[#EEEDF9]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#000000] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8FB] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              aria-label="Next page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Brand Logos Strip */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-20 mb-8">
        <Reveal delay={0}>
          <div className="bg-white rounded-[24px] py-10 px-6 sm:px-12 border border-[#E5E7EB] shadow-sm text-center">
            <p className="text-xs font-bold text-[#6C757D] uppercase tracking-widest mb-8">
              Supported Automobile Brands
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 sm:gap-10 lg:gap-14 px-2 sm:px-6">
              {brandLogos.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => {
                    setSearchQuery(brand.query || brand.name);
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  title={`Filter by ${brand.name}`}
                  className="h-10 sm:h-12 flex items-center justify-center group transition-transform hover:-translate-y-0.5 focus:outline-none cursor-pointer"
                >
                  <Image
                    src={brand.src}
                    alt={brand.alt}
                    width={brand.width}
                    height={brand.height}
                    unoptimized
                    className="max-h-7 sm:max-h-9 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
