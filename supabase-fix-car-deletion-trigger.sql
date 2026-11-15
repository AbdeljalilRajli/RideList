-- =============================================================================
-- FIX: Allow deleting whole car listing with confirmed bookings
--
-- Prevents trg_auto_assign_unit_on_confirm from firing and blocking
-- when a car listing is being deleted (or when ON DELETE SET NULL cascades).
-- =============================================================================

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
