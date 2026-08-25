/** Project (new development) data model. Separate from Property (subsale). */
import type { VideoSource } from "./property";

export type ProjectCategory = "residential" | "commercial" | "industrial";

export type ProjectStatus =
  | "new-launch"
  | "under-construction"
  | "completed";

export interface Project {
  id: string;
  slug: string;

  name: string;
  developer?: string;

  category: ProjectCategory;
  propertyType?: string;

  state: string;
  area: string;
  subArea?: string;
  address?: string;

  priceFrom?: number;
  priceTo?: number;

  tenure?: string;

  completionDate?: string;

  projectStatus?: ProjectStatus;

  unitTypes?: string[];

  description: string;

  facilities?: string[];

  photos: string[];

  floorPlans?: string[];

  videos?: VideoSource[];

  featured?: boolean;
}

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Industrial",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  "new-launch": "New Launch",
  "under-construction": "Under Construction",
  completed: "Completed",
};
