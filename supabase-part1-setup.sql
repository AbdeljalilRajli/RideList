-- =============================================================================
-- RIDELIST PART 1: SUPABASE SCHEMA, RLS POLICIES & SEED DATA
-- =============================================================================

-- 1. Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 2. Create the 'admins' table
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Enable RLS on admins
alter table public.admins enable row level security;

-- Drop existing policies if any to allow safe re-runs
drop policy if exists "Allow user to check their own admin status" on public.admins;
drop policy if exists "Admins can view admins list" on public.admins;

-- Policy: Authenticated users can check if they themselves are an admin
create policy "Allow user to check their own admin status"
on public.admins
for select
to authenticated
using (auth.uid() = user_id);

-- Helper function to check if current user is an admin without RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- 3. Link existing admin user to admins table (replace with your admin email)
insert into public.admins (user_id, email)
select id, email
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (user_id) do nothing;

-- 4. Create the 'cars' table
create table if not exists public.cars (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  year integer not null,
  class text not null,
  fuel_type text not null,
  transmission text not null,
  seats integer not null default 5,
  color text,
  price_per_day numeric not null,            -- Price in MAD (DH)
  deposit_amount numeric not null default 0, -- Deposit in MAD (DH)
  km_policy text not null default 'Unlimited',
  status text not null default 'available' check (status in ('available', 'rented', 'maintenance', 'hidden')),
  images text[] not null default '{}',
  city_mpg numeric,
  highway_mpg numeric,
  combination_mpg numeric,
  cylinders integer,
  displacement numeric,
  drive text,
  created_at timestamptz not null default now()
);

-- Enable RLS on cars
alter table public.cars enable row level security;

-- Drop existing policies on cars if any
drop policy if exists "Public can view non-hidden cars" on public.cars;
drop policy if exists "Admins have full access to cars" on public.cars;

-- Public can SELECT cars that are NOT hidden
create policy "Public can view non-hidden cars"
on public.cars
for select
to anon, authenticated
using (status != 'hidden');

