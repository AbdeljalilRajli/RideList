"use client";

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cars as fallbackCars } from "@/constants";
import { CarProps } from "@/types";
import CarCard from "@/components/CarCard";
import Reveal from "@/components/Reveal";
import { supabase } from "@/lib/supabase";
import {
  CAR_SEGMENTS,
  normalizeFuel,
  normalizeTransmission,
  formatBodyType,
  formatSegment,
} from "@/lib/carTaxonomy";
import DateRangePicker from "@/components/common/DateRangePicker";

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

type SortOption = "price_asc" | "price_desc" | "newest";

function FleetContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Supabase Cars State & Skeletons
  const [carsList, setCarsList] = useState<CarProps[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // 2. Fetch cars once from Supabase
  useEffect(() => {
    async function loadCars() {
      try {
        const { data, error } = await supabase
          .from("cars")
          .select("*")
          .neq("status", "hidden")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setCarsList(data as CarProps[]);
        } else {
          setCarsList(fallbackCars as CarProps[]);
        }
      } catch (err) {
        console.error("Error loading cars from Supabase:", err);
        setCarsList(fallbackCars as CarProps[]);
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

  // Actual price bounds from fleet data
  const { minPriceBound, maxPriceBound } = useMemo(() => {
    if (visibleCars.length === 0) return { minPriceBound: 300, maxPriceBound: 2000 };
    const prices = visibleCars.map((c) => Number(c.price_per_day) || 0);
    return {
      minPriceBound: Math.min(...prices),
      maxPriceBound: Math.max(...prices),
    };
  }, [visibleCars]);

  // 3. State initialized from URL Query Params
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || searchParams.get("query") || searchParams.get("city") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedType, setSelectedType] = useState(() => searchParams.get("type")?.toLowerCase() || "all");
  const [selectedSegment, setSelectedSegment] = useState(() => searchParams.get("segment")?.toLowerCase() || "all");
  const [selectedSeats, setSelectedSeats] = useState(() => searchParams.get("seats") || "all");
  const [transmission, setTransmission] = useState(() => searchParams.get("transmission") || "all");
  const [fuelType, setFuelType] = useState(() => searchParams.get("fuel") || "all");
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const s = searchParams.get("sort");
    return s === "price_desc" || s === "newest" ? s : "price_asc";
  });

  // Price range state
  const [minPrice, setMinPrice] = useState<number>(() => {
    const val = searchParams.get("min_price");
    return val ? Number(val) : minPriceBound;
  });
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const val = searchParams.get("max_price");
    return val ? Number(val) : maxPriceBound;
  });

  // Date availability state
  const [pickupDate, setPickupDate] = useState(() => searchParams.get("pickup_date") || "");
  const [returnDate, setReturnDate] = useState(() => searchParams.get("return_date") || "");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(() => searchParams.get("only_available") === "true");
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});
  const [isCheckingDates, setIsCheckingDates] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const itemsPerPage = 9;

  // Ref to the results container for accessible smooth scrolling
  const resultsContainerRef = useRef<HTMLElement>(null);
  const isInitialMount = useRef(true);
  const prevPageRef = useRef(currentPage);

  const scrollToResults = useCallback(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({
        behavior: prefersReduced ? "auto" : "smooth",
        block: "start",
      });
      resultsContainerRef.current.focus({ preventScroll: true });
    }
  }, []);

  // Smooth-scroll to top of list when page changes (not on first load, respects prefers-reduced-motion)
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      scrollToResults();
    }
  }, [currentPage, scrollToResults]);

  // Mobile: also scroll to top of results when a filter or sort changes
  const prevFiltersRef = useRef({
    type: selectedType,
    segment: selectedSegment,
    seats: selectedSeats,
    transmission,
    fuel: fuelType,
    sort: sortOption,
    minPrice,
    maxPrice,
    onlyAvailable,
    debouncedQuery,
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prev = prevFiltersRef.current;
    const hasFilterChanged =
      prev.type !== selectedType ||
      prev.segment !== selectedSegment ||
      prev.seats !== selectedSeats ||
      prev.transmission !== transmission ||
      prev.fuel !== fuelType ||
      prev.sort !== sortOption ||
      prev.minPrice !== minPrice ||
      prev.maxPrice !== maxPrice ||
      prev.onlyAvailable !== onlyAvailable ||
      prev.debouncedQuery !== debouncedQuery;

    if (hasFilterChanged) {
      prevFiltersRef.current = {
        type: selectedType,
        segment: selectedSegment,
        seats: selectedSeats,
        transmission,
        fuel: fuelType,
        sort: sortOption,
        minPrice,
        maxPrice,
        onlyAvailable,
        debouncedQuery,
      };

      if (typeof window !== "undefined" && window.innerWidth < 768) {
        scrollToResults();
      }
    }
  }, [
    selectedType,
    selectedSegment,
    selectedSeats,
    transmission,
    fuelType,
    sortOption,
    minPrice,
    maxPrice,
    onlyAvailable,
    debouncedQuery,
    scrollToResults,
  ]);

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Synchronize price bounds once cars are loaded if not customized by user
  useEffect(() => {
    if (visibleCars.length > 0) {
      const urlMin = searchParams.get("min_price");
      const urlMax = searchParams.get("max_price");
      if (!urlMin) setMinPrice(minPriceBound);
      if (!urlMax) setMaxPrice(maxPriceBound);
    }
  }, [minPriceBound, maxPriceBound, visibleCars.length, searchParams]);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 4. Check Date Availability via Supabase RPC (SECURITY DEFINER)
  useEffect(() => {
    if (!pickupDate || !returnDate || returnDate < pickupDate) {
      setAvailabilityMap({});
      return;
    }

    let isCancelled = false;
    async function checkAvailability() {
      setIsCheckingDates(true);
      try {
        const { data, error } = await supabase.rpc("get_available_cars", {
          p_pickup_date: pickupDate,
          p_return_date: returnDate,
          p_include_pending: false,
        });

        if (!error && data && !isCancelled) {
          const map: Record<string, boolean> = {};
          (data as { car_id: string; is_available: boolean }[]).forEach((row) => {
            map[row.car_id] = row.is_available;
          });
          setAvailabilityMap(map);
        }
      } catch (err) {
        console.error("Availability RPC error:", err);
      } finally {
        if (!isCancelled) setIsCheckingDates(false);
      }
    }

    checkAvailability();
    return () => {
      isCancelled = true;
    };
  }, [pickupDate, returnDate]);

  // 5. Synchronize URL State smoothly with window.history (preserves back/refresh/share)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (selectedType !== "all") params.set("type", selectedType);
    if (selectedSegment !== "all") params.set("segment", selectedSegment);
    if (selectedSeats !== "all") params.set("seats", selectedSeats);
    if (transmission !== "all") params.set("transmission", transmission);
    if (fuelType !== "all") params.set("fuel", fuelType);
    if (sortOption !== "price_asc") params.set("sort", sortOption);
    if (minPrice > minPriceBound) params.set("min_price", String(minPrice));
    if (maxPrice < maxPriceBound) params.set("max_price", String(maxPrice));
    if (pickupDate) params.set("pickup_date", pickupDate);
    if (returnDate) params.set("return_date", returnDate);
    if (onlyAvailable) params.set("only_available", "true");
    if (currentPage > 1) params.set("page", String(currentPage));

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [
    debouncedQuery,
    selectedType,
    selectedSegment,
    selectedSeats,
    transmission,
    fuelType,
    sortOption,
    minPrice,
    maxPrice,
    pickupDate,
    returnDate,
    onlyAvailable,
    currentPage,
    pathname,
    minPriceBound,
    maxPriceBound,
  ]);

  // 6. Dynamic Options Generated from Fleet Data with Counts (Hide 0-car options)

  // A. Body Type Chips
  const dynamicBodyTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleCars.forEach((c) => {
      const type = (c.body_type || (c.class?.toLowerCase().includes("suv") ? "suv" : "sedan")).toLowerCase();
      counts[type] = (counts[type] || 0) + 1;
    });

    const standardOrder = ["sedan", "hatchback", "suv", "minivan", "pickup", "convertible", "coupe", "van"];
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

  // B. Vehicle Segment Options
  const availableSegments = useMemo(() => {
    const counts: Record<string, number> = {};
    visibleCars.forEach((c) => {
      const seg = (c.segment || "midsize").toLowerCase();
      counts[seg] = (counts[seg] || 0) + 1;
    });

    const list: { label: string; value: string; count: number }[] = [];
    CAR_SEGMENTS.forEach((s) => {
      const count = counts[s.value] || 0;
      if (count > 0) {
        list.push({ label: s.label, value: s.value, count });
      }
    });
    return list;
  }, [visibleCars]);

  // C. Seats Filter Options (2, 4-5, 6+)
  const availableSeatsOptions = useMemo(() => {
    let count2 = 0;
    let count45 = 0;
    let count6plus = 0;

    visibleCars.forEach((c) => {
      const s = c.seats || 5;
      if (s === 2) count2++;
      else if (s >= 4 && s <= 5) count45++;
      else if (s >= 6) count6plus++;
    });

    const options: { label: string; value: string; count: number }[] = [];
    if (count2 > 0) options.push({ label: "2 Seats", value: "2", count: count2 });
    if (count45 > 0) options.push({ label: "4-5 Seats", value: "4-5", count: count45 });
    if (count6plus > 0) options.push({ label: "6+ Seats", value: "6+", count: count6plus });
    return options;
  }, [visibleCars]);

  // D. Transmission Options (Normalized)
  const availableTransmissions = useMemo(() => {
    const set = new Set<string>();
    visibleCars.forEach((c) => {
      set.add(normalizeTransmission(c.transmission));
    });
    return Array.from(set).sort();
  }, [visibleCars]);

  // E. Fuel Options (Normalized)
  const availableFuels = useMemo(() => {
    const set = new Set<string>();
    visibleCars.forEach((c) => {
      set.add(normalizeFuel(c.fuel_type));
    });
    return Array.from(set).sort();
  }, [visibleCars]);

  // 7. Combined In-Memory Filter with AND
  const filteredCars = useMemo(() => {
    return visibleCars.filter((car) => {
      // 1. Search Query
      if (debouncedQuery.trim()) {
        const q = debouncedQuery.toLowerCase().trim();
        const name = `${car.make} ${car.model}`.toLowerCase();
        const bType = (car.body_type || "").toLowerCase();
        const cClass = (car.class || "").toLowerCase();
        const seg = (car.segment || "").toLowerCase();
        if (!name.includes(q) && !bType.includes(q) && !cClass.includes(q) && !seg.includes(q)) {
          return false;
        }
      }

      // 2. Body Type Chip
      if (selectedType !== "all") {
        const carType = (car.body_type || (car.class?.toLowerCase().includes("suv") ? "suv" : "sedan")).toLowerCase();
        if (carType !== selectedType.toLowerCase()) return false;
      }

      // 3. Vehicle Segment
      if (selectedSegment !== "all") {
        const carSeg = (car.segment || "").toLowerCase();
        if (carSeg !== selectedSegment.toLowerCase()) return false;
      }

      // 4. Seats Filter (2, 4-5, 6+)
      if (selectedSeats !== "all") {
        const s = car.seats || 5;
        if (selectedSeats === "2" && s !== 2) return false;
        if (selectedSeats === "4-5" && (s < 4 || s > 5)) return false;
        if (selectedSeats === "6+" && s < 6) return false;
      }

      // 5. Transmission (normalized)
      if (transmission !== "all") {
        if (normalizeTransmission(car.transmission) !== transmission) return false;
      }

      // 6. Fuel Type (normalized)
      if (fuelType !== "all") {
        if (normalizeFuel(car.fuel_type) !== fuelType) return false;
      }

      // 7. Price Range Filter
      const price = Number(car.price_per_day) || 0;
      if (price < minPrice || price > maxPrice) return false;

      // 8. Availability filter (if onlyAvailable checked and dates selected)
      if (onlyAvailable && pickupDate && returnDate && car.id) {
        if (availabilityMap[car.id] === false) return false;
      }

      return true;
    });
  }, [
    visibleCars,
    debouncedQuery,
    selectedType,
    selectedSegment,
    selectedSeats,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    onlyAvailable,
    pickupDate,
    returnDate,
    availabilityMap,
  ]);

  // 8. Sorting: price_asc, price_desc, newest
  const sortedCars = useMemo(() => {
    const list = [...filteredCars];
    if (sortOption === "price_asc") {
      list.sort((a, b) => (Number(a.price_per_day) || 0) - (Number(b.price_per_day) || 0));
    } else if (sortOption === "price_desc") {
      list.sort((a, b) => (Number(b.price_per_day) || 0) - (Number(a.price_per_day) || 0));
    } else if (sortOption === "newest") {
      list.sort((a, b) => {
        const yearDiff = (b.year || 0) - (a.year || 0);
        if (yearDiff !== 0) return yearDiff;
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    }
    return list;
  }, [filteredCars, sortOption]);

  // 9. Pagination (strictly applied after filtering and sorting)
  const totalPages = Math.ceil(sortedCars.length / itemsPerPage) || 1;
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCars.slice(start, start + itemsPerPage);
  }, [sortedCars, currentPage]);

  // Active filters count (for badge and removable pills)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedQuery.trim()) count++;
    if (selectedType !== "all") count++;
    if (selectedSegment !== "all") count++;
    if (selectedSeats !== "all") count++;
    if (transmission !== "all") count++;
    if (fuelType !== "all") count++;
    if (minPrice > minPriceBound || maxPrice < maxPriceBound) count++;
    if (pickupDate && returnDate) count++;
    if (onlyAvailable) count++;
    return count;
  }, [
    debouncedQuery,
    selectedType,
    selectedSegment,
    selectedSeats,
    transmission,
    fuelType,
    minPrice,
    maxPrice,
    minPriceBound,
    maxPriceBound,
    pickupDate,
    returnDate,
    onlyAvailable,
  ]);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedType("all");
    setSelectedSegment("all");
    setSelectedSeats("all");
    setTransmission("all");
    setFuelType("all");
    setMinPrice(minPriceBound);
    setMaxPrice(maxPriceBound);
    setPickupDate("");
    setReturnDate("");
    setOnlyAvailable(false);
    setSortOption("price_asc");
    setCurrentPage(1);
  }, [minPriceBound, maxPriceBound]);

  return (
    <main className="min-h-screen bg-[#F8F8FB] text-[#000000] pt-[104px] pb-24 font-['Work_Sans',sans-serif]">
      {/* Header Banner */}
      <section className="bg-white border-b border-[#E5E7EB] py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 text-center">
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

          {/* Dynamic Body Type Filter Chips (Horizontal scroll on mobile) */}
          <Reveal triggerOnLoad delay={140} className="w-full max-w-full overflow-hidden min-w-0">
            <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar py-2 px-1 justify-start sm:justify-center w-full max-w-full">
              {loadingCars && dynamicBodyTypes.length <= 1 ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-11 w-28 rounded-[50px] bg-gray-100 animate-pulse shrink-0"
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
                    className={`px-4 sm:px-5 py-2.5 rounded-[50px] text-xs font-bold transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 shrink-0 ${
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

      {/* Main Filter & Controls Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 mt-8">
        <Reveal delay={0}>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-sm space-y-4">
            {/* Top Row: Search + Mobile Filter Trigger + Sort Dropdown */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by make, model, category..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-[#000000] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#5937E0] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Action Buttons: Mobile Drawer Button & Sort Dropdown */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                {/* Mobile Filter Trigger Button (Drawer) */}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="lg:hidden h-11 px-4 rounded-xl bg-[#EEEDF9] text-[#5937E0] hover:bg-[#5937E0] hover:text-white transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#5937E0] group-hover:bg-white text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#6C757D] font-medium hidden sm:inline">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => {
                      setSortOption(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="h-11 px-3 sm:px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-[#000000] focus:outline-none focus:border-[#5937E0] transition-colors cursor-pointer"
                  >
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest Fleet</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Filters Row (Hidden on mobile, present in drawer) */}
            <div className="hidden lg:grid grid-cols-12 gap-3 pt-3 border-t border-[#E5E7EB] items-center">
              {/* Dates Selector */}
              <div className="col-span-4">
                <DateRangePicker
                  startDate={pickupDate}
                  endDate={returnDate}
                  onChange={({ startDate, endDate }) => {
                    setPickupDate(startDate);
                    setReturnDate(endDate);
                    setCurrentPage(1);
                  }}
                  layout="split"
                  showLabels={true}
                  pickupLabel="Pickup Date"
                  returnLabel="Return Date"
                  buttonClassName="!h-10 !rounded-xl text-[11px]"
                />
              </div>

              {/* Segment Dropdown */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">
                  Segment
                </label>
                <select
                  value={selectedSegment}
                  onChange={(e) => {
                    setSelectedSegment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="all">All Segments</option>
                  {availableSegments.map((seg) => (
                    <option key={seg.value} value={seg.value}>
                      {seg.label} ({seg.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Seats Dropdown */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">
                  Seats
                </label>
                <select
                  value={selectedSeats}
                  onChange={(e) => {
                    setSelectedSeats(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="all">All Seats</option>
                  {availableSeatsOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission Dropdown */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">
                  Transmission
                </label>
                <select
                  value={transmission}
                  onChange={(e) => {
                    setTransmission(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="all">All Transmissions</option>
                  {availableTransmissions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Dropdown */}
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-[#6C757D] uppercase tracking-wider mb-1">
                  Fuel Type
                </label>
                <select
                  value={fuelType}
                  onChange={(e) => {
                    setFuelType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="all">All Fuels</option>
                  {availableFuels.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range Slider & Bounds */}
            <div className="hidden lg:flex items-center justify-between gap-4 pt-3 border-t border-[#E5E7EB] text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#6C757D] uppercase text-[10px] tracking-wider">
                  Daily Price (MAD):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={minPriceBound}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMinPrice(v);
                      setCurrentPage(1);
                    }}
                    className="w-20 h-9 px-2 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-center font-bold text-black text-xs"
                  />
                  <span className="text-[#6C757D]">to</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPriceBound}
                    value={maxPrice}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMaxPrice(v);
                      setCurrentPage(1);
                    }}
                    className="w-20 h-9 px-2 rounded-lg bg-[#F8F8FB] border border-[#E5E7EB] text-center font-bold text-black text-xs"
                  />
                  <span className="text-[#6C757D]">DH/day</span>
                </div>
              </div>

              {/* Only Available Vehicles Toggle */}
              {pickupDate && returnDate && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => {
                      setOnlyAvailable(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 text-[#5937E0] rounded border-gray-300 focus:ring-[#5937E0]"
                  />
                  <span>Show only vehicles free for these dates</span>
                </label>
              )}
            </div>
          </div>
        </Reveal>

        {/* Active Filter Tags Strip */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            <span className="text-xs font-bold text-[#6C757D] mr-1">Active Filters:</span>

            {/* Body Type Tag */}
            {selectedType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Type: {formatBodyType(selectedType)}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("all");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Segment Tag */}
            {selectedSegment !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Segment: {formatSegment(selectedSegment)}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSegment("all");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Seats Tag */}
            {selectedSeats !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Seats: {selectedSeats}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSeats("all");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Transmission Tag */}
            {transmission !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Trans: {transmission}
                <button
                  type="button"
                  onClick={() => {
                    setTransmission("all");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Fuel Tag */}
            {fuelType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Fuel: {fuelType}
                <button
                  type="button"
                  onClick={() => {
                    setFuelType("all");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Price Tag */}
            {(minPrice > minPriceBound || maxPrice < maxPriceBound) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Price: {minPrice} - {maxPrice} DH
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice(minPriceBound);
                    setMaxPrice(maxPriceBound);
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Dates Tag */}
            {pickupDate && returnDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Dates: {pickupDate} → {returnDate}
                <button
                  type="button"
                  onClick={() => {
                    setPickupDate("");
                    setReturnDate("");
                    setOnlyAvailable(false);
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Search Query Tag */}
            {debouncedQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEEDF9] text-[#5937E0] text-xs font-bold">
                Search: &ldquo;{debouncedQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedQuery("");
                    setCurrentPage(1);
                  }}
                  className="hover:text-black font-extrabold"
                >
                  ✕
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-bold text-[#FFA000] hover:text-[#FF8F00] underline ml-2 cursor-pointer"
            >
              Clear all filters
            </button>

            {/* Result count pill */}
            <span className="text-xs font-medium text-[#6C757D] ml-auto">
              {sortedCars.length} {sortedCars.length === 1 ? "vehicle found" : "vehicles found"}
            </span>
          </div>
        )}
      </section>

      {/* Vehicles Grid Section */}
      <section
        ref={resultsContainerRef}
        tabIndex={-1}
        aria-label="Available Vehicles"
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 mt-8 scroll-mt-24 sm:scroll-mt-28 outline-none"
      >
        {loadingCars ? (
          /* Skeleton Loading Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="h-96 rounded-[16px] bg-white border border-[#E5E7EB] p-6 flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="w-full h-44 bg-gray-100 rounded-xl mb-4" />
                  <div className="h-5 w-3/4 bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-gray-100 rounded mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-11 w-full bg-gray-100 rounded-[50px] mt-4" />
              </div>
            ))}
          </div>
        ) : paginatedCars.length === 0 ? (
          /* Empty State */
          <Reveal delay={0}>
            <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#E5E7EB] max-w-xl mx-auto shadow-sm">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No vehicles match your filters</h3>
              <p className="text-sm text-[#6C757D] mb-6">
                Try widening your price range, clearing some filter attributes, or removing date restrictions.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-3 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </Reveal>
        ) : (
          /* Vehicle Cards Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedCars.map((car, idx) => (
                <CarCard
                  key={car.id || `${car.make}-${car.model}-${idx}`}
                  car={car}
                  index={idx}
                  isAvailableForDates={
                    pickupDate && returnDate && car.id
                      ? availabilityMap[car.id] ?? true
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-black hover:bg-[#EEEDF9] hover:text-[#5937E0] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition-colors cursor-pointer"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          if (currentPage === pageNum) {
                            scrollToResults();
                          } else {
                            setCurrentPage(pageNum);
                          }
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-[#5937E0] text-white shadow-sm"
                            : "bg-white border border-[#E5E7EB] text-black hover:bg-[#EEEDF9] hover:text-[#5937E0]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-black hover:bg-[#EEEDF9] hover:text-[#5937E0] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Mobile Filters Drawer / Bottom Sheet */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs lg:hidden">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative bg-white rounded-t-[28px] max-h-[85vh] flex flex-col shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-black">Filter Fleet</h3>
                <p className="text-xs text-[#6C757D]">
                  {sortedCars.length} {sortedCars.length === 1 ? "vehicle available" : "vehicles available"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
              {/* Dates */}
              <div>
                <DateRangePicker
                  startDate={pickupDate}
                  endDate={returnDate}
                  onChange={({ startDate, endDate }) => {
                    setPickupDate(startDate);
                    setReturnDate(endDate);
                    setCurrentPage(1);
                  }}
                  layout="split"
                  showLabels={true}
                  pickupLabel="Pickup Date"
                  returnLabel="Return Date"
                  buttonClassName="!h-10 !rounded-xl text-xs"
                />
              </div>

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-black">Daily Price (MAD)</label>
                  <span className="text-xs font-bold text-[#5937E0]">
                    {minPrice} - {maxPrice} DH
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={minPriceBound}
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    placeholder="Min"
                    className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] font-bold text-black"
                  />
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPriceBound}
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    placeholder="Max"
                    className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] font-bold text-black"
                  />
                </div>
              </div>

              {/* Vehicle Segment */}
              <div>
                <label className="block text-xs font-bold text-black mb-2">Segment</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSegment("all");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full font-bold ${
                      selectedSegment === "all"
                        ? "bg-[#5937E0] text-white"
                        : "bg-[#F8F8FB] border border-[#E5E7EB] text-black"
                    }`}
                  >
                    All
                  </button>
                  {availableSegments.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setSelectedSegment(s.value);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full font-bold ${
                        selectedSegment === s.value
                          ? "bg-[#5937E0] text-white"
                          : "bg-[#F8F8FB] border border-[#E5E7EB] text-black"
                      }`}
                    >
                      {s.label} ({s.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Seats */}
              <div>
                <label className="block text-xs font-bold text-black mb-2">Seats</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSeats("all");
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-full font-bold ${
                      selectedSeats === "all"
                        ? "bg-[#5937E0] text-white"
                        : "bg-[#F8F8FB] border border-[#E5E7EB] text-black"
                    }`}
                  >
                    All
                  </button>
                  {availableSeatsOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedSeats(opt.value);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-full font-bold ${
                        selectedSeats === opt.value
                          ? "bg-[#5937E0] text-white"
                          : "bg-[#F8F8FB] border border-[#E5E7EB] text-black"
                      }`}
                    >
                      {opt.label} ({opt.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission & Fuel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => {
                      setTransmission(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] font-semibold text-black"
                  >
                    <option value="all">All</option>
                    {availableTransmissions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5">Fuel</label>
                  <select
                    value={fuelType}
                    onChange={(e) => {
                      setFuelType(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] font-semibold text-black"
                  >
                    <option value="all">All</option>
                    {availableFuels.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-white flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="w-1/3 h-11 rounded-full border border-[#E5E7EB] text-xs font-bold text-black hover:bg-gray-50"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-2/3 h-11 rounded-full bg-[#5937E0] text-white text-xs font-bold shadow-md hover:bg-[#4A2CC7]"
              >
                Apply ({sortedCars.length} Cars)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Logos Strip */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-20">
        <Reveal delay={200}>
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#000000]">
              Browse By Popular Makes
            </h3>
            <p className="text-xs sm:text-sm text-[#6C757D] mt-1">
              Select a brand to instantly filter through our premium vehicle line
            </p>
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandLogos.map((brand) => (
              <button
                key={brand.name}
                type="button"
                onClick={() => {
                  setSearchQuery(brand.query);
                  setDebouncedQuery(brand.query);
                  setCurrentPage(1);
                }}
                className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#5937E0] hover:shadow-md transition-all cursor-pointer h-24"
              >
                <div className="relative w-16 h-8 flex items-center justify-center">
                  <Image
                    src={brand.src}
                    alt={brand.alt}
                    fill
                    unoptimized
                    className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                  />
                </div>
                <span className="text-[11px] font-bold text-[#6C757D] group-hover:text-[#5937E0] transition-colors mt-2">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
