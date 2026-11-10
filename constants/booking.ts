/**
 * RideList Morocco Rental Configuration
 * Locations, Delivery Fees (MAD), Optional Extras, and WhatsApp Integration
 */

export interface LocationOption {
  id: string;
  name: string;
  city: string;
  fee: number; // in MAD (DH)
  requiresAddress?: boolean;
  description?: string;
}

export interface ExtraOption {
  id: string;
  name: string;
  description: string;
  price: number; // in MAD (DH)
  perDay: boolean; // true = multiplied by rental days, false = flat rate
  icon: string;
}

/**
 * Configurable list of pickup and return locations across Morocco
 */
export const RENTAL_LOCATIONS: LocationOption[] = [
  {
    id: "agency_casablanca",
    name: "Downtown Agency (Casablanca Boulevard d'Anfa)",
    city: "Casablanca",
    fee: 0,
    description: "Free pickup at main branch",
  },
  {
    id: "airport_cmn",
    name: "Mohammed V International Airport (CMN) - Casablanca",
    city: "Casablanca",
    fee: 150,
    description: "Terminal 1 & 2 meet & greet (+150 DH)",
  },
  {
    id: "airport_rak",
    name: "Menara International Airport (RAK) - Marrakech",
    city: "Marrakech",
    fee: 200,
    description: "Terminal arrival hall delivery (+200 DH)",
  },
  {
    id: "train_casa_voyageurs",
    name: "Casa-Voyageurs Train Station (Al Boraq / ONCF)",
    city: "Casablanca",
    fee: 80,
    description: "Station forecourt delivery (+80 DH)",
  },
  {
    id: "train_casa_port",
    name: "Casa-Port Train Station",
    city: "Casablanca",
    fee: 80,
    description: "Station forecourt delivery (+80 DH)",
  },
  {
    id: "hotel_delivery",
    name: "Doorstep / Hotel Delivery (Custom Address)",
    city: "Any City",
    fee: 120,
    requiresAddress: true,
    description: "Delivered directly to your hotel or residence (+120 DH)",
  },
];

/**
 * Configurable optional extras with prices in MAD (DH)
 */
export const BOOKING_EXTRAS: ExtraOption[] = [
  {
    id: "second_driver",
    name: "Additional Driver",
    description: "Authorizes a 2nd registered driver on the rental contract",
    price: 50,
    perDay: true,
    icon: "person_add",
  },
  {
    id: "child_seat",
    name: "Child Safety Seat",
    description: "Certified, sanitized infant/child car safety seat",
    price: 40,
    perDay: true,
    icon: "child_care",
  },
  {
    id: "gps",
    name: "GPS Navigation Unit",
    description: "Preloaded GPS device with offline Moroccan road maps",
    price: 30,
    perDay: true,
    icon: "navigation",
  },
  {
    id: "wifi",
    name: "Portable 4G WiFi Hotspot",
    description: "High-speed 4G pocket router with unlimited data everywhere in Morocco",
    price: 60,
    perDay: true,
    icon: "wifi",
  },
];

import { AGENCY_CONFIG } from "./agency";

/**
 * Returns the cleaned WhatsApp phone number for wa.me links
 */
export function getAgencyWhatsAppNumber(): string {
  return AGENCY_CONFIG.whatsapp;
}

/**
 * Builds the WhatsApp direct chat link with prefilled Moroccan booking details
 */
export function buildWhatsAppBookingUrl(params: {
  referenceCode: string;
  carMake: string;
  carModel: string;
  carYear: number;
  pickupDate: string;
  pickupTime: string;
  pickupPlace: string;
  returnDate: string;
  returnTime: string;
  returnPlace: string;
  totalPrice: number;
  depositAmount: number;
  customerName: string;
  customerPhone: string;
}): string {
  const phone = getAgencyWhatsAppNumber();

  const message = [
    `Bonjour RideList! 🚗`,
    `Je souhaite confirmer ma demande de réservation.`,
    ``,
    `🔖 *Référence:* ${params.referenceCode}`,
    `🚘 *Véhicule:* ${params.carMake} ${params.carModel} (${params.carYear})`,
    `📅 *Prise en charge:* ${params.pickupDate} à ${params.pickupTime}`,
    `📍 *Lieu de prise:* ${params.pickupPlace}`,
    `🏁 *Restitution:* ${params.returnDate} à ${params.returnTime}`,
    `📍 *Lieu de restitution:* ${params.returnPlace}`,
    `💰 *Montant total:* ${params.totalPrice} DH (Paiement sur place)`,
    `🛡️ *Caution:* ${params.depositAmount} DH (Restituée au retour)`,
    ``,
    `👤 *Client:* ${params.customerName}`,
    `📞 *Téléphone:* ${params.customerPhone}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
