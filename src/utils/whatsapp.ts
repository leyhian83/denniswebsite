/**
 * Reusable WhatsApp deep-link helper.
 * The number always comes from the central profile configuration.
 */
import { profile } from "../config/site";

const DEFAULT_MESSAGE =
  "Hi, I found your property website and would like to enquire.";

/** Build a wa.me URL with an encoded message. */
export function buildWhatsAppUrl(message?: string): string {
  const text = message ?? DEFAULT_MESSAGE;
  return `https://wa.me/${profile.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** General website enquiry message. */
export function generalWhatsAppMessage(): string {
  return DEFAULT_MESSAGE;
}

/** Pre-filled enquiry for a specific subsale property. */
export function propertyWhatsAppMessage(propertyTitle: string): string {
  return `Hi, I am interested in ${propertyTitle}. Could you share more information?`;
}

/** Pre-filled enquiry for a specific project / development. */
export function projectWhatsAppMessage(projectName: string): string {
  return `Hi, I am interested in ${projectName}. Could you share more information?`;
}

/** Direct tel: link from the profile phone. */
export function telLink(): string {
  // Strip anything except digits for the tel scheme.
  const digits = profile.phone.replace(/\D/g, "");
  return `tel:${digits}`;
}
