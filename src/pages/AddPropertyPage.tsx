import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  LogOut,
  Minus,
  Plus,
} from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { useAuth } from "../context/AuthContext";
import { MediaUploader } from "../components/admin/MediaUploader";
import {
  createProperty,
  type CreatePropertyResult,
  type PropertyInput,
  type UploadedMedia,
} from "../services/propertyService";
import {
  MALAYSIA_AREAS,
  MALAYSIA_PROPERTY_TYPES,
  MALAYSIA_STATES,
  MALAYSIA_SUBAREAS,
} from "../data/malaysiaLocations";
import type {
  BumiLotStatus,
  PropertyCategory,
  PropertyTitleType,
  VideoSource,
} from "../types/property";

type FormValues = {
  headline: string;
  category: PropertyCategory | "";
  propertyType: string;
  state: string;
  area: string;
  subArea: string;
  address: string;
  block: string;
  unitNumber: string;
  floor: string;
  hideAddressDetails: boolean;
  price: string;
  negotiable: boolean;
  bedrooms: string;
  bathrooms: string;
  carParks: number;
  builtUpSqFt: string;
  landAreaSqFt: string;
  builtUpWidthFt: string;
  builtUpLengthFt: string;
  tenure: string;
  furnishing: string;
  furnishingDetails: string[];
  completionYear: string;
  titleType: PropertyTitleType | "";
  bumiLot: BumiLotStatus;
  facingDirection: string;
  maintenanceFee: string;
  mapUrl: string;
  description: string;
  keyFeatures: string;
  photos: string;
  featured: boolean;
  status: "available" | "reserved" | "sold";
};

const EMPTY: FormValues = {
  headline: "",
  category: "",
  propertyType: "",
  state: "",
  area: "",
  subArea: "",
  address: "",
  block: "",
  unitNumber: "",
  floor: "",
  hideAddressDetails: false,
  price: "",
  negotiable: false,
  bedrooms: "",
  bathrooms: "",
  carParks: 0,
  builtUpSqFt: "",
  landAreaSqFt: "",
  builtUpWidthFt: "",
  builtUpLengthFt: "",
  tenure: "",
  furnishing: "",
  furnishingDetails: [],
  completionYear: "",
  titleType: "",
  bumiLot: "not-specified",
  facingDirection: "",
  maintenanceFee: "",
  mapUrl: "",
  description: "",
  keyFeatures: "",
  photos: "",
  featured: false,
  status: "available",
};

const steps = [
  { label: "Basics", title: "Describe the listing" },
  { label: "Location", title: "Help buyers find it" },
  { label: "Size & price", title: "Add the essentials" },
  { label: "Details", title: "Give buyers context" },
  { label: "Story", title: "Write the public listing" },
  { label: "Media", title: "Prepare to publish" },
] as const;

const furnishingOptions = ["Fully Furnished", "Partially Furnished", "Unfurnished"];
const furnishingDetails = [
  "Air Conditioner",
  "Bed",
  "Cooker Hood",
  "Fridge",
  "Wardrobe",
  "Water Heater",
  "Washing Machine",
];
const directions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];

function listFromCsv(value: string): string[] | undefined {
  const values = value.split(",").map((item) => item.trim()).filter(Boolean);
  return values.length ? values : undefined;
}

function numOrUndefined(value: string): number | undefined {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) && number >= 0 ? number : undefined;
}

function numOrZero(value: string): number | undefined {
  const number = numOrUndefined(value);
  return number && number > 0 ? number : undefined;
}

