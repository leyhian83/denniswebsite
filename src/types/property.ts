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

export type PropertyTitleType = "individual" | "strata" | "master";

export type BumiLotStatus = "yes" | "no" | "not-specified";

export type VideoSource = {
  type: "local" | "youtube";
  url: string;
  poster?: string;
};

export type PropertyAdditionalDetail = {
  label: string;
  value: string;
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
  /** Use when the owner has not set a public numerical price. */
  priceLabel?: string;
  /** Optional monthly rent, including reported income for a tenanted investment. */
  rentalPrice?: number;

  /** When true, the asking price is negotiable (defaults to false / firm). */
  negotiable?: boolean;

  bedrooms?: number;
  bathrooms?: number;
  carParks?: number;

  builtUpSqFt?: number;
  landAreaSqFt?: number;

  tenure?: string;
  furnishing?: string;
  furnishingDetails?: string[];

  /** Optional public-facing listing title; falls back to `title`. */
  headline?: string;
  completionYear?: number;
  titleType?: PropertyTitleType;
  bumiLot?: BumiLotStatus;
  facingDirection?: string;
  maintenanceFee?: number;

  /** Optional dimensions used to add context to the built-up area. */
  builtUpWidthFt?: number;
  builtUpLengthFt?: number;

  /** Keep sensitive unit details in the record but suppress them publicly. */
  block?: string;
  unitNumber?: string;
  floor?: string;
  hideAddressDetails?: boolean;

  /** Optional external map link supplied by the listing author. */
  mapUrl?: string;

  description: string;

  keyFeatures?: string[];
  additionalDetails?: PropertyAdditionalDetail[];

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
