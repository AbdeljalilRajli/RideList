-- =============================================================================
-- RIDELIST PART 5: MULTI-UNIT FLEET SUPPORT & AVAILABILITY
-- 
-- Run this script in the Supabase Dashboard SQL Editor.
-- Wrapped in a transaction: if any statement fails, all changes are rolled back.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- -----------------------------------------------------------------------------
-- 1. CREATE 'car_units' TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.car_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  plate_number text NOT NULL UNIQUE,
  color text DEFAULT 'Standard',
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance')),
  notes text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_car_units_car_id ON public.car_units(car_id);
CREATE INDEX IF NOT EXISTS idx_car_units_status ON public.car_units(status);

-- -----------------------------------------------------------------------------
-- 2. ADD 'unit_id' TO 'bookings' TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS unit_id uuid REFERENCES public.car_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_unit_id ON public.bookings(unit_id);

-- -----------------------------------------------------------------------------
-- 3. MIGRATE EXISTING CARS & BACKFILL UNITS
-- -----------------------------------------------------------------------------
-- 3a. Ensure every existing car listing has at least one physical unit
INSERT INTO public.car_units (car_id, plate_number, color, status, notes)
SELECT 
  c.id,
  'PLT-' || upper(substr(replace(c.id::text, '-', ''), 1, 8)),
  COALESCE(NULLIF(trim(c.color), ''), 'Standard'),
  CASE WHEN c.status = 'maintenance' THEN 'maintenance' ELSE 'available' END,
  'Initial unit automatically created during multi-unit migration'
FROM public.cars c
WHERE NOT EXISTS (
  SELECT 1 FROM public.car_units u WHERE u.car_id = c.id
);

-- 3b. Backfill unit_id ONLY for existing confirmed and completed bookings
-- (Pending, cancelled, and rejected bookings remain NULL)
UPDATE public.bookings b
SET unit_id = (
  SELECT u.id 
  FROM public.car_units u 
  WHERE u.car_id = b.car_id 
  ORDER BY u.created_at ASC 
  LIMIT 1
)
WHERE b.status IN ('confirmed', 'completed')
  AND b.unit_id IS NULL;

-- -----------------------------------------------------------------------------
-- 4. EXCLUSION CONSTRAINTS ON 'bookings'
-- -----------------------------------------------------------------------------
-- Remove old car-level exclusion constraint so multiple units of the same model can be booked
ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS no_overlapping_confirmed_bookings;

-- Remove unit-level constraint if previously created to allow clean re-runs
ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS no_overlapping_confirmed_units;

-- Add unit-level exclusion constraint: no overlapping confirmed bookings per physical unit
ALTER TABLE public.bookings 
  ADD CONSTRAINT no_overlapping_confirmed_units 
  EXCLUDE USING gist (
    unit_id WITH =,
    daterange(pickup_date, return_date, '[]') WITH &&
  ) 
  WHERE (status = 'confirmed' AND unit_id IS NOT NULL);

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY ON 'car_units' (ADMIN-ONLY)
-- -----------------------------------------------------------------------------
ALTER TABLE public.car_units ENABLE ROW LEVEL SECURITY;

-- Drop any public/anon access policies
DROP POLICY IF EXISTS "Public can view car_units" ON public.car_units;
DROP POLICY IF EXISTS "Anon can view car_units" ON public.car_units;
DROP POLICY IF EXISTS "Admins have full access to car_units" ON public.car_units;

-- Only authenticated administrators have access to car_units (plates & notes are internal)
CREATE POLICY "Admins have full access to car_units"
  ON public.car_units
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. TRIGGERS
-- -----------------------------------------------------------------------------

