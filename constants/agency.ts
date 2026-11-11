/**
 * Centralized agency contact configuration.
 * Reads from environment variables with sensible defaults.
 * Single source of truth for Address, Email, Phone, and WhatsApp across the app.
 */

export const AGENCY_CONFIG = {
  // Physical Address
  address: process.env.NEXT_PUBLIC_AGENCY_ADDRESS || "Marrakech, Morocco",

  // Google Maps link
  get addressMapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address)}`;
  },

  // Contact Email
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL || "contact@ridelist.ma",
  
  // mailto: URI
  get emailMailto(): string {
    return `mailto:${this.email}`;
  },

  // Formatted Phone for UI display (e.g., "+212 6 000 000 00")
  phoneDisplay: process.env.NEXT_PUBLIC_AGENCY_PHONE || "+212 6 000 000 00",
  
  // Cleaned tel: URI
  get phoneTel(): string {
    const raw = process.env.NEXT_PUBLIC_AGENCY_PHONE || "+212600000000";
    return `tel:${raw.replace(/[\s-]/g, "")}`;
  },

  // WhatsApp digits (without +, e.g. "212600000000")
  get whatsapp(): string {
    const raw = process.env.NEXT_PUBLIC_AGENCY_WHATSAPP || process.env.NEXT_PUBLIC_AGENCY_PHONE || "212600000000";
    return raw.replace(/\D/g, "");
  },

  // Formatted wa.me link
  get whatsappUrl(): string {
    return `https://wa.me/${this.whatsapp}`;
  },
};
