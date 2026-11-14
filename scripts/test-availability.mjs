import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("=================================================");
  console.log("RUNNING VEHICLE AVAILABILITY & SECURITY TESTS");
  console.log("=================================================\n");

  // 1. Test: Guest cannot read bookings table
  console.log("1. Testing Anonymous Access on public.bookings...");
  const { data: guestBookings, error: guestError } = await anonClient
    .from("bookings")
    .select("*");

  if (guestError) {
    console.log("   [PASS] Anonymous select error returned (RLS denied):", guestError.message);
  } else if (!guestBookings || guestBookings.length === 0) {
    console.log("   [PASS] Anonymous select returned 0 rows (RLS protected).");
  } else {
    console.error("   [FAIL] Anonymous select returned rows! Count:", guestBookings.length);
  }

  // 2. Find BMW iX ID
  console.log("\n2. Finding BMW iX in cars fleet...");
  const { data: bmwList, error: bmwErr } = await anonClient
    .from("cars")
    .select("id, make, model, status")
    .ilike("model", "%iX%")
    .limit(1);

  if (bmwErr || !bmwList || bmwList.length === 0) {
    console.error("   BMW iX not found in cars table:", bmwErr);
    return;
  }

  const bmw = bmwList[0];
  console.log(`   Found vehicle: ${bmw.make} ${bmw.model} (ID: ${bmw.id}) - Manual Status: ${bmw.status}`);

  // 3. Test: Call get_unavailable_ranges(car_id)
  console.log("\n3. Testing get_unavailable_ranges(bmw.id)...");
  const { data: ranges, error: rangesErr } = await anonClient.rpc(
    "get_unavailable_ranges",
    { p_car_id: bmw.id }
  );

  if (rangesErr) {
    console.error("   [FAIL] get_unavailable_ranges error:", rangesErr.message);
  } else {
    console.log("   [PASS] get_unavailable_ranges returned:", ranges);
  }

  // 4. Test: Overlapping dates (Nov 20 to Nov 30) via create_booking
  console.log("\n4. Testing create_booking for Nov 20-30 (should be rejected if confirmed booking exists)...");
  const { data: blockRes, error: blockErr } = await anonClient.rpc("create_booking", {
    p_car_id: bmw.id,
    p_pickup_date: "2026-11-20",
    p_pickup_time: "10:00",
    p_return_date: "2026-11-30",
    p_return_time: "10:00",
    p_pickup_place: "Downtown Agency",
    p_return_place: "Downtown Agency",
    p_customer_name: "Test Customer",
    p_customer_phone: "212600000000",
    p_customer_email: "test@example.com",
    p_customer_country: "Morocco",
  });

  if (blockErr) {
    console.log("   [PASS] create_booking successfully rejected overlapping dates:", blockErr.message);
  } else {
    console.log("   [INFO] create_booking succeeded (reference code:", blockRes?.[0]?.reference_code, ")");
  }

  // 5. Test: get_available_cars for Nov 20-30, Dec 2, and adjacent dates
  console.log("\n5. Testing get_available_cars date checks...");
  
  // 5a. Blocked period: Nov 20 - Nov 30
  const { data: availNov } = await anonClient.rpc("get_available_cars", {
    p_pickup_date: "2026-11-20",
    p_return_date: "2026-11-30",
  });
  const bmwNovAvail = availNov?.find((c) => c.car_id === bmw.id)?.is_available;
  console.log(`   - Nov 20 to Nov 30 available: ${bmwNovAvail} (expected: false if booked)`);

  // 5b. Adjacent date range before: Nov 10 - Nov 19
  const { data: availPre } = await anonClient.rpc("get_available_cars", {
    p_pickup_date: "2026-11-10",
    p_return_date: "2026-11-19",
  });
  const bmwPreAvail = availPre?.find((c) => c.car_id === bmw.id)?.is_available;
  console.log(`   - Nov 10 to Nov 19 (adjacent before) available: ${bmwPreAvail} (expected: true)`);

  // 5c. Adjacent date range after: Dec 1 - Dec 5
  const { data: availPost } = await anonClient.rpc("get_available_cars", {
    p_pickup_date: "2026-12-01",
    p_return_date: "2026-12-05",
  });
  const bmwPostAvail = availPost?.find((c) => c.car_id === bmw.id)?.is_available;
  console.log(`   - Dec 1 to Dec 5 (adjacent after) available: ${bmwPostAvail} (expected: true)`);

  // 5d. Dec 2 works: Dec 2 - Dec 5
  const { data: availDec2 } = await anonClient.rpc("get_available_cars", {
    p_pickup_date: "2026-12-02",
    p_return_date: "2026-12-05",
  });
  const bmwDec2Avail = availDec2?.find((c) => c.car_id === bmw.id)?.is_available;
  console.log(`   - Dec 2 to Dec 5 available: ${bmwDec2Avail} (expected: true)`);

  // 6. Test: get_cars_rented_today()
  console.log("\n6. Testing get_cars_rented_today()...");
  const { data: rentedToday, error: rentedErr } = await anonClient.rpc("get_cars_rented_today");
  if (rentedErr) {
    console.error("   [FAIL] get_cars_rented_today error:", rentedErr.message);
  } else {
    console.log("   [PASS] get_cars_rented_today returned:", rentedToday);
  }

  console.log("\n=================================================");
  console.log("ALL LOCAL CHECKS COMPLETE");
  console.log("=================================================");
}

runTests().catch(console.error);
