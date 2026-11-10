"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export interface CustomerBooking {
  id: string;
  reference_code: string;
  car_id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_country?: string | null;
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
  created_at: string;
  notes?: string | null;
  cars?: {
    make: string;
    model: string;
    year: number;
    images?: string[];
  } | null;
}

export interface CustomerBookingsStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
}

export function useCustomerBookings(user: User | null) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const bookingsRef = useRef<CustomerBooking[]>([]);
  bookingsRef.current = bookings;

  // 1. Fetch customer bookings
  const fetchCustomerBookings = useCallback(
    async (isBackground: boolean = false) => {
      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      if (!isBackground) setLoading(true);
      else setIsRefreshing(true);

      try {
        // Link any unlinked past guest bookings matching customer's confirmed email
        if (user.email_confirmed_at) {
          try {
            await supabase.rpc("link_guest_bookings");
          } catch (e) {
            // Non-blocking if function already ran
          }
        }

        const { data, error } = await supabase
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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setBookings((data as any[]) || []);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error loading customer bookings:", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [user]
  );

  // Initial load on mount or user change
  useEffect(() => {
    fetchCustomerBookings(false);
  }, [fetchCustomerBookings]);

  // 2. Realtime Subscription on customer's own bookings
  useEffect(() => {
    if (!user) return;

    // Listen only to changes for this specific customer
    const channel = supabase
      .channel(`customer-bookings-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as CustomerBooking;
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
                return [fullBooking as CustomerBooking, ...prev];
              });
            } else {
              setBookings((prev) => {
                if (prev.some((b) => b.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRow = payload.new as CustomerBooking;
            setBookings((prev) =>
              prev.map((b) => {
                if (b.id === updatedRow.id) {
                  return {
                    ...b,
                    ...updatedRow,
                    // Preserve joined car details
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
      .subscribe();

    // 3. Window focus, visibility, online listeners
    const handleRevalidate = () => {
      fetchCustomerBookings(true);
    };

    window.addEventListener("focus", handleRevalidate);
    window.addEventListener("online", handleRevalidate);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleRevalidate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 4. Fallback polling every 45s
    const pollInterval = setInterval(() => {
      fetchCustomerBookings(true);
    }, 45000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleRevalidate);
      window.removeEventListener("online", handleRevalidate);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(pollInterval);
    };
  }, [user, fetchCustomerBookings]);

  // 5. Unfiltered Stats Calculation
  const stats: CustomerBookingsStats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
    };
  }, [bookings]);

  // 6. Optimistic cancellation
  const cancelBooking = async (bookingId: string) => {
    const originalBookings = [...bookings];
    setCancellingId(bookingId);

    // Optimistically cancel in memory
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
    );

    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId)
        .eq("status", "pending");

      if (error) {
        throw new Error(error.message);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      // Rollback on failure
      setBookings(originalBookings);
      throw err;
    } finally {
      setCancellingId(null);
    }
  };

  return {
    bookings,
    loading,
    isRefreshing,
    lastUpdated,
    cancellingId,
    stats,
    refresh: () => fetchCustomerBookings(true),
    cancelBooking,
  };
}