-- 6a. TRANSITION SAFETY TRIGGER:
-- When a booking becomes 'confirmed' and unit_id is NULL (e.g. from older code still live),
-- automatically assign the first free available unit for those dates, or raise an error.
CREATE OR REPLACE FUNCTION public.trg_auto_assign_unit_on_confirm()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_free_unit_id uuid;
BEGIN
  -- 1. If the parent car listing is being deleted (or does not exist), do nothing
  IF NOT EXISTS (SELECT 1 FROM public.cars WHERE id = NEW.car_id) THEN
    RETURN NEW;
  END IF;

  -- 2. Only auto-assign when status transitions to 'confirmed' (from non-confirmed)
  -- or on INSERT of a confirmed booking with NULL unit_id.
  -- Do NOT trigger when an already-confirmed booking has its unit_id set to NULL by a CASCADE delete.
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed' AND NEW.unit_id IS NULL)
     OR (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'confirmed') AND NEW.status = 'confirmed' AND NEW.unit_id IS NULL) THEN

    SELECT u.id INTO v_free_unit_id
    FROM public.car_units u
    WHERE u.car_id = NEW.car_id
      AND u.status = 'available'
      AND NOT EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.unit_id = u.id
          AND b.status = 'confirmed'
          AND (NEW.id IS NULL OR b.id != NEW.id)
          AND b.pickup_date <= NEW.return_date
          AND b.return_date >= NEW.pickup_date
      )
    ORDER BY u.created_at ASC, u.plate_number ASC
    LIMIT 1;

    IF v_free_unit_id IS NULL THEN
      RAISE EXCEPTION 'Cannot confirm reservation: No free units are available for this vehicle model between % and %.',
        NEW.pickup_date, NEW.return_date;
    END IF;

    NEW.unit_id := v_free_unit_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_auto_assign_unit ON public.bookings;
CREATE TRIGGER trg_bookings_auto_assign_unit
  BEFORE INSERT OR UPDATE OF status, unit_id, car_id, pickup_date, return_date
  ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_auto_assign_unit_on_confirm();

