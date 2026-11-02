"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { cars } from "@/constants";
import { CarProps } from "@/types";
import { getCarImage } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export default function FleetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F8FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3730A3]"></div>
      </div>
    }>
      <FleetContent />
    </Suspense>
  );
}

function FleetContent() {
  const searchParams = useSearchParams();
  const initialFuel = searchParams.get("fuel") || "";

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [transmission, setTransmission] = useState<string>("all");
  const [fuelType, setFuelType] = useState<string>(initialFuel || "all");
  const [drivetrain, setDrivetrain] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setTransmission("all");
    setFuelType("all");
    setDrivetrain("all");
    setMaxPrice(250);
    setSortBy("popular");
    setCurrentPage(1);
  };

  // Filtered & Sorted Cars
  const filteredCars = useMemo(() => {
    let result = cars.filter((car) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = `${car.make} ${car.model}`.toLowerCase().includes(q);
        const matchesClass = car.class.toLowerCase().includes(q);
        const matchesFuel = car.fuel_type.toLowerCase().includes(q);
        const matchesDrive = car.drive.toLowerCase().includes(q);
        if (!matchesName && !matchesClass && !matchesFuel && !matchesDrive) {
          return false;
        }
      }

      // Type pill filter
      if (selectedType !== "all") {
        const cClass = car.class.toLowerCase();
        const fType = car.fuel_type.toLowerCase();
        if (selectedType === "Sedan" && !cClass.includes("compact") && !cClass.includes("midsize") && !cClass.includes("sedan") && !cClass.includes("wagon")) {
          return false;
        }
        if (selectedType === "SUV" && !cClass.includes("suv")) {
          return false;
        }
        if (selectedType === "Hybrid" && !fType.includes("hybrid") && !fType.includes("electric")) {
          return false;
        }
        if (selectedType === "Luxury" && car.price_per_day < 70) {
          return false;
        }
      }

      // Transmission filter
      if (transmission !== "all") {
        if (transmission === "Automatic" && car.transmission !== "a") return false;
        if (transmission === "Manual" && car.transmission !== "m") return false;
      }

      // Fuel type filter
      if (fuelType !== "all") {
        if (fuelType.toLowerCase() === "gasoline" && car.fuel_type.toLowerCase() !== "gas") return false;
        if (fuelType.toLowerCase() === "hybrid" && !car.fuel_type.toLowerCase().includes("hybrid")) return false;
        if (fuelType.toLowerCase() === "electric" && !car.fuel_type.toLowerCase().includes("electr")) return false;
      }

      // Drivetrain filter
      if (drivetrain !== "all") {
        if (car.drive.toLowerCase() !== drivetrain.toLowerCase()) return false;
      }

      // Price filter
      if (car.price_per_day > maxPrice) {
        return false;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "price-asc") return a.price_per_day - b.price_per_day;
      if (sortBy === "price-desc") return b.price_per_day - a.price_per_day;
      if (sortBy === "mpg-desc") return b.city_mpg - a.city_mpg;
      return 0; // "popular" default order
    });

    return result;
  }, [searchQuery, selectedType, transmission, fuelType, drivetrain, maxPrice, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredCars.length / itemsPerPage);
  const displayedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCars.slice(start, start + itemsPerPage);
  }, [filteredCars, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType, transmission, fuelType, drivetrain, maxPrice, sortBy]);

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#0F0F1A] pt-24 pb-20">
      {/* 1. Top Fleet Intro Header & Editorial Highlights */}
      <section className="w-full max-w-[1280px] mx-auto px-6 pt-6 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-[#E5E7EB]">
          <div className="max-w-2xl flex flex-col gap-3">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
              <Link href="/" className="hover:text-[#3730A3] transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">home</span>
                Home
              </Link>
              <span>/</span>
              <span className="text-[#0F0F1A]">Fleet Collection</span>
            </nav>

            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#EEEDF9] text-[#3730A3] font-bold text-xs tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#3730A3] animate-pulse"></span>
              REAL-TIME FLEET AVAILABILITY • 2026 EDITION
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F0F1A] tracking-tight leading-tight">
              Explore Our Curated <span className="text-[#3730A3]">Fleet</span>
            </h1>

            <p className="text-base text-[#6B7280] leading-relaxed">
              Discover handpicked, meticulously maintained vehicles for city commutes, weekend road trips, and seamless business mobility. Transparent pricing with comprehensive protection included.
            </p>
          </div>

          {/* Quick Fleet Stat Strip */}
          <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-[#E5E7EB] shadow-sm self-start lg:self-auto">
            <div className="flex items-center gap-3 px-4 py-2 border-r border-[#E5E7EB]">
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] flex items-center justify-center text-[#3730A3]">
                <span className="material-symbols-outlined text-[20px]">directions_car</span>
              </div>
              <div>
                <div className="font-extrabold text-lg text-[#0F0F1A] leading-none">
                  {cars.length}+
                </div>
                <div className="text-xs text-[#6B7280] mt-1 font-medium">Available Cars</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-10 h-10 rounded-full bg-[#EEEDF9] flex items-center justify-center text-[#3730A3]">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div>
                <div className="font-extrabold text-lg text-[#0F0F1A] leading-none">100%</div>
                <div className="text-xs text-[#6B7280] mt-1 font-medium">Insured & Ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Control Dock (Stitch exact layout) */}
      <section className="w-full max-w-[1280px] mx-auto px-6 mb-8">
        <div className="w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-md p-6 flex flex-col gap-6">
          {/* Row 1: Search Input + Type Pills */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Live Search Field */}
            <div className="relative flex-1 min-w-[280px]">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by car name, make, model (e.g. Honda Civic, Hybrid, AWD)..."
                className="w-full h-12 pl-12 pr-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-sm placeholder:text-[#9CA3AF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3730A3] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F0F1A]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Vehicle Type Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {[
                { label: "All Cars", value: "all" },
                { label: "Sedans", value: "Sedan" },
                { label: "SUVs", value: "SUV" },
                { label: "Hybrids", value: "Hybrid" },
                { label: "Luxury & Sports", value: "Luxury" },
              ].map((pill) => {
                const isActive = selectedType === pill.value;
                return (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => setSelectedType(pill.value)}
                    className={`px-5 h-11 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 shadow-sm ${
                      isActive
                        ? "bg-[#3730A3] text-white"
                        : "bg-[#F8F8FB] border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F0F1A] hover:bg-[#EEEDF9]"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Secondary Spec Dropdowns & Price Sliders */}
          <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Transmission Select */}
              <div className="relative">
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold cursor-pointer hover:bg-white focus:outline-none transition-colors"
                >
                  <option value="all">Transmission: All</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Fuel Type Select */}
              <div className="relative">
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold cursor-pointer hover:bg-white focus:outline-none transition-colors"
                >
                  <option value="all">Fuel Type: All</option>
                  <option value="gasoline">Gasoline</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Drivetrain Select */}
              <div className="relative">
                <select
                  value={drivetrain}
                  onChange={(e) => setDrivetrain(e.target.value)}
                  className="appearance-none h-10 pl-4 pr-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold cursor-pointer hover:bg-white focus:outline-none transition-colors"
                >
                  <option value="all">Drivetrain: All</option>
                  <option value="fwd">FWD (Front-Wheel)</option>
                  <option value="awd">AWD (All-Wheel)</option>
                  <option value="rwd">RWD (Rear-Wheel)</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                  expand_more
                </span>
              </div>

              {/* Price Range Slider Widget */}
              <div className="flex items-center gap-3 px-4 h-10 rounded-full bg-[#F8F8FB] border border-[#E5E7EB]">
                <span className="text-xs font-medium text-[#6B7280]">Max Rate:</span>
                <input
                  type="range"
                  min="40"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-24 accent-[#3730A3] cursor-pointer"
                />
                <span className="text-xs font-bold text-[#0F0F1A] min-w-[50px]">
                  ${maxPrice}/d
                </span>
              </div>
            </div>

            {/* Sort Option & Reset Trigger */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280] hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none h-10 pl-3 pr-9 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] text-xs font-semibold cursor-pointer hover:bg-white focus:outline-none transition-colors"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="mpg-desc">Highest MPG</option>
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[18px]">
                    sort
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="h-10 px-4 rounded-full text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Reset
              </button>
            </div>
          </div>

          {/* Row 3: Active Badges Ribbon */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#6B7280]">
            <span className="text-[#9CA3AF]">Filtering by:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] font-medium">
              {selectedType === "all" ? "All Categories" : selectedType}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] font-medium">
              Up to ${maxPrice}/day
            </span>
            {transmission !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] font-medium">
                {transmission}
              </span>
            )}
            {fuelType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-[#0F0F1A] font-medium">
                {fuelType.toUpperCase()}
              </span>
            )}
            <span className="text-[#6B7280] ml-2">
              (<strong className="text-[#0F0F1A]">{filteredCars.length}</strong> vehicles ready)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Fleet Card Grid (3 Columns on lg, 2 on md, 1 on sm) */}
      <section className="w-full max-w-[1280px] mx-auto px-6 py-2">
        {displayedCars.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7EB] p-8">
            <div className="w-16 h-16 rounded-full bg-[#EEEDF9] text-[#3730A3] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">directions_car</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F0F1A] mb-2">No Vehicles Match Your Criteria</h2>
            <p className="text-[#6B7280] text-sm max-w-md mx-auto mb-6">
              Try adjusting your filter options or clearing the current selection to view all available cars in our fleet.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3730A3] text-white text-sm font-semibold hover:bg-[#312E81] transition-all shadow-md"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCars.map((car, idx) => {
              const carId = `${car.make.toLowerCase()}-${car.model.toLowerCase().replace(/\s+/g, "-")}-${car.year}-${cars.indexOf(car)}`;
              const isFav = !!favorites[carId];
              const carImg = getCarImage(car);

              // Subtitle category
              const categoryBadge = car.fuel_type.toLowerCase() === "hybrid"
                ? "Hybrid Sedan"
                : car.class.toLowerCase().includes("suv")
                ? "Compact SUV"
                : car.price_per_day >= 70
                ? "Luxury Class"
                : "Economy Sedan";

              return (
                <article
                  key={carId}
                  className="flex flex-col bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Top Stage */}
                  <div className="relative p-5 pb-0">
                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-3 py-1 rounded-full bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#6B7280]">
                        {categoryBadge}
                      </span>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-[#E5E7EB]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span className="text-xs font-medium text-[#0F0F1A]">Available Now</span>
                      </div>
                    </div>

                    {/* Vehicle Image Stage */}
                    <div className="w-full h-52 flex items-center justify-center overflow-hidden my-2 relative bg-[#F8F8FB] rounded-xl">
                      <Image
                        src={carImg}
                        alt={`${car.make} ${car.model}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        priority={idx < 3}
                      />
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(carId, e)}
                        aria-label={`Favorite ${car.make} ${car.model}`}
                        className={`absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-colors shadow-sm ${
                          isFav ? "text-[#BA1A1A]" : "text-[#9CA3AF] hover:text-[#BA1A1A]"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 pt-2 flex flex-col flex-1 justify-between gap-5 bg-gradient-to-b from-transparent to-[#F8F8FB]/40">
                    <div>
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-xl font-bold text-[#0F0F1A] group-hover:text-[#3730A3] transition-colors">
                          {car.make} {car.model}
                        </h3>
                        <span className="text-sm font-semibold text-[#6B7280]">{car.year}</span>
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {car.class} • {car.cylinders} cylinders • Refined {car.fuel_type} drive
                      </p>

                      {/* Specs 4-Box Grid */}
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-center">
                          <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
                            swap_driving_apps
                          </span>
                          <span className="text-[11px] font-semibold text-[#0F0F1A] mt-1">
                            {car.transmission === "a" ? "Auto" : "Manual"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-center">
                          <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
                            electric_meter
                          </span>
                          <span className="text-[11px] font-semibold text-[#0F0F1A] mt-1">
                            {car.drive.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-center">
                          <span className="material-symbols-outlined text-[18px] text-[#3730A3]">
                            local_gas_station
                          </span>
                          <span className="text-[11px] font-semibold text-[#0F0F1A] mt-1">
                            {car.city_mpg} MPG
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-center">
                          <span className="material-symbols-outlined text-[18px] text-[#6B7280]">
                            airline_seat_recline_normal
                          </span>
                          <span className="text-[11px] font-semibold text-[#0F0F1A] mt-1">
                            {car.seats} Seats
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Strip */}
                    <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-[#0F0F1A]">
                            ${car.price_per_day}
                          </span>
                          <span className="text-xs text-[#6B7280]">/ day</span>
                        </div>
                        <span className="text-[11px] text-[#9CA3AF] block">
                          Zero deposit · Insured
                        </span>
                      </div>

                      <Link
                        href={`/car/${carId}`}
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#3730A3] text-white text-xs font-semibold shadow-sm hover:bg-[#312E81] active:scale-95 transition-all"
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white text-[#0F0F1A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F8FB] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#3730A3] text-white shadow-sm"
                    : "bg-white border border-[#E5E7EB] text-[#0F0F1A] hover:bg-[#EEEDF9]"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="w-10 h-10 rounded-full border border-[#E5E7EB] bg-white text-[#0F0F1A] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8F8FB] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
