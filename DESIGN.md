# RideList Design System Specification: Editorial Indigo Luxury

Extracted from Stitch Project `RideList` with the active **RideList Brand Palette**.

> **Design Philosophy: Quiet Editorial Luxury & Precision Mobility**
> Generous, serene off-white canvas expanses (`#F8F8FB`) paired with crisp pure white card surfaces (`#FFFFFF`), architectural deep indigo accents (`#1E1B4B`), precise subtle borders (`#E5E7EB`), and deliberate primary indigo focal points (`#3730A3`). Interfaces reject visual noise in favor of sculpted card geometries, soft floating overlays, and high-impact automotive typography.
>
> **Strict Rule**: No yellow or amber is used anywhere. Any yellow, gold, or bright nautical navy from Stitch mocks is strictly replaced by this indigo palette.

---

## 1. Color Palette

### 1.1 Curated Brand & Surface Colors

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `canvas-base` | `#F8F8FB` | Primary page background; cool, serene alabaster off-white providing tranquil, non-glaring grounding. |
| `surface-white` | `#FFFFFF` | Primary card surfaces, modal sheets, search console tiles, and elevated containers. |
| `surface-subtle` | `#F1F1F6` | Low-contrast secondary containers, badge backgrounds, and inactive input states. |
| `surface-accent` | `#EEEDF9` | Subtle indigo-tinted background container for active highlights and soft selected states. |
| `primary-accent` | `#3730A3` | Deep Indigo. The core brand accent used for primary CTAs, active filters, highlighted headline words, numeric prices, and status badges. |
| `primary-accent-hover` | `#312E81` | Hover and pressed state for primary indigo CTAs. |
| `primary-accent-light` | `#4F46E5` | Interactive hover glow and focus rings (`rgba(55, 48, 163, 0.15)`). |
| `deep-contrast` | `#1E1B4B` | Dark Indigo. Used for high-contrast dark banners, midnight feature cards, dark pills, and dark footer modules. |
| `text-headline` / `text-body` | `#0F0F1A` | Inky near-black for headlines, section titles, and primary body copy. |
| `text-secondary` | `#6B7280` | Muted slate for mechanical specs, vehicle subtitles, breadcrumbs, and meta labels. |
| `text-tertiary` | `#9CA3AF` | Quiet metadata, tertiary footnotes, and placeholder text. |
| `border-subtle` | `#E5E7EB` | Hairline borders framing cards, divider segments, and pill containers without harsh gridlines. |

### 1.2 System & Status Colors

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `success` | `#16A34A` | Availability indicators ("Available now"), completed reservation steps, confirmation status. |
| `success-light` | `#DCFCE7` | Background pill for success badges. |
| `error` | `#BA1A1A` | Validation errors, alert notices, cancellation warnings. |
| `error-container` | `#FFDAD6` | Background tint for error alerts. |
| `badge-indigo` | `#EEEDF9` | Background capsule for vehicle class tags and rating chips. |
| `badge-indigo-text`| `#3730A3` | Text color for indigo badges. |

---

## 2. Typography

Primary Typeface: **Plus Jakarta Sans** (Google Fonts / Variable)  
Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Type Scale & Hierarchy

| Scale Token | Font Size | Weight | Line Height | Tracking | Usage |
|---|---|---|---|---|---|
| `display-hero` | `64px` (`4rem`) | ExtraBold (`800`) | `72px` (`1.125`) | `-0.03em` | Desktop hero headlines, marquee titles |
| `display-hero-mobile` | `36px` (`2.25rem`) | ExtraBold (`800`) | `44px` (`1.22`) | `-0.025em` | Mobile hero headlines |
| `headline-lg` | `44px` (`2.75rem`) | ExtraBold (`800`) | `52px` (`1.18`) | `-0.02em` | Section headers, major feature headings |
| `headline-lg-mobile` | `28px` (`1.75rem`) | Bold (`700`) | `36px` (`1.28`) | `-0.015em` | Mobile section headers |
| `headline-md` | `28px` (`1.75rem`) | Bold (`700`) | `36px` (`1.28`) | `-0.02em` | Vehicle names, step titles, card headlines |
| `headline-sm` | `20px` (`1.25rem`) | Bold (`700`) | `28px` (`1.4`) | `-0.01em` | Subsection titles, card group headers |
| `body-lg` | `18px` (`1.125rem`) | Regular (`400`) | `28px` (`1.55`) | `0em` | Hero intro paragraphs, editorial lead copy |
| `body-md` | `15px` (`0.9375rem`) | Regular (`400`) | `24px` (`1.6`) | `0em` | Primary body copy, specifications summary |
| `body-sm` | `13px` (`0.8125rem`) | Regular (`400`) | `20px` (`1.53`) | `0em` | Meta descriptions, terms, helper text |
| `label-lg` | `15px` (`0.9375rem`) | SemiBold (`600`) | `20px` (`1.33`) | `0.01em` | Button text, navigation links, primary CTAs |
| `label-md` | `13px` (`0.8125rem`) | SemiBold (`600`) | `18px` (`1.38`) | `0.02em` | Filter tabs, badge labels, spec values |
| `label-sm` | `11px` (`0.6875rem`) | Bold (`700`) | `16px` (`1.45`) | `+0.06em` | Uppercase kickers, category eyebrow tags |

