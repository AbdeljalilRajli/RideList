"use client";

import { useState, useEffect, useCallback } from "react";
import { CarUnit } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCasablancaToday } from "@/lib/utils";
import ChangeUnitModal from "@/components/admin/ChangeUnitModal";

interface UpcomingBooking {
  id: string;
  reference_code: string;
  pickup_date: string;
  return_date: string;
  customer_name: string;
  car_id: string;
  unit_id: string | null;
  car_units?: {
    id: string;
    plate_number: string;
    color?: string;
    status: string;
  } | null;
  cars?: {
    make: string;
    model: string;
    year: number;
  } | null;
}

interface CarUnitsManagerProps {
  carId: string;
  carMake: string;
  carModel: string;
  initialUnits?: CarUnit[];
  onUnitsChanged?: () => void;
  onUnitsCountChange?: (count: number) => void;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function CarUnitsManager({
  carId,
  carMake,
  carModel,
  initialUnits,
  onUnitsChanged,
  onUnitsCountChange,
  onToast,
}: CarUnitsManagerProps) {
  const [units, setUnits] = useState<CarUnit[]>(initialUnits || []);
  const [loading, setLoading] = useState(false);

  // Dismissible notifications
  const [errorBanner, setErrorBanner] = useState<{
    title: string;
    message: string;
    bookings?: UpcomingBooking[];
  } | null>(null);

  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Maintenance confirmation dialog state
  const [maintenanceConfirmData, setMaintenanceConfirmData] = useState<{
    unit: CarUnit;
    bookings: UpcomingBooking[];
  } | null>(null);

  // Shortcut Change Unit modal state
  const [bookingToReassign, setBookingToReassign] = useState<any | null>(null);

  // Single Add state
  const [showAddSingle, setShowAddSingle] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newColor, setNewColor] = useState("Standard");
  const [newStatus, setNewStatus] = useState<"available" | "maintenance">("available");
  const [newNotes, setNewNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Bulk Add state
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkMode, setBulkMode] = useState<"count" | "paste">("paste");
  const [bulkCount, setBulkCount] = useState<number>(3);
  const [bulkPlatesText, setBulkPlatesText] = useState("");
  const [bulkColor, setBulkColor] = useState("Standard");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // Clear errors when clicking anywhere else
  const handleContainerClick = () => {
    if (errorBanner) {
      setErrorBanner(null);
    }
  };