-- 6b. UNIT DELETION SAFETY TRIGGER:
-- Prevent deleting a unit if it has active or upcoming confirmed bookings.
-- Deleting the entire car listing still cascades and succeeds.
CREATE OR REPLACE FUNCTION public.trg_prevent_unit_deletion_with_active_bookings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today date := (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date;
  v_active_count integer;
BEGIN
  -- Only enforce if the parent car listing still exists (i.e. not cascading from a whole car deletion)
  IF EXISTS (SELECT 1 FROM public.cars WHERE id = OLD.car_id) THEN
    SELECT count(*) INTO v_active_count
    FROM public.bookings b
    WHERE b.unit_id = OLD.id
      AND b.status = 'confirmed'
      AND b.return_date >= v_today;

    IF v_active_count > 0 THEN
      RAISE EXCEPTION 'Cannot delete unit "%": It has active or upcoming confirmed reservations (% found). Please set the unit status to "maintenance" instead.',
        OLD.plate_number, v_active_count;
    END IF;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_car_units_prevent_delete_with_active_bookings ON public.car_units;
CREATE TRIGGER trg_car_units_prevent_delete_with_active_bookings
  BEFORE DELETE ON public.car_units
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_prevent_unit_deletion_with_active_bookings();

-- -----------------------------------------------------------------------------
-- 7. DROP PREVIOUS FUNCTION SIGNATURES TO PREVENT SIGNATURE CONFLICTS
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_available_units(uuid, date, date);
DROP FUNCTION IF EXISTS public.get_available_units(uuid, date, date, uuid);
DROP FUNCTION IF EXISTS public.confirm_booking(uuid);
DROP FUNCTION IF EXISTS public.confirm_booking(uuid, uuid);
DROP FUNCTION IF EXISTS public.change_booking_unit(uuid, uuid);
DROP FUNCTION IF EXISTS public.block_car_dates(uuid, date, date, text);
DROP FUNCTION IF EXISTS public.block_car_dates(uuid, date, date, text, numeric);
DROP FUNCTION IF EXISTS public.block_car_dates(uuid, date, date, text, numeric, uuid);
DROP FUNCTION IF EXISTS public.get_unavailable_ranges(uuid);
DROP FUNCTION IF EXISTS public.get_available_cars(date, date, boolean);
DROP FUNCTION IF EXISTS public.get_cars_rented_today();
DROP FUNCTION IF EXISTS public.create_booking(uuid, date, text, date, text, text, text, text, text, text, text, text, text, jsonb, text);

-- -----------------------------------------------------------------------------
-- 8. ADMIN RPC: get_available_units (ADMIN-ONLY)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_available_units(
  p_car_id uuid,
  p_pickup_date date,
  p_return_date date,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  car_id uuid,
  plate_number text,
  color text,
  status text,
  notes text,
  is_free boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can view vehicle units.';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.car_id,
    u.plate_number,
    u.color,
    u.status,
    u.notes,
    (
      u.status = 'available'
      AND NOT EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.unit_id = u.id
          AND b.status = 'confirmed'
          AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
          AND b.pickup_date <= p_return_date
          AND b.return_date >= p_pickup_date
      )
    ) AS is_free
  FROM public.car_units u
  WHERE u.car_id = p_car_id
  ORDER BY is_free DESC, u.plate_number ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_available_units(uuid, date, date, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_available_units(uuid, date, date, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 9. ADMIN RPC: confirm_booking (ADMIN-ONLY)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_booking(
  p_booking_id uuid,
  p_unit_id uuid DEFAULT NULL
)
RETURNS TABLE (
  booking_id uuid,
  assigned_unit_id uuid,
  plate_number text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_chosen_unit_id uuid := p_unit_id;
  v_chosen_unit public.car_units%ROWTYPE;
  v_overlap_count integer;
BEGIN
  -- 1. Security check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can confirm reservations.';
  END IF;

  -- 2. Fetch booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking with ID % not found.', p_booking_id;
  END IF;

  -- 3. Only pending bookings can be confirmed
  IF v_booking.status != 'pending' THEN
    RAISE EXCEPTION 'Only pending reservations can be confirmed. Current status is "%".', v_booking.status;
  END IF;

  -- 4. Assign specific unit or auto-select first free available unit
  IF v_chosen_unit_id IS NOT NULL THEN
    SELECT * INTO v_chosen_unit
    FROM public.car_units
    WHERE id = v_chosen_unit_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Unit with ID % not found.', v_chosen_unit_id;
    END IF;

    IF v_chosen_unit.car_id != v_booking.car_id THEN
      RAISE EXCEPTION 'Selected unit does not belong to the reserved vehicle model.';
    END IF;

    IF v_chosen_unit.status != 'available' THEN
      RAISE EXCEPTION 'Selected unit "%" is currently in maintenance and cannot be assigned.', v_chosen_unit.plate_number;
    END IF;

    -- Check overlap for this specific unit
    SELECT count(*) INTO v_overlap_count
    FROM public.bookings b
    WHERE b.unit_id = v_chosen_unit_id
      AND b.status = 'confirmed'
      AND b.id != v_booking.id
      AND b.pickup_date <= v_booking.return_date
      AND b.return_date >= v_booking.pickup_date;

    IF v_overlap_count > 0 THEN
      RAISE EXCEPTION 'Selected unit "%" already has a confirmed booking overlapping these dates.', v_chosen_unit.plate_number;
    END IF;
  ELSE
    SELECT * INTO v_chosen_unit
    FROM public.car_units u
    WHERE u.car_id = v_booking.car_id
      AND u.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.unit_id = u.id
          AND b.status = 'confirmed'
          AND b.id != v_booking.id
          AND b.pickup_date <= v_booking.return_date
          AND b.return_date >= v_booking.pickup_date
      )
    ORDER BY u.created_at ASC, u.plate_number ASC
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot confirm reservation: No free units are available for this vehicle model between % and %.',
        v_booking.pickup_date, v_booking.return_date;
    END IF;

    v_chosen_unit_id := v_chosen_unit.id;
  END IF;

  -- 5. Update booking to confirmed with unit_id
  UPDATE public.bookings
  SET 
    status = 'confirmed',
    unit_id = v_chosen_unit_id
  WHERE id = p_booking_id;

  RETURN QUERY
  SELECT 
    b.id AS booking_id,
    u.id AS assigned_unit_id,
    u.plate_number,
    b.status
  FROM public.bookings b
  JOIN public.car_units u ON u.id = b.unit_id
  WHERE b.id = p_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_booking(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_booking(uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 10. ADMIN RPC: change_booking_unit (ADMIN-ONLY)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.change_booking_unit(
  p_booking_id uuid,
  p_new_unit_id uuid
)
RETURNS TABLE (
  booking_id uuid,
  assigned_unit_id uuid,
  plate_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_booking public.bookings%ROWTYPE;
  v_new_unit public.car_units%ROWTYPE;
  v_overlap_count integer;
BEGIN
  -- 1. Security check
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change assigned vehicle units.';
  END IF;

  -- 2. Fetch booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking with ID % not found.', p_booking_id;
  END IF;

  IF v_booking.status != 'confirmed' THEN
    RAISE EXCEPTION 'Units can only be changed for confirmed bookings. Current status is "%".', v_booking.status;
  END IF;

  -- 3. Fetch new unit
  SELECT * INTO v_new_unit
  FROM public.car_units
  WHERE id = p_new_unit_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unit with ID % not found.', p_new_unit_id;
  END IF;

  IF v_new_unit.car_id != v_booking.car_id THEN
    RAISE EXCEPTION 'Selected unit does not belong to the reserved vehicle model.';
  END IF;

  IF v_new_unit.status != 'available' THEN
    RAISE EXCEPTION 'Unit "%" is currently marked as maintenance and cannot be assigned.', v_new_unit.plate_number;
  END IF;

  -- 4. Check overlap for the new unit (excluding this booking)
  SELECT count(*) INTO v_overlap_count
  FROM public.bookings b
  WHERE b.unit_id = p_new_unit_id
    AND b.status = 'confirmed'
    AND b.id != v_booking.id
    AND b.pickup_date <= v_booking.return_date
    AND b.return_date >= v_booking.pickup_date;

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Unit "%" is already booked for overlapping dates.', v_new_unit.plate_number;
  END IF;

  -- 5. Update unit
  UPDATE public.bookings
  SET unit_id = p_new_unit_id
  WHERE id = p_booking_id;

  RETURN QUERY
  SELECT 
    b.id AS booking_id,
    u.id AS assigned_unit_id,
    u.plate_number
  FROM public.bookings b
  JOIN public.car_units u ON u.id = b.unit_id
  WHERE b.id = p_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.change_booking_unit(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.change_booking_unit(uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 11. ADMIN RPC: block_car_dates (ADMIN-ONLY)
-- Backward-compatible with live app (accepts 4, 5, or 6 arguments via defaults)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.block_car_dates(
  p_car_id uuid,
  p_pickup_date date,
  p_return_date date,
  p_notes text DEFAULT NULL,
  p_amount_received numeric DEFAULT 0,
  p_unit_id uuid DEFAULT NULL
)
RETURNS TABLE (
  booking_id uuid,
  reference_code text,
  assigned_unit_id uuid,
  plate_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_car public.cars%ROWTYPE;
  v_reference_code text;
  v_booking_id uuid;
  v_chosen_unit_id uuid := p_unit_id;
  v_chosen_unit public.car_units%ROWTYPE;
  v_overlap_count integer;
BEGIN
  -- Require administrator privileges
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can manually block vehicle dates.';
  END IF;

  SELECT * INTO v_car FROM public.cars WHERE id = p_car_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle was not found.';
  END IF;

  IF p_pickup_date IS NULL OR p_return_date IS NULL THEN
    RAISE EXCEPTION 'Pickup date and return date are required.';
  END IF;

  IF p_return_date < p_pickup_date THEN
    RAISE EXCEPTION 'Return date must be on or after pickup date.';
  END IF;

  -- Unit validation or auto-assignment
  IF v_chosen_unit_id IS NOT NULL THEN
    SELECT * INTO v_chosen_unit FROM public.car_units WHERE id = v_chosen_unit_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Unit with ID % was not found.', v_chosen_unit_id;
    END IF;
    IF v_chosen_unit.car_id != p_car_id THEN
      RAISE EXCEPTION 'Selected unit does not belong to this vehicle listing.';
    END IF;
    IF v_chosen_unit.status != 'available' THEN
      RAISE EXCEPTION 'Selected unit "%" is currently in maintenance and cannot be blocked.', v_chosen_unit.plate_number;
    END IF;

    SELECT count(*) INTO v_overlap_count
    FROM public.bookings b
    WHERE b.unit_id = v_chosen_unit_id
      AND b.status = 'confirmed'
      AND b.pickup_date <= p_return_date
      AND b.return_date >= p_pickup_date;

    IF v_overlap_count > 0 THEN
      RAISE EXCEPTION 'Cannot block dates: Unit "%" already has a confirmed booking overlapping with % to %.',
        v_chosen_unit.plate_number, p_pickup_date, p_return_date;
    END IF;
  ELSE
    -- Auto-select the first free available unit for these dates
    SELECT * INTO v_chosen_unit
    FROM public.car_units u
    WHERE u.car_id = p_car_id
      AND u.status = 'available'
      AND NOT EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.unit_id = u.id
          AND b.status = 'confirmed'
          AND b.pickup_date <= p_return_date
          AND b.return_date >= p_pickup_date
      )
    ORDER BY u.created_at ASC, u.plate_number ASC
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cannot block dates: All units of this vehicle model already have confirmed bookings overlapping with % to %.',
        p_pickup_date, p_return_date;
    END IF;

    v_chosen_unit_id := v_chosen_unit.id;
  END IF;

  -- Generate Reference Code: BLK-XXXXXX (matches current live Blocks tab identifier)
  LOOP
    v_reference_code := 'BLK-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.bookings b WHERE b.reference_code = v_reference_code
    );
  END LOOP;

  INSERT INTO public.bookings (
    reference_code,
    car_id,
    unit_id,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_country,
    pickup_date,
    pickup_time,
    return_date,
    return_time,
    pickup_place,
    return_place,
    delivery_fee,
    total_price,
    deposit_amount,
    status,
    notes
  ) VALUES (
    v_reference_code,
    p_car_id,
    v_chosen_unit_id,
    auth.uid(),
    'Manual Block',
    'Walk-in / Phone',
    NULL,
    'Morocco',
    p_pickup_date,
    '10:00',
    p_return_date,
    '10:00',
    'Downtown Agency',
    'Downtown Agency',
    0,
    COALESCE(p_amount_received, 0),
    0,
    'confirmed',
    COALESCE(NULLIF(trim(p_notes), ''), 'Walk-in / Phone rental manual block')
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY
  SELECT 
    b.id AS booking_id,
    b.reference_code,
    u.id AS assigned_unit_id,
    u.plate_number
  FROM public.bookings b
  JOIN public.car_units u ON u.id = b.unit_id
  WHERE b.id = v_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.block_car_dates(uuid, date, date, text, numeric, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_car_dates(uuid, date, date, text, numeric, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 12. PUBLIC RPC: get_unavailable_ranges (ANON & AUTHENTICATED)
-- Returns ranges only when ALL available units are booked.
-- Counts only bookings on available units (or legacy bookings with no unit yet).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_unavailable_ranges(
  p_car_id uuid
)
RETURNS TABLE (
  pickup_date date,
  return_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_car public.cars%ROWTYPE;
  v_available_units_count integer;
  v_today date := (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date;
BEGIN
  -- 1. Check car existence and status
  SELECT * INTO v_car
  FROM public.cars
  WHERE id = p_car_id;

  IF NOT FOUND OR v_car.status IN ('maintenance', 'hidden') THEN
    -- If listing is under maintenance or hidden, whole calendar is blocked
    RETURN QUERY
    SELECT v_today AS pickup_date, (v_today + interval '2 years')::date AS return_date;
    RETURN;
  END IF;

  -- 2. Count active units for this car model
  SELECT count(*) INTO v_available_units_count
  FROM public.car_units u
  WHERE u.car_id = p_car_id
    AND u.status = 'available';

  -- If 0 available units, vehicle cannot be booked
  IF v_available_units_count = 0 THEN
    RETURN QUERY
    SELECT v_today AS pickup_date, (v_today + interval '2 years')::date AS return_date;
    RETURN;
  END IF;

  -- 3. Return contiguous date ranges where ALL available units are booked
  RETURN QUERY
  WITH booking_days AS (
    SELECT d::date AS b_day, b.id AS booking_id
    FROM public.bookings b
    CROSS JOIN LATERAL generate_series(
      b.pickup_date,
      b.return_date,
      interval '1 day'
    ) AS d
    WHERE b.car_id = p_car_id
      AND b.status = 'confirmed'
      AND b.return_date >= v_today
      AND (
        b.unit_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.car_units u
          WHERE u.id = b.unit_id AND u.status = 'available'
        )
      )
  ),
  daily_booked_units AS (
    SELECT b_day, count(DISTINCT booking_id) AS booked_count
    FROM booking_days
    GROUP BY b_day
    HAVING count(DISTINCT booking_id) >= v_available_units_count
  ),
  grouped_blocked_days AS (
    SELECT 
      b_day,
      b_day - (row_number() OVER (ORDER BY b_day))::integer AS grp
    FROM daily_booked_units
  )
  SELECT 
    min(b_day) AS pickup_date,
    max(b_day) AS return_date
  FROM grouped_blocked_days
  GROUP BY grp
  ORDER BY pickup_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_unavailable_ranges(uuid) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 13. PUBLIC RPC: get_available_cars (ANON & AUTHENTICATED)
-- Treats listing-level 'maintenance' and 'hidden' as unavailable.
-- Evaluates availability based on whether at least 1 unit is free for the range.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_available_cars(
  p_pickup_date date,
  p_return_date date,
  p_include_pending boolean DEFAULT false
)
RETURNS TABLE (
  car_id uuid,
  is_available boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If dates are missing or invalid, treat all non-maintenance, non-hidden vehicles with units as available
  IF p_pickup_date IS NULL OR p_return_date IS NULL OR p_return_date < p_pickup_date THEN
    RETURN QUERY
    SELECT c.id, (
      c.status = 'available' AND EXISTS (
        SELECT 1 FROM public.car_units u WHERE u.car_id = c.id AND u.status = 'available'
      )
    ) AS is_available
    FROM public.cars c
    WHERE c.status != 'hidden';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    c.id AS car_id,
    CASE
      -- Maintenance or hidden listings are unavailable for all dates
      WHEN c.status IN ('maintenance', 'hidden') THEN false
      -- Check if at least one available unit is free for the requested dates
      WHEN (
        (
          SELECT count(*)
          FROM public.car_units u
          WHERE u.car_id = c.id
            AND u.status = 'available'
            AND NOT EXISTS (
              SELECT 1 FROM public.bookings b
              WHERE b.unit_id = u.id
                AND (
                  b.status = 'confirmed'
                  OR (p_include_pending = true AND b.status = 'pending')
                )
                AND b.pickup_date <= p_return_date
                AND b.return_date >= p_pickup_date
            )
        ) - (
          SELECT count(*)
          FROM public.bookings b
          WHERE b.car_id = c.id
            AND b.unit_id IS NULL
            AND (
              b.status = 'confirmed'
              OR (p_include_pending = true AND b.status = 'pending')
            )
            AND b.pickup_date <= p_return_date
            AND b.return_date >= p_pickup_date
        )
      ) > 0 THEN true
      ELSE false
    END AS is_available
  FROM public.cars c
  WHERE c.status != 'hidden';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_cars(date, date, boolean) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 14. PUBLIC RPC: get_cars_rented_today (ANON & AUTHENTICATED)
-- A car model shows as rented today ONLY when ALL of its available units are rented today.
-- Anonymous-safe: returns zero customer or personal data.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_cars_rented_today()
RETURNS TABLE (
  car_id uuid,
  return_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_today date := (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date;
BEGIN
  RETURN QUERY
  WITH available_unit_counts AS (
    SELECT u.car_id, count(*)::integer AS total_units
    FROM public.car_units u
    WHERE u.status = 'available'
    GROUP BY u.car_id
  ),
  rented_today_units AS (
    SELECT 
      b.car_id, 
      count(DISTINCT COALESCE(b.unit_id, b.id))::integer AS rented_units, 
      min(b.return_date) AS earliest_return
    FROM public.bookings b
    WHERE b.status = 'confirmed'
      AND b.pickup_date <= v_today
      AND b.return_date >= v_today
      AND (
        b.unit_id IS NULL
        OR EXISTS (
          SELECT 1 FROM public.car_units u
          WHERE u.id = b.unit_id AND u.status = 'available'
        )
      )
    GROUP BY b.car_id
  )
  SELECT r.car_id, r.earliest_return AS return_date
  FROM rented_today_units r
  JOIN available_unit_counts a ON a.car_id = r.car_id
  JOIN public.cars c ON c.id = r.car_id
  WHERE c.status = 'available'
    AND r.rented_units >= a.total_units;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cars_rented_today() TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 15. PUBLIC RPC: create_booking (ANON & AUTHENTICATED)
-- Rejects booking if all units are booked or in maintenance for the dates.
-- Listing-level 'maintenance' and 'hidden' reject booking immediately.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_booking(
  p_car_id uuid,
  p_pickup_date date,
  p_pickup_time text,
  p_return_date date,
  p_return_time text,
  p_pickup_place text,
  p_return_place text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT NULL,
  p_customer_country text DEFAULT 'Morocco',
  p_pickup_address text DEFAULT NULL,
  p_return_address text DEFAULT NULL,
  p_extras jsonb DEFAULT '[]'::jsonb,
  p_notes text DEFAULT NULL
)
RETURNS TABLE (
  reference_code text,
  total_price numeric,
  deposit_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_car public.cars%ROWTYPE;
  v_days integer;
  v_base_price numeric;
  v_pickup_fee numeric;
  v_return_fee numeric;
  v_delivery_fee numeric;
  v_extras_price numeric := 0;
  v_total_price numeric;
  v_deposit_amount numeric;
  v_reference_code text;
  v_user_id uuid;
  v_free_units_count integer;
  v_unassigned_confirmed_count integer;
BEGIN
  -- 1. Validate Car existence and manual status
  IF p_car_id IS NULL THEN
    RAISE EXCEPTION 'A valid vehicle ID must be specified.';
  END IF;

  SELECT * INTO v_car
  FROM public.cars AS c
  WHERE c.id = p_car_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle with ID % was not found.', p_car_id;
  END IF;

  IF v_car.status IN ('maintenance', 'hidden') THEN
    RAISE EXCEPTION 'Vehicle "% %" is currently not available for reservation.', v_car.make, v_car.model;
  END IF;

  -- 2. Validate Customer Details
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 OR length(p_customer_name) > 100 THEN
    RAISE EXCEPTION 'Please provide a valid full name (2-100 characters).';
  END IF;

  IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 8 OR length(p_customer_phone) > 30 THEN
    RAISE EXCEPTION 'Please provide a valid WhatsApp phone number (minimum 8 digits).';
  END IF;

  -- 3. Validate Dates
  IF p_pickup_date IS NULL OR p_return_date IS NULL THEN
    RAISE EXCEPTION 'Pickup date and return date are required.';
  END IF;

  IF p_pickup_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Pickup date cannot be in the past.';
  END IF;

  IF p_return_date < p_pickup_date THEN
    RAISE EXCEPTION 'Return date must be on or after pickup date.';
  END IF;

  -- 4. Overlap Check across units: Reject if NO free available unit exists for the requested dates
  SELECT count(*) INTO v_free_units_count
  FROM public.car_units u
  WHERE u.car_id = p_car_id
    AND u.status = 'available'
    AND NOT EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.unit_id = u.id
        AND b.status = 'confirmed'
        AND b.pickup_date <= p_return_date
        AND b.return_date >= p_pickup_date
    );

  SELECT count(*) INTO v_unassigned_confirmed_count
  FROM public.bookings b
  WHERE b.car_id = p_car_id
    AND b.unit_id IS NULL
    AND b.status = 'confirmed'
    AND b.pickup_date <= p_return_date
    AND b.return_date >= p_pickup_date;

  IF (v_free_units_count - v_unassigned_confirmed_count) <= 0 THEN
    RAISE EXCEPTION 'This vehicle is not available for the selected dates (all units are booked or in maintenance). Please choose different dates.';
  END IF;

  -- 5. Calculate Duration in Days (min 1 day)
  v_days := GREATEST(1, (p_return_date - p_pickup_date));

  -- 6. Calculate Base Price
  v_base_price := v_car.price_per_day * v_days;

  -- 7. Calculate Delivery Fees based on location
  v_pickup_fee := public.get_location_delivery_fee(p_pickup_place);
  v_return_fee := public.get_location_delivery_fee(p_return_place);
  v_delivery_fee := v_pickup_fee + v_return_fee;

  -- 8. Calculate Extras Price from JSONB array
  IF p_extras IS NOT NULL AND jsonb_typeof(p_extras) = 'array' THEN
    SELECT COALESCE(SUM(
      CASE
        WHEN COALESCE((elem->>'per_day')::boolean, (elem->>'perDay')::boolean, false) = true THEN
          COALESCE((elem->>'price')::numeric, 0) * v_days
        ELSE
          COALESCE((elem->>'price')::numeric, (elem->>'cost')::numeric, 0)
      END
    ), 0)
    INTO v_extras_price
    FROM jsonb_array_elements(p_extras) AS elem;
  END IF;

  -- 9. Compute Total Price & Deposit
  v_total_price := v_base_price + v_delivery_fee + v_extras_price;
  v_deposit_amount := COALESCE(v_car.deposit_amount, 3000);

  -- 10. Resolve Authenticated User (NULL for guest bookings)
  v_user_id := auth.uid();

  -- 11. Generate Unique Reference Code (RL-XXXXXX)
  LOOP
    v_reference_code := 'RL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 
      FROM public.bookings AS b 
      WHERE b.reference_code = v_reference_code
    );
  END LOOP;

  -- 12. Insert Pending Booking (unit_id remains NULL until confirmed)
  INSERT INTO public.bookings (
    reference_code,
    car_id,
    unit_id,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    customer_country,
    pickup_date,
    pickup_time,
    return_date,
    return_time,
    pickup_place,
    return_place,
    pickup_address,
    return_address,
    extras,
    delivery_fee,
    total_price,
    deposit_amount,
    status,
    notes
  ) VALUES (
    v_reference_code,
    p_car_id,
    NULL,
    v_user_id,
    trim(p_customer_name),
    trim(p_customer_phone),
    NULLIF(trim(p_customer_email), ''),
    COALESCE(NULLIF(trim(p_customer_country), ''), 'Morocco'),
    p_pickup_date,
    COALESCE(NULLIF(trim(p_pickup_time), ''), '10:00'),
    p_return_date,
    COALESCE(NULLIF(trim(p_return_time), ''), '10:00'),
    p_pickup_place,
    p_return_place,
    NULLIF(trim(p_pickup_address), ''),
    NULLIF(trim(p_return_address), ''),
    COALESCE(p_extras, '[]'::jsonb),
    v_delivery_fee,
    v_total_price,
    v_deposit_amount,
    'pending',
    NULLIF(trim(p_notes), '')
  );

  reference_code := v_reference_code;
  total_price := v_total_price;
  deposit_amount := v_deposit_amount;
  RETURN NEXT;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking TO anon, authenticated;

COMMIT;