export function AddPropertyPage() {
  usePageMeta({ title: "Add a Property" });
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues | "form", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreatePropertyResult | null>(null);
  const [photos, setPhotos] = useState<UploadedMedia[]>([]);
  const [videos, setVideos] = useState<UploadedMedia[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  const areaOptions = useMemo(
    () => values.state ? MALAYSIA_AREAS[values.state] ?? [] : Array.from(new Set(Object.values(MALAYSIA_AREAS).flat())).sort(),
    [values.state],
  );
  const subAreaOptions = useMemo(
    () => values.area ? MALAYSIA_SUBAREAS[values.area] ?? [] : [],
    [values.area],
  );
  const propertyTypeOptions = useMemo(
    () => values.category ? MALAYSIA_PROPERTY_TYPES[values.category] ?? [] : Array.from(new Set(Object.values(MALAYSIA_PROPERTY_TYPES).flat())).sort(),
    [values.category],
  );
  const pricePerSqFt = values.price && values.builtUpSqFt
    ? Number(values.price) / Number(values.builtUpSqFt)
    : undefined;

  const set = (key: keyof FormValues) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = event.target;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setValues((current) => {
      const next = { ...current, [key]: value } as FormValues;
      if (key === "state" && value !== current.state) {
        next.area = "";
        next.subArea = "";
      }
      if (key === "area" && value !== current.area) next.subArea = "";
      if (key === "category" && value !== current.category) next.propertyType = "";
      return next;
    });
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
    if (result && !result.ok) setResult(null);
  };

  const toggleFurnishingDetail = (detail: string) => {
    setValues((current) => ({
      ...current,
      furnishingDetails: current.furnishingDetails.includes(detail)
        ? current.furnishingDetails.filter((item) => item !== detail)
        : [...current.furnishingDetails, detail],
    }));
  };

  const validateStep = (targetStep: number): boolean => {
    const next: typeof errors = {};
    if (targetStep === 0) {
      if (values.headline.trim().length < 10) next.headline = "Use at least 10 characters for a clear headline.";
      if (values.headline.trim().length > 70) next.headline = "Keep the headline within 70 characters.";
      if (!values.category) next.category = "Choose a category.";
      if (!values.propertyType) next.propertyType = "Choose a property type.";
    }
    if (targetStep === 1) {
      if (!values.state) next.state = "Choose a Malaysian state.";
      if (!values.area) next.area = "Choose an area.";
    }
    if (targetStep === 2) {
      if (!numOrZero(values.price)) next.price = "Enter an asking price greater than zero.";
    }
    if (targetStep === 4) {
      if (values.description.trim().length < 40) next.description = "Add at least 40 characters so buyers understand the property.";
      if (values.description.length > 1000) next.description = "Keep the description within 1,000 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const valid = [0, 1, 2, 4].every(validateStep);
    if (!valid) {
      const firstInvalid = [0, 1, 2, 4].find((index) => {
        const previous = step;
        setStep(index);
        const okay = validateStep(index);
        setStep(previous);
        return !okay;
      });
      if (firstInvalid != null) setStep(firstInvalid);
      return;
    }
    setSubmitting(true);
    setErrors({});

    const uploadedPhotos = photos.filter((item) => item.kind === "image").map((item) => item.url);
    const uploadedVideos: VideoSource[] = videos.filter((item) => item.kind === "video").map((item) => ({ type: "local", url: item.url }));
    const youtube = videoUrl.trim();
    if (youtube) uploadedVideos.push({ type: "youtube", url: youtube });

    const input: PropertyInput = {
      title: values.headline,
      headline: values.headline,
      category: values.category as PropertyCategory,
      propertyType: values.propertyType,
      state: values.state,
      area: values.area,
      subArea: values.subArea || undefined,
      address: values.address || undefined,
      block: values.block || undefined,
      unitNumber: values.unitNumber || undefined,
      floor: values.floor || undefined,
      hideAddressDetails: values.hideAddressDetails,
      price: Number(values.price),
      negotiable: values.negotiable,
      bedrooms: numOrZero(values.bedrooms),
      bathrooms: numOrZero(values.bathrooms),
      carParks: values.carParks,
      builtUpSqFt: numOrZero(values.builtUpSqFt),
      landAreaSqFt: numOrZero(values.landAreaSqFt),
      builtUpWidthFt: numOrZero(values.builtUpWidthFt),
      builtUpLengthFt: numOrZero(values.builtUpLengthFt),
      tenure: values.tenure || undefined,
      furnishing: values.furnishing || undefined,
      furnishingDetails: values.furnishingDetails,
      completionYear: numOrZero(values.completionYear),
      titleType: values.titleType || undefined,
      bumiLot: values.bumiLot,
      facingDirection: values.facingDirection || undefined,
      maintenanceFee: numOrZero(values.maintenanceFee),
      mapUrl: values.mapUrl || undefined,
      description: values.description,
      keyFeatures: listFromCsv(values.keyFeatures),
      photos: [...uploadedPhotos, ...(listFromCsv(values.photos) ?? [])],
      videos: uploadedVideos.length ? uploadedVideos : undefined,
      featured: values.featured,
      status: values.status,
    };
    const created = await createProperty(input);
    setResult(created);
    setSubmitting(false);
  };

  if (result?.ok) {
    return (
      <section className="section">
        <div className="container container--narrow">
          <div className="admin-success" role="status">
            <CheckCircle2 size={44} aria-hidden="true" />
            <p className="admin-success__eyebrow u-eyebrow">Saved</p>
            <h1 className="admin-success__title">Property added</h1>
            <p className="admin-success__text">
              <strong>{result.property.title}</strong>{" "}
              {result.persisted
                ? "has been added to the local property data and is now visible on the public listing pages."
                : "was created for this session. The production deployment needs a database or API to persist new listings."}
            </p>
            <div className="admin-success__actions">
              <Link className="btn btn--primary" to={`/properties/${result.property.slug}`}>View public listing</Link>
              <button type="button" className="btn btn--outline" onClick={() => { setValues(EMPTY); setResult(null); setStep(0); setPhotos([]); setVideos([]); }}>
                Add another property
              </button>
            </div>
            {!result.persisted && <details className="admin-success__json"><summary>Show JSON fallback</summary><pre>{result.json}</pre></details>}
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
          <h1 className="page-header__title">Add a property</h1>
          <p className="page-header__desc">Create a customer-ready subsale listing with clear facts, helpful context, and a polished public detail page.</p>
          <div className="page-header__actions">
            <button type="button" className="btn btn--outline btn--sm" onClick={() => { logout(); navigate("/login"); }}><LogOut size={14} aria-hidden="true" /> Log out</button>
            <Link to="/subsale" className="btn btn--ghost btn--sm"><ArrowLeft size={14} aria-hidden="true" /> Public listings</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow">
          {errors.form && <div className="admin-form__banner" role="alert"><AlertCircle size={18} aria-hidden="true" />{errors.form}</div>}
          <form className="property-wizard" onSubmit={handleSubmit} noValidate>
            <nav className="property-wizard__progress" aria-label="Listing progress">
              <ol>
                {steps.map((item, index) => (
                  <li key={item.label} className={index === step ? "is-active" : index < step ? "is-complete" : ""}>
                    <button type="button" onClick={() => index <= step && setStep(index)} aria-current={index === step ? "step" : undefined} disabled={index > step}>
                      <span className="property-wizard__step-number">{index < step ? <Check size={14} aria-hidden="true" /> : index + 1}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="property-wizard__progress-note">Step {step + 1} of {steps.length}</p>
            </nav>

            <div className="property-wizard__panel">
              <div className="property-wizard__intro">
                <p className="u-eyebrow">{steps[step].label}</p>
                <h2>{steps[step].title}</h2>
                <p>{step === 0 ? "Start with the information customers notice first." : step === 1 ? "Use precise Malaysian location options, then add the public address detail you are comfortable sharing." : step === 2 ? "These facts power the public property facts and pricing summary." : step === 3 ? "Give buyers the practical details they need to compare homes." : step === 4 ? "This copy appears directly on the customer-facing property page." : "Add media and decide how the listing should appear."}</p>
              </div>

              {step === 0 && <div className="property-wizard__fields">
                <Field id="property-headline" label="Headline *" error={errors.headline} hint={`${values.headline.length} / 70 characters`} wide>
                  <input id="property-headline" type="text" maxLength={70} value={values.headline} onChange={set("headline")} placeholder="e.g. Aira Residence @ Damansara Heights" aria-invalid={Boolean(errors.headline)} />
                </Field>
                <Field id="property-category" label="Category *" error={errors.category}>
                  <select id="property-category" value={values.category} onChange={set("category")} aria-invalid={Boolean(errors.category)}><option value="">Select category…</option><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option></select>
                </Field>
                <Field id="property-type" label="Property type *" error={errors.propertyType}>
                  <select id="property-type" value={values.propertyType} onChange={set("propertyType")} aria-invalid={Boolean(errors.propertyType)}><option value="">Select type…</option>{propertyTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select>
                </Field>
                <Field id="property-status" label="Listing status"><select id="property-status" value={values.status} onChange={set("status")}><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></Field>
                <div className="property-wizard__callout property-wizard__callout--wide"><Info size={18} aria-hidden="true" /><span>The headline becomes the public page title and URL. Keep it specific enough to help customers recognise the property.</span></div>
              </div>}

              {step === 1 && <div className="property-wizard__fields">
                <Field id="property-state" label="State *" error={errors.state} hint="All Malaysian states and federal territories are included."><select id="property-state" value={values.state} onChange={set("state")} aria-invalid={Boolean(errors.state)}><option value="">Choose a state…</option>{MALAYSIA_STATES.map((state) => <option key={state} value={state}>{state}</option>)}</select></Field>
                <Field id="property-area" label="Area *" error={errors.area}><select id="property-area" value={values.area} onChange={set("area")} disabled={!values.state} aria-invalid={Boolean(errors.area)}><option value="">{values.state ? "Choose an area…" : "Choose a state first"}</option>{areaOptions.map((area) => <option key={area} value={area}>{area}</option>)}</select></Field>
                <Field id="property-subarea" label="Sub-area" hint="Optional neighbourhood detail for search and the public location summary."><select id="property-subarea" value={values.subArea} onChange={set("subArea")} disabled={!values.area}><option value="">{values.area ? "Choose a sub-area…" : "Choose an area first"}</option>{subAreaOptions.map((area) => <option key={area} value={area}>{area}</option>)}</select></Field>
                <Field id="property-address" label="Public address"><input id="property-address" value={values.address} onChange={set("address")} placeholder="e.g. Jalan Damansara" /></Field>
                <Field id="property-block" label="Block"><input id="property-block" value={values.block} onChange={set("block")} placeholder="Optional" /></Field>
                <Field id="property-unit" label="Unit / house no."><input id="property-unit" value={values.unitNumber} onChange={set("unitNumber")} placeholder="Optional" /></Field>
                <Field id="property-floor" label="Floor"><input id="property-floor" value={values.floor} onChange={set("floor")} placeholder="Optional" /></Field>
                <label className="property-wizard__check property-wizard__field--wide"><input type="checkbox" checked={values.hideAddressDetails} onChange={set("hideAddressDetails")} /><span><strong>Hide block, unit/house no. and floor details when published.</strong><small>These values stay in admin records but will not be shown to customers.</small></span></label>
                <Field id="property-map-url" label="Map link" hint="Optional Google Maps or Waze link for the public location button." wide><input id="property-map-url" type="url" value={values.mapUrl} onChange={set("mapUrl")} placeholder="https://maps.google.com/..." /></Field>
              </div>}

              {step === 2 && <div className="property-wizard__fields">
                <Field id="property-price" label="Asking price (RM) *" error={errors.price}><div className="property-wizard__input-prefix"><span>RM</span><input id="property-price" type="number" min="1" step="1000" value={values.price} onChange={set("price")} placeholder="11,900,000" aria-invalid={Boolean(errors.price)} /></div></Field>
                <label className="property-wizard__check property-wizard__check--align-end"><input type="checkbox" checked={values.negotiable} onChange={set("negotiable")} /><span><strong>Price negotiable</strong><small>Show a negotiable label to customers.</small></span></label>
                <Field id="property-built-up" label="Built-up area" hint="Shown in square feet."><div className="property-wizard__input-suffix"><input id="property-built-up" type="number" min="0" step="1" value={values.builtUpSqFt} onChange={set("builtUpSqFt")} placeholder="5,253" /><span>sqft</span></div></Field>
                <Field id="property-land-area" label="Land area" hint="Useful for landed properties."><div className="property-wizard__input-suffix"><input id="property-land-area" type="number" min="0" step="1" value={values.landAreaSqFt} onChange={set("landAreaSqFt")} placeholder="4,800" /><span>sqft</span></div></Field>
                <Field id="property-width" label="Built-up width" hint="Optional dimensions."><div className="property-wizard__input-suffix"><input id="property-width" type="number" min="0" step="0.1" value={values.builtUpWidthFt} onChange={set("builtUpWidthFt")} placeholder="40" /><span>ft</span></div></Field>
                <Field id="property-length" label="Built-up length" hint="Optional dimensions."><div className="property-wizard__input-suffix"><input id="property-length" type="number" min="0" step="0.1" value={values.builtUpLengthFt} onChange={set("builtUpLengthFt")} placeholder="80" /><span>ft</span></div></Field>
                <Field id="property-bedrooms" label="Bedrooms"><input id="property-bedrooms" type="number" min="0" step="1" value={values.bedrooms} onChange={set("bedrooms")} placeholder="3" /></Field>
                <Field id="property-bathrooms" label="Bathrooms"><input id="property-bathrooms" type="number" min="0" step="1" value={values.bathrooms} onChange={set("bathrooms")} placeholder="2" /></Field>
                <div className="property-wizard__parking property-wizard__field--wide"><div><span className="property-wizard__label">Parking spaces</span><p>Let customers quickly understand parking capacity.</p></div><div className="property-wizard__stepper"><button type="button" onClick={() => setValues((current) => ({ ...current, carParks: Math.max(0, current.carParks - 1) }))} aria-label="Decrease parking spaces"><Minus size={18} aria-hidden="true" /></button><output aria-live="polite">{values.carParks}</output><button type="button" onClick={() => setValues((current) => ({ ...current, carParks: current.carParks + 1 }))} aria-label="Increase parking spaces"><Plus size={18} aria-hidden="true" /></button></div></div>
                <div className="property-wizard__calculation property-wizard__field--wide"><span><span className="property-wizard__label">Price per sqft</span><small>Calculated from asking price ÷ built-up area.</small></span><strong>{pricePerSqFt ? `RM ${pricePerSqFt.toLocaleString("en-MY", { maximumFractionDigits: 2 })}` : "Add price and built-up area"}</strong></div>
              </div>}

              {step === 3 && <div className="property-wizard__fields">
                <Field id="property-tenure" label="Tenure"><select id="property-tenure" value={values.tenure} onChange={set("tenure")}><option value="">Select tenure…</option><option>Freehold</option><option>Leasehold</option><option>Malay Reserved</option></select></Field>
                <Field id="property-completion" label="Completion year"><input id="property-completion" type="number" min="1900" max="2100" value={values.completionYear} onChange={set("completionYear")} placeholder="2019" /></Field>
                <ChoiceGroup label="Title type" value={values.titleType} options={[{ value: "individual", label: "Individual" }, { value: "strata", label: "Strata" }, { value: "master", label: "Master" }]} onChange={(value) => setValues((current) => ({ ...current, titleType: value as PropertyTitleType }))} />
                <Field id="property-bumi" label="Is this a Bumi Lot?"><select id="property-bumi" value={values.bumiLot} onChange={set("bumiLot")}><option value="not-specified">Do not specify</option><option value="yes">Yes</option><option value="no">No</option></select></Field>
                <Field id="property-direction" label="Direction"><select id="property-direction" value={values.facingDirection} onChange={set("facingDirection")}><option value="">Select a direction…</option>{directions.map((direction) => <option key={direction}>{direction}</option>)}</select></Field>
                <Field id="property-maintenance" label="Monthly maintenance fee" hint="Optional customer-facing cost. Leave blank if not applicable."><div className="property-wizard__input-prefix"><span>RM</span><input id="property-maintenance" type="number" min="0" step="10" value={values.maintenanceFee} onChange={set("maintenanceFee")} placeholder="Enter maintenance fee" /></div></Field>
                <ChoiceGroup label="Furnishing" value={values.furnishing} options={furnishingOptions.map((option) => ({ value: option, label: option }))} onChange={(value) => setValues((current) => ({ ...current, furnishing: value }))} wide />
                <div className="property-wizard__amenities property-wizard__field--wide"><div><span className="property-wizard__label">Furnishing details</span><p>Select all applicable details.</p></div><div className="property-wizard__chips">{furnishingDetails.map((detail) => <button type="button" key={detail} className={values.furnishingDetails.includes(detail) ? "is-selected" : ""} onClick={() => toggleFurnishingDetail(detail)} aria-pressed={values.furnishingDetails.includes(detail)}><Check size={15} aria-hidden="true" />{detail}</button>)}</div></div>
              </div>}

              {step === 4 && <div className="property-wizard__fields">
                <Field id="property-description" label="Description *" error={errors.description} hint={`${values.description.length} / 1,000 characters`} wide><textarea id="property-description" maxLength={1000} rows={10} value={values.description} onChange={set("description")} placeholder="Describe the layout, condition, setting, access and what makes this property worth viewing." aria-invalid={Boolean(errors.description)} /></Field>
                <Field id="property-features" label="Key features" hint="Comma-separated highlights shown as public feature chips." wide><input id="property-features" value={values.keyFeatures} onChange={set("keyFeatures")} placeholder="Renovated, Near MRT, Corner unit" /></Field>
                <div className="property-wizard__callout property-wizard__callout--wide"><Info size={18} aria-hidden="true" /><span>Customers will see this headline, description, feature list, and facts on the public property page.</span></div>
              </div>}

              {step === 5 && <div className="property-wizard__fields">
                <div className="property-wizard__media property-wizard__field--wide"><div><span className="property-wizard__label">Photos</span><p>Upload the strongest images first. The first image becomes the card cover.</p></div><MediaUploader scope="properties" slug={values.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-")} kind="image" value={photos} onChange={setPhotos} /></div>
                <Field id="property-photo-paths" label="Photo URLs" hint="Optional comma-separated paths for existing media." wide><input id="property-photo-paths" value={values.photos} onChange={set("photos")} placeholder="/media/properties/example/cover.jpg" /></Field>
                <div className="property-wizard__media property-wizard__field--wide"><div><span className="property-wizard__label">Video</span><p>Optional local upload or add a YouTube link below.</p></div><MediaUploader scope="properties" slug={values.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-")} kind="video" value={videos} onChange={setVideos} /></div>
                <Field id="property-video-url" label="YouTube URL" wide><input id="property-video-url" type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://youtube.com/watch?v=..." /></Field>
                <Field id="property-featured" label="Publishing"><div className="property-wizard__select-row"><select id="property-featured" value={values.featured ? "featured" : "standard"} onChange={(event) => setValues((current) => ({ ...current, featured: event.target.value === "featured" }))}><option value="standard">Standard listing</option><option value="featured">Featured listing</option></select><span className="property-wizard__hint">Featured listings may appear in curated areas of the site.</span></div></Field>
                <div className="property-wizard__preview property-wizard__field--wide"><span className="property-wizard__label">Public location preview</span><strong>{values.area || "Area"}{values.subArea ? ` · ${values.subArea}` : ""}, {values.state || "State"}</strong><small>{values.hideAddressDetails ? "Unit details will be hidden from customers." : values.address || "Add a public address or approximate location."}</small></div>
              </div>}
            </div>

            <div className="property-wizard__actions">
              <button type="button" className="btn btn--outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
              {step < steps.length - 1 ? <button type="button" className="btn btn--primary" onClick={goNext}>Continue <ArrowRight size={16} aria-hidden="true" /></button> : <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? "Saving…" : "Publish property"} {!submitting && <CheckCircle2 size={16} aria-hidden="true" />}</button>}
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

function Field({ id, label, error, hint, wide, children }: { id: string; label: string; error?: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={`property-wizard__field ${wide ? "property-wizard__field--wide" : ""}`}><label htmlFor={id}>{label}</label>{children}{hint && <span className="property-wizard__hint">{hint}</span>}{error && <span className="property-wizard__error">{error}</span>}</div>;
}

function ChoiceGroup({ label, value, options, onChange, wide }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void; wide?: boolean }) {
  return <fieldset className={`property-wizard__choice ${wide ? "property-wizard__field--wide" : ""}`}><legend>{label}</legend><div>{options.map((option) => <button type="button" key={option.value} className={value === option.value ? "is-selected" : ""} onClick={() => onChange(option.value)} aria-pressed={value === option.value}>{option.label}</button>)}</div></fieldset>;
}