  // Load units for this car
  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("car_units")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const loaded = (data as CarUnit[]) || [];
      setUnits(loaded);
      onUnitsCountChange?.(loaded.length);
    } catch (err: any) {
      console.error("Failed to load car units:", err);
      setErrorBanner({
        title: "Load Error",
        message: err.message || "Failed to load vehicle units.",
      });
    } finally {
      setLoading(false);
    }
  }, [carId, onUnitsCountChange]);

  useEffect(() => {
    if (carId) {
      setErrorBanner(null);
      setSuccessBanner(null);
      loadUnits();
    }
  }, [carId, loadUnits]);

  // Fetch upcoming confirmed bookings for a unit
  const fetchUpcomingBookingsForUnit = async (unitId: string): Promise<UpcomingBooking[]> => {
    const today = getCasablancaToday();
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        reference_code,
        pickup_date,
        return_date,
        customer_name,
        car_id,
        unit_id,
        car_units:unit_id (id, plate_number, color, status),
        cars:car_id (make, model, year)
      `)
      .eq("unit_id", unitId)
      .eq("status", "confirmed")
      .gte("return_date", today)
      .order("pickup_date", { ascending: true });

    if (error) {
      console.error("Error fetching unit upcoming bookings:", error);
      return [];
    }
    return (data as unknown as UpcomingBooking[]) || [];
  };

  // Single Add Unit
  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = newPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setErrorBanner({
        title: "Validation Error",
        message: "Please enter a valid license plate number.",
      });
      return;
    }

    setIsAdding(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const { error } = await supabase.from("car_units").insert({
        car_id: carId,
        plate_number: cleanPlate,
        color: newColor.trim() || "Standard",
        status: newStatus,
        notes: newNotes.trim() || null,
      });

      if (error) {
        if (error.code === "23505" || error.message?.includes("unique")) {
          throw new Error(`Plate "${cleanPlate}" already exists in the system. Plates must be globally unique.`);
        }
        throw error;
      }

      setNewPlate("");
      setNewNotes("");
      setShowAddSingle(false);
      setSuccessBanner(`Unit "${cleanPlate}" added successfully.`);
      await loadUnits();
      onUnitsChanged?.();
      onToast?.(`Unit "${cleanPlate}" added.`, "success");
    } catch (err: any) {
      console.error("Add unit error:", err);
      setErrorBanner({
        title: "Cannot Add Unit",
        message: err.message || "Failed to add unit.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Bulk Add Units
  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBulkAdding(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    let platesToAdd: string[] = [];
    if (bulkMode === "count") {
      const count = Math.max(1, Math.min(20, Number(bulkCount) || 1));
      for (let i = 0; i < count; i++) {
        const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
        platesToAdd.push(`PLT-${randHex}`);
      }
    } else {
      platesToAdd = bulkPlatesText
        .split(/[\n,;]+/)
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean);

      platesToAdd = Array.from(new Set(platesToAdd));
      if (platesToAdd.length === 0) {
        setErrorBanner({
          title: "Validation Error",
          message: "Please enter at least one license plate number.",
        });
        setIsBulkAdding(false);
        return;
      }
    }

    try {
      const rows = platesToAdd.map((plate) => ({
        car_id: carId,
        plate_number: plate,
        color: bulkColor.trim() || "Standard",
        status: "available",
        notes: "Bulk added unit",
      }));

      const { error } = await supabase.from("car_units").insert(rows);

      if (error) {
        if (error.code === "23505" || error.message?.includes("unique")) {
          throw new Error("One or more license plates already exist in the database. Plates must be unique.");
        }
        throw error;
      }

      setBulkPlatesText("");
      setShowBulkAdd(false);
      setSuccessBanner(`${platesToAdd.length} units added successfully.`);
      await loadUnits();
      onUnitsChanged?.();
      onToast?.(`${platesToAdd.length} units added to fleet.`, "success");
    } catch (err: any) {
      console.error("Bulk add units error:", err);
      setErrorBanner({
        title: "Bulk Add Error",
        message: err.message || "Failed to add bulk units.",
      });
    } finally {
      setIsBulkAdding(false);
    }
  };

  // Status Change Handler with Confirmation when Switching to Maintenance
  const handleStatusSelect = async (unit: CarUnit, newStatus: "available" | "maintenance") => {
    setErrorBanner(null);
    setSuccessBanner(null);

    if (newStatus === unit.status) return;

    if (newStatus === "maintenance") {
      // Check if unit has upcoming confirmed bookings
      const upcoming = await fetchUpcomingBookingsForUnit(unit.id);
      if (upcoming.length > 0) {
        // Show confirmation dialog with list of bookings and change unit shortcut
        setMaintenanceConfirmData({
          unit,
          bookings: upcoming,
        });
        return;
      }
    }

    // Direct apply if no conflict or switching to available
    await applyStatusChange(unit.id, unit.plate_number, newStatus);
  };

  const applyStatusChange = async (unitId: string, plateNumber: string, status: "available" | "maintenance") => {
    try {
      const { error } = await supabase
        .from("car_units")
        .update({ status })
        .eq("id", unitId);

      if (error) throw error;

      setUnits((prev) =>
        prev.map((u) => (u.id === unitId ? { ...u, status } : u))
      );
      setSuccessBanner(`Unit ${plateNumber} status successfully changed to ${status === "available" ? "Available" : "Maintenance"}.`);
      onUnitsChanged?.();
      onToast?.(`Unit ${plateNumber} set to ${status}.`, "success");
    } catch (err: any) {
      console.error("Status update error:", err);
      setErrorBanner({
        title: "Status Update Error",
        message: err.message || "Failed to update unit status.",
      });
    }
  };

  // Delete Unit (Refused if active/upcoming bookings exist, listing them with change unit shortcuts)
  const handleDeleteUnit = async (unit: CarUnit) => {
    setErrorBanner(null);
    setSuccessBanner(null);

    const upcoming = await fetchUpcomingBookingsForUnit(unit.id);
    if (upcoming.length > 0) {
      setErrorBanner({
        title: `Cannot delete unit "${unit.plate_number}"`,
        message: `This unit has ${upcoming.length} active or upcoming confirmed reservation(s). You must reassign or cancel these reservations first:`,
        bookings: upcoming,
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("car_units")
        .delete()
        .eq("id", unit.id);

      if (error) throw error;

      setUnits((prev) => {
        const remaining = prev.filter((u) => u.id !== unit.id);
        onUnitsCountChange?.(remaining.length);
        return remaining;
      });
      setSuccessBanner(`Unit "${unit.plate_number}" deleted successfully.`);
      onUnitsChanged?.();
      onToast?.(`Unit "${unit.plate_number}" removed.`, "success");
    } catch (err: any) {
      console.error("Delete unit error:", err);
      setErrorBanner({
        title: "Delete Error",
        message: err.message || "Failed to delete unit.",
      });
    }
  };

  const availableCount = units.filter((u) => u.status === "available").length;

  return (
    <div className="space-y-6" onClick={handleContainerClick}>
      {/* Header & Unit Capacity Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F8FB] border border-[#E5E7EB]">
        <div>
          <span className="text-[11px] font-bold text-[#5937E0] uppercase tracking-wider block mb-0.5">
            Physical Fleet Inventory
          </span>
          <h4 className="text-sm font-bold text-black">
            Units for {carMake} {carModel}
          </h4>
          <p className="text-xs text-[#6C757D] mt-0.5">
            {units.length} total registered physical {units.length === 1 ? "unit" : "units"} (
            <span className="text-emerald-700 font-bold">{availableCount} active</span>,{" "}
            <span className="text-amber-700 font-bold">{units.length - availableCount} in maintenance</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddSingle(true);
              setShowBulkAdd(false);
              setErrorBanner(null);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#5937E0] hover:bg-[#4d2ed1] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>+ Add Unit</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowBulkAdd(true);
              setShowAddSingle(false);
              setErrorBanner(null);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#EEEDF9] hover:bg-[#5937E0] text-[#5937E0] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Bulk Add</span>
          </button>
        </div>
      </div>

      {/* Dismissible Error Banner */}
      {errorBanner && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 shadow-xs space-y-2 animate-in fade-in duration-150"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <strong className="block text-red-800 text-sm font-bold">
                {errorBanner.title}
              </strong>
              <p className="text-red-700 mt-0.5 leading-relaxed">
                {errorBanner.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="w-6 h-6 rounded-full hover:bg-red-200/60 text-red-700 flex items-center justify-center shrink-0 cursor-pointer text-sm font-bold"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>

          {/* List of conflicting bookings with Change Unit shortcut */}
          {errorBanner.bookings && errorBanner.bookings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
              <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
                Active Bookings on this Unit ({errorBanner.bookings.length}):
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {errorBanner.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-red-200 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-black text-xs mr-2">
                        {b.reference_code}
                      </span>
                      <span className="text-[#6C757D]">
                        ({b.pickup_date} to {b.return_date})
                      </span>
                      <span className="text-black font-semibold ml-2">
                        • {b.customer_name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingToReassign(b)}
                      className="px-2.5 py-1 rounded-lg bg-[#5937E0] hover:bg-[#4d2ed1] text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      Change Unit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dismissible Success Banner */}
      {successBanner && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 shadow-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="w-6 h-6 rounded-full hover:bg-emerald-200/60 text-emerald-700 flex items-center justify-center shrink-0 cursor-pointer text-sm font-bold"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* Single Add Form */}
      {showAddSingle && (
        <form
          onSubmit={handleAddSingle}
          onClick={(e) => e.stopPropagation()}
          className="p-4 rounded-2xl bg-white border-2 border-[#5937E0] space-y-4 shadow-sm animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <h5 className="text-xs font-bold text-[#5937E0] uppercase tracking-wider">
              Add Single Physical Unit
            </h5>
            <button
              type="button"
              onClick={() => setShowAddSingle(false)}
              className="text-xs text-[#6C757D] hover:text-black cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Plate Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 12345-A-1"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-mono font-bold text-black focus:outline-none focus:border-[#5937E0]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Black / White"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-black focus:outline-none focus:border-[#5937E0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Initial Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as "available" | "maintenance")}
                className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-semibold text-black focus:outline-none focus:border-[#5937E0]"
              >
                <option value="available">Available for rent</option>
                <option value="maintenance">In Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Parking spot B12, Minor scratch on rear door"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-black focus:outline-none focus:border-[#5937E0]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddSingle(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D] hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 rounded-xl bg-[#5937E0] text-white text-xs font-bold hover:bg-[#4d2ed1] disabled:opacity-50 cursor-pointer"
            >
              {isAdding ? "Adding..." : "Save Unit"}
            </button>
          </div>
        </form>
      )}

      {/* Bulk Add Form */}
      {showBulkAdd && (
        <form
          onSubmit={handleBulkAdd}
          onClick={(e) => e.stopPropagation()}
          className="p-4 rounded-2xl bg-white border-2 border-[#5937E0] space-y-4 shadow-sm animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
            <div>
              <h5 className="text-xs font-bold text-[#5937E0] uppercase tracking-wider">
                Bulk Add Physical Units
              </h5>
              <p className="text-[11px] text-[#6C757D]">
                Add multiple identical units in seconds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBulkAdd(false)}
              className="text-xs text-[#6C757D] hover:text-black cursor-pointer"
            >
              ✕ Cancel
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBulkMode("paste")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                bulkMode === "paste"
                  ? "bg-[#5937E0] text-white"
                  : "bg-gray-100 text-[#6C757D] hover:bg-gray-200"
              }`}
            >
              Paste Plate Numbers
            </button>
            <button
              type="button"
              onClick={() => setBulkMode("count")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                bulkMode === "count"
                  ? "bg-[#5937E0] text-white"
                  : "bg-gray-100 text-[#6C757D] hover:bg-gray-200"
              }`}
            >
              Auto-generate N Units
            </button>
          </div>

          {bulkMode === "paste" ? (
            <div>
              <label className="block text-xs font-bold text-black mb-1">
                Paste License Plates (one per line or comma-separated)
              </label>
              <textarea
                rows={4}
                placeholder={"12345-A-1\n12346-A-1\n12347-A-1"}
                value={bulkPlatesText}
                onChange={(e) => setBulkPlatesText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs font-mono text-black focus:outline-none focus:border-[#5937E0]"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  How many units to create?
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-black focus:outline-none focus:border-[#5937E0]"
                  required
                />
                <p className="text-[11px] text-[#6C757D] mt-1">
                  Will generate unique placeholder plates you can edit anytime.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Default Color
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard"
                  value={bulkColor}
                  onChange={(e) => setBulkColor(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#F8F8FB] border border-[#E5E7EB] text-xs text-black focus:outline-none focus:border-[#5937E0]"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowBulkAdd(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#6C757D] hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBulkAdding}
              className="px-5 py-2 rounded-xl bg-[#5937E0] text-white text-xs font-bold hover:bg-[#4d2ed1] disabled:opacity-50 cursor-pointer"
            >
              {isBulkAdding ? "Adding..." : "Add All Units"}
            </button>
          </div>
        </form>
      )}

      {/* Units Table with Dropdown Status Control */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6C757D]">
            <div className="w-5 h-5 border-2 border-[#5937E0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span>Loading fleet units...</span>
          </div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#6C757D]">
            No units found for this car. Click &quot;+ Add Unit&quot; or &quot;⚡ Bulk Add&quot; above to register physical vehicles.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8FB] border-b border-[#E5E7EB] text-[#6C757D] text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">License Plate</th>
                <th className="py-3 px-4">Color</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-black">
                      🚘 {unit.plate_number}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-black">
                    {unit.color || "Standard"}
                  </td>
                  <td className="py-3 px-4">
                    {/* Explicit Status Dropdown with Chevron */}
                    <div
                      className="relative inline-block"
                      title="Switch physical unit status between Available and Maintenance"
                    >
                      <select
                        value={unit.status}
                        onChange={(e) =>
                          handleStatusSelect(
                            unit,
                            e.target.value as "available" | "maintenance"
                          )
                        }
                        className={`h-8 pl-3 pr-7 rounded-full text-xs font-bold border transition-all cursor-pointer focus:outline-none appearance-none ${
                          unit.status === "available"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                        }`}
                      >
                        <option value="available">● Available</option>
                        <option value="maintenance">● Maintenance</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#6C757D] max-w-xs truncate">
                    {unit.notes || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(unit)}
                      className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold border border-red-200 cursor-pointer transition-colors"
                      title="Remove unit from fleet"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Maintenance Confirmation Dialog */}
      {maintenanceConfirmData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-sm font-bold text-black">
                  Switch Unit {maintenanceConfirmData.unit.plate_number} to Maintenance?
                </h3>
                <p className="text-xs text-[#6C757D] mt-1 leading-relaxed">
                  This unit has <strong className="text-black">{maintenanceConfirmData.bookings.length} upcoming confirmed reservation(s)</strong>.
                  Switching to maintenance will reduce available fleet capacity for those dates. These reservations will stay assigned to this unit until you reassign them.
                </p>
              </div>
            </div>

            {/* List of affected bookings with Change Unit shortcut */}
            <div className="p-3 bg-[#F8F8FB] rounded-2xl border border-[#E5E7EB] space-y-2 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-wider block">
                Upcoming Confirmed Reservations ({maintenanceConfirmData.bookings.length}):
              </span>
              {maintenanceConfirmData.bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5E7EB] text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-black mr-2">
                      {b.reference_code}
                    </span>
                    <span className="text-[#6C757D]">
                      {b.pickup_date} to {b.return_date}
                    </span>
                    <span className="text-black font-medium block truncate max-w-[170px]">
                      {b.customer_name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBookingToReassign(b);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#5937E0] hover:bg-[#4d2ed1] text-white text-[10px] font-bold cursor-pointer"
                  >
                    Change Unit
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
              <button
                type="button"
                onClick={() => setMaintenanceConfirmData(null)}
                className="px-4 py-2 rounded-xl border border-[#E5E7EB] text-xs font-bold text-[#6C757D] hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const { unit } = maintenanceConfirmData;
                  setMaintenanceConfirmData(null);
                  await applyStatusChange(unit.id, unit.plate_number, "maintenance");
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Set to Maintenance Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Unit Reassignment Modal Shortcut */}
      {bookingToReassign && (
        <ChangeUnitModal
          isOpen={Boolean(bookingToReassign)}
          booking={bookingToReassign}
          onClose={() => setBookingToReassign(null)}
          onChangeUnit={async (bookingId, newUnitId) => {
            const { error } = await supabase.rpc("change_booking_unit", {
              p_booking_id: bookingId,
              p_new_unit_id: newUnitId,
            });
            if (error) throw error;

            // Refresh affected bookings in confirmation dialog if open
            if (maintenanceConfirmData) {
              const updatedBookings = maintenanceConfirmData.bookings.filter(
                (b) => b.id !== bookingId
              );
              setMaintenanceConfirmData({
                ...maintenanceConfirmData,
                bookings: updatedBookings,
              });
            }

            // Refresh affected bookings in error banner if open
            if (errorBanner?.bookings) {
              const updatedBookings = errorBanner.bookings.filter(
                (b) => b.id !== bookingId
              );
              if (updatedBookings.length === 0) {
                setErrorBanner(null);
              } else {
                setErrorBanner({
                  ...errorBanner,
                  bookings: updatedBookings,
                });
              }
            }

            setBookingToReassign(null);
            onUnitsChanged?.();
            onToast?.("Reservation reassigned successfully.", "success");
          }}
          onToast={onToast}
        />
      )}
    </div>
  );
}
