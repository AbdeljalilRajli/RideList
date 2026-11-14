"use client";

import React, { useState } from "react";
import { CarProps } from "@/types";
import { getCasablancaToday } from "@/lib/utils";

interface BlockDatesModalProps {
  car: CarProps | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockDates: (
    carId: string,
    pickupDate: string,
    returnDate: string,
    notes?: string
  ) => Promise<any>;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function BlockDatesModal({
  car,
  isOpen,
  onClose,
  onBlockDates,
  onToast,
}: BlockDatesModalProps) {
  const today = getCasablancaToday();
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !car) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupDate || !returnDate) {
      setError("Please specify both pickup and return dates.");
      return;
    }

    if (returnDate < pickupDate) {
      setError("Return date must be on or after pickup date.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!car.id) throw new Error("Car ID is missing.");
      await onBlockDates(car.id, pickupDate, returnDate, notes);
      onToast?.(
        `Dates blocked for ${car.make} ${car.model} (${pickupDate} to ${returnDate}).`,
        "success"
      );
      onClose();
    } catch (err: any) {
      console.error("Block dates error:", err);
      setError(err.message || "Failed to block dates.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-purple-50 text-[#5937E0] flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-black font-['Work_Sans',sans-serif]">
                Block Vehicle Dates
              </h3>
              <p className="text-xs text-[#6C757D]">
                For walk-in or phone reservations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Vehicle Badge */}
        <div className="p-3.5 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider block">
              Target Vehicle
            </span>
            <strong className="text-sm text-black font-bold">
              {car.make} {car.model} ({car.year})
            </strong>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            {car.price_per_day} DH/day
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Start Date (Pickup)
              </label>
              <input
                type="date"
                required
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                End Date (Return)
              </label>
              <input
                type="date"
                required
                min={pickupDate || today}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Optional Note
            </label>
            <input
              type="text"
              placeholder="e.g. Phone rental - Ahmed (06XXXXXXXX)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-black placeholder:text-[#6C757D] focus:outline-none focus:border-[#5937E0]"
            />
          </div>

          <p className="text-[11px] text-[#6C757D] leading-relaxed">
            This will create a confirmed block in the reservations list. Any customer booking overlapping with these dates will be automatically rejected. You can remove this block anytime.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-[#F8F8FB] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Blocking...</span>
                </>
              ) : (
                <span>Confirm Block</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
