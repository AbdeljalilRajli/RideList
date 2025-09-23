"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CarCard from "@/components/CarCard";
import SearchBar from "@/components/SearchBar";
import CustomFilter from "@/components/CustomFilter";
import { fuels, yearsOfProduction, cars, transmissionTypes, priceRanges, seatOptions } from "@/constants";
import { CarProps } from "@/types/index";

export default function FleetPage() {
  const [allCars, setAllCars] = useState<CarProps[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarProps[]>([]);
  const [loading, setLoading] = useState(false);

  // Search states
  const [manufacturer, setManuFacturer] = useState("");
  const [model, setModel] = useState("");

  // Filter states
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [transmission, setTransmission] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [seats, setSeats] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [carsPerPage] = useState(12);

  // Get available models for selected manufacturer
  const getAvailableModels = () => {
    if (!manufacturer) return [];
    const models = cars
      .filter(car => car.make.toLowerCase().includes(manufacturer.toLowerCase()))
      .map(car => car.model);
    return Array.from(new Set(models));
  };

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
    if (year) {
      filtered = filtered.filter(car => car.year.toString() === year);
    }

    // Filter by transmission
    if (transmission) {
      filtered = filtered.filter(car => car.transmission === transmission);
    }

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''));
      if (max) {
        filtered = filtered.filter(car => 
          car.price_per_day >= parseInt(min) && car.price_per_day <= parseInt(max)
        );
      } else {
        filtered = filtered.filter(car => car.price_per_day >= parseInt(min));
      }
    }

    // Filter by seats
    if (seats) {
      if (seats === "7") {
        filtered = filtered.filter(car => car.seats >= 7);
      } else {
        filtered = filtered.filter(car => car.seats === parseInt(seats));
      }
    }
    
    setFilteredCars(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setLoading(false);
  };

  const clearFilters = () => {
    setManuFacturer("");
    setModel("");
    setFuel("");
    setYear("");
    setTransmission("");
    setPriceRange("");
    setSeats("");
  };

  // Clear model when manufacturer changes
  useEffect(() => {
    if (manufacturer) {
      const availableModels = getAvailableModels();
      if (model && !availableModels.includes(model)) {
        setModel("");
      }
    } else {
      setModel("");
    }
  }, [manufacturer]);

  useEffect(() => {
    filterCars();
  }, [manufacturer, model, fuel, year, transmission, priceRange, seats]);
  
  useEffect(() => {
    setAllCars(cars);
    setFilteredCars(cars);
  }, []);

  // Pagination logic
  const indexOfLastCar = currentPage * carsPerPage;
  const indexOfFirstCar = indexOfLastCar - carsPerPage;
  const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar);
  const totalPages = Math.ceil(filteredCars.length / carsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-width padding-x py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Our Fleet</h1>
              <p className="text-gray-600 mt-2">Discover the perfect car for your journey</p>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-width padding-x py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-8">
                {/* Manufacturer Filter */}
                <div className="relative z-50">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Manufacturer
                  </label>
                  <SearchBar
                    setManuFacturer={setManuFacturer}
                    setModel={setModel}
                  />
                </div>

                {/* Model Filter - Updated to use dropdown */}
                {manufacturer && (
                  <div className="relative z-40">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Model
                    </label>
                    <div className="relative">
                      <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">All Models</option>
                        {getAvailableModels().map((modelName) => (
                          <option key={modelName} value={modelName}>
                            {modelName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Fuel Type */}
                <div className="relative z-30">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Fuel Type
                  </label>
                  <CustomFilter options={fuels} setFilter={setFuel} />
                </div>

                {/* Year */}
                <div className="relative z-20">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Year
                  </label>
                  <CustomFilter options={yearsOfProduction} setFilter={setYear} />
                </div>

                {/* Transmission */}
                <div className="relative z-10">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Transmission
                  </label>
                  <CustomFilter options={transmissionTypes} setFilter={setTransmission} />
                </div>

                {/* Price Range */}
                <div className="relative z-10">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </label>
                  <CustomFilter options={priceRanges} setFilter={setPriceRange} />
                </div>

                {/* Seats */}
                <div className="relative z-10">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seats
                  </label>
                  <CustomFilter options={seatOptions} setFilter={setSeats} />
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">
                    {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {currentCars.length > 0 ? (
              <>
                {/* Cars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {currentCars.map((car, index) => {
                    // Calculate the actual index in the full filtered array
                    const actualIndex = indexOfFirstCar + index;
                    return (
                      <CarCard key={`${car.make}-${car.model}-${actualIndex}`} car={car} index={actualIndex} />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-3">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                              currentPage === page
                                ? 'bg-blue-900 text-white [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
                  <p className="text-gray-600 mb-4">
                    No cars match your current filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="py-[16px] px-6 rounded-full bg-blue-900 text-white text-[14px] leading-[17px] font-bold hover:bg-blue-800 transition-colors [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]"
                  >
                    Clear All Filters
                  </button>
                </div>
              )
            )}

            {loading && (
              <div className="flex justify-center items-center py-12">
                <Image 
                  src="/loader.svg"
                  alt="loader"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
