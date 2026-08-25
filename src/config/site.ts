/**
 * Site-wide configuration.
 *
 * Profile personal details (from the profile config) power contact CTAs
 * site-wide. Edit `src/data/profile.json` to change the person, not here.
 */
import profileJson from "../data/profile.json";
import type { Profile } from "../types";

export const profile: Profile = profileJson as Profile;

export const SITE = {
  name: "Leyhi Properties",
  tagline: "Premium property advisory across Malaysia",
  /** Base path for routing/asset URLs. Leave "/" for a root deploy. */
  basePath: "/",
  currency: "MYR",
} as const;

/** UTM / tracking param appended to WhatsApp links (optional). */
export const WHATSAPP_PARAMS = "";
