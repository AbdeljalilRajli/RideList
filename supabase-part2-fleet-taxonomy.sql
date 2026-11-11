-- =============================================================================
-- RIDELIST PART 2: ADDITIVE FLEET TAXONOMY (body_type & segment)
-- =============================================================================
-- Run this in the Supabase SQL Editor.
-- This script is strictly ADDITIVE:
-- 1. Adds 'body_type' with CHECK constraint
-- 2. Adds 'segment' with CHECK constraint
-- 3. Updates all 26 existing vehicles with their approved body_type & segment
-- 4. Keeps the existing 'class' column completely untouched for backward compatibility
-- =============================================================================

-- 1. Add 'body_type' column if not exists
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS body_type text;

-- Add or replace check constraint for body_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_body_type_check'
  ) THEN
    ALTER TABLE public.cars
    ADD CONSTRAINT cars_body_type_check
    CHECK (body_type IS NULL OR body_type IN (
      'sedan', 'hatchback', 'suv', 'minivan', 'pickup', 'convertible', 'coupe', 'van'
    ));
  END IF;
END $$;

-- 2. Add 'segment' column if not exists
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS segment text;

-- Add or replace check constraint for segment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cars_segment_check'
  ) THEN
    ALTER TABLE public.cars
    ADD CONSTRAINT cars_segment_check
    CHECK (segment IS NULL OR segment IN (
      'economy', 'compact', 'midsize', 'fullsize', 'premium', 'luxury'
    ));
  END IF;
END $$;

-- 3. Populate existing cars by ID and by Make/Model
UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = '34b85e8b-dc0f-4c86-aaed-5b61d0721137' OR (make = 'Honda' AND model = 'Accord Hybrid');

UPDATE public.cars SET body_type = 'suv', segment = 'compact'
WHERE id = '86043771-f71f-4826-bcb8-fa7187d60801' OR (make = 'Honda' AND model = 'CR-V' AND model NOT ILIKE '%Hybrid%');

UPDATE public.cars SET body_type = 'suv', segment = 'compact'
WHERE id = 'aaa1ca2d-9303-4b83-83dd-0573d8fd28a7' OR (make = 'Honda' AND model = 'CR-V Hybrid');

UPDATE public.cars SET body_type = 'sedan', segment = 'compact'
WHERE id = 'ecf1851a-3f29-42d7-8f02-6d5dbfbf41b2' OR (make = 'Toyota' AND model = 'Corolla');

UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = 'd46c1379-cc0c-40c1-9b8d-f9dce47731fd' OR (make = 'Toyota' AND model = 'Camry Hybrid');

UPDATE public.cars SET body_type = 'sedan', segment = 'compact'
WHERE id = '660432a7-59e5-4941-a4ba-aa44611f0fa6' OR (make = 'Honda' AND model = 'Civic');

UPDATE public.cars SET body_type = 'hatchback', segment = 'compact'
WHERE id = 'bc722b72-4af1-40cd-8876-9b289cff12cc' OR (make = 'Toyota' AND model = 'Prius');

UPDATE public.cars SET body_type = 'suv', segment = 'compact'
WHERE id = 'a49fd086-c2e7-4bf3-a4ed-4c510ac246b7' OR (make = 'Toyota' AND model = 'RAV4');

UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = 'c6a49c2d-8b20-4a00-851b-a73e4b253d93' OR (make = 'Tesla' AND model = 'Model 3');

UPDATE public.cars SET body_type = 'sedan', segment = 'fullsize'
WHERE id = 'd360e69a-2dc3-40c5-8475-9bba3609afb6' OR (make = 'Tesla' AND model = 'Model S');

UPDATE public.cars SET body_type = 'suv', segment = 'midsize'
WHERE id = 'f548478c-4975-43c6-bb40-b2223f170b2e' OR (make = 'Tesla' AND model = 'Model Y');

UPDATE public.cars SET body_type = 'sedan', segment = 'premium'
WHERE id = '8ee336e6-96d3-4d78-8aa7-386fc8bb8a5d' OR (make = 'BMW' AND model = '3 Series');

UPDATE public.cars SET body_type = 'suv', segment = 'premium'
WHERE id = '17a96e47-06f5-4a82-a533-78d92cd4cfff' OR (make = 'BMW' AND model = 'X3');

UPDATE public.cars SET body_type = 'suv', segment = 'luxury'
WHERE id = 'c4aa16c5-741d-44e4-83ce-43bb7e9b7795' OR (make = 'BMW' AND model = 'iX');

UPDATE public.cars SET body_type = 'hatchback', segment = 'compact'
WHERE id = 'f68513f0-e195-4905-8076-48c6bc3ebfb8' OR (make = 'Mercedes-Benz' AND model = 'A-Class');

UPDATE public.cars SET body_type = 'suv', segment = 'luxury'
WHERE id = 'a438d294-c321-43e2-a2cb-6e598aa1fe9a' OR (make = 'Mercedes-Benz' AND model = 'GLE');

UPDATE public.cars SET body_type = 'sedan', segment = 'premium'
WHERE id = '5259e639-2136-41c0-ad88-b3fd35cd7ae9' OR (make = 'Audi' AND model = 'A4');

UPDATE public.cars SET body_type = 'suv', segment = 'premium'
WHERE id = 'e484ad10-ed06-4daf-8489-bfc6d39ea471' OR (make = 'Audi' AND model = 'Q5');

UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = 'adf848fc-b545-400d-a36d-c85c559d9473' OR (make = 'Ford' AND model = 'Fusion');

UPDATE public.cars SET body_type = 'suv', segment = 'midsize'
WHERE id = '9c071b21-6c96-477e-92da-864e66bc382f' OR (make = 'Ford' AND model = 'Mustang Mach-E');

UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = '4cadeba2-c235-4692-b04c-9ce52241f893' OR (make = 'Chevrolet' AND model = 'Malibu');

UPDATE public.cars SET body_type = 'hatchback', segment = 'compact'
WHERE id = '580f8d2b-9841-4c3c-9c1c-2cbb3d4b6370' OR (make = 'Chevrolet' AND model = 'Bolt EV');

UPDATE public.cars SET body_type = 'sedan', segment = 'midsize'
WHERE id = '965e863b-2a17-448b-80e5-c7aed3f28337' OR (make = 'Nissan' AND model = 'Altima');

UPDATE public.cars SET body_type = 'hatchback', segment = 'compact'
WHERE id = 'e3b5988c-5b18-4183-ad37-080203129d01' OR (make = 'Nissan' AND model = 'Leaf');

UPDATE public.cars SET body_type = 'sedan', segment = 'compact'
WHERE id = '1569023f-53e0-47ba-8ed5-0639ffb44aa0' OR (make = 'Hyundai' AND model = 'Elantra');

UPDATE public.cars SET body_type = 'suv', segment = 'compact'
WHERE id = '85b167fd-6c15-456b-88cb-20572666b33c' OR (make = 'Hyundai' AND model = 'Kona Electric');
