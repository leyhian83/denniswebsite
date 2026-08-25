import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import type { Project } from "../../types";
import { ResponsiveImage } from "../common/ResponsiveImage";
import { formatPriceCompact, slugToTitle } from "../../utils/format";
import { PROJECT_STATUS_LABELS, PROJECT_CATEGORY_LABELS } from "../../types/project";

interface ProjectCardProps {
  project: Project;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  const hasPrice = project.priceFrom != null || project.priceTo != null;

  return (
    <article className={`project-card ${className}`.trim()}>
      <Link
        to={`/projects/${project.slug}`}
        className="project-card__media"
        aria-label={`View ${project.name}`}
      >
        <ResponsiveImage
          src={project.photos[0]}
          alt={`${project.name} — ${PROJECT_CATEGORY_LABELS[project.category]} project in ${project.area}`}
          className="project-card__img"
        />
        {project.projectStatus && (
          <span className="project-card__status">
            {PROJECT_STATUS_LABELS[project.projectStatus]}
          </span>
        )}
      </Link>

      <div className="project-card__body">
        <div className="project-card__meta">
          <span>{PROJECT_CATEGORY_LABELS[project.category]}</span>
          {project.propertyType && (
            <>
              <span className="project-card__dot" aria-hidden="true">·</span>
              <span>{slugToTitle(project.propertyType)}</span>
            </>
          )}
        </div>

        <h3 className="project-card__title">
          <Link to={`/projects/${project.slug}`}>{project.name}</Link>
        </h3>

        <p className="project-card__developer">{project.developer}</p>

        {hasPrice && (
          <p className="project-card__price">
            <span className="u-sr-only">Price from </span>
            {project.priceFrom ? `From ${formatPriceCompact(project.priceFrom)}` : ""}
            {project.priceFrom && project.priceTo ? " – " : ""}
            {project.priceTo ? formatPriceCompact(project.priceTo) : ""}
          </p>
        )}

        <p className="project-card__location">
          <MapPin size={14} aria-hidden="true" />
          <span>
            {project.area}, {project.state}
          </span>
        </p>

        <span className="project-card__link">
          View Project <ArrowRight size={15} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
