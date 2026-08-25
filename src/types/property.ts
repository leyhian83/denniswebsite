/**
 * Property data model.
 *
 * One `Property` record powers every navigation path (subsale category,
 * area, featured, search, detail). Never duplicate a property record;
 * instead reference the same object through the service layer.
 */

export type PropertyCategory = "residential" | "commercial" | "industrial";

export type TransactionType = "subsale";

export type PropertyStatus = "available" | "reserved" | "sold";

export type VideoSource = {
  type: "local" | "youtube";
  url: string;
};

export interface Property {
  id: string;
  slug: string;

  title: string;

  transactionType: TransactionType;

  category: PropertyCategory;
  propertyType: string;

  state: string;
  area: string;
  subArea?: string;
  address?: string;

  price: number;
  currency: "MYR";

  bedrooms?: number;
  bathrooms?: number;
  carParks?: number;

  builtUpSqFt?: number;
  landAreaSqFt?: number;

  tenure?: string;
  furnishing?: string;

  description: string;

  keyFeatures?: string[];

  photos: string[];

  videos?: VideoSource[];

  featured?: boolean;

  status: PropertyStatus;

  createdAt?: string;
  updatedAt?: string;
}

/** Human-facing categories used across the UI and routing. */
export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
};

export const RESIDENTIAL_TYPES_LABELS: Record<string, string> = {
  condominium: "Condominium",
  landed: "Landed",
};
