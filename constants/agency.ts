/**
 * Centralized agency contact configuration.
 * Reads from environment variables with sensible defaults.
 * Single source of truth for Email, Phone, and WhatsApp across the app.
 */

export const AGENCY_CONFIG = {
  // Contact Email
  email: process.env.NEXT_PUBLIC_AGENCY_EMAIL || "contact@ridelist.ma",
  
  // Formatted Phone for UI display (e.g., "+212 6 000 000 00")
  phoneDisplay: process.env.NEXT_PUBLIC_AGENCY_PHONE || "+212 6 000 000 00",
  
  // Cleaned tel: URI
  get phoneTel(): string {
    return `tel:${(process.env.NEXT_PUBLIC_AGENCY_PHONE || "+212600000000").replace(/\s+/g, "")}`;
  },

  // mailto: URI
  get emailMailto(): string {
    return `mailto:${this.email}`;
  },

  // WhatsApp digits (without +, e.g. "212600000000")
  get whatsapp(): string {
    const raw = process.env.NEXT_PUBLIC_AGENCY_WHATSAPP || "212600000000";
    return raw.replace(/\D/g, "");
  },
};
