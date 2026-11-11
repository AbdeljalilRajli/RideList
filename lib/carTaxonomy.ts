export const BODY_TYPES = [
  { value: "sedan", label: "Sedan" },
  { value: "hatchback", label: "Hatchback" },
  { value: "suv", label: "SUV" },
  { value: "minivan", label: "Minivan" },
  { value: "pickup", label: "Pickup" },
  { value: "convertible", label: "Convertible" },
  { value: "coupe", label: "Coupe" },
  { value: "van", label: "Van" },
] as const;

export const CAR_SEGMENTS = [
  { value: "economy", label: "Economy" },
  { value: "compact", label: "Compact" },
  { value: "midsize", label: "Midsize" },
  { value: "fullsize", label: "Fullsize" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
] as const;

export type BodyType = (typeof BODY_TYPES)[number]["value"];
export type CarSegment = (typeof CAR_SEGMENTS)[number]["value"];

/**
 * Normalizes fuel labels across the entire app:
 * "PB 95", "gas", "petrol", "gasoline" -> "Petrol"
 * "diesel" -> "Diesel"
 * "hybrid" -> "Hybrid"
 * "electric", "electricity" -> "Electric"
 */
export function normalizeFuel(fuel?: string | null): string {
  if (!fuel) return "Petrol";
  const f = fuel.trim().toLowerCase();
  if (f.includes("hybrid")) return "Hybrid";
  if (f.includes("electric") || f === "ev") return "Electric";
  if (f.includes("diesel")) return "Diesel";
  if (f.includes("gas") || f.includes("petrol") || f.includes("pb") || f.includes("95") || f.includes("98")) return "Petrol";
  return f.charAt(0).toUpperCase() + f.slice(1);
}

/**
 * Normalizes transmission labels across the entire app:
 * "a", "automat", "automatic" -> "Automatic"
 * "m", "manual" -> "Manual"
 */
export function normalizeTransmission(transmission?: string | null): string {
  if (!transmission) return "Automatic";
  const t = transmission.trim().toLowerCase();
  if (t === "m" || t.includes("manual")) return "Manual";
  return "Automatic";
}

/**
 * Formats body type for UI display (e.g. "sedan" -> "Sedan", "suv" -> "SUV")
 */
export function formatBodyType(bodyType?: string | null): string {
  if (!bodyType) return "Sedan";
  const b = bodyType.trim().toLowerCase();
  if (b === "suv") return "SUV";
  return b.charAt(0).toUpperCase() + b.slice(1);
}

/**
 * Formats segment for UI display (e.g. "midsize" -> "Midsize")
 */
export function formatSegment(segment?: string | null): string {
  if (!segment) return "Midsize";
  const s = segment.trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
