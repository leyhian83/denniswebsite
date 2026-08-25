import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LogOut, PlusCircle, AlertCircle } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import {
  createProject,
  slugify,
  type ProjectInput,
  type CreateProjectResult,
  type UploadedMedia,
} from "../services/projectService";
import { MediaUploader } from "../components/admin/MediaUploader";
import {
  PROJECT_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
  type ProjectCategory,
  type ProjectStatus,
} from "../types/project";
import type { VideoSource } from "../types/property";
import {
  MALAYSIA_AREAS,
  MALAYSIA_PROPERTY_TYPES,
  MALAYSIA_SUBAREAS,
  MALAYSIA_STATES,
} from "../data/malaysiaLocations";

type FormValues = {
  name: string;
  developer: string;
  category: ProjectCategory | "";
  propertyType: string;
  state: string;
  area: string;
  subArea: string;
  address: string;
  priceFrom: string;
  priceTo: string;
  tenure: string;
  completionDate: string;
  projectStatus: ProjectStatus | "";
  unitTypes: string;
  description: string;
  facilities: string;
  photos: string;
  featured: boolean;
};

const EMPTY: FormValues = {
  name: "",
  developer: "",
  category: "",
  propertyType: "",
  state: "",
  area: "",
  subArea: "",
  address: "",
  priceFrom: "",
  priceTo: "",
  tenure: "",
  completionDate: "",
  projectStatus: "",
  unitTypes: "",
  description: "",
  facilities: "",
  photos: "",
  featured: false,
};

