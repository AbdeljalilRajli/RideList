"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { CarProps, CarUnit } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCasablancaToday, isManualBlock } from "@/lib/utils";

export interface AdminBooking {
  id: string;
  reference_code: string;
  car_id: string;
  unit_id?: string | null;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_country: string | null;
  pickup_date: string;
  pickup_time: string;
  return_date: string;
  return_time: string;
  pickup_place: string;
  return_place: string;
  pickup_address: string | null;
  return_address: string | null;
  extras: any[];
  delivery_fee: number;
  total_price: number;
  deposit_amount: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  notes: string | null;
  created_at: string;
  cars?: {
    make: string;
    model: string;
    year: number;
    images?: string[];
  } | null;
  car_units?: {
    id: string;
    plate_number: string;
    color?: string;
    status: string;
  } | null;
}

export interface AdminBookingsStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  blocks: number;
}

export interface AdminCarsStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  hidden: number;
}

export function useAdminData(enabled: boolean = true) {
  const [cars, setCars] = useState<CarProps[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Keep a ref to cars and bookings for realtime event handlers to avoid stale closures
  const carsRef = useRef<CarProps[]>([]);
  const bookingsRef = useRef<AdminBooking[]>([]);
  carsRef.current = cars;
  bookingsRef.current = bookings;

  // 1. Initial full fetch
  const fetchData = useCallback(
    async (isBackground: boolean = false) => {
      if (!enabled) return;
      if (!isBackground) setLoading(true);
      else setIsRefreshing(true);

      try {
        const [carsRes, bookingsRes] = await Promise.all([
          supabase
            .from("cars")
            .select(
              `
              *,
              units:car_units (*)
            `
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("bookings")
            .select(
              `
              *,
              cars:car_id (
                make,
                model,
                year,
                images
              ),
              car_units:unit_id (
                id,
                plate_number,
                color,
                status
              )
            `
            )
            .order("created_at", { ascending: false }),
        ]);

        if (carsRes.error) {
          console.error("Error fetching cars:", carsRes.error);
        } else if (carsRes.data) {
          setCars(carsRes.data as CarProps[]);
        }

        if (bookingsRes.error) {
          console.error("Error fetching bookings:", bookingsRes.error);
        } else if (bookingsRes.data) {
          setBookings(bookingsRes.data as AdminBooking[]);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error("useAdminData fetch error:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [enabled]
  );

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchData(false);
    }
  }, [enabled, fetchData]);

  // 2. Realtime Subscriptions on 'bookings' and 'cars'
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("admin-realtime-sync")
      // Listen to all changes on public.bookings
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as AdminBooking;
            // Fetch joined car relation for the new booking
            const { data: fullBooking } = await supabase
              .from("bookings")
              .select(
                `
                *,
                cars:car_id (
                  make,
                  model,
                  year,
                  images
                ),
                car_units:unit_id (
                  id,
                  plate_number,
                  color,
                  status
                )
              `
              )
              .eq("id", newRow.id)
              .maybeSingle();

            if (fullBooking) {
              setBookings((prev) => {
                if (prev.some((b) => b.id === fullBooking.id)) return prev;
                return [fullBooking as AdminBooking, ...prev];
              });
            } else {
              setBookings((prev) => {
                if (prev.some((b) => b.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as AdminBooking;
            setBookings((prev) =>
              prev.map((b) => {
                if (b.id === updatedRow.id) {
                  return {
                    ...b,
                    ...updatedRow,
                    // Preserve joined car relation if not present in raw payload
                    cars: updatedRow.cars || b.cars,
                  };
                }
                return b;
              })
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setBookings((prev) => prev.filter((b) => b.id !== deletedId));
          }

          setLastUpdated(new Date());
        }
      )
      // Listen to all changes on public.cars
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cars" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newCar = payload.new as CarProps;
            setCars((prev) => {
              if (prev.some((c) => c.id === newCar.id)) return prev;
              return [newCar, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedCar = payload.new as CarProps;
            setCars((prev) =>
              prev.map((c) => (c.id === updatedCar.id ? { ...c, ...updatedCar } : c))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setCars((prev) => prev.filter((c) => c.id !== deletedId));
          }

          setLastUpdated(new Date());
        }
      )
      // Listen to all changes on public.car_units
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "car_units" },
        () => {
          fetchData(true);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          // Connected cleanly
        }
      });

    // 3. Window focus, visibility, online reconnection listeners
    const handleRevalidate = () => {
      fetchData(true);
    };

    window.addEventListener("focus", handleRevalidate);
    window.addEventListener("online", handleRevalidate);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleRevalidate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 4. Fallback polling every 45s in case realtime connection drops
    const pollInterval = setInterval(() => {
      fetchData(true);
    }, 45000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleRevalidate);
      window.removeEventListener("online", handleRevalidate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, [enabled, fetchData]);

  // 5. Unfiltered Stats Calculation (always from full unfiltered arrays)
  // Manual blocks must not count in the reservation stats (total, pending, confirmed, completed)
  const bookingsStats: AdminBookingsStats = useMemo(() => {
    const reservations = bookings.filter((b) => !isManualBlock(b));
    const blocksCount = bookings.filter((b) => isManualBlock(b)).length;
    return {
      total: reservations.length,
      pending: reservations.filter((b) => b.status === "pending").length,
      confirmed: reservations.filter((b) => b.status === "confirmed").length,
      completed: reservations.filter((b) => b.status === "completed").length,
      cancelled: reservations.filter((b) => b.status === "cancelled").length,
      rejected: reservations.filter((b) => b.status === "rejected").length,
      blocks: blocksCount,
    };
  }, [bookings]);

  // Active rentals today (Africa/Casablanca time) computed from confirmed bookings
  const rentedNowMap: Record<string, string> = useMemo(() => {
    const today = getCasablancaToday();
    const map: Record<string, string> = {};
    bookings.forEach((b) => {
      if (
        b.status === "confirmed" &&
        b.pickup_date <= today &&
        b.return_date >= today
      ) {
        if (!map[b.car_id] || b.return_date > map[b.car_id]) {
          map[b.car_id] = b.return_date;
        }
      }
    });
    return map;
  }, [bookings]);

  // Enrich cars with unit availability counts computed from live bookings and car_units
  // Availability Rule: Supply = available units only; Demand = ALL confirmed bookings for this car
  const enrichedCars: CarProps[] = useMemo(() => {
    const today = getCasablancaToday();
    return cars.map((car) => {
      const units = car.units || [];
      const totalCount = units.length;

      // Demand today = all active confirmed bookings for this car model covering today
      const demandToday = bookings.filter(
        (b) =>
          b.car_id === car.id &&
          b.status === "confirmed" &&
          b.pickup_date <= today &&
          b.return_date >= today
      ).length;

      if (totalCount === 0) {
        const supply = 1;
        const availableNow = Math.max(0, supply - demandToday);
        return {
          ...car,
          total_units_count: 1,
          available_units_count: car.status === "available" ? availableNow : 0,
        };
      }

      // Supply = count of units with status 'available'
      const supply = units.filter((u) => u.status === "available").length;
      const availableNow = Math.max(0, supply - demandToday);

      return {
        ...car,
        total_units_count: totalCount,
        available_units_count: car.status === "available" ? availableNow : 0,
      };
    });
  }, [cars, bookings]);

  const carsStats: AdminCarsStats = useMemo(() => {
    const rentedCount = enrichedCars.filter(
      (c) => (c.available_units_count ?? 1) === 0 && c.status === "available"
    ).length;
    return {
      total: enrichedCars.length,
      available: enrichedCars.filter(
        (c) => (c.available_units_count ?? 1) > 0 && c.status === "available"
      ).length,
      rented: rentedCount,
      maintenance: enrichedCars.filter((c) => c.status === "maintenance").length,
      hidden: enrichedCars.filter((c) => c.status === "hidden").length,
    };
  }, [enrichedCars]);

  // 6. Optimistic Action: Update Booking Status with rollback
  const updateBookingStatus = async (
    booking: AdminBooking,
    newStatus: "confirmed" | "rejected" | "completed" | "cancelled"
  ) => {
    const originalBookings = [...bookings];
    setActionLoadingId(booking.id);

    // Optimistically update local state immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b))
    );

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", booking.id);

      if (error) {
        if (
          error.code === "23P01" ||
          error.message?.includes("no_overlapping_confirmed_bookings")
        ) {
          throw new Error(
            `Cannot confirm booking ${booking.reference_code}: This vehicle already has another confirmed booking overlapping with ${booking.pickup_date} to ${booking.return_date}.`
          );
        }
        throw new Error(error.message);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      // Rollback to original state on failure
      setBookings(originalBookings);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  // 7. Optimistic Action: Update Car Status with rollback
  const updateCarStatus = async (
    carId: string,
    newStatus: "available" | "rented" | "maintenance" | "hidden"
  ) => {
    const originalCars = [...cars];
    setActionLoadingId(carId);

    // Optimistically update local state
    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, status: newStatus } : c))
    );

    try {
      const { error } = await supabase
        .from("cars")
        .update({ status: newStatus })
        .eq("id", carId);

      if (error) {
        throw new Error(error.message);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setCars(originalCars);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  // 8. Car mutations handler
  const saveCar = (savedCar: CarProps, isNew: boolean) => {
    if (isNew) {
      setCars((prev) => [savedCar, ...prev.filter((c) => c.id !== savedCar.id)]);
    } else {
      setCars((prev) =>
        prev.map((c) => (c.id === savedCar.id ? { ...c, ...savedCar } : c))
      );
    }
    setLastUpdated(new Date());
  };

  const deleteCar = async (carId: string) => {
    const originalCars = [...cars];
    setCars((prev) => prev.filter((c) => c.id !== carId));

    try {
      const { error } = await supabase.from("cars").delete().eq("id", carId);
      if (error) throw new Error(error.message);
      setLastUpdated(new Date());
    } catch (err: any) {
      setCars(originalCars);
      throw err;
    }
  };

  const deleteBooking = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const isManualBlock =
      booking.customer_name === "Manual Block" ||
      booking.reference_code?.startsWith("BLK-") ||
      booking.customer_phone === "Walk-in / Phone";

    // Active customer bookings must be cancelled/rejected first. Manual blocks can be removed directly.
    if (!isManualBlock && (booking.status === "pending" || booking.status === "confirmed")) {
      throw new Error(
        `Cannot delete reservation ${booking.reference_code}: Active bookings (Pending or Confirmed) must be cancelled or rejected first.`
      );
    }

    const originalBookings = [...bookings];
    setActionLoadingId(bookingId);

    // Optimistically update local state immediately
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));

    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", bookingId);

      if (error) {
        throw new Error(error.message);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      // Rollback to original state on failure
      setBookings(originalBookings);
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const blockCarDates = async (
    carId: string,
    pickupDate: string,
    returnDate: string,
    notes?: string,
    amount?: number,
    unitId?: string
  ) => {
    if (!pickupDate || !returnDate) {
      throw new Error("Pickup date and return date are required.");
    }
    if (returnDate < pickupDate) {
      throw new Error("Return date must be equal to or after pickup date.");
    }

    const { data, error } = await supabase.rpc("block_car_dates", {
      p_car_id: carId,
      p_pickup_date: pickupDate,
      p_return_date: returnDate,
      p_notes: notes?.trim() || null,
      p_amount_received: amount || 0,
      p_unit_id: unitId || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    // If an optional amount received was entered, update total_price on the created booking record
    const createdBookingId =
      (Array.isArray(data) && data[0]?.booking_id) || (data as any)?.booking_id;
    if (createdBookingId && amount !== undefined && amount > 0) {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ total_price: amount })
        .eq("id", createdBookingId);

      if (updateError) {
        console.error("Failed to update amount received for block:", updateError);
      }
    }

    await fetchData(true);
    return data;
  };

  // Unit Management Actions
  const addCarUnit = async (
    carId: string,
    unitData: {
      plate_number: string;
      color?: string;
      status?: "available" | "maintenance";
      notes?: string;
    }
  ) => {
    const { data, error } = await supabase
      .from("car_units")
      .insert({
        car_id: carId,
        plate_number: unitData.plate_number.trim().toUpperCase(),
        color: unitData.color?.trim() || "Standard",
        status: unitData.status || "available",
        notes: unitData.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505" || error.message?.includes("unique")) {
        throw new Error(
          `A vehicle unit with plate "${unitData.plate_number.trim().toUpperCase()}" already exists. Plates must be globally unique.`
        );
      }
      throw new Error(error.message || "Failed to add vehicle unit.");
    }

    await fetchData(true);
    return data;
  };

  const updateCarUnit = async (
    unitId: string,
    updates: Partial<CarUnit>
  ) => {
    const { data, error } = await supabase
      .from("car_units")
      .update(updates)
      .eq("id", unitId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505" || error.message?.includes("unique")) {
        throw new Error("This license plate is already assigned to another unit.");
      }
      throw new Error(error.message || "Failed to update vehicle unit.");
    }

    await fetchData(true);
    return data;
  };

  const deleteCarUnit = async (unitId: string) => {
    const { error } = await supabase
      .from("car_units")
      .delete()
      .eq("id", unitId);

    if (error) {
      if (error.message?.includes("reservations") || error.message?.includes("maintenance")) {
        throw new Error(error.message);
      }
      throw new Error(error.message || "Failed to delete vehicle unit.");
    }

    await fetchData(true);
  };

  const bulkAddCarUnits = async (
    carId: string,
    plates: string[],
    color: string = "Standard"
  ) => {
    if (!plates || plates.length === 0) return;
    const cleanPlates = Array.from(
      new Set(plates.map((p) => p.trim().toUpperCase()).filter(Boolean))
    );
    if (cleanPlates.length === 0) return;

    const rows = cleanPlates.map((plate) => ({
      car_id: carId,
      plate_number: plate,
      color: color || "Standard",
      status: "available" as const,
      notes: "Bulk added unit",
    }));

    const { data, error } = await supabase
      .from("car_units")
      .insert(rows)
      .select();

    if (error) {
      if (error.code === "23505" || error.message?.includes("unique")) {
        throw new Error(
          "One or more license plates already exist. Plates must be unique."
        );
      }
      throw new Error(error.message || "Failed to bulk add vehicle units.");
    }

    await fetchData(true);
    return data;
  };

  const confirmBookingWithUnit = async (
    bookingId: string,
    unitId?: string
  ) => {
    setActionLoadingId(bookingId);
    try {
      const { data, error } = await supabase.rpc("confirm_booking", {
        p_booking_id: bookingId,
        p_unit_id: unitId || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      await fetchData(true);
      return data;
    } finally {
      setActionLoadingId(null);
    }
  };

  const changeBookingUnit = async (
    bookingId: string,
    newUnitId: string
  ) => {
    setActionLoadingId(bookingId);
    try {
      const { data, error } = await supabase.rpc("change_booking_unit", {
        p_booking_id: bookingId,
        p_new_unit_id: newUnitId,
      });

      if (error) {
        throw new Error(error.message);
      }

      await fetchData(true);
      return data;
    } finally {
      setActionLoadingId(null);
    }
  };

  return {
    cars: enrichedCars,
    bookings,
    rentedNowMap,
    loading,
    isRefreshing,
    lastUpdated,
    actionLoadingId,
    bookingsStats,
    carsStats,
    refresh: () => fetchData(true),
    updateBookingStatus,
    updateCarStatus,
    saveCar,
    deleteCar,
    deleteBooking,
    blockCarDates,
    addCarUnit,
    updateCarUnit,
    deleteCarUnit,
    bulkAddCarUnits,
    confirmBookingWithUnit,
    changeBookingUnit,
  };
}
