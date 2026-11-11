"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CarProps, BodyType, CarSegment } from "@/types";
import { compressAndResizeImage, formatBytes } from "@/lib/imageCompression";
import { uploadCarImage, deleteCarImages } from "@/lib/carStorage";
import { supabase } from "@/lib/supabase";
import { BODY_TYPES, CAR_SEGMENTS, formatBodyType, formatSegment } from "@/lib/carTaxonomy";

interface CarFormModalProps {
  isOpen: boolean;
  carToEdit?: CarProps | null;
  onClose: () => void;
  onSaved: (savedCar: CarProps, isNew: boolean) => void;
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isExisting: boolean;
  compressionInfo?: string;
}

export default function CarFormModal({
  isOpen,
  carToEdit,
  onClose,
  onSaved,
}: CarFormModalProps) {
  const isEditing = Boolean(carToEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2024);
  const [bodyType, setBodyType] = useState<BodyType>("sedan");
  const [segment, setSegment] = useState<CarSegment>("midsize");
  const [carClass, setCarClass] = useState("compact car");
  const [seats, setSeats] = useState<number>(5);
  const [color, setColor] = useState("Black");
  const [fuelType, setFuelType] = useState("gas");
  const [transmission, setTransmission] = useState("a");
  const [pricePerDay, setPricePerDay] = useState<number>(500);
  const [depositAmount, setDepositAmount] = useState<number>(3000);
  const [kmPolicy, setKmPolicy] = useState("Unlimited");
  const [status, setStatus] = useState<"available" | "rented" | "maintenance" | "hidden">("available");

  // Technical Specs
  const [drive, setDrive] = useState("fwd");
  const [cityMpg, setCityMpg] = useState<number>(30);
  const [highwayMpg, setHighwayMpg] = useState<number>(38);
  const [combinationMpg, setCombinationMpg] = useState<number>(34);
  const [cylinders, setCylinders] = useState<number>(4);
  const [displacement, setDisplacement] = useState<number>(2.0);

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);
  const [deletedExistingUrls, setDeletedExistingUrls] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setDeletedExistingUrls([]);

      if (carToEdit) {
        setMake(carToEdit.make || "");
        setModel(carToEdit.model || "");
        setYear(carToEdit.year || 2024);
        setCarClass(carToEdit.class || "compact car");

        // Body type fallback
        const rawBody = (carToEdit.body_type || "").toLowerCase().trim();
        const validBody = BODY_TYPES.some((b) => b.value === rawBody)
          ? (rawBody as BodyType)
          : carToEdit.class?.toLowerCase().includes("suv")
          ? "suv"
          : carToEdit.class?.toLowerCase().includes("hatchback")
          ? "hatchback"
          : "sedan";
        setBodyType(validBody);

        // Segment fallback
        const rawSeg = (carToEdit.segment || "").toLowerCase().trim();
        const validSeg = CAR_SEGMENTS.some((s) => s.value === rawSeg)
          ? (rawSeg as CarSegment)
          : "midsize";
        setSegment(validSeg);

        setSeats(carToEdit.seats || 5);
        setColor(carToEdit.color || "Black");

        // Fuel normalization
        const normF = (carToEdit.fuel_type || "").toLowerCase().trim();
        if (normF.includes("electr") || normF === "ev") {
          setFuelType("electric");
        } else if (normF.includes("diesel")) {
          setFuelType("diesel");
        } else if (normF.includes("hybrid")) {
          setFuelType("hybrid");
        } else {
          setFuelType("gas");
        }

        // Transmission normalization
        const normT = (carToEdit.transmission || "").toLowerCase().trim();
        if (normT === "m" || normT.includes("manual")) {
          setTransmission("m");
        } else {
          setTransmission("a");
        }

        setPricePerDay(carToEdit.price_per_day || 500);
        setDepositAmount(carToEdit.deposit_amount ?? 3000);
        setKmPolicy(carToEdit.km_policy || "Unlimited");
        setStatus(carToEdit.status || "available");

        setDrive(carToEdit.drive || "fwd");
        setCityMpg(carToEdit.city_mpg || 30);
        setHighwayMpg(carToEdit.highway_mpg || 38);
        setCombinationMpg(carToEdit.combination_mpg || 34);
        setCylinders(carToEdit.cylinders || 4);
        setDisplacement(carToEdit.displacement || 2.0);

        // Preload existing images
        const existingList: string[] = [];
        if (Array.isArray(carToEdit.images) && carToEdit.images.length > 0) {
          existingList.push(...carToEdit.images);
        } else if (carToEdit.image) {
          existingList.push(carToEdit.image);
        }

        setImages(
          existingList.map((url, idx) => ({
            id: `existing-${idx}-${url}`,
            url,
            isExisting: true,
          }))
        );
      } else {
        // Reset defaults for Add
        setMake("");
        setModel("");
        setYear(2024);
        setBodyType("sedan");
        setSegment("midsize");
        setCarClass("compact car");
        setSeats(5);
        setColor("Black");
        setFuelType("gas");
        setTransmission("a");
        setPricePerDay(500);
        setDepositAmount(3000);
        setKmPolicy("Unlimited");
        setStatus("available");
        setDrive("fwd");
        setCityMpg(30);
        setHighwayMpg(38);
        setCombinationMpg(34);
        setCylinders(4);
        setDisplacement(2.0);
        setImages([]);
      }
    }
  }, [isOpen, carToEdit]);

  if (!isOpen) return null;

  // Handle image files selection with browser compression
  const handleFilesSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressing(true);
    setErrorMessage(null);

    const newItems: ImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await compressAndResizeImage(file, 1600, 0.8);
        newItems.push({
          id: `new-${Date.now()}-${i}-${Math.random()}`,
          url: result.previewUrl,
          file: result.file,
          isExisting: false,
          compressionInfo: `${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)} (WebP)`,
        });
      } catch (err: any) {
        setErrorMessage(err.message || `Failed to process image "${file.name}".`);
      }
    }

    setImages((prev) => [...prev, ...newItems]);
    setIsCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Move image left (toward main)
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Move image right
  const handleMoveRight = (index: number) => {
    if (index >= images.length - 1) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  // Set specific image as main (index 0)
  const handleSetAsMain = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.unshift(item);
      return updated;
    });
  };

  // Remove image from list
  const handleRemoveImage = (index: number) => {
    const item = images[index];
    if (item.isExisting) {
      setDeletedExistingUrls((prev) => [...prev, item.url]);
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!make.trim() || !model.trim()) {
      setErrorMessage("Please enter both Make and Model.");
      return;
    }

    if (images.length === 0) {
      setErrorMessage("Please upload at least one image of the vehicle.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Upload newly added compressed files to Supabase Storage
      const finalImageUrls: string[] = [];

      for (const item of images) {
        if (item.isExisting) {
          finalImageUrls.push(item.url);
        } else if (item.file) {
          const uploadedUrl = await uploadCarImage(item.file, "cars");
          finalImageUrls.push(uploadedUrl);
        }
      }

      // 2. Prepare payload
      const carPayload = {
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        body_type: bodyType,
        segment: segment,
        class: carClass.trim() || `${formatSegment(segment)} ${formatBodyType(bodyType)}`,
        seats: Number(seats),
        color: color.trim(),
        fuel_type: fuelType,
        transmission,
        price_per_day: Number(pricePerDay),
        deposit_amount: Number(depositAmount),
        km_policy: kmPolicy.trim() || "Unlimited",
        status,
        images: finalImageUrls,
        drive,
        city_mpg: Number(cityMpg),
        highway_mpg: Number(highwayMpg),
        combination_mpg: Number(combinationMpg),
        cylinders: Number(cylinders),
        displacement: Number(displacement),
      };

      let savedRecord: CarProps;

      if (isEditing && carToEdit?.id) {
        // UPDATE existing car
        const { data, error } = await supabase
          .from("cars")
          .update(carPayload)
          .eq("id", carToEdit.id)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to update car details.");
        }
        savedRecord = data as CarProps;

        // Clean up removed storage images in background
        if (deletedExistingUrls.length > 0) {
          deleteCarImages(deletedExistingUrls).catch((err) =>
            console.warn("Storage cleanup notice:", err)
          );
        }
      } else {
        // INSERT new car
        const { data, error } = await supabase
          .from("cars")
          .insert(carPayload)
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Failed to create new vehicle.");
        }
        savedRecord = data as CarProps;
      }

      onSaved(savedRecord, !isEditing);
      onClose();
    } catch (err: any) {
      console.error("Save car error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[28px] border border-[#E5E7EB] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <div>
            <span className="text-xs font-bold text-[#5937E0] uppercase tracking-wider block mb-1">
              {isEditing ? "Update Vehicle" : "New Vehicle Entry"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-black font-['Work_Sans',sans-serif]">
              {isEditing ? `Edit ${carToEdit?.make} ${carToEdit?.model}` : "Add Car to Fleet"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-10 h-10 rounded-full bg-[#F8F8FB] hover:bg-[#EEEDF9] text-[#6C757D] hover:text-[#5937E0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-8">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Images & Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-black">Vehicle Photos & Gallery</h3>
                <p className="text-xs text-[#6C757D]">
                  Photos are compressed in-browser (max 1600px WebP) to save bandwidth. The <strong>first image</strong> is the main vehicle card photo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing || isSaving}
                className="px-4 py-2 rounded-full bg-[#EEEDF9] hover:bg-[#5937E0] text-[#5937E0] hover:text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Photos</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFilesSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload Drag & Drop Box */}
            {images.length === 0 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E5E7EB] hover:border-[#5937E0] rounded-2xl p-8 text-center cursor-pointer transition-colors bg-[#F8F8FB]"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-3 text-[#5937E0]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-black mb-1">Click to select vehicle photos</p>
                <p className="text-xs text-[#6C757D]">JPEG, PNG, WebP up to 5 MB each. Auto-resized to 1600px WebP.</p>
              </div>
            )}

            {isCompressing && (
              <div className="p-4 rounded-xl bg-[#EEEDF9] text-[#5937E0] text-xs font-semibold flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin"></div>
                <span>Optimizing and compressing photos...</span>
              </div>
            )}

            {/* Images Grid with Reorder controls */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`relative rounded-2xl border-2 p-2 bg-[#F8F8FB] transition-all flex flex-col justify-between ${
                      idx === 0 ? "border-[#5937E0] shadow-sm bg-purple-50/20" : "border-[#E5E7EB]"
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-1.5">
                      {idx === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#5937E0] text-white text-[10px] font-bold uppercase tracking-wider">
                          ★ Main Photo
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-[#6C757D]">#{idx + 1}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Image Preview */}
                    <div className="relative w-full h-28 rounded-xl overflow-hidden bg-white mb-2">
                      <Image
                        src={img.url}
                        alt="Vehicle preview"
                        fill
                        unoptimized
                        className="object-contain p-1"
                      />
                    </div>

                    {img.compressionInfo && (
                      <span className="text-[9px] text-[#10B981] font-semibold block truncate mb-1">
                        {img.compressionInfo}
                      </span>
                    )}

                    {/* Reorder Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => handleMoveLeft(idx)}
                        disabled={idx === 0}
                        className="p-1 rounded bg-white border border-[#E5E7EB] text-black disabled:opacity-30 text-xs hover:bg-[#EEEDF9]"
                        title="Move left"
                      >
                        ←
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetAsMain(idx)}
                          className="px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[10px] font-bold text-[#5937E0] hover:bg-[#EEEDF9]"
                          title="Set as main thumbnail"
                        >
                          Make Main
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMoveRight(idx)}
                        disabled={idx === images.length - 1}
                        className="p-1 rounded bg-white border border-[#E5E7EB] text-black disabled:opacity-30 text-xs hover:bg-[#EEEDF9]"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Core Details */}
          <div>
            <h3 className="text-sm font-bold text-black mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Make *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BMW, Toyota, Tesla"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Series, Corolla, Model 3"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Year *</label>
                <input
                  type="number"
                  required
                  min={2000}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              {/* Body Type (Required Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-black mb-1">Body Type *</label>
                <select
                  required
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value as BodyType)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-semibold focus:outline-none focus:border-[#5937E0]"
                >
                  {BODY_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Segment (Required Dropdown) */}
              <div>
                <label className="block text-xs font-bold text-black mb-1">Vehicle Segment *</label>
                <select
                  required
                  value={segment}
                  onChange={(e) => setSegment(e.target.value as CarSegment)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-semibold focus:outline-none focus:border-[#5937E0]"
                >
                  {CAR_SEGMENTS.map((seg) => (
                    <option key={seg.value} value={seg.value}>
                      {seg.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Seats *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={15}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Exterior Color</label>
                <input
                  type="text"
                  placeholder="e.g. Black, White, Silver"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Legacy Category / Class</label>
                <input
                  type="text"
                  placeholder="e.g. compact car, midsize SUV"
                  value={carClass}
                  onChange={(e) => setCarClass(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing, Policy & Status */}
          <div>
            <h3 className="text-sm font-bold text-black mb-3">Rental Pricing & Policy (Moroccan Dirham)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Price per Day (DH) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-bold focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Deposit Amount (DH)</label>
                <input
                  type="number"
                  min={0}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Km Policy</label>
                <select
                  value={kmPolicy}
                  onChange={(e) => setKmPolicy(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="Unlimited">Unlimited</option>
                  <option value="250 km/day">250 km/day</option>
                  <option value="300 km/day">300 km/day</option>
                  <option value="150 km/day">150 km/day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-bold focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="available">Available (Public)</option>
                  <option value="rented">Rented (Visible, disabled)</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="hidden">Hidden (Admin only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Engine & Technical Specs */}
          <div>
            <h3 className="text-sm font-bold text-black mb-3">Transmission & Technical Specs</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Transmission *</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-medium focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="a">Automatic</option>
                  <option value="m">Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Fuel Type *</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black font-medium focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="gas">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Drive</label>
                <select
                  value={drive}
                  onChange={(e) => setDrive(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                >
                  <option value="fwd">Front-Wheel Drive (FWD)</option>
                  <option value="rwd">Rear-Wheel Drive (RWD)</option>
                  <option value="awd">All-Wheel Drive (AWD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">Displacement (L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={displacement}
                  onChange={(e) => setDisplacement(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-sm text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-6 border-t border-[#E5E7EB] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full border border-[#E5E7EB] hover:bg-[#F8F8FB] text-sm font-bold text-[#6C757D] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isCompressing}
              className="px-8 py-2.5 rounded-full bg-[#5937E0] hover:bg-[#4A2CC7] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Vehicle & Photos...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Vehicle"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
