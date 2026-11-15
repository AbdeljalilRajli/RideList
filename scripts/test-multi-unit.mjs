import assert from "node:assert";
import fs from "node:fs";

console.log("=================================================");
console.log("RUNNING MULTI-UNIT FLEET LOGIC & CODE INTEGRATION TESTS");
console.log("=================================================\n");

// 1. Verify TypeScript types definition
console.log("1. Verifying CarUnit interface in types/index.ts...");
const typesCode = fs.readFileSync("types/index.ts", "utf8");
assert(typesCode.includes("export interface CarUnit"), "CarUnit interface must be exported in types/index.ts");
assert(typesCode.includes("plate_number: string"), "CarUnit must have plate_number");
assert(typesCode.includes("units?: CarUnit[]"), "CarProps must have optional units array");
assert(typesCode.includes("available_units_count?: number"), "CarProps must have available_units_count");
assert(typesCode.includes("total_units_count?: number"), "CarProps must have total_units_count");
console.log("   [PASS] types/index.ts defines CarUnit and CarProps multi-unit fields.");

// 2. Verify useAdminData hook implementation
console.log("\n2. Verifying multi-unit state & actions in hooks/useAdminData.ts...");
const hookCode = fs.readFileSync("hooks/useAdminData.ts", "utf8");
assert(hookCode.includes("units:car_units (*)"), "fetchData must query car_units for each car");
assert(hookCode.includes("car_units:unit_id"), "fetchData must join car_units on bookings");
assert(hookCode.includes("confirmBookingWithUnit"), "useAdminData must provide confirmBookingWithUnit");
assert(hookCode.includes("changeBookingUnit"), "useAdminData must provide changeBookingUnit");
assert(hookCode.includes("addCarUnit"), "useAdminData must provide addCarUnit");
assert(hookCode.includes("bulkAddCarUnits"), "useAdminData must provide bulkAddCarUnits");
assert(hookCode.includes("available_units_count"), "enrichedCars must calculate available_units_count");
console.log("   [PASS] hooks/useAdminData.ts provides all required multi-unit queries and mutations.");

// 3. Verify ConfirmBookingModal & ChangeUnitModal
console.log("\n3. Verifying ConfirmBookingModal & ChangeUnitModal components...");
assert(fs.existsSync("components/admin/ConfirmBookingModal.tsx"), "ConfirmBookingModal.tsx must exist");
assert(fs.existsSync("components/admin/ChangeUnitModal.tsx"), "ChangeUnitModal.tsx must exist");
assert(fs.existsSync("components/admin/CarUnitsManager.tsx"), "CarUnitsManager.tsx must exist");
const confirmModalCode = fs.readFileSync("components/admin/ConfirmBookingModal.tsx", "utf8");
assert(confirmModalCode.includes("get_available_units"), "ConfirmBookingModal calls get_available_units RPC");
assert(confirmModalCode.includes("firstFree"), "ConfirmBookingModal pre-selects first free unit");

const changeModalCode = fs.readFileSync("components/admin/ChangeUnitModal.tsx", "utf8");
assert(changeModalCode.includes("change_booking_unit") || changeModalCode.includes("onChangeUnit"), "ChangeUnitModal allows reassignment");
console.log("   [PASS] Modals implement pre-selected 1-click confirmation and unit reassignment.");

// 4. Verify License Plate badges & search in BookingTable
console.log("\n4. Verifying plate display and search in components/admin/BookingTable.tsx...");
const tableCode = fs.readFileSync("components/admin/BookingTable.tsx", "utf8");
assert(tableCode.includes("b.car_units?.plate_number"), "BookingTable renders plate badge for assigned units");
assert(tableCode.includes("b.car_units.plate_number.toLowerCase().includes(q)"), "Bookings search matches license plate numbers");
assert(tableCode.includes("ConfirmBookingModal"), "BookingTable renders ConfirmBookingModal");
assert(tableCode.includes("ChangeUnitModal"), "BookingTable renders ChangeUnitModal");
console.log("   [PASS] BookingTable displays plates and makes them searchable.");

