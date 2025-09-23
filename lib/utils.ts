import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarProps } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCarImage = (car: CarProps, angle?: string): string => {
  // For now, return the default image for all cars
  // This can be expanded later with specific car images
  return "/cars/default-car.webp";
};