/** "a, b, c" / "a,b,c" -> ["a","b","c"] */
function listFromCsv(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

function numOrUndefined(value: string): number | undefined {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0 ? n : undefined;
}

export function AddProjectPage() {
  usePageMeta({ title: "Add a Project" });

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateProjectResult | null>(null);

  // Uploaded media, keyed by kind. Staged as files are chosen and included in
  // the saved project's `photos` / `videos`.
  const [photos, setPhotos] = useState<UploadedMedia[]>([]);
  const [videos, setVideos] = useState<UploadedMedia[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  // Folder slug used for uploads is derived from the current project name.
  const uploadSlug = slugify(values.name);
  const areaOptions = values.state
    ? MALAYSIA_AREAS[values.state] ?? []
    : Array.from(new Set(Object.values(MALAYSIA_AREAS).flat())).sort();
  const propertyTypeOptions = values.category
    ? MALAYSIA_PROPERTY_TYPES[values.category] ?? []
    : Array.from(new Set(Object.values(MALAYSIA_PROPERTY_TYPES).flat())).sort();
  const subAreaOptions = values.area ? MALAYSIA_SUBAREAS[values.area] ?? [] : [];

  const set = (key: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value =
      e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "state" && value !== v.state) {
        next.area = "";
        next.subArea = "";
      }
      if (key === "area" && value !== v.area) {
        next.subArea = "";
      }
      return next;
    });
    if (errors[key]) setErrors((err) => ({ ...err, [key]: undefined }));
    if (result && !result.ok) setResult(null);
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Project name is required.";
    if (!values.category) next.category = "Pick a category.";
    if (!values.state.trim()) next.state = "State is required.";
    if (!values.area.trim()) next.area = "Area is required.";
    if (!values.description.trim()) next.description = "A short description is required.";
    const from = numOrUndefined(values.priceFrom);
    const to = numOrUndefined(values.priceTo);
    if (from != null && to != null && to < from) {
      next.priceTo = "Price To must be greater than Price From.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // Photos: uploaded files first, then any manually typed paths.
    const uploadedPhotos = photos.map((p) => p.url);
    const manualPhotos = listFromCsv(values.photos) ?? [];
    const photoUrls = [...uploadedPhotos, ...manualPhotos];

    // Videos: local uploaded files, plus an optional YouTube link.
    const videoSources: VideoSource[] = [];
    for (const v of videos) {
      videoSources.push({ type: "local", url: v.url });
    }
    const yt = videoUrl.trim();
    if (yt) {
      videoSources.push({ type: "youtube", url: yt });
    }

    const input: ProjectInput = {
      name: values.name,
      developer: values.developer || undefined,
      category: values.category as ProjectCategory,
      propertyType: values.propertyType || undefined,
      state: values.state,
      area: values.area,
      subArea: values.subArea || undefined,
      address: values.address || undefined,
      priceFrom: numOrUndefined(values.priceFrom),
      priceTo: numOrUndefined(values.priceTo),
      tenure: values.tenure || undefined,
      completionDate: values.completionDate || undefined,
      projectStatus: (values.projectStatus || undefined) as ProjectStatus | undefined,
      unitTypes: listFromCsv(values.unitTypes),
      description: values.description,
      facilities: listFromCsv(values.facilities),
      photos: photoUrls.length ? photoUrls : [],
      videos: videoSources.length ? videoSources : undefined,
      featured: values.featured,
    };

    const res = await createProject(input);
    setResult(res);
    setSubmitting(false);
  };

  if (result && result.ok) {
    return (
      <section className="section">
        <div className="container container--narrow">
          <div className="admin-success" role="status">
            <CheckCircle2 size={44} aria-hidden="true" />
            <p className="admin-success__eyebrow u-eyebrow">Saved</p>
            <h1 className="admin-success__title">Project added</h1>
            <p className="admin-success__text">
              <strong>{result.ok ? result.project.name : ""}</strong>{" "}
              {result.ok && result.persisted
                ? "has been written to src/data/projects.json. It now appears in Projects and the homepage featured section."
                : result.ok
                  ? "was created for this session. The dev-server file writer is not available, so copy the JSON below into src/data/projects.json to keep it."
                  : "could not be created. Please try again."}
            </p>

            {result.ok && (
              <div className="admin-success__actions">
                <Link
                  className="btn btn--primary"
                  to={`/projects/${result.project.slug}`}
                >
                  View project page
                </Link>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setValues(EMPTY);
                    setResult(null);
                  }}
                >
                  <PlusCircle size={16} aria-hidden="true" /> Add another
                </button>
              </div>
            )}

            {result.ok && !result.persisted && (
              <details className="admin-success__json">
                <summary>Show JSON to paste manually</summary>
                <pre>{result.json}</pre>
              </details>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="page-header page-header--admin">
        <div className="container">
          <p className="page-header__eyebrow u-eyebrow">Admin</p>
          <h1 className="page-header__title">Add a project</h1>
          <p className="page-header__desc">
            Fill in the details and the project is saved to the local{" "}
            <code>projects.json</code> data file — no React code required. A unique
            page is generated automatically from the project name.
          </p>
          <div className="page-header__actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={14} aria-hidden="true" /> Log out
            </button>
            <Link to="/projects" className="btn btn--ghost btn--sm">
              <ArrowLeft size={14} aria-hidden="true" /> All projects
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          {result && !result.ok && (
            <div className="admin-form__banner" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{result.error}</span>
            </div>
          )}

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form__grid">
              <div className="admin-form__field admin-form__field--wide">
                <label htmlFor="ap-name">Project name *</label>
                <input
                  id="ap-name"
                  type="text"
                  value={values.name}
                  onChange={set("name")}
                  placeholder="e.g. The Meridian Residences"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <span className="admin-form__error">{errors.name}</span>}
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-developer">Developer</label>
                <input
                  id="ap-developer"
                  type="text"
                  value={values.developer}
                  onChange={set("developer")}
                  placeholder="e.g. Meridian Development Sdn Bhd"
                />
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-category">Category *</label>
                <select
                  id="ap-category"
                  className="field"
                  value={values.category}
                  onChange={set("category")}
                  aria-invalid={Boolean(errors.category)}
                >
                  <option value="">Select category…</option>
                  {(Object.keys(PROJECT_CATEGORY_LABELS) as ProjectCategory[]).map((c) => (
                    <option key={c} value={c}>
                      {PROJECT_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="admin-form__error">{errors.category}</span>
                )}
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-type">Property type</label>
                <input
                  id="ap-type"
                  type="text"
                  value={values.propertyType}
                  onChange={set("propertyType")}
                  list="ap-property-type-options"
                  aria-autocomplete="list"
                  placeholder="Choose or type a property type"
                />
                <datalist id="ap-property-type-options">
                  {propertyTypeOptions.map((propertyType) => (
                    <option key={propertyType} value={propertyType} />
                  ))}
                </datalist>
                <span className="admin-form__hint">Options update when you choose a category. Custom values are allowed.</span>
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-state">State *</label>
                <input
                  id="ap-state"
                  type="text"
                  value={values.state}
                  onChange={set("state")}
                  list="ap-state-options"
                  autoComplete="address-level1"
                  aria-autocomplete="list"
                  placeholder="Choose or type a Malaysian state"
                  aria-invalid={Boolean(errors.state)}
                />
                <datalist id="ap-state-options">
                  {MALAYSIA_STATES.map((state) => (
                    <option key={state} value={state} />
                  ))}
                </datalist>
                <span className="admin-form__hint">All states and federal territories are available. You can also type a custom value.</span>
                {errors.state && <span className="admin-form__error">{errors.state}</span>}
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-area">Area *</label>
                <input
                  id="ap-area"
                  type="text"
                  value={values.area}
                  onChange={set("area")}
                  list="ap-area-options"
                  autoComplete="address-level2"
                  aria-autocomplete="list"
                  placeholder={values.state ? "Choose or type an area" : "Choose a state first"}
                  aria-invalid={Boolean(errors.area)}
                />
                <datalist id="ap-area-options">
                  {areaOptions.map((area) => (
                    <option key={area} value={area} />
                  ))}
                </datalist>
                <span className="admin-form__hint">
                  {values.state
                    ? areaOptions.length
                      ? "Choose from the curated list or type a custom area."
                      : "No curated areas for this state yet — type the area manually."
                    : "Select a state to see curated area suggestions."}
                </span>
                {errors.area && <span className="admin-form__error">{errors.area}</span>}
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-subarea">Sub-area</label>
                <input
                  id="ap-subarea"
                  type="text"
                  value={values.subArea}
                  onChange={set("subArea")}
                  list="ap-subarea-options"
                  autoComplete="address-line2"
                  aria-autocomplete="list"
                  placeholder={values.area ? "Choose or type a sub-area" : "Choose an area first"}
                />
                <datalist id="ap-subarea-options">
                  {subAreaOptions.map((subArea) => (
                    <option key={subArea} value={subArea} />
                  ))}
                </datalist>
                <span className="admin-form__hint">
                  {values.area
                    ? subAreaOptions.length
                      ? "Choose from the curated neighbourhood list or type a custom sub-area."
                      : "No curated sub-areas for this area yet — type one manually."
                    : "Select an area to see curated sub-area suggestions."}
                </span>
              </div>

              <div className="admin-form__field admin-form__field--wide">
                <label htmlFor="ap-address">Address</label>
                <input
                  id="ap-address"
                  type="text"
                  value={values.address}
                  onChange={set("address")}
                  placeholder="Street address (optional)"
                />
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-pricefrom">Price from (RM)</label>
                <input
                  id="ap-pricefrom"
                  type="number"
                  min="0"
                  step="1000"
                  value={values.priceFrom}
                  onChange={set("priceFrom")}
                  placeholder="e.g. 680000"
                />
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-priceto">Price to (RM)</label>
                <input
                  id="ap-priceto"
                  type="number"
                  min="0"
                  step="1000"
                  value={values.priceTo}
                  onChange={set("priceTo")}
                  placeholder="e.g. 980000"
                  aria-invalid={Boolean(errors.priceTo)}
                />
                {errors.priceTo && (
                  <span className="admin-form__error">{errors.priceTo}</span>
                )}
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-tenure">Tenure</label>
                <input
                  id="ap-tenure"
                  type="text"
                  value={values.tenure}
                  onChange={set("tenure")}
                  placeholder="e.g. Freehold"
                />
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-completion">Completion date</label>
                <input
                  id="ap-completion"
                  type="month"
                  value={values.completionDate}
                  onChange={set("completionDate")}
                />
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-status">Project status</label>
                <select
                  id="ap-status"
                  className="field"
                  value={values.projectStatus}
                  onChange={set("projectStatus")}
                >
                  <option value="">Select status…</option>
                  {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {PROJECT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form__field">
                <label htmlFor="ap-units">Unit types (comma-separated)</label>
                <input
                  id="ap-units"
                  type="text"
                  value={values.unitTypes}
                  onChange={set("unitTypes")}
                  placeholder="e.g. 1 Bedroom, 2 Bedrooms, 3 Bedrooms"
                />
              </div>

              <div className="admin-form__field admin-form__field--wide">
                <label htmlFor="ap-desc">Description *</label>
                <textarea
                  id="ap-desc"
                  rows={5}
                  value={values.description}
                  onChange={set("description")}
                  placeholder="Describe the project — location, concept, highlights…"
                  aria-invalid={Boolean(errors.description)}
                />
                {errors.description && (
                  <span className="admin-form__error">{errors.description}</span>
                )}
              </div>

              <div className="admin-form__field admin-form__field--wide">
                <label htmlFor="ap-facilities">Facilities (comma-separated)</label>
                <input
                  id="ap-facilities"
                  type="text"
                  value={values.facilities}
                  onChange={set("facilities")}
                  placeholder="e.g. Infinity Pool, Gym, Children's Playground"
                />
              </div>

              <div className="admin-media admin-form__field--wide">
                <div className="admin-media__panel">
                  <span className="admin-media__label">Photos</span>
                  <MediaUploader
                    slug={uploadSlug}
                    kind="image"
                    value={photos}
                    onChange={setPhotos}
                  />
                  <p className="admin-media__caption">
                    Upload .jpg, .png, .webp or .gif. The first photo becomes the cover.
                  </p>
                </div>

                <div className="admin-media__panel">
                  <span className="admin-media__label">Video</span>
                  <MediaUploader
                    slug={uploadSlug}
                    kind="video"
                    value={videos}
                    onChange={setVideos}
                  />
                  <input
                    id="ap-videourl"
                    className="field"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="…or paste a YouTube URL"
                  />
                  <p className="admin-media__caption">
                    Upload an .mp4 or .webm file, or link a YouTube video.
                  </p>
                </div>
              </div>

              <details className="admin-form__details admin-form__field--wide">
                <summary>Advanced: type photo paths manually</summary>
                <div className="admin-form__field">
                  <label htmlFor="ap-photos">Photo paths (comma-separated)</label>
                  <input
                    id="ap-photos"
                    type="text"
                    value={values.photos}
                    onChange={set("photos")}
                    placeholder="/media/projects/my-project/cover.jpg, /media/projects/my-project/lobby.jpg"
                  />
                  <span className="admin-form__hint">
                    Leave empty to use /media/projects/&lt;slug&gt;/cover.jpg.
                  </span>
                </div>
              </details>
            </div>

            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={set("featured")}
              />
              <span>Feature this project on the homepage</span>
            </label>

            <div className="admin-form__actions">
              <button
                type="submit"
                className="btn btn--primary btn--lg"
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Save project"}
              </button>
              <Link to="/projects" className="btn btn--outline btn--lg">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
