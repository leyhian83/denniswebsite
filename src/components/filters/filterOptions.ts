import type { PropertyCategory } from "../../types";

/** Filter values bound by the listing pages. */
export interface FiltersValue {
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
  /** Price negotiability tri-state. */
  negotiable?: "negotiable" | "non-negotiable";
}

export interface Option {
  value: string;
  label: string;
}

/** Shared options used by both desktop and mobile filter UIs. */
export const propertyOptions = {
  categories: [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
  ],
  residentialTypes: [
    { value: "condominium", label: "Condominium" },
    { value: "landed", label: "Landed" },
  ],
  priceRanges: [
    { value: "0-500000", label: "Under RM 500K" },
    { value: "500000-1000000", label: "RM 500K – 1M" },
    { value: "1000000-2000000", label: "RM 1M – 2M" },
    { value: "2000000-9999999999", label: "RM 2M+" },
  ],
  bedrooms: [
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ],
  furnishing: [
    { value: "Fully Furnished", label: "Fully furnished" },
    { value: "Partially Furnished", label: "Partially furnished" },
    { value: "Unfurnished", label: "Unfurnished" },
  ],
  builtUp: [
    { value: "500", label: "500+ sqft" },
    { value: "1000", label: "1,000+ sqft" },
    { value: "1500", label: "1,500+ sqft" },
    { value: "2500", label: "2,500+ sqft" },
  ],
  parking: [
    { value: "1", label: "1+ space" },
    { value: "2", label: "2+ spaces" },
    { value: "3", label: "3+ spaces" },
  ],
  negotiable: [
    { value: "negotiable", label: "Negotiable" },
    { value: "non-negotiable", label: "Non-negotiable" },
  ],
};

export type { PropertyCategory };
