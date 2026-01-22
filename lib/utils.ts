import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CarProps } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCarImage = (car: CarProps, angle?: string): string => {
  const make = car?.make?.trim();
  const model = car?.model?.trim();
  const explicitImage = car?.image?.trim();

  if (explicitImage) {
    if (explicitImage.startsWith("/")) {
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
