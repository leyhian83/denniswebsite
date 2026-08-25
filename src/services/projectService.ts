/**
 * Project (new development) data service.
 * Swap the JSON import for a DB / API later without editing pages.
 */
import projectsJson from "../data/projects.json";
import type { Project, ProjectCategory } from "../types";

const { projects } = projectsJson as { projects: Project[] };
const ALL: Project[] = projects;

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
