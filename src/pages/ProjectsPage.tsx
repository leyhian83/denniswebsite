import { Link, useLocation } from "react-router-dom";
import { ProjectCard } from "../components/project/ProjectCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { getProjectsByCategory, getAllProjects } from "../services/projectService";
import { PROJECT_CATEGORY_LABELS } from "../types/project";
import type { ProjectCategory } from "../types";

export function ProjectsPage() {
  // Category is a static route segment (/projects/residential etc.), so
  // derive it from the current pathname.
  const { pathname } = useLocation();
  const segment = pathname.split("/")[2] ?? "";
  const activeCategory =
    segment === "residential" || segment === "commercial" || segment === "industrial"
      ? (segment as ProjectCategory)
      : undefined;

  usePageMeta({
    title: activeCategory ? `${PROJECT_CATEGORY_LABELS[activeCategory]} Projects` : "New Projects",
    description: "Browse upcoming and current new property developments across Kuala Lumpur and Selangor.",
  });

  const projects = activeCategory ? getProjectsByCategory(activeCategory) : getAllProjects();

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
                <span aria-current="page">{PROJECT_CATEGORY_LABELS[activeCategory]}</span>
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
