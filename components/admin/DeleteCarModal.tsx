"use client";

import { useState } from "react";
import Image from "next/image";
import { CarProps } from "@/types";
import { deleteCarImages } from "@/lib/carStorage";
import { supabase } from "@/lib/supabase";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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
    <ConfirmDialog
      isOpen={isOpen && Boolean(car)}
      title="Delete Vehicle?"
      description={`Are you sure you want to delete ${car.make} ${car.model} (${car.year})? This will permanently remove the vehicle from the database and delete all its photos from storage.`}
      confirmLabel="Confirm Delete"
      cancelLabel="Cancel"
      confirmVariant="danger"
      isLoading={isDeleting}
      loadingLabel="Deleting..."
      onConfirm={handleDelete}
      onClose={onClose}
    >
      {/* Car Mini Preview */}
      <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB] my-2">
        <div className="relative w-16 h-12 rounded-xl bg-white overflow-hidden shrink-0">
          <Image
            src={mainImage}
            alt={`${car.make} ${car.model}`}
            fill
            unoptimized
            className="object-contain p-1"
          />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h4 className="text-sm font-bold text-black truncate">
            {car.make} {car.model}
          </h4>
          <p className="text-xs text-[#6C757D]">
            {car.price_per_day} DH/day • {car.year}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold text-center">
          {errorMsg}
        </div>
      )}
    </ConfirmDialog>
  );
}
