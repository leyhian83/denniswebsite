/**
 * Area / location data service. Property counts are computed
 * dynamically from the property service, never stored in areas.json.
 */
import areasJson from "../data/areas.json";
import type {
  AreaDetail,
  AreaDistrict,
  StateGroup,
} from "../types";
import { countPropertiesForArea, getAvailableStates } from "./propertyService";

const { states } = areasJson as { states: StateGroup[] };

export function getAllStateGroups(): StateGroup[] {
  return states;
}

export function getStateGroupBySlug(slug: string): StateGroup | undefined {
  return states.find((s) => s.slug === slug);
}

export function getDistrictBySlugs(stateSlug: string, areaSlug: string) {
  const state = getStateGroupBySlug(stateSlug);
  if (!state) return undefined;
  const district = state.areas.find((a) => a.slug === areaSlug);
  return district ? { state, district } : undefined;
}

/** Build a flattened list of every state/district for the Areas index. */
export function getAllAreasFlat(): AreaDetail[] {
  return states.flatMap((s) =>
    s.areas.map((a: AreaDistrict) => ({
      state: s.state,
      stateSlug: s.slug,
      area: a.name,
      slug: a.slug,
      description: a.description,
    })),
  );
}

/**
 * Listings live in states that also appear in the areas config; this
 * simply returns the count for a state (all areas) using the data.
 */
export function getStateListingCount(stateSlug: string): number {
  const group = getStateGroupBySlug(stateSlug);
  if (!group) return 0;
  return countPropertiesForArea(group.state);
}

/** Convenience: all states present in the properties data. */
export function getDataStates(): string[] {
  return getAvailableStates();
}