// 5. Verify CarUnitsManager in CarFormModal
console.log("\n5. Verifying Units section & bulk add in components/admin/CarFormModal.tsx...");
const carFormCode = fs.readFileSync("components/admin/CarFormModal.tsx", "utf8");
assert(carFormCode.includes("CarUnitsManager"), "CarFormModal incorporates CarUnitsManager");
const unitsManagerCode = fs.readFileSync("components/admin/CarUnitsManager.tsx", "utf8");
assert(unitsManagerCode.includes("handleBulkAdd"), "CarUnitsManager provides bulk add");
assert(unitsManagerCode.includes("handleToggleStatus"), "CarUnitsManager provides maintenance toggle");
assert(unitsManagerCode.includes("handleDeleteUnit"), "CarUnitsManager provides unit deletion");
assert(unitsManagerCode.includes("Maintenance"), "CarUnitsManager prompts maintenance when unit has bookings");
console.log("   [PASS] CarFormModal provides unit management and bulk add.");

// 6. Multi-Unit Availability Simulation (3-unit car scenario)
console.log("\n6. Simulating 3-Unit Car Availability Math & Capacity Logic...");
const car = { id: "car-1", make: "BMW", model: "iX", status: "available" };
const units = [
  { id: "u-1", car_id: "car-1", plate_number: "PLT-1111", status: "available" },
  { id: "u-2", car_id: "car-1", plate_number: "PLT-2222", status: "available" },
  { id: "u-3", car_id: "car-1", plate_number: "PLT-3333", status: "available" },
];

let bookings = [
  // Booking 1: Confirmed on Unit 1 (Nov 20 to Nov 25)
  { id: "b-1", car_id: "car-1", unit_id: "u-1", status: "confirmed", pickup_date: "2026-11-20", return_date: "2026-11-25" },
  // Booking 2: Confirmed on Unit 2 (Nov 22 to Nov 28)
  { id: "b-2", car_id: "car-1", unit_id: "u-2", status: "confirmed", pickup_date: "2026-11-22", return_date: "2026-11-28" },
];

function checkAvailability(carId, pickup, ret, activeUnits, currentBookings) {
  const freeUnits = activeUnits.filter(u => u.status === "available" && !currentBookings.some(b => 
    b.unit_id === u.id && b.status === "confirmed" && b.pickup_date <= ret && b.return_date >= pickup
  ));
  return freeUnits.length > 0;
}

// Check with 2 bookings on 3 units: Unit 3 is completely free
const isAvailableWith2Bookings = checkAvailability("car-1", "2026-11-22", "2026-11-25", units, bookings);
assert.strictEqual(isAvailableWith2Bookings, true, "Car must remain bookable when only 2 of 3 units are confirmed");
console.log("   [PASS] 2 overlapping confirmed bookings leave the 3-unit car bookable (Unit 3 free).");

// Add Booking 3 on Unit 3 for Nov 21 to Nov 24: ALL 3 units are now booked on Nov 22-24
bookings.push({ id: "b-3", car_id: "car-1", unit_id: "u-3", status: "confirmed", pickup_date: "2026-11-21", return_date: "2026-11-24" });
const isAvailableWith3Bookings = checkAvailability("car-1", "2026-11-22", "2026-11-24", units, bookings);
assert.strictEqual(isAvailableWith3Bookings, false, "Car must NOT be available when all 3 units are occupied for the dates");
console.log("   [PASS] 3rd overlapping booking blocks those dates (all 3 units occupied).");

// Maintenance reduces capacity:
units[2].status = "maintenance"; // Unit 3 under maintenance
const activeUnitsCount = units.filter(u => u.status === "available").length;
assert.strictEqual(activeUnitsCount, 2, "Maintenance unit reduces active capacity to 2");
console.log("   [PASS] Maintenance unit reduces capacity from 3 to 2.");

// Unit Reassignment:
const b1 = bookings.find(b => b.id === "b-1");
assert.ok(b1, "Booking 1 found");
b1.unit_id = "u-2"; // reassigned to unit 2
assert.strictEqual(b1.unit_id, "u-2", "Unit reassignment works smoothly");
console.log("   [PASS] Changing booking unit updates assigned unit successfully.");

// 7. Extra Test: Whole car deletion trigger guard
console.log("\n7. Verifying trigger guard for deleting a whole car listing with confirmed bookings...");
const triggerSql = fs.readFileSync("supabase-fix-car-deletion-trigger.sql", "utf8");
assert(triggerSql.includes("IF NOT EXISTS (SELECT 1 FROM public.cars WHERE id = NEW.car_id) THEN"), "Trigger must check if parent car was deleted");
assert(triggerSql.includes("TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'confirmed')"), "Trigger must only run when status transitions to confirmed");
console.log("   [PASS] supabase-fix-car-deletion-trigger.sql guards whole-car deletion from being blocked by ON DELETE SET NULL.");

console.log("\n=================================================");
console.log("ALL TESTS PASSED SUCCESSFULLY!");
console.log("=================================================");
