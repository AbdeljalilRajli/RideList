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

interface ChangeUnitModalProps {
  isOpen: boolean;
  booking: AdminBooking | null;
  onClose: () => void;
  onChangeUnit: (bookingId: string, newUnitId: string) => Promise<void>;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function ChangeUnitModal({
  isOpen,
  booking,
  onClose,
  onChangeUnit,
  onToast,
}: ChangeUnitModalProps) {
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
          p_exclude_booking_id: booking!.id,
        });

        if (error) throw error;

        if (!isCancelled && data) {
          const list = data as AvailableUnit[];
          setUnits(list);
          // Pre-select current unit or first free alternate unit
          const currentUnit = list.find((u) => u.id === booking?.unit_id);
          const firstAlternateFree = list.find((u) => u.is_free && u.id !== booking?.unit_id);
          if (firstAlternateFree) {
            setSelectedUnitId(firstAlternateFree.id);
          } else if (currentUnit) {
            setSelectedUnitId(currentUnit.id);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to load units for reassignment:", err);
          setErrorMsg(err.message || "Could not load units.");
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

  const currentUnitPlate = booking.car_units?.plate_number || "None";
  const alternateFreeUnits = units.filter((u) => u.is_free && u.id !== booking.unit_id);

  const handleSubmit = async () => {
    if (!selectedUnitId) {
      setErrorMsg("Please select a unit to reassign.");
      return;
    }
    if (selectedUnitId === booking.unit_id) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onChangeUnit(booking.id, selectedUnitId);
      const assigned = units.find((u) => u.id === selectedUnitId);
      onToast?.(
        `Unit reassigned to ${assigned?.plate_number || "new unit"} for booking ${booking.reference_code}.`,
        "success"
      );
      onClose();
    } catch (err: any) {
      console.error("Change unit error:", err);
      setErrorMsg(err.message || "Failed to change vehicle unit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-unit-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-2">
            ● Reassign Vehicle Unit
          </span>
          <h3 id="change-unit-title" className="text-lg font-black text-black">
            Change Unit for {booking.reference_code}
          </h3>
          <p className="text-xs text-[#6C757D] mt-0.5">
            {booking.cars?.make} {booking.cars?.model} • {booking.pickup_date} to {booking.return_date}
          </p>
        </div>

        {/* Current Unit Badge */}
        <div className="bg-[#F8F8FB] rounded-2xl p-4 border border-[#E5E7EB] space-y-1.5 text-xs">
          <span className="text-[#6C757D] block">Currently Assigned Unit:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB] text-black">
              🚘 {currentUnitPlate}
            </span>
            {booking.car_units?.color && (
              <span className="text-[#6C757D]">({booking.car_units.color})</span>
            )}
          </div>
          <p className="text-[11px] text-[#6C757D] pt-1">
            Reassigning a unit is helpful in case of vehicle breakdown, maintenance, or client preferences.
          </p>
        </div>

        {/* Reassignment Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-black">
            Select Replacement Unit
          </label>

          {loadingUnits ? (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-[#6C757D]">
              <div className="w-3.5 h-3.5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
              <span>Checking free units for these dates...</span>
            </div>
          ) : units.length <= 1 ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              This vehicle model has only 1 registered unit. Add more units in Fleet Management to allow replacements.
            </div>
          ) : alternateFreeUnits.length === 0 ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              No alternate units are free for these dates ({booking.pickup_date} to {booking.return_date}). Other units are currently booked or under maintenance.
            </div>
          ) : (
            <div className="space-y-1.5">
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0] cursor-pointer"
              >
                {units.map((u) => {
                  const isCurrent = u.id === booking.unit_id;
                  return (
                    <option key={u.id} value={u.id} disabled={!u.is_free && !isCurrent}>
                      {u.plate_number} — {u.color || "Standard"} {isCurrent ? "(Currently Assigned)" : u.is_free ? "(Free)" : "(Occupied)"}
                    </option>
                  );
                })}
              </select>
              <p className="text-[11px] text-[#6C757D]">
                Only units free between {booking.pickup_date} and {booking.return_date} can be selected.
              </p>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
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
            onClick={handleSubmit}
            disabled={isSubmitting || loadingUnits || selectedUnitId === booking.unit_id || !units.find((u) => u.id === selectedUnitId)?.is_free}
            className="px-5 py-2.5 rounded-xl bg-[#5937E0] hover:bg-[#4d2ed1] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </>
            ) : (
              <span>Save Replacement</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
