/**
 * Project data service.
 * Swap the JSON import for a DB / API later without editing pages.
 *
 * `createProject` is the write path used by the admin "add project" form.
 * In development it posts to a tiny local Vite middleware endpoint that
 * appends the record to src/data/projects.json. In a production build (no
 * middleware) it falls back to returning the ready-to-paste JSON so the
 * record can still be added manually.
 */
import projectsJson from "../data/projects.json";
import type { Project, ProjectCategory } from "../types";

const { projects } = projectsJson as { projects: Project[] };
const ALL: Project[] = projects;

/** Fields collected by the add-project form (the rest are optional). */
export interface ProjectInput {
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
  projectStatus?: Project["projectStatus"];
  unitTypes?: string[];
  description: string;
  facilities?: string[];
  photos: string[];
  featured?: boolean;
}

export type CreateProjectResult =
  | { ok: true; project: Project; persisted: boolean; json: string }
  | { ok: false; error: string };

export function getProjectBySlug(slug: string): Project | undefined {
  return ALL.find((p) => p.slug === slug);
}

export function getAllProjects(): Project[] {
  return ALL;
}

export function getProjectsByCategory(category: ProjectCategory): Project[] {
  return ALL.filter((p) => p.category === category);
}

export function getFeaturedProjects(limit?: number): Project[] {
  const featured = ALL.filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

/** Suggest a unique project id, e.g. prj-007. */
export function nextProjectId(existing: Project[] = ALL): string {
  const nums = existing
    .map((p) => /^prj-(\d+)$/.exec(p.id)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `prj-${String(next).padStart(3, "0")}`;
}

/** Build a complete Project record from form input and persist it. */
export async function createProject(input: ProjectInput): Promise<CreateProjectResult> {
  const slug = slugify(input.name);
  if (!slug) {
    return { ok: false, error: "A project name is required to create a URL." };
  }
  if (ALL.some((p) => p.slug === slug)) {
    return { ok: false, error: "A project with this name already exists." };
  }

  const project: Project = {
    id: nextProjectId(ALL),
    slug,
    name: input.name.trim(),
    developer: input.developer || undefined,
    category: input.category,
    propertyType: input.propertyType || undefined,
    state: input.state.trim(),
    area: input.area.trim(),
    subArea: input.subArea || undefined,
    address: input.address || undefined,
    priceFrom: input.priceFrom,
    priceTo: input.priceTo,
    tenure: input.tenure || undefined,
    completionDate: input.completionDate || undefined,
    projectStatus: input.projectStatus || undefined,
    unitTypes: input.unitTypes?.length ? input.unitTypes : undefined,
    description: input.description.trim(),
    facilities: input.facilities?.length ? input.facilities : undefined,
    photos: input.photos?.length ? input.photos : defaultPhotos(slug),
    featured: input.featured,
  };

  const json = JSON.stringify({ ...projectsJson, projects: [...ALL, project] }, null, 2)
    .replace(/\n/g, "\r\n");

  // In dev this hits the Vite middleware which writes projects.json.
  // In production (no middleware) it 404s and we fall back gracefully.
  try {
    const res = await fetch("/__admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    if (res.ok) {
      return { ok: true, project, persisted: true, json };
    }
    return { ok: true, project, persisted: false, json };
  } catch {
    return { ok: true, project, persisted: false, json };
  }
}

/**
 * Lowercase hyphenated slug from a name. Kept here (not in format.ts) so the
 * service is self-contained for migration; only ASCII is supported.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sensible placeholder unless the user provides photos. */
function defaultPhotos(slug: string): string[] {
  return [`/media/projects/${slug}/cover.jpg`];
}
