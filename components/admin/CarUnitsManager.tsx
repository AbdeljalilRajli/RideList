"use client";

import { useState, useEffect } from "react";
import { CarUnit } from "@/types";
import { supabase } from "@/lib/supabase";

interface CarUnitsManagerProps {
  carId: string;
  carMake: string;
  carModel: string;
  initialUnits?: CarUnit[];
  onUnitsChanged?: () => void;
  onToast?: (message: string, type?: "success" | "error") => void;
}

export default function CarUnitsManager({
  carId,
  carMake,
  carModel,
  initialUnits,
  onUnitsChanged,
  onToast,
}: CarUnitsManagerProps) {
  const [units, setUnits] = useState<CarUnit[]>(initialUnits || []);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Load units for this car
  const loadUnits = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from("car_units")
        .select("*")
        .eq("car_id", carId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setUnits((data as CarUnit[]) || []);
    } catch (err: any) {
      console.error("Failed to load car units:", err);
      setErrorMsg(err.message || "Failed to load vehicle units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (carId) {
      loadUnits();
    }
  }, [carId]);

  // Single Add Unit
  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = newPlate.trim().toUpperCase();
    if (!cleanPlate) {
      setErrorMsg("Please enter a valid license plate number.");
      return;
    }

    setIsAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);
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
      setSuccessMsg(`Unit "${cleanPlate}" added successfully.`);
      await loadUnits();
      onUnitsChanged?.();
      onToast?.(`Unit "${cleanPlate}" added.`, "success");
    } catch (err: any) {
      console.error("Add unit error:", err);
      setErrorMsg(err.message || "Failed to add unit.");
    } finally {
      setIsAdding(false);
    }
  };

  // Bulk Add Units
  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBulkAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let platesToAdd: string[] = [];
    if (bulkMode === "count") {
      const count = Math.max(1, Math.min(20, Number(bulkCount) || 1));
      for (let i = 0; i < count; i++) {
        const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
        platesToAdd.push(`PLT-${randHex}`);
      }
    } else {
      // Split by commas, newlines, or semicolons
      platesToAdd = bulkPlatesText
        .split(/[\n,;]+/)
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean);

      // Deduplicate
      platesToAdd = Array.from(new Set(platesToAdd));
      if (platesToAdd.length === 0) {
        setErrorMsg("Please enter at least one license plate number.");
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
      setSuccessMsg(`${platesToAdd.length} units added successfully.`);
      await loadUnits();
      onUnitsChanged?.();
      onToast?.(`${platesToAdd.length} units added to fleet.`, "success");
    } catch (err: any) {
      console.error("Bulk add units error:", err);
      setErrorMsg(err.message || "Failed to add bulk units.");
    } finally {
      setIsBulkAdding(false);
    }
  };

  // Toggle Maintenance Status
  const handleToggleStatus = async (unit: CarUnit) => {
    const nextStatus = unit.status === "available" ? "maintenance" : "available";
    try {
      const { error } = await supabase
        .from("car_units")
        .update({ status: nextStatus })
        .eq("id", unit.id);

      if (error) throw error;

      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, status: nextStatus } : u))
      );
      onUnitsChanged?.();
      onToast?.(`Unit ${unit.plate_number} marked as ${nextStatus}.`, "success");
    } catch (err: any) {
      console.error("Toggle unit status error:", err);
      setErrorMsg(err.message || "Failed to update unit status.");
    }
  };

  // Delete Unit (safely handled if active bookings exist)
  const handleDeleteUnit = async (unit: CarUnit) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase
        .from("car_units")
        .delete()
        .eq("id", unit.id);

      if (error) {
        if (error.message?.includes("reservations") || error.message?.includes("maintenance")) {
          throw new Error(
            `Cannot delete unit "${unit.plate_number}": It has active or upcoming confirmed reservations. Please change its status to "Maintenance" instead.`
          );
        }
        throw error;
      }

      setUnits((prev) => prev.filter((u) => u.id !== unit.id));
      setSuccessMsg(`Unit "${unit.plate_number}" removed.`);
      onUnitsChanged?.();
      onToast?.(`Unit "${unit.plate_number}" removed.`, "success");
    } catch (err: any) {
      console.error("Delete unit error:", err);
      setErrorMsg(err.message || "Failed to delete unit.");
    }
  };

  const availableCount = units.filter((u) => u.status === "available").length;

  return (
    <div className="space-y-6">
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
            onClick={() => {
              setShowAddSingle(true);
              setShowBulkAdd(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#5937E0] hover:bg-[#4d2ed1] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>+ Add Unit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBulkAdd(true);
              setShowAddSingle(false);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#EEEDF9] hover:bg-[#5937E0] text-[#5937E0] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ Bulk Add</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Single Add Form */}
      {showAddSingle && (
        <form onSubmit={handleAddSingle} className="p-4 rounded-2xl bg-white border-2 border-[#5937E0] space-y-4 shadow-sm animate-in fade-in duration-150">
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
        <form onSubmit={handleBulkAdd} className="p-4 rounded-2xl bg-white border-2 border-[#5937E0] space-y-4 shadow-sm animate-in fade-in duration-150">
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

      {/* Units Table */}
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
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(unit)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                        unit.status === "available"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                      }`}
                      title="Click to toggle status"
                    >
                      <span>● {unit.status === "available" ? "Available" : "Maintenance"}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-[#6C757D] max-w-xs truncate">
                    {unit.notes || "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUnit(unit)}
                      className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold border border-red-200 cursor-pointer transition-colors"
                      title="Remove unit"
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
    </div>
  );
}
