import { MouseEventHandler } from "react";

export type BodyType =
  | "sedan"
  | "hatchback"
  | "suv"
  | "minivan"
  | "pickup"
  | "convertible"
  | "coupe"
  | "van";

export type CarSegment =
  | "economy"
  | "compact"
  | "midsize"
  | "fullsize"
  | "premium"
  | "luxury";

export interface CarProps {
  id?: string;
  city_mpg: number;
  class: string;
  body_type?: BodyType;
  segment?: CarSegment;
  combination_mpg: number;
  cylinders: number;
  displacement: number;
  drive: string;
  fuel_type: string;
  highway_mpg: number;
  make: string;
  model: string;
  transmission: string;
  year: number;
  price_per_day: number;
  seats: number;
  color: string;
  image?: string;
  images?: string[];
  status?: "available" | "rented" | "maintenance" | "hidden";
  km_policy?: string;
  deposit_amount?: number;
  created_at?: string;
}

export type CarState = CarProps[] & { message?: string };

export interface SearchBarProps {
  setManuFacturer: (manufacturer: string) => void;
  setModel: (model: string) => void;
}

export interface FilterProps {
  manufacturer?: string;
  year?: number;
  model?: string;
  limit?: number;
  fuel?: string;
}

export interface CarCardProps {
  model: string;
  make: string;
  mpg: number;
  transmission: string;
  year: number;
  drive: string;
  cityMPG: number;
}

export interface CustomButtonProps {
  isDisabled?: boolean;
  btnType?: "button" | "submit";
  containerStyles?: string;
  textStyles?: string;
  title: string;
  rightIcon?: string;
  handleClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface OptionProps {
  title: string;
  value: string;
}

export interface CustomFilterProps<T = any> {
  title?: string;
  options: OptionProps[];
  setFilter: (value: T) => void;
}

export interface SearchManuFacturerProps {
  selected: string;
  setSelected: (selected: string) => void;
}

export interface ShowMoreProps {
  pageNumber: number;
  isNext: boolean;
  setLimit: (limit: number) => void;
}