-- Admins have full access (SELECT, INSERT, UPDATE, DELETE)
create policy "Admins have full access to cars"
on public.cars
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 5. Seed initial 26 cars (Runs only if table is currently empty to prevent duplicates)
do $$
begin
  if not exists (select 1 from public.cars limit 1) then
    insert into public.cars (
      make, model, year, class, fuel_type, transmission, seats, color,
      price_per_day, deposit_amount, km_policy, status, images,
      city_mpg, highway_mpg, combination_mpg, cylinders, displacement, drive
    ) values
      ('Honda', 'Civic', 2024, 'compact car', 'gas', 'a', 5, 'Silver', 450, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Honda Civic.webp'], 32, 42, 35, 4, 2, 'fwd'),
      ('Honda', 'Accord Hybrid', 2024, 'midsize car', 'hybrid', 'a', 5, 'White', 550, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Honda Accord Hybrid.webp'], 48, 48, 48, 4, 2, 'fwd'),
      ('Honda', 'CR-V', 2023, 'compact SUV', 'gas', 'a', 5, 'Black', 650, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Honda CR-V.webp'], 28, 34, 30, 4, 1.5, 'awd'),
      ('Honda', 'CR-V Hybrid', 2024, 'compact SUV', 'hybrid', 'a', 5, 'Blue', 700, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Honda CR-V Hybrid.webp'], 40, 35, 38, 4, 2, 'awd'),
      ('Toyota', 'Corolla', 2024, 'compact car', 'gas', 'a', 5, 'Red', 420, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Toyota Corolla.webp'], 31, 40, 32, 4, 2, 'fwd'),
      ('Toyota', 'Camry Hybrid', 2024, 'midsize car', 'hybrid', 'a', 5, 'Gray', 580, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Toyota Camry Hybrid.webp'], 51, 53, 53, 4, 2.5, 'fwd'),
      ('Toyota', 'Prius', 2024, 'compact car', 'hybrid', 'a', 5, 'Green', 500, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Toyota Prius.webp'], 57, 56, 56, 4, 1.8, 'fwd'),
      ('Toyota', 'RAV4', 2023, 'midsize SUV', 'gas', 'a', 5, 'White', 680, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Toyota RAV4.webp'], 27, 35, 29, 4, 2.5, 'awd'),
      ('Tesla', 'Model 3', 2024, 'midsize car', 'electricity', 'a', 5, 'White', 850, 5000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Tesla Model 3.webp'], 134, 126, 132, null, null, 'rwd'),
      ('Tesla', 'Model S', 2024, 'large car', 'electricity', 'a', 5, 'Black', 1200, 5000, '250 km/day', 'available', ARRAY['/ridelist cars images/Tesla Model S.webp'], 120, 109, 115, null, null, 'awd'),
      ('Tesla', 'Model Y', 2024, 'midsize SUV', 'electricity', 'a', 7, 'Blue', 950, 5000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Tesla Model Y.webp'], 125, 112, 120, null, null, 'awd'),
      ('BMW', '3 Series', 2024, 'compact car', 'gas', 'a', 5, 'Silver', 750, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/BMW 3 Series.webp'], 26, 36, 30, 4, 2, 'rwd'),
      ('BMW', 'X3', 2023, 'midsize SUV', 'gas', 'a', 5, 'Black', 850, 5000, '250 km/day', 'available', ARRAY['/ridelist cars images/BMW X3.webp'], 23, 30, 26, 4, 2, 'awd'),
      ('BMW', 'iX', 2024, 'midsize SUV', 'electricity', 'a', 5, 'White', 1100, 5000, 'Unlimited', 'available', ARRAY['/ridelist cars images/BMW iX.webp'], 113, 105, 109, null, null, 'awd'),
      ('Mercedes-Benz', 'A-Class', 2023, 'compact car', 'gas', 'a', 5, 'Silver', 700, 3000, 'Unlimited', 'rented', ARRAY['/ridelist cars images/Mercedes-Benz A-Class.webp'], 24, 35, 28, 4, 2, 'fwd'),
      ('Mercedes-Benz', 'GLE', 2024, 'midsize SUV', 'gas', 'a', 7, 'Black', 950, 5000, '250 km/day', 'available', ARRAY['/ridelist cars images/Mercedes-Benz GLE.webp'], 21, 28, 25, 6, 3, 'awd'),
      ('Audi', 'A4', 2024, 'compact car', 'gas', 'a', 5, 'Gray', 720, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Audi A4.webp'], 25, 34, 29, 4, 2, 'awd'),
      ('Audi', 'Q5', 2023, 'compact SUV', 'gas', 'a', 5, 'White', 800, 5000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Audi Q5.webp'], 22, 31, 26, 4, 2, 'awd'),
      ('Ford', 'Fusion', 2023, 'midsize car', 'gas', 'a', 5, 'Blue', 480, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Ford Fusion.webp'], 23, 34, 26, 4, 1.5, 'fwd'),
      ('Ford', 'Mustang Mach-E', 2024, 'midsize SUV', 'electricity', 'a', 5, 'Red', 900, 5000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Ford Mustang Mach-E.webp'], 126, 89, 105, null, null, 'awd'),
      ('Chevrolet', 'Malibu', 2023, 'compact car', 'gas', 'a', 5, 'Silver', 460, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Chevrolet Malibu.webp'], 29, 38, 32, 4, 1.4, 'fwd'),
      ('Chevrolet', 'Bolt EV', 2024, 'compact car', 'electricity', 'a', 5, 'Green', 550, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Chevrolet Bolt EV.webp'], 120, 108, 113, null, null, 'fwd'),
      ('Nissan', 'Altima', 2023, 'compact car', 'gas', 'a', 5, 'White', 470, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Nissan Altima.webp'], 29, 39, 32, 4, 2, 'fwd'),
      ('Nissan', 'Leaf', 2024, 'compact car', 'electricity', 'a', 5, 'Blue', 520, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Nissan Leaf.webp'], 104, 113, 108, null, null, 'fwd'),
      ('Hyundai', 'Elantra', 2024, 'compact car', 'gas', 'a', 5, 'Red', 440, 3000, '250 km/day', 'available', ARRAY['/ridelist cars images/Hyundai Elantra.webp'], 33, 41, 37, 4, 2, 'fwd'),
      ('Hyundai', 'Kona Electric', 2024, 'compact SUV', 'electricity', 'a', 5, 'Orange', 620, 3000, 'Unlimited', 'available', ARRAY['/ridelist cars images/Hyundai Kona Electric.webp'], 114, 94, 104, null, null, 'awd');
  end if;
end $$;
