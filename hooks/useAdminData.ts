"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { CarProps } from "@/types";
import { supabase } from "@/lib/supabase";

export interface AdminBooking {
  id: string;
  reference_code: string;
  car_id: string;
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
}

export interface AdminBookingsStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
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
            .select("*")
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
  const bookingsStats: AdminBookingsStats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
    };
  }, [bookings]);

  const carsStats: AdminCarsStats = useMemo(() => {
    return {
      total: cars.length,
      available: cars.filter((c) => c.status === "available").length,
      rented: cars.filter((c) => c.status === "rented").length,
      maintenance: cars.filter((c) => c.status === "maintenance").length,
      hidden: cars.filter((c) => c.status === "hidden").length,
    };
  }, [cars]);

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

    if (booking.status === "pending" || booking.status === "confirmed") {
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

  return {
    cars,
    bookings,
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
  };
}
