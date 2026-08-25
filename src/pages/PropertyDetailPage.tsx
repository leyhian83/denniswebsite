import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize,
  Ruler,
  BadgeCheck,
  Check,
  Clock,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Gallery } from "../components/common/Gallery";
import { PropertyCard } from "../components/property/PropertyCard";
import { EnquiryCard } from "../components/contact/EnquiryCard";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  getPropertyBySlug,
  getSimilarProperties,
} from "../services/propertyService";
import { NotFoundPage } from "./NotFoundPage";
import {
  formatPrice,
  formatSqFt,
  slugToTitle,
} from "../utils/format";
import {
  buildWhatsAppUrl,
  propertyWhatsAppMessage,
} from "../utils/whatsapp";
import { CATEGORY_LABELS } from "../types/property";

/** Deterministic YouTube embed URL (no API key required). */
function youtubeEmbed(url: string): string {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  const id = m ? m[1] : url;
  return `https://www.youtube.com/embed/${id}`;
}

export function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<"photos" | "video">("photos");

  const property = slug ? getPropertyBySlug(slug) : undefined;
  usePageMeta(
    property
      ? {
          title: property.title,
          description: `${property.title} — ${formatPrice(property.price)}. ${
            CATEGORY_LABELS[property.category]
          } property in ${property.area}, ${property.state}.`,
        }
      : { title: "Property Not Found" },
  );

  if (!property) {
    return <NotFoundPage />;
  }

  const similar = getSimilarProperties(property);
  const videos = property.videos ?? [];

  // Detail rows shown only when a value is present.
  const details = [
    { label: "Price", value: formatPrice(property.price), icon: Tag },
    { label: "Property Type", value: slugToTitle(property.propertyType), icon: Tag },
    { label: "Category", value: CATEGORY_LABELS[property.category], icon: Tag },
    { label: "Transaction", value: "Subsale", icon: Clock },
    { label: "Tenure", value: property.tenure, icon: BadgeCheck },
    { label: "Bedrooms", value: property.bedrooms, icon: BedDouble },
    { label: "Bathrooms", value: property.bathrooms, icon: Bath },
    { label: "Car Parks", value: property.carParks, icon: Car },
    { label: "Built-up", value: formatSqFt(property.builtUpSqFt), icon: Maximize },
    { label: "Land Area", value: formatSqFt(property.landAreaSqFt), icon: Ruler },
    { label: "Furnishing", value: property.furnishing, icon: Check },
  ].filter((d) => d.value) as { label: string; value: string; icon: typeof Tag }[];

  const locationLines = [
    { label: "State", value: property.state },
    { label: "Area", value: property.area },
    { label: "Sub-area", value: property.subArea },
    { label: "Address", value: property.address },
  ].filter((l) => l.value) as { label: string; value: string }[];

  const hasPhotos = property.photos.length > 0;

  return (
    <>
      <section className="page-header page-header--slim">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/subsale">Subsale</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/subsale/${property.category}`}>
              {CATEGORY_LABELS[property.category]}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{property.title}</span>
          </nav>
          <p className="page-header__eyebrow u-eyebrow">
            {slugToTitle(property.propertyType)} · {CATEGORY_LABELS[property.category]}
          </p>
          <h1 className="page-header__title">{property.title}</h1>
          <p className="page-header__location">
            <MapPin size={16} aria-hidden="true" />
            <span>
              {property.area}, {property.state}
              {property.subArea && property.subArea !== property.area
                ? ` · ${property.subArea}`
                : ""}
            </span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-layout">
            {/* Main column */}
            <div className="detail-main">
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
                <Gallery photos={property.photos} altTitle={property.title} />
              )}

              {tab === "video" && videos.length > 0 && (
                <div className="detail-video">
                  {videos.map((v, i) =>
                    v.type === "youtube" ? (
                      <div key={i} className="detail-video__frame">
                        <iframe
                          src={youtubeEmbed(v.url)}
                          title={`${property.title} video ${i + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <video key={i} controls className="detail-video__frame detail-video__frame--local">
                        <source src={v.url} />
                        Your browser does not support the video tag.
                      </video>
                    ),
                  )}
                </div>
              )}

              {/* Price prominent on mobile */}
              <div className="detail-price-mobile">
                <span className="detail-price-mobile__label">Asking price</span>
                <span className="detail-price-mobile__value">
                  {formatPrice(property.price)}
                  {property.negotiable && (
                    <span className="detail-price-mobile__negotiable">Negotiable</span>
                  )}
                </span>
              </div>

              {/* Key information */}
              <section className="detail-section" aria-labelledby="detail-specs">
                <h2 id="detail-specs" className="detail-section__title">
                  Property Details
                </h2>
                <dl className="detail-specs">
                  {details.map((d) => {
                    const Icon = d.icon;
                    return (
                      <div key={d.label} className="detail-spec">
                        <dt className="detail-spec__label">
                          <Icon size={16} aria-hidden="true" /> {d.label}
                        </dt>
                        <dd className="detail-spec__value">{d.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </section>

              {/* Description */}
              <section className="detail-section" aria-labelledby="detail-desc">
                <h2 id="detail-desc" className="detail-section__title">About this property</h2>
                <p className="detail-description">{property.description}</p>
              </section>

              {/* Key features */}
              {property.keyFeatures && property.keyFeatures.length > 0 && (
                <section className="detail-section" aria-labelledby="detail-features">
                  <h2 id="detail-features" className="detail-section__title">Key Features</h2>
                  <ul className="detail-features" role="list">
                    {property.keyFeatures.map((f) => (
                      <li key={f} className="detail-feature">
                        <Check size={16} aria-hidden="true" /> {f}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Location */}
              <section className="detail-section" aria-labelledby="detail-location">
                <h2 id="detail-location" className="detail-section__title">Location</h2>
                <dl className="detail-location">
                  {locationLines.map((l) => (
                    <div key={l.label} className="detail-location__row">
                      <dt>{l.label}</dt>
                      <dd>{l.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="detail-location__note">
                  Map integration is coming soon. For exact coordinates or a
                  viewing, just ask.
                </p>
              </section>
            </div>

            {/* Sidebar — enquiry */}
            <aside className="detail-sidebar">
              <div className="detail-sidebar__sticky">
                <div className="detail-sidebar__price">
                  <span className="detail-sidebar__price-label">Asking price</span>
                  <span className="detail-sidebar__price-value">
                    {formatPrice(property.price)}
                    {property.negotiable && (
                      <span className="detail-sidebar__price-negotiable">Negotiable</span>
                    )}
                  </span>
                </div>
                <EnquiryCard
                  title={property.title}
                  whatsappMessage={propertyWhatsAppMessage(property.title)}
                >
                  <dl className="detail-sidebar__specs">
                    {details.slice(0, 4).map((d) => (
                      <div key={d.label} className="detail-sidebar__spec">
                        <dt>{d.label}</dt>
                        <dd>{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                </EnquiryCard>
              </div>
            </aside>
          </div>

          {/* Similar properties */}
          {similar.length > 0 && (
            <section className="detail-section" aria-labelledby="similar-title">
              <div className="section-head">
                <div>
                  <p className="section-head__eyebrow u-eyebrow">You may also like</p>
                  <h2 id="similar-title" className="u-section-title">Similar Properties</h2>
                </div>
              </div>
              <div className="property-grid">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      {/* Mobile sticky enquiry bar */}
      <div className="detail-stickybar">
        <a
          className="btn btn--whatsapp"
          href={buildWhatsAppUrl(propertyWhatsAppMessage(property.title))}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <Link to="/contact" state={{ subject: property.title }} className="btn btn--primary">
          Enquire
        </Link>
      </div>
    </>
  );
}
