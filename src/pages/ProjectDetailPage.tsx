import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import {
  MapPin,
  Building2,
  Check,
  Calendar,
  BadgeCheck,
  Ruler,
  Tag,
  Users,
} from "lucide-react";
import { Gallery } from "../components/common/Gallery";
import { EnquiryCard } from "../components/contact/EnquiryCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { getProjectBySlug } from "../services/projectService";
import { NotFoundPage } from "./NotFoundPage";
import {
  formatMonthYear,
  formatPrice,
  formatPriceCompact,
  slugToTitle,
} from "../utils/format";
import { projectWhatsAppMessage, buildWhatsAppUrl } from "../utils/whatsapp";
import { PROJECT_CATEGORY_LABELS, PROJECT_STATUS_LABELS } from "../types/project";

function youtubeEmbed(url: string): string {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  const id = m ? m[1] : url;
  return `https://www.youtube.com/embed/${id}`;
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<"photos" | "video">("photos");

  const project = slug ? getProjectBySlug(slug) : undefined;

  usePageMeta(
    project
      ? {
          title: project.name,
          description: `${project.name} — ${PROJECT_CATEGORY_LABELS[project.category]} new development in ${project.area}, ${project.state}.${project.developer ? ` By ${project.developer}.` : ""}`,
        }
      : { title: "Project Not Found" },
  );

  if (!project) {
    return <NotFoundPage />;
  }

  const videos = project.videos ?? [];
  const hasFloorPlans = (project.floorPlans?.length ?? 0) > 0;
  const hasFacilities = (project.facilities?.length ?? 0) > 0;
  const hasUnitTypes = (project.unitTypes?.length ?? 0) > 0;
  const hasPhotos = (project.photos?.length ?? 0) > 0;

  const infoRows = [
    { label: "Developer", value: project.developer, icon: Building2 },
    { label: "Tenure", value: project.tenure, icon: BadgeCheck },
    { label: "Completion", value: formatMonthYear(project.completionDate), icon: Calendar },
    {
      label: "Status",
      value: project.projectStatus
        ? PROJECT_STATUS_LABELS[project.projectStatus]
        : undefined,
      icon: Tag,
    },
    { label: "Property Type", value: project.propertyType ? slugToTitle(project.propertyType) : undefined, icon: Ruler },
  ].filter(
    (r) => r.value,
  ) as { label: string; value: string; icon: typeof Building2 }[];

  const locationLines = [
    { label: "State", value: project.state },
    { label: "Area", value: project.area },
    { label: "Sub-area", value: project.subArea },
    { label: "Address", value: project.address },
  ].filter((l) => l.value);

  const priceLine =
    project.priceFrom != null && project.priceTo != null
      ? `${formatPriceCompact(project.priceFrom)} – ${formatPriceCompact(project.priceTo)}`
      : project.priceFrom != null
        ? `From ${formatPrice(project.priceFrom)}`
        : project.priceTo != null
          ? `Up to ${formatPrice(project.priceTo)}`
          : "";

  return (
    <>
      <section className="page-header page-header--slim">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/projects">Projects</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/projects/${project.category}`}>
              {PROJECT_CATEGORY_LABELS[project.category]}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.name}</span>
          </nav>
          <p className="page-header__eyebrow u-eyebrow">
            {PROJECT_STATUS_LABELS[project.projectStatus ?? "completed"]}
          </p>
          <h1 className="page-header__title">{project.name}</h1>
          <p className="page-header__location">
            <MapPin size={16} aria-hidden="true" />
            <span>
              {project.area}, {project.state}
              {project.subArea && project.subArea !== project.area
                ? ` · ${project.subArea}`
                : ""}
            </span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-layout">
            <div className="detail-main">
              {/* Price banner */}
              {priceLine && (
                <div className="project-price">
                  <span className="project-price__label">Indicative pricing</span>
                  <span className="project-price__value">{priceLine}</span>
                </div>
              )}

              {/* Media tabs */}
              {(hasPhotos || videos.length > 0) && (
                <div className="detail-tabs">
                  {hasPhotos && (
                    <button
                      type="button"
                      className={`detail-tab ${tab === "photos" ? "is-active" : ""}`}
                      onClick={() => setTab("photos")}
                    >
                      Photos
                    </button>
                  )}
                  {videos.length > 0 && (
                    <button
                      type="button"
                      className={`detail-tab ${tab === "video" ? "is-active" : ""}`}
                      onClick={() => setTab("video")}
                    >
                      Video
                    </button>
                  )}
                </div>
              )}

              {tab === "photos" && hasPhotos && (
                <Gallery photos={project.photos!} altTitle={project.name} />
              )}

              {tab === "video" && videos.length > 0 && (
                <div className="detail-video">
                  {videos.map((v, i) =>
                    v.type === "youtube" ? (
                      <iframe
                        key={i}
                        className="detail-video__frame"
                        src={youtubeEmbed(v.url)}
                        title={`${project.name} video ${i + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <video key={i} controls className="detail-video__frame detail-video__frame--local">
                        <source src={v.url} />
                        Your browser does not support the video tag.
                      </video>
                    ),
                  )}
                </div>
              )}

              {/* Info */}
              <section className="detail-section">
                <h2 className="detail-section__title">Project Information</h2>
                <dl className="detail-specs">
                  {infoRows.map((r) => {
                    const Icon = r.icon;
                    return (
                      <div key={r.label} className="detail-spec">
                        <dt className="detail-spec__label">
                          <Icon size={16} aria-hidden="true" /> {r.label}
                        </dt>
                        <dd className="detail-spec__value">{r.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </section>

              {/* Description */}
              <section className="detail-section">
                <h2 className="detail-section__title">About the project</h2>
                <p className="detail-description">{project.description}</p>
              </section>

              {/* Unit types */}
              {hasUnitTypes && (
                <section className="detail-section">
                  <h2 className="detail-section__title">Available Unit Types</h2>
                  <ul className="detail-features" role="list">
                    {project.unitTypes!.map((u) => (
                      <li key={u} className="detail-feature">
                        <Users size={16} aria-hidden="true" /> {u}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Facilities */}
              {hasFacilities && (
                <section className="detail-section">
                  <h2 className="detail-section__title">Facilities</h2>
                  <ul className="detail-features" role="list">
                    {project.facilities!.map((f) => (
                      <li key={f} className="detail-feature">
                        <Check size={16} aria-hidden="true" /> {f}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Floor plans */}
              {hasFloorPlans && (
                <section className="detail-section">
                  <h2 className="detail-section__title">Floor Plans</h2>
                  <div className="floorplan-grid">
                    {project.floorPlans!.map((fp, i) => (
                      <div key={i} className="floorplan-item">
                        <img src={fp} alt={`${project.name} floor plan ${i + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Location */}
              {locationLines.length > 0 && (
                <section className="detail-section">
                  <h2 className="detail-section__title">Location</h2>
                  <dl className="detail-location">
                    {locationLines.map((l) => (
                      <div key={l.label} className="detail-location__row">
                        <dt>{l.label}</dt>
                        <dd>{l.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="detail-location__note">
                    Map integration is coming soon. For site visits or a brochure,
                    just ask.
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="detail-sidebar">
              <div className="detail-sidebar__sticky">
                {priceLine && (
                  <div className="detail-sidebar__price">
                    <span className="detail-sidebar__price-label">Indicative pricing</span>
                    <span className="detail-sidebar__price-value">{priceLine}</span>
                  </div>
                )}
                <EnquiryCard
                  title={project.name}
                  whatsappMessage={projectWhatsAppMessage(project.name)}
                >
                  <dl className="detail-sidebar__specs">
                    <div className="detail-sidebar__spec">
                      <dt>Developer</dt>
                      <dd>{project.developer ?? "—"}</dd>
                    </div>
                    <div className="detail-sidebar__spec">
                      <dt>Category</dt>
                      <dd>{PROJECT_CATEGORY_LABELS[project.category]}</dd>
                    </div>
                    <div className="detail-sidebar__spec">
                      <dt>Status</dt>
                      <dd>{PROJECT_STATUS_LABELS[project.projectStatus ?? "completed"]}</dd>
                    </div>
                  </dl>
                </EnquiryCard>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Mobile sticky enquiry bar */}
      <div className="detail-stickybar">
        <a
          className="btn btn--whatsapp"
          href={buildWhatsAppUrl(projectWhatsAppMessage(project.name))}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <Link to="/contact" state={{ subject: project.name }} className="btn btn--primary">
          Enquire
        </Link>
      </div>
    </>
  );
}
