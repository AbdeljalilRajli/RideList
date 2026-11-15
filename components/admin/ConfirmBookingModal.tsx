"use client";

import { useState, useEffect } from "react";
import { AdminBooking } from "@/hooks/useAdminData";
import { supabase } from "@/lib/supabase";

interface AvailableUnit {
  id: string;
  car_id: string;
  plate_number: string;
  color: string;
  status: string;
  notes: string | null;
  is_free: boolean;
}

interface ConfirmBookingModalProps {
  isOpen: boolean;
  booking: AdminBooking | null;
  onClose: () => void;
  onConfirm: (bookingId: string, unitId?: string) => Promise<void>;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function ConfirmBookingModal({
  isOpen,
  booking,
  onClose,
  onConfirm,
  onToast,
}: ConfirmBookingModalProps) {
  const [units, setUnits] = useState<AvailableUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !booking) {
      setUnits([]);
      setSelectedUnitId("");
      setErrorMsg(null);
      return;
    }

    let isCancelled = false;
    async function loadUnits() {
      setLoadingUnits(true);
      setErrorMsg(null);
      try {
        const { data, error } = await supabase.rpc("get_available_units", {
          p_car_id: booking!.car_id,
          p_pickup_date: booking!.pickup_date,
          p_return_date: booking!.return_date,
        });

        if (error) throw error;

        if (!isCancelled && data) {
          const list = data as AvailableUnit[];
          setUnits(list);
          // Pre-select the first available free unit
          const firstFree = list.find((u) => u.is_free);
          if (firstFree) {
            setSelectedUnitId(firstFree.id);
          } else {
            setSelectedUnitId("");
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to load available units:", err);
          setErrorMsg(err.message || "Could not load units for this vehicle.");
        }
      } finally {
        if (!isCancelled) setLoadingUnits(false);
      }
    }

    loadUnits();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const freeUnits = units.filter((u) => u.is_free);
  const hasFreeUnits = freeUnits.length > 0;

  const handleConfirm = async () => {
    if (!selectedUnitId && hasFreeUnits) {
      setErrorMsg("Please select a physical unit to assign.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onConfirm(booking.id, selectedUnitId || undefined);
      onToast?.(`Reservation ${booking.reference_code} confirmed successfully.`, "success");
      onClose();
    } catch (err: any) {
      console.error("Confirm error:", err);
      setErrorMsg(err.message || "Failed to confirm reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
            ● Confirm Reservation
          </span>
          <h3 id="confirm-modal-title" className="text-lg font-black text-black">
            Confirm {booking.cars?.make} {booking.cars?.model}
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            Ref: <span className="font-mono font-bold text-black">{booking.reference_code}</span> • {booking.pickup_date} to {booking.return_date}
          </p>
        </div>

        {/* Customer & Booking Summary */}
        <div className="bg-[#F8F8FB] rounded-2xl p-4 border border-[#E5E7EB] space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#6C757D]">Customer</span>
            <span className="font-bold text-black">{booking.customer_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6C757D]">WhatsApp</span>
            <span className="font-bold text-black">{booking.customer_phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6C757D]">Total Price</span>
            <span className="font-extrabold text-[#5937E0]">{booking.total_price} DH</span>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-black">
            Assign Vehicle Unit (Plate Number)
          </label>

          {loadingUnits ? (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-[#6C757D]">
              <div className="w-3.5 h-3.5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
              <span>Checking available units for these dates...</span>
            </div>
          ) : units.length === 0 ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              No units registered for this vehicle model yet. Please add a unit in Fleet Management first.
            </div>
          ) : !hasFreeUnits ? (
            <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 space-y-1">
              <p className="font-bold">No units available for these dates.</p>
              <p className="text-[11px] text-red-700">
                All {units.length} registered unit(s) are either booked or in maintenance between {booking.pickup_date} and {booking.return_date}.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0] cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id} disabled={!u.is_free}>
                    {u.plate_number} — {u.color || "Standard"} {u.is_free ? "(Free)" : "(Occupied / Maintenance)"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#6C757D]">
                First free available unit is pre-selected for 1-click confirmation.
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-bold text-black hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || loadingUnits || !hasFreeUnits}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Confirming...</span>
              </>
            ) : (
              <span>Confirm Reservation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
