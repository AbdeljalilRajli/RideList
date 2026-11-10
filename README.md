# RideList 🚗

Welcome to **RideList**, a modern, Morocco-tailored car rental platform built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

Featuring transparent pricing in Moroccan Dirhams (MAD / DH), WhatsApp confirmation handshakes, guest & customer booking flows, live booking tracking, client self-service cancellation, and a comprehensive admin management portal with double-booking prevention.

---

## ✨ Key Features

### 🇲🇦 **Morocco-Tailored Rental Flow**
- **Transparent MAD Pricing**: All rates, delivery fees, and caution deposits displayed clearly in Moroccan Dirhams (DH).
- **Locations & Delivery**: Pickup/return at Downtown Agency, Casablanca Mohammed V Airport (CMN), Casa-Voyageurs Train Station, or custom Hotel/Address delivery with configurable fees.
- **WhatsApp Integration**: Instant 1-click confirmation handshake with the agency pre-filled with reservation code, car details, dates, and locations.
- **Pay at Pickup**: Transparent cash/card payment upon vehicle handover; clear reminders for required driver documents (Passport/ID & Driving License).

### 🔐 **Authentication & Security**
- **Supabase Auth**: Email & password authentication with confirmation flow.
- **Optional Customer Accounts**: Guests can book immediately without creating an account; registered users get prefilled details and a dedicated self-service dashboard (`/dashboard`).
- **Post-Confirmation Booking Linking**: Automatically links historical guest bookings to customer accounts after email confirmation.
- **Strict Role-Based Security**: Admin routes (`/admin`) are restricted to verified administrators registered in the `admins` table. Anonymous and standard users cannot access admin pages or read other users' reservations.

### 🚗 **Fleet & Inventory Management**
- **Supabase Storage**: High-resolution vehicle photos compressed to WebP and securely stored in the `car-images` storage bucket.
- **Live Vehicle Status**: Instant toggle between `Available`, `Rented`, `Maintenance`, and `Hidden`.
- **Search & Filter**: Filter by vehicle category, transmission, fuel type, and price.

### 📅 **Reservations & Double-Booking Protection**
- **PostgreSQL Exclusion Constraints**: Date-range overlap prevention (`btree_gist`) ensures confirmed bookings for the same vehicle can never overlap.
- **Server-Side Price Validation**: PostgreSQL triggers automatically compute and enforce total prices.
- **Admin Booking Desk**: Real-time reservation table with status filtering, customer details, status updates (confirm, reject, complete, cancel), and direct WhatsApp customer contact buttons.
- **Guest Tracking**: Public `/track` portal allows guests to track their booking status in real-time using their Reference Code and Phone/Email.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Row-Level Security, Storage Buckets)
- **Styling**: Tailwind CSS & Lucide Icons
- **Language**: TypeScript

---

## ⚙️ Environment Variables

Create a `.env.local` file in your root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Agency WhatsApp Number (Morocco country code + number without +, e.g. 2126XXXXXXXX)
NEXT_PUBLIC_AGENCY_WHATSAPP=212600000000
```

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.
