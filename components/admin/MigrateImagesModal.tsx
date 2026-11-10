"use client";

import { useState } from "react";
import { CarProps } from "@/types";
import { migrateLocalImageToSupabase } from "@/lib/carStorage";
import { supabase } from "@/lib/supabase";

interface MigrateImagesModalProps {
  isOpen: boolean;
  cars: CarProps[];
  onClose: () => void;
  onCompleted: () => void;
}

export default function MigrateImagesModal({
  isOpen,
  cars,
  onClose,
  onCompleted,
}: MigrateImagesModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentCarName, setCurrentCarName] = useState("");
  const [progressIndex, setProgressIndex] = useState(0);
  const [totalCarsToMigrate, setTotalCarsToMigrate] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  // Identify cars that still use local paths
  const localCars = cars.filter((c) => {
    const mainImg = (Array.isArray(c.images) && c.images[0]) || c.image || "";
    return mainImg.startsWith("/") && !mainImg.startsWith("http");
  });

  const handleStartMigration = async () => {
    setIsRunning(true);
    setErrorMessage(null);
    setIsDone(false);
    setTotalCarsToMigrate(localCars.length);
    setProgressIndex(0);

    try {
      for (let i = 0; i < localCars.length; i++) {
        const car = localCars[i];
        setCurrentCarName(`${car.make} ${car.model}`);
        setProgressIndex(i + 1);

        const currentImages = Array.isArray(car.images) && car.images.length > 0
          ? car.images
          : car.image
          ? [car.image]
          : [];

        const updatedUrls: string[] = [];

        for (const imgPath of currentImages) {
          if (imgPath.startsWith("http")) {
            // Already a remote URL
            updatedUrls.push(imgPath);
          } else {
            // Upload local asset to Supabase Storage
            const publicUrl = await migrateLocalImageToSupabase(imgPath);
            updatedUrls.push(publicUrl);
          }
        }

        // Update database row in public.cars
        if (car.id) {
          const { error } = await supabase
            .from("cars")
            .update({ images: updatedUrls })
            .eq("id", car.id);

          if (error) {
            console.error(`Failed to update DB for ${car.make} ${car.model}:`, error);
          }
        }
      }

      setIsDone(true);
      onCompleted();
    } catch (err: any) {
      console.error("Migration error:", err);
      setErrorMessage(err.message || "Failed during image migration.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[28px] border border-[#E5E7EB] shadow-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#EEEDF9] text-[#5937E0] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black font-['Work_Sans',sans-serif]">
              Migrate Fleet Images to Supabase Storage
            </h3>
            <p className="text-xs text-[#6C757D]">
              Upload all local car photos to the <code className="bg-[#F8F8FB] px-1.5 py-0.5 rounded text-[#5937E0]">car-images</code> bucket.
            </p>
          </div>
        </div>

        <div className="bg-[#F8F8FB] border border-[#E5E7EB] rounded-2xl p-4 mb-6 text-xs text-[#0F0F1A] space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#6C757D]">Cars with local images:</span>
            <span className="font-bold text-black">{localCars.length} vehicles</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#6C757D]">Target bucket:</span>
            <span className="font-bold text-[#5937E0]">car-images (public)</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {isRunning && (
          <div className="mb-6 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-black">Uploading: {currentCarName}</span>
              <span className="text-[#5937E0]">{progressIndex} / {totalCarsToMigrate}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full bg-[#5937E0] transition-all duration-300"
                style={{
                  width: totalCarsToMigrate > 0 ? `${(progressIndex / totalCarsToMigrate) * 100}%` : "0%",
                }}
              ></div>
            </div>
          </div>
        )}

        {isDone && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>All 26 fleet car images were successfully uploaded to Supabase Storage!</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isRunning}
            className="px-6 py-2.5 rounded-full border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-[#F8F8FB] transition-colors cursor-pointer"
          >
            {isDone ? "Close" : "Cancel"}
          </button>

          {!isDone && (
            <button
              type="button"
              onClick={handleStartMigration}
              disabled={isRunning || localCars.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Migrating Photos...</span>
                </>
              ) : (
                <span>Start Migration ({localCars.length})</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
