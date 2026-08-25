import { Link, useLocation } from "react-router-dom";
import { ProjectCard } from "../components/project/ProjectCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { getProjectsByCategory, getAllProjects } from "../services/projectService";
import { PROJECT_CATEGORY_LABELS } from "../types/project";
import type { ProjectCategory } from "../types";

const RESIDENTIAL_PROJECT_TYPES = {
  condominium: "Condominium",
  landed: "Landed",
} as const;

type ResidentialProjectType = keyof typeof RESIDENTIAL_PROJECT_TYPES;

export function ProjectsPage() {
  // Category is a static route segment (/projects/residential etc.), so
  // derive it from the current pathname.
  const { pathname } = useLocation();
  const segment = pathname.split("/")[2] ?? "";
  const activeCategory =
    segment === "residential" || segment === "commercial" || segment === "industrial"
      ? (segment as ProjectCategory)
      : undefined;
  const subtypeSegment = pathname.split("/")[3] ?? "";
  const activeSubtype =
    activeCategory === "residential" && subtypeSegment in RESIDENTIAL_PROJECT_TYPES
      ? (subtypeSegment as ResidentialProjectType)
      : undefined;

  usePageMeta({
    title: activeSubtype
      ? `${RESIDENTIAL_PROJECT_TYPES[activeSubtype]} Projects`
      : activeCategory
        ? `${PROJECT_CATEGORY_LABELS[activeCategory]} Projects`
        : "New Projects",
    description: "Browse upcoming and current new property developments across Kuala Lumpur and Selangor.",
  });

  const projects = activeCategory
    ? getProjectsByCategory(activeCategory, activeSubtype)
    : getAllProjects();

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/projects">Projects</Link>
            {activeCategory && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current={!activeSubtype ? "page" : undefined}>
                  {PROJECT_CATEGORY_LABELS[activeCategory]}
                </span>
                {activeSubtype && (
                  <>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{RESIDENTIAL_PROJECT_TYPES[activeSubtype]}</span>
                  </>
                )}
              </>
            )}
          </nav>
          <p className="page-header__eyebrow u-eyebrow">New Developments</p>
          <h1 className="page-header__title">
            {activeCategory ? `${PROJECT_CATEGORY_LABELS[activeCategory]} Projects` : "New Projects"}
          </h1>
          <p className="page-header__desc">
            Explore the latest new launches and developments I'm marketing across the Klang Valley.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <nav className="category-nav" aria-label="Project categories">
            <Link to="/projects" className={`category-nav__item ${!activeCategory ? "is-active" : ""}`}>
              All
            </Link>
            {(Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategory[]).map((c) => (
              <Link
                key={c}
                to={`/projects/${c}`}
                className={`category-nav__item ${activeCategory === c ? "is-active" : ""}`}
              >
                {PROJECT_CATEGORY_LABELS[c]}
              </Link>
            ))}
          </nav>

          {activeCategory === "residential" && (
            <nav className="category-nav" aria-label="Residential project types">
              <Link
                to="/projects/residential"
                className={`category-nav__item ${!activeSubtype ? "is-active" : ""}`}
              >
                Residential · All
              </Link>
              {(Object.keys(RESIDENTIAL_PROJECT_TYPES) as ResidentialProjectType[]).map((type) => (
                <Link
                  key={type}
                  to={`/projects/residential/${type}`}
                  className={`category-nav__item ${activeSubtype === type ? "is-active" : ""}`}
                >
                  {RESIDENTIAL_PROJECT_TYPES[type]}
                </Link>
              ))}
            </nav>
          )}

          {projects.length > 0 ? (
            <div className="project-grid">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="empty-state__title">No projects in this category yet</h2>
              <p className="empty-state__text">Check back soon or browse all projects.</p>
              <Link to="/projects" className="btn btn--primary">
                View all projects
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
