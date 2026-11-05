# RideList Design System Specification: Figma Car Rental Template

Extracted from Figma File `Car-Rental-Figma-Template--Community-` (Key: `CSbP56mdOiKs0lQeTRDeh2`).

> **Design Philosophy: Vibrant Royal Purple & Amber Orange Automotive Rental**
> High-energy, clean and modern visual design featuring deep royal purple (`#5937E0`) paired with vibrant amber orange (`#FFA000`) accents, floating white cards (`#FFFFFF`) with soft drop shadows, rounded pill geometries (`50px` / `full`), and crisp automotive photography.

---

## 1. Color Palette

### 1.1 Brand & Surface Colors

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| `primary` | `#5937E0` | Royal Purple: Main brand color for hero banner, facts banner, newsletter banner, view details buttons, and badges. |
| `primary-hover` | `#4A2CC7` | Darker purple for button hover states. |
| `primary-light` | `#EEEDF9` | Tinted soft violet background for mockups, badges, and card containers. |
| `accent-orange` | `#FFA000` | Warm Amber: "View all cars" CTA, "Book now" submit button, "Search" button, stat card icons, footer contact circles. |
| `accent-orange-hover` | `#FF8F00` | Hover state for orange CTA buttons. |
| `canvas-white` | `#FFFFFF` | Main background, floating "Book your car" form card, car cards, facts stat cards, footer surface. |
| `canvas-light` | `#F8F8FB` | Light gray background for input fields, category tabs, and secondary surfaces. |
| `text-primary` | `#000000` | Bold titles, headings, make/model names, navigation links. |
| `text-secondary` | `#6C757D` | Secondary body text, car specifications, subtitles, contact labels. |
| `border-subtle` | `#E5E7EB` | Subtle hairlines for cards, inputs, and section dividers. |

---

## 2. Typography

Primary Typefaces: **Plus Jakarta Sans** / **Inter**

| Scale Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `hero-heading` | `48px`–`54px` | ExtraBold (`800`) | `1.12` | "Experience the road like never before" |
| `section-title` | `32px`–`40px` | ExtraBold (`800`) | `1.2` | "Choose the car that suits you", "Facts in numbers", "Download mobile app" |
| `card-title` | `18px`–`20px` | Bold (`700`) | `1.3` | Car card titles, value pillars ("Availability", "Comfort", "Savings") |
| `body-text` | `14px`–`16px` | Regular (`400`) | `1.6` | Paragraph descriptions, value proposition leads |
| `spec-label` | `12px` | Medium (`500`) | `1.4` | Specs: "Automat", "PB 95", "Air Conditioner" |
| `btn-text` | `14px` | Bold (`700`) | `1.0` | "View Details", "Book now", "View all cars" |

---

## 3. Radii & Elevation

| Token | Value | Applied To |
|---|---|---|
| `rounded-pill` | `rounded-full` (`50px`) | Primary buttons ("View Details", "Book now", "View all cars", "Search"), contact pills |
| `rounded-card` | `16px`–`24px` | Car cards (`16px`), "Book your car" form (`24px`), feature cards (`20px`) |
| `rounded-banner`| `32px`–`40px` | Purple Hero, Facts banner, Newsletter banner |
| `shadow-floating`| `0 20px 40px rgba(0, 0, 0, 0.12)` | Hero form card, mobile mockups |
| `shadow-card` | `0 2px 10px rgba(0, 0, 0, 0.03)` | Car cards rest state |
| `shadow-hover` | `0 10px 25px rgba(89, 55, 224, 0.1)` | Car cards hover state |

---

## 4. Key Sections & Exact Content

1. **Header**: Car Rental logo (black circle + car icon), Links (Home, Vehicles, Details, About Us, Contact Us), Support phone pill ("Need help? +996 247-1680" with purple icon circle), User Auth profile.
2. **Hero Banner**: Royal Purple `#5937E0` with tire tread background, "Experience the road like never before", Orange "View all cars" button, BMW 3 Series graphic, and floating white "Book your car" form (5 fields + orange "Book now" button).
3. **Three Value Pillars**: Availability, Comfort, Savings on pure white with circular outline icons.
4. **Feature Block**: Driver lifestyle photo + 4 numbered steps with `#5937E0` solid purple circle badges ("Erat at semper", "Urna nec vivamus risus duis arcu", "Lobortis euismod imperdiet tempus", "Cras nulla aliquet nam eleifend amet et").
5. **Catalogue Grid**: "Choose the car that suits you", "View All ▾" link, 2x3 grid of 6 car cards with purple "View Details" buttons.
6. **Facts in Numbers**: Purple banner with tire tread texture, car silhouette, and 4 floating white stat cards (`540+ cars`, `20k+ customers`, `25+ Years`, `20m+ Miles`) with orange square icons.
7. **Download Mobile App**: App Store / Google Play buttons with dual offset iPhone mockups.
8. **Newsletter Banner**: "Enjoy every mile with adorable companionship." with pill search input and orange "Search" button.
9. **Footer**: 4 contact pills at top with orange icons (Address: Oxford Ave. Cary, NC 27511; Email: nwiger@yahoo.com; Phone: +537 547-6401; Brand: Car Rental), 4 column footer (About & socials, Useful links, Vehicles, Download App), and centered copyright.
