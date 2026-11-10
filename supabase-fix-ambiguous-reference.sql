-- =============================================================================
-- FIX: Eliminate ambiguous 'reference_code' variable conflict in create_booking
-- Run this in the Supabase SQL Editor
-- =============================================================================

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
BEGIN
  -- 1. Validate Car existence and availability
  IF p_car_id IS NULL THEN
    RAISE EXCEPTION 'A valid vehicle ID must be specified.';
  END IF;

  SELECT * INTO v_car
  FROM public.cars AS c
  WHERE c.id = p_car_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle with ID % was not found.', p_car_id;
  END IF;

  IF v_car.status != 'available' THEN
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

  -- 4. Calculate Duration in Days (min 1 day)
  v_days := GREATEST(1, (p_return_date - p_pickup_date));

  -- 5. Calculate Base Price
  v_base_price := v_car.price_per_day * v_days;

  -- 6. Calculate Delivery Fees based on location
  v_pickup_fee := public.get_location_delivery_fee(p_pickup_place);
  v_return_fee := public.get_location_delivery_fee(p_return_place);
  v_delivery_fee := v_pickup_fee + v_return_fee;

  -- 7. Calculate Extras Price from JSONB array
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

  -- 8. Compute Total Price & Deposit
  v_total_price := v_base_price + v_delivery_fee + v_extras_price;
  v_deposit_amount := COALESCE(v_car.deposit_amount, 3000);

  -- 9. Resolve Authenticated User (NULL for guest bookings)
  v_user_id := auth.uid();

  -- 10. Generate Unique Reference Code (RL-XXXXXX) with explicit table alias
  LOOP
    v_reference_code := 'RL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    EXIT WHEN NOT EXISTS (
      SELECT 1 
      FROM public.bookings AS b 
      WHERE b.reference_code = v_reference_code
    );
  END LOOP;

  -- 11. Insert Pending Booking
  INSERT INTO public.bookings (
    reference_code,
    car_id,
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

  -- 12. Assign output columns directly (eliminates query planner ambiguity)
  reference_code := v_reference_code;
  total_price := v_total_price;
  deposit_amount := v_deposit_amount;
  RETURN NEXT;
  RETURN;
END;
$$;

-- Ensure execute permissions are active for both anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_booking TO anon, authenticated;