---

## 3. Spacing, Grid & Layout

### 3.1 Spacing Scale

| Token | REM | Pixels | Usage |
|---|---|---|---|
| `space-xs` | `0.25rem` | `4px` | Micro-gaps between icons and text, inner badge margins |
| `space-sm` | `0.5rem` | `8px` | Gap within pills, vertical spacing between kicker and title |
| `space-md` | `1.0rem` | `16px` | Standard component internal padding, grid gaps on mobile |
| `space-lg` | `1.5rem` | `24px` | Card internal padding, desktop grid gutters |
| `space-xl` | `2.5rem` | `40px` | Space between card groups, form step separation |
| `section-y` | `5.0rem`–`7.5rem` | `80px`–`120px` | Macro vertical section padding on desktop (`48px`–`64px` on mobile) |

### 3.2 Layout & Containers

- **Maximum Content Width**: `1280px` (centered with auto margins).
- **Page Gutters**: `32px` (`2rem`) on desktop; `16px` (`1rem`) on mobile.
- **Grid Structure**:
  - **Desktop (1024px+)**: 12 columns, `24px` gutter. 3 or 4 cards per row for vehicle listings.
  - **Tablet (768px – 1023px)**: 8 columns, `20px` gutter. 2 cards per row.
  - **Mobile (<768px)**: 4 columns, `16px` gutter. Single card full width with horizontal scroll pills.

---

## 4. Border Radius & Shapes

The visual language follows the **"Pill & Sculpted Card"** philosophy:

| Token | Value | Applied Elements |
|---|---|---|
| `rounded-sm` | `8px` (`0.5rem`) | Small thumbnails, compact popovers |
| `rounded-DEFAULT` | `16px` (`1.0rem`) | Inner feature tiles, nested review blocks |
| `rounded-md` | `20px` (`1.25rem`) | Secondary cards, payment summary boxes |
| `rounded-lg` / `rounded-xl` | `24px`–`28px` | Primary vehicle cards, modal panels, checkout flow wrappers |
| `rounded-full` | `9999px` | **All interactive elements**: buttons, search docks, filter chips, rating badges, status indicators, form inputs |

---

## 5. Elevation, Depth & Surfaces

| Level | Style / Definition | Usage |
|---|---|---|
| **Level 0 (Flat)** | Background `#F8F8FB`, `box-shadow: none` | Foundational page canvas. |
| **Level 1 (Card Rest)** | `background: #FFFFFF`, `box-shadow: 0px 8px 24px -4px rgba(15, 15, 26, 0.04)`, `border: 1px solid #E5E7EB` | Standard vehicle card, feature block, booking step container. |
| **Level 2 (Hover / Elevated)** | `box-shadow: 0px 16px 36px -6px rgba(15, 15, 26, 0.08)`, `transform: translateY(-2px)` | Interactive card hover, floating rating badge, dropdown menu. |
| **Level 3 (Floating Console)** | `background: rgba(255, 255, 255, 0.90)`, `backdrop-filter: blur(16px)`, `box-shadow: 0px 20px 40px -10px rgba(15, 15, 26, 0.10)`, `border: 1px solid #E5E7EB` | Sticky top navigation bar, floating search & booking bar. |
| **Dark Inverted Card** | `background: #1E1B4B`, `border: 1px solid rgba(255, 255, 255, 0.10)` (no heavy drop shadow) | Curated fleet dark showcase, VIP membership banner, midnight feature modules. |

