import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarProps } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCarImage = (car: CarProps, angle?: string): string => {
  const make = car?.make?.trim();
  const model = car?.model?.trim();
  
  // 1. Check images array from Supabase
  if (car?.images && car.images.length > 0 && car.images[0]) {
    const firstImg = car.images[0].trim();
    if (firstImg.startsWith("/") || firstImg.startsWith("http")) {
      return firstImg;
    }
    return `/ridelist%20cars%20images/${encodeURIComponent(firstImg)}`;
  }

  // 2. Check explicit single image property
  const explicitImage = car?.image?.trim();
  if (explicitImage) {
    if (explicitImage.startsWith("/") || explicitImage.startsWith("http")) {
      return explicitImage;
    }
    return `/ridelist%20cars%20images/${encodeURIComponent(explicitImage)}`;
  }

  if (!make || !model) {
    return "/cars/default-car.webp";
  }

  const fileName = `${make} ${model}.webp`;
  return `/ridelist%20cars%20images/${encodeURIComponent(fileName)}`;
};

/**
 * Returns a clean, human-readable, and SEO-friendly slug for vehicle details URLs.
 * e.g., { make: "BMW", model: "3 Series" } -> "bmw-3-series"
 */
export function getCarSlug(car: { make?: string; model?: string; id?: string }): string {
  if (!car?.make || !car?.model) return car?.id || "vehicle";
  return `${car.make}-${car.model}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns today's ISO date string ("YYYY-MM-DD") in Africa/Casablanca timezone.
 */
export function getCasablancaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Formats an ISO date string "YYYY-MM-DD" into a friendly "DD Mon" string (e.g. "30 Nov").
 */
export function formatDayMonth(isoDateStr?: string | null): string {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("-");
  if (parts.length !== 3) return "";
  const day = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(day) || isNaN(month)) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${day} ${months[month - 1]}`;
}
