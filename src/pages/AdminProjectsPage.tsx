import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  Check,
  Edit3,
  Eye,
  FolderOpen,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  archiveProject,
  deleteProject,
  getAllProjectsForAdmin,
  restoreProject,
} from "../services/projectService";
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from "../types/project";
import { formatPriceCompact } from "../utils/format";

type ProjectView = "active" | "archived";
type ModalAction = "archive" | "restore" | "delete";

interface ConfirmationState {
  action: ModalAction;
  project: Project;
}

function projectPrice(project: Project): string {
  if (project.priceFrom != null && project.priceTo != null) {
    return `${formatPriceCompact(project.priceFrom)} – ${formatPriceCompact(project.priceTo)}`;
  }
  if (project.priceFrom != null) return `From ${formatPriceCompact(project.priceFrom)}`;
  if (project.priceTo != null) return `Up to ${formatPriceCompact(project.priceTo)}`;
  return "Price on request";
}

export function AdminProjectsPage() {
  usePageMeta({ title: "Manage Projects" });

  const [projects, setProjects] = useState<Project[]>(getAllProjectsForAdmin);
  const [view, setView] = useState<ProjectView>("active");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | ProjectCategory>("all");
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [modal, setModal] = useState<ConfirmationState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const activeCount = projects.filter((project) => !project.archived).length;
  const archivedCount = projects.filter((project) => project.archived).length;

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects
      .filter((project) => (view === "archived" ? project.archived : !project.archived))
      .filter((project) => category === "all" || project.category === category)
      .filter((project) => status === "all" || project.projectStatus === status)
      .filter((project) => {
        if (!normalizedQuery) return true;
        return [
          project.name,
          project.developer,
          project.state,
          project.area,
          project.subArea,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [category, projects, query, status, view]);

  const closeModal = () => {
    if (!busy) setModal(null);
  };

  const refreshProjects = () => setProjects(getAllProjectsForAdmin());

  const runAction = async () => {
    if (!modal) return;
    setBusy(true);
    setError("");
    const result =
      modal.action === "archive"
        ? await archiveProject(modal.project.id)
        : modal.action === "restore"
          ? await restoreProject(modal.project.id)
          : await deleteProject(modal.project.id);

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    refreshProjects();
    setNotice(
      modal.action === "archive"
        ? `${modal.project.name} was archived.`
        : modal.action === "restore"
          ? `${modal.project.name} is visible again.`
          : `${modal.project.name} was permanently deleted.`,
    );
    setModal(null);
    setBusy(false);
  };

  const modalTitle =
    modal?.action === "archive"
      ? "Archive this project?"
      : modal?.action === "restore"
        ? "Restore this project?"
        : "Delete this project permanently?";

  return (
    <>
      <section className="page-header page-header--admin">
        <div className="container">
          <p className="page-header__eyebrow u-eyebrow">Admin workspace</p>
          <div className="admin-dashboard__heading">
            <div>
              <h1 className="page-header__title">Manage projects</h1>
              <p className="page-header__desc">
                Keep your new development catalogue current from one place.
              </p>
            </div>
            <Link to="/admin/add-project" className="btn btn--primary btn--lg">
              <Plus size={17} aria-hidden="true" /> Add project
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--admin-dashboard">
        <div className="container">
          <div className="admin-dashboard__stats" aria-label="Project totals">
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-label">Live projects</span>
              <strong>{activeCount}</strong>
            </div>
            <div className="admin-dashboard__stat">
              <span className="admin-dashboard__stat-label">Archived</span>
              <strong>{archivedCount}</strong>
            </div>
            <div className="admin-dashboard__stat admin-dashboard__stat--quiet">
              <span className="admin-dashboard__stat-label">Showing</span>
              <strong>{filteredProjects.length}</strong>
            </div>
          </div>

          <div className="admin-dashboard__toolbar">
            <div className="admin-dashboard__views" role="tablist" aria-label="Project visibility">
              <button
                type="button"
                role="tab"
                aria-selected={view === "active"}
                className={view === "active" ? "is-active" : ""}
                onClick={() => setView("active")}
              >
                Live <span>{activeCount}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "archived"}
                className={view === "archived" ? "is-active" : ""}
                onClick={() => setView("archived")}
              >
                Archived <span>{archivedCount}</span>
              </button>
            </div>

            <div className="admin-dashboard__filters">
              <label className="admin-dashboard__search">
                <Search size={17} aria-hidden="true" />
                <span className="u-sr-only">Search projects</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, area or developer"
                />
              </label>
              <label className="admin-dashboard__select">
                <span className="u-sr-only">Filter by category</span>
                <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>
                  <option value="all">All categories</option>
                  {(Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategory[]).map((value) => (
                    <option key={value} value={value}>{PROJECT_CATEGORY_LABELS[value]}</option>
                  ))}
                </select>
              </label>
              <label className="admin-dashboard__select">
                <span className="u-sr-only">Filter by status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                  <option value="all">All statuses</option>
                  {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((value) => (
                    <option key={value} value={value}>{PROJECT_STATUS_LABELS[value]}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {notice && (
            <div className="admin-dashboard__notice" role="status">
              <Check size={17} aria-hidden="true" />
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification">
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          )}
          {error && <div className="admin-form__banner" role="alert">{error}</div>}

          {filteredProjects.length > 0 ? (
            <div className="admin-project-list" role="list">
              {filteredProjects.map((project) => (
                <article className="admin-project-row" key={project.id} role="listitem">
                  <img
                    className="admin-project-row__image"
                    src={project.photos[0]}
                    alt=""
                    loading="lazy"
                  />
                  <div className="admin-project-row__body">
                    <div className="admin-project-row__topline">
                      <span className="admin-project-row__category">
                        {PROJECT_CATEGORY_LABELS[project.category]}
                      </span>
                      {project.projectStatus && (
                        <span className="admin-project-row__status">
                          {PROJECT_STATUS_LABELS[project.projectStatus]}
                        </span>
                      )}
                      {project.featured && <span className="admin-project-row__featured">Featured</span>}
                    </div>
                    <h2>{project.name}</h2>
                    <p className="admin-project-row__meta">
                      {project.developer || "Independent project"} · {project.area}, {project.state}
                    </p>
                    <p className="admin-project-row__price">{projectPrice(project)}</p>
                  </div>
                  <div className="admin-project-row__actions">
                    <Link to={`/projects/${project.slug}`} className="admin-action admin-action--quiet">
                      <Eye size={16} aria-hidden="true" /> <span>View</span>
                    </Link>
                    {!project.archived && (
                      <Link to={`/admin/projects/${project.id}/edit`} className="admin-action">
                        <Edit3 size={16} aria-hidden="true" /> <span>Edit</span>
                      </Link>
                    )}
                    {project.archived ? (
                      <>
                        <button type="button" className="admin-action" onClick={() => setModal({ action: "restore", project })}>
                          <RotateCcw size={16} aria-hidden="true" /> <span>Restore</span>
                        </button>
                        <button type="button" className="admin-action admin-action--danger" onClick={() => setModal({ action: "delete", project })}>
                          <Trash2 size={16} aria-hidden="true" /> <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button type="button" className="admin-action admin-action--danger" onClick={() => setModal({ action: "archive", project })}>
                        <Archive size={16} aria-hidden="true" /> <span>Archive</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard__empty">
              <FolderOpen size={28} aria-hidden="true" />
              <h2>{view === "archived" ? "No archived projects" : "No projects found"}</h2>
              <p>{view === "archived" ? "Archived projects will appear here for restoration." : "Try changing your filters or add a new project."}</p>
              {view === "active" && <Link to="/admin/add-project" className="btn btn--primary">Add project</Link>}
            </div>
          )}
        </div>
      </section>

      {modal && (
        <div className="admin-confirm" role="presentation" onMouseDown={closeModal}>
          <div className="admin-confirm__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="admin-confirm__close" onClick={closeModal} aria-label="Close confirmation">
              <X size={18} aria-hidden="true" />
            </button>
            <div className="admin-confirm__icon"><Trash2 size={22} aria-hidden="true" /></div>
            <p className="admin-confirm__eyebrow u-eyebrow">Confirm action</p>
            <h2 id="admin-confirm-title">{modalTitle}</h2>
            <p>
              {modal.action === "archive"
                ? <><strong>{modal.project.name}</strong> will disappear from the public website but can be restored later.</>
                : modal.action === "restore"
                  ? <><strong>{modal.project.name}</strong> will become visible on the public website again.</>
                  : <><strong>{modal.project.name}</strong> and its local project record will be removed permanently. This cannot be undone.</>}
            </p>
            <div className="admin-confirm__actions">
              <button type="button" className="btn btn--outline" onClick={closeModal} disabled={busy}>Cancel</button>
              <button
                type="button"
                className={`btn ${modal.action === "restore" ? "btn--primary" : "btn--danger"}`}
                onClick={runAction}
                disabled={busy}
              >
                {busy ? "Working…" : modal.action === "archive" ? "Archive project" : modal.action === "restore" ? "Restore project" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
