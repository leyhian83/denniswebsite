/**
 * Property data service.
 *
 * Components obtain data through this module rather than importing
 * `properties.json` directly. Later you can swap the JSON import for an
 * API / Supabase / PostgreSQL / CMS call without touching the pages.
 */
import propertiesJson from "../data/properties.json";
import {
  MALAYSIA_AREAS,
  MALAYSIA_STATES,
  MALAYSIA_SUBAREAS,
} from "../data/malaysiaLocations";
import type { Property, PropertyCategory } from "../types";

const { properties } = propertiesJson as { properties: Property[] };
const ALL: Property[] = properties;

export interface PropertyFilters {
  category?: PropertyCategory;
  residentialType?: "condominium" | "landed";
  state?: string;
  area?: string;
  subArea?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  negotiable?: "negotiable" | "non-negotiable";
  query?: string;
}

export type PropertySort = "newest" | "price-asc" | "price-desc";

/** Return the single property for a slug, or undefined. */
export function getPropertyBySlug(slug: string): Property | undefined {
  return ALL.find((p) => p.slug === slug);
}

export function getPropertyById(id: string): Property | undefined {
  return ALL.find((p) => p.id === id);
}

export function getAllProperties(): Property[] {
  return ALL;
}

export function getFeaturedProperties(limit?: number): Property[] {
  const featured = ALL.filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

/** All Malaysian states plus any additional states present in listing data. */
export function getAvailableStates(): string[] {
  return [...new Set([...MALAYSIA_STATES, ...ALL.map((p) => p.state)])].sort();
}

/** Curated Malaysian areas plus any areas present in listing data. */
export function getAreasForState(state?: string): string[] {
  const curated = state
    ? MALAYSIA_AREAS[state] ?? []
    : Object.values(MALAYSIA_AREAS).flat();
  const listed = ALL
    .filter((p) => !state || p.state === state)
    .map((p) => p.area);
  return [...new Set([...curated, ...listed])].sort();
}

/** Curated neighbourhood options plus any sub-areas present in listing data. */
export function getSubAreasForArea(area?: string): string[] {
  const curated = area
    ? MALAYSIA_SUBAREAS[area] ?? []
    : Object.values(MALAYSIA_SUBAREAS).flat();
  const listed = ALL
    .filter((p) => !area || p.area === area)
    .map((p) => p.subArea)
    .filter((subArea): subArea is string => Boolean(subArea));
  return [...new Set([...curated, ...listed])].sort();
}

/** Exact area match is ambiguous across states (e.g. "Damansara"),
 *  so filter by both state + area together where relevant. */
function normalize(v?: string): string {
  return (v ?? "").trim().toLowerCase();
}

/** Core filtering shared by subsale listing and area pages. */
export function filterProperties(
  filter: PropertyFilters = {},
  sort: PropertySort = "newest",
): Property[] {
  let results = ALL.filter((p) => p.status === "available" || p.status === "reserved");

  if (filter.category) {
    results = results.filter((p) => p.category === filter.category);
  }
  if (filter.residentialType) {
    results = results.filter((p) => p.propertyType === filter.residentialType);
  }
  if (filter.state) {
    results = results.filter((p) => p.state === filter.state);
  }
  if (filter.area) {
    results = results.filter(
      (p) =>
        normalize(p.area) === normalize(filter.area) ||
        normalize(p.subArea) === normalize(filter.area),
    );
  }
  if (filter.subArea) {
    results = results.filter((p) => normalize(p.subArea) === normalize(filter.subArea));
  }
  if (filter.minPrice != null && filter.minPrice > 0) {
    results = results.filter((p) => p.price >= filter.minPrice!);
  }
  if (filter.maxPrice != null && filter.maxPrice > 0) {
    results = results.filter((p) => p.price <= filter.maxPrice!);
  }
  if (filter.bedrooms != null && filter.bedrooms > 0) {
    results = results.filter((p) => (p.bedrooms ?? 0) >= filter.bedrooms!);
  }
  if (filter.negotiable) {
    results = results.filter((p) =>
      filter.negotiable === "negotiable"
        ? p.negotiable === true
        : p.negotiable !== true,
    );
  }
  if (filter.query) {
    const q = normalize(filter.query);
    results = results.filter((p) => {
      const haystack = [
        p.title,
        p.area,
        p.subArea,
        p.state,
        p.propertyType,
        p.category,
        p.address,
        p.description,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  switch (sort) {
    case "price-asc":
      results = [...results].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      results = [...results].sort((a, b) => b.price - a.price);
      break;
    case "newest":
    default:
      results = [...results].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
      );
  }

  return results;
}

/**
 * Suggest similar properties for a detail page.
 * Priority: same area -> same property type -> similar price range.
 */
export function getSimilarProperties(property: Property, limit = 4): Property[] {
  const same = (p: Property) =>
    p.category === property.category && p.propertyType === property.propertyType;
  const areaMatch = (p: Property) =>
    normalize(p.area) === normalize(property.area) ||
    normalize(p.subArea) === normalize(property.subArea);
  const priceNear = (p: Property) =>
    Math.abs(p.price - property.price) / property.price <= 0.5;

  const scored = ALL.filter((p) => p.id !== property.id && p.status !== "sold").map(
    (p) => {
      let score = 0;
      if (areaMatch(p)) score += 3;
      if (same(p)) score += 2;
      if (priceNear(p)) score += 1;
      return { p, score };
    },
  );

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.p);
}

/** How many available listings a specific area (and optional state) holds. */
export function countPropertiesForArea(state: string, area?: string): number {
  return ALL.filter((p) => {
    const stateMatch = p.state === state;
    if (!area) return stateMatch;
    return (
      stateMatch &&
      (normalize(p.area) === normalize(area) || normalize(p.subArea) === normalize(area))
    );
  }).length;
}
