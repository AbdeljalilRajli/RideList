"use client";

import { useState } from "react";
import Image from "next/image";
import { CarProps } from "@/types";
import { deleteCarImages } from "@/lib/carStorage";
import { supabase } from "@/lib/supabase";

interface DeleteCarModalProps {
  isOpen: boolean;
  car: CarProps | null;
  onClose: () => void;
  onDeleted: (carId: string) => void;
}

export default function DeleteCarModal({
  isOpen,
  car,
  onClose,
  onDeleted,
}: DeleteCarModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !car) return null;

  const mainImage =
    (Array.isArray(car.images) && car.images[0]) || car.image || "/logo-icon.png";

  const handleDelete = async () => {
    if (!car.id) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      // 1. Delete all images stored in Supabase Storage for this car
      const imagesToDelete = Array.isArray(car.images) ? car.images : car.image ? [car.image] : [];
      await deleteCarImages(imagesToDelete);

      // 2. Delete car row from Supabase 'cars' table
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", car.id);

      if (error) {
        throw new Error(error.message || "Failed to delete car from database.");
      }

      onDeleted(car.id);
      onClose();
    } catch (err: any) {
      console.error("Delete car error:", err);
      setErrorMsg(err.message || "An unexpected error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[24px] border border-[#E5E7EB] shadow-2xl p-6 sm:p-8">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-center text-black font-['Work_Sans',sans-serif] mb-2">
          Delete Vehicle?
        </h3>

        <p className="text-xs text-[#6C757D] text-center mb-6 leading-relaxed">
          Are you sure you want to delete <strong className="text-black">{car.make} {car.model} ({car.year})</strong>? This will permanently remove the vehicle from the database and delete all its photos from storage.
        </p>

        {/* Car Mini Preview */}
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] mb-6">
          <div className="relative w-16 h-12 rounded-xl bg-white overflow-hidden shrink-0">
            <Image
              src={mainImage}
              alt={`${car.make} ${car.model}`}
              fill
              unoptimized
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-black truncate">{car.make} {car.model}</h4>
            <p className="text-xs text-[#6C757D]">{car.price_per_day} DH/day • {car.year}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-[#F8F8FB] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
