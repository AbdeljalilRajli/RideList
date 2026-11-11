-- =============================================================================
-- RIDELIST PART 3: VEHICLE AVAILABILITY RPC FUNCTION (SECURITY DEFINER)
-- Enables public date-range availability checks without exposing the bookings table
-- =============================================================================

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
  -- If dates are missing or invalid, treat all non-hidden vehicles as available
  IF p_pickup_date IS NULL OR p_return_date IS NULL OR p_return_date < p_pickup_date THEN
    RETURN QUERY
    SELECT c.id, true
    FROM public.cars c
    WHERE c.status != 'hidden';
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    c.id AS car_id,
    CASE
      -- Vehicles in 'rented' or 'maintenance' status are unavailable
      WHEN c.status != 'available' THEN false
      -- Check if there is an overlapping booking on the same vehicle
      WHEN EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE b.car_id = c.id
          AND (
            b.status = 'confirmed'
            OR (p_include_pending = true AND b.status = 'pending')
          )
          AND b.pickup_date <= p_return_date
          AND b.return_date >= p_pickup_date
      ) THEN false
      ELSE true
    END AS is_available
  FROM public.cars c
  WHERE c.status != 'hidden';
END;
$$;

-- Grant execution to anon and authenticated clients
GRANT EXECUTE ON FUNCTION public.get_available_cars(date, date, boolean) TO anon, authenticated;
