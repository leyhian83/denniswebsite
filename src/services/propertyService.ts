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
import type {
  BumiLotStatus,
  Property,
  PropertyAdditionalDetail,
  PropertyCategory,
  PropertyStatus,
  PropertyTitleType,
  VideoSource,
} from "../types";

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
  furnishing?: string;
  minBuiltUp?: number;
  parking?: number;
  negotiable?: "negotiable" | "non-negotiable";
  query?: string;
}

export type PropertySort = "newest" | "price-asc" | "price-desc";

export interface UploadedMedia {
  url: string;
  fileName: string;
  kind: "image" | "video";
}

export type UploadMediaResult =
  | { ok: true; items: UploadedMedia[]; folder: string }
  | { ok: false; error: string };

export interface PropertyInput {
  title: string;
  category: PropertyCategory;
  propertyType: string;
  state: string;
  area: string;
  subArea?: string;
  address?: string;
  block?: string;
  unitNumber?: string;
  floor?: string;
  hideAddressDetails?: boolean;
  price: number;
  priceLabel?: string;
  rentalPrice?: number;
  negotiable?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  carParks?: number;
  builtUpSqFt?: number;
  landAreaSqFt?: number;
  builtUpWidthFt?: number;
  builtUpLengthFt?: number;
  tenure?: string;
  furnishing?: string;
  furnishingDetails?: string[];
  completionYear?: number;
  titleType?: PropertyTitleType;
  bumiLot?: BumiLotStatus;
  facingDirection?: string;
  maintenanceFee?: number;
  mapUrl?: string;
  headline?: string;
  description: string;
  keyFeatures?: string[];
  additionalDetails?: PropertyAdditionalDetail[];
  photos: string[];
  videos?: VideoSource[];
  featured?: boolean;
  status?: PropertyStatus;
}

export type CreatePropertyResult =
  | { ok: true; property: Property; persisted: boolean; json: string }
  | { ok: false; error: string };

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

export function getPricePerSqFt(property: Property): number | undefined {
  if (!property.builtUpSqFt || property.builtUpSqFt <= 0 || property.price <= 0) {
    return undefined;
  }
  return property.price / property.builtUpSqFt;
}

export async function uploadPropertyMedia(
  files: File[],
  slug: string,
): Promise<UploadMediaResult> {
  return uploadMedia(files, slug, "properties");
}

async function uploadMedia(
  files: File[],
  slug: string,
  scope: "properties" | "projects",
): Promise<UploadMediaResult> {
  try {
    const res = await fetch("/__admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        scope,
        files: await Promise.all(files.map(async (file) => ({
          name: file.name,
          data: await blobToBase64(file),
        }))),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data?.error || "Upload failed." };
    }
    return {
      ok: true,
      items: (data.files as { url: string; fileName?: string; kind: string }[]).map((file) => ({
        url: file.url,
        fileName: file.fileName ?? file.url.split("/").pop() ?? "",
        kind: file.kind as "image" | "video",
      })),
      folder: data.folder as string,
    };
  } catch {
    return { ok: false, error: "Upload unavailable in this environment." };
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function getFeaturedProperties(limit?: number): Property[] {
  const featured = ALL.filter((p) => p.featured).sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
  );
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
  if (filter.furnishing) {
    results = results.filter((p) => p.furnishing === filter.furnishing);
  }
  if (filter.minBuiltUp != null && filter.minBuiltUp > 0) {
    results = results.filter((p) => (p.builtUpSqFt ?? 0) >= filter.minBuiltUp!);
  }
  if (filter.parking != null && filter.parking > 0) {
    results = results.filter((p) => (p.carParks ?? 0) >= filter.parking!);
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
      results = [...results].sort(
        (a, b) =>
          (a.price > 0 ? a.price : Number.POSITIVE_INFINITY) -
          (b.price > 0 ? b.price : Number.POSITIVE_INFINITY),
      );
      break;
    case "price-desc":
      results = [...results].sort(
        (a, b) =>
          (b.price > 0 ? b.price : Number.NEGATIVE_INFINITY) -
          (a.price > 0 ? a.price : Number.NEGATIVE_INFINITY),
      );
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
    property.price > 0 && p.price > 0 && Math.abs(p.price - property.price) / property.price <= 0.5;

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

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nextPropertyId(existing: Property[] = ALL): string {
  const nums = existing
    .map((p) => /^p-(\d+)$/.exec(p.id)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `p-${String(next).padStart(3, "0")}`;
}

export async function createProperty(input: PropertyInput): Promise<CreatePropertyResult> {
  const slug = slugify(input.title);
  if (!slug) return { ok: false, error: "A listing headline is required to create a URL." };
  if (ALL.some((property) => property.slug === slug)) {
    return { ok: false, error: "A property with this headline already exists." };
  }

  const property: Property = {
    id: nextPropertyId(ALL),
    slug,
    title: input.title.trim(),
    headline: input.headline?.trim() || input.title.trim(),
    transactionType: "subsale",
    category: input.category,
    propertyType: input.propertyType.trim(),
    state: input.state.trim(),
    area: input.area.trim(),
    subArea: input.subArea?.trim() || undefined,
    address: input.address?.trim() || undefined,
    block: input.block?.trim() || undefined,
    unitNumber: input.unitNumber?.trim() || undefined,
    floor: input.floor?.trim() || undefined,
    hideAddressDetails: input.hideAddressDetails,
    price: input.price,
    currency: "MYR",
    priceLabel: input.priceLabel?.trim() || undefined,
    rentalPrice: input.rentalPrice,
    negotiable: input.negotiable,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    carParks: input.carParks,
    builtUpSqFt: input.builtUpSqFt,
    landAreaSqFt: input.landAreaSqFt,
    builtUpWidthFt: input.builtUpWidthFt,
    builtUpLengthFt: input.builtUpLengthFt,
    tenure: input.tenure?.trim() || undefined,
    furnishing: input.furnishing || undefined,
    furnishingDetails: input.furnishingDetails?.length ? input.furnishingDetails : undefined,
    completionYear: input.completionYear,
    titleType: input.titleType,
    bumiLot: input.bumiLot,
    facingDirection: input.facingDirection || undefined,
    maintenanceFee: input.maintenanceFee,
    mapUrl: input.mapUrl?.trim() || undefined,
    description: input.description.trim(),
    keyFeatures: input.keyFeatures?.length ? input.keyFeatures : undefined,
    additionalDetails: input.additionalDetails?.length ? input.additionalDetails : undefined,
    photos: input.photos?.length ? input.photos : [`/media/properties/${slug}/cover.jpg`],
    videos: input.videos?.length ? input.videos : undefined,
    featured: input.featured,
    status: input.status ?? "available",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const json = JSON.stringify({ ...propertiesJson, properties: [...ALL, property] }, null, 2)
    .replace(/\n/g, "\r\n");

  try {
    const res = await fetch("/__admin/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(property),
    });
    if (res.ok) {
      ALL.push(property);
      return { ok: true, property, persisted: true, json };
    }
  } catch {
    // Production builds have no local file middleware; return the JSON fallback.
  }

  ALL.push(property);
  return { ok: true, property, persisted: false, json };
}