---

## 6. Component Style Guide

### 6.1 Buttons

- **Primary Action (Indigo Pill)**:
  - Height: `48px`–`54px`, horizontal padding: `28px` (`px-7`).
  - Background: `#3730A3` (Hover: `#312E81`).
  - Text: `#FFFFFF`, font `label-lg` (`15px`, weight `600`).
  - Icon: Trailing monoline arrow `→` with `translate-x-1` on hover.
  - Geometry: `rounded-full`.
- **Secondary Dark Action (Dark Indigo Pill)**:
  - Background: `#1E1B4B` (Hover: `#17153B`), text `#FFFFFF`, `rounded-full`.
  - Nested circular white/translucent micro-badge with arrow.
- **Tertiary / Outlined**:
  - Background: Transparent or `#FFFFFF`, border `1px solid #E5E7EB`, text `#0F0F1A`, `rounded-full`. Hover: background `#F1F1F6`.
- **Icon Action Buttons**:
  - Circular `44px × 44px`, 1:1 ratio, border `1px solid #E5E7EB`, centered 1.5px stroke icon.

### 6.2 Filter Chips & Pills

- Height: `40px`, padding: `10px 20px`, `rounded-full`.
- **Inactive**: Background `#FFFFFF`, border `1px solid #E5E7EB`, text `#6B7280`, font `label-md`.
- **Active**: Background `#3730A3` with pure white `#FFFFFF` text, or dark indigo `#1E1B4B` with white text.

### 6.3 Vehicle Cards

- Foundation: Pure `#FFFFFF` surface with `24px` radius (`rounded-2xl`).
- Perimeter: Subtle border `1px solid #E5E7EB`.
- Floating Micro-Badges: Absolute positioned frosted pill (e.g. `4.9 ★` with `#3730A3` star or green-dot `Available now`).
- Spec Badges Row: Monoline capsules with border `1px solid #E5E7EB`, background `#F8F8FB`, displaying transmission, passengers, fuel/EV, and horsepower in `#6B7280`.
- Pricing Strip: Daily rate in heavy bold with indigo highlight (e.g., `<span class="text-[#3730A3] font-bold text-2xl">$120</span> <span class="text-[#6B7280] text-sm">/ day</span>`), paired with circular quick-reserve arrow button (`bg-[#3730A3] text-white`).

### 6.4 Search & Booking Console

- Floating segmented capsule bar spanning vehicle class, pickup location, and rental dates.
- Vertical hairline dividers (`#E5E7EB`) separating segments.
- Terminating in a high-contrast indigo `#3730A3` "Search Vehicles" CTA pill with white text.

### 6.5 Form Inputs & Controls

- Container: Height `50px`, padding: `0 20px`, `rounded-full`.
- Background: `#F8F8FB`, border `1px solid #E5E7EB`.
- Focus State: Background `#FFFFFF`, border `1px solid #3730A3`, ambient focus ring `rgba(55, 48, 163, 0.15)`.
- Checkboxes / Radio Buttons: `20px` rounded circles, deep indigo fill (`#3730A3`) with pure white check glyph.

---

## 7. Tailwind CSS Configuration Mapping

```js
// tailwind.config.js snippet
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: '#F8F8FB',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F1F1F6',
          accent: '#EEEDF9',
        },
        navy: {
          deep: '#1E1B4B', // Dark indigo for dark cards & banners
        },
        brand: {
          indigo: '#3730A3', // Primary brand accent for CTAs, badges, prices
          'indigo-hover': '#312E81',
          'indigo-light': '#4F46E5',
          dark: '#1E1B4B',
        },
        ink: {
          primary: '#0F0F1A',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        hairline: '#E5E7EB',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'card-lg': '28px',
      },
      boxShadow: {
        'card': '0px 8px 24px -4px rgba(15, 15, 26, 0.04)',
        'card-hover': '0px 16px 36px -6px rgba(15, 15, 26, 0.08)',
        'dock': '0px 20px 40px -10px rgba(15, 15, 26, 0.10)',
      },
    },
  },
};
```
