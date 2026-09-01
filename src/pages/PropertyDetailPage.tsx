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
  Compass,
  Building2,
  CircleDollarSign,
  Map,
} from "lucide-react";
import { useState } from "react";
import { Gallery } from "../components/common/Gallery";
import { PropertyCard } from "../components/property/PropertyCard";
import { EnquiryCard } from "../components/contact/EnquiryCard";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  getPropertyBySlug,
  getSimilarProperties,
  getPricePerSqFt,
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
          description: `${property.title} — ${formatPrice(property.price, property.priceLabel)}. ${
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
  const displayPrice = formatPrice(property.price, property.priceLabel);
  const priceLabel = property.priceLabel ? "Price" : "Asking price";

  // Detail rows shown only when a value is present.
  const pricePerSqFt = getPricePerSqFt(property);
  const details = [
    { label: "Price", value: displayPrice, icon: Tag },
    { label: "Monthly Rent", value: property.rentalPrice ? `${formatPrice(property.rentalPrice)} / month` : undefined, icon: CircleDollarSign },
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
    {
      label: "Dimensions",
      value: property.builtUpWidthFt && property.builtUpLengthFt
        ? `${property.builtUpWidthFt} × ${property.builtUpLengthFt} ft`
        : undefined,
      icon: Ruler,
    },
    { label: "Completion", value: property.completionYear, icon: Clock },
    { label: "Title Type", value: property.titleType ? slugToTitle(property.titleType) : undefined, icon: Building2 },
    { label: "Bumi Lot", value: property.bumiLot && property.bumiLot !== "not-specified" ? property.bumiLot === "yes" ? "Yes" : "No" : undefined, icon: BadgeCheck },
    { label: "Direction", value: property.facingDirection, icon: Compass },
    { label: "Maintenance", value: property.maintenanceFee ? formatPrice(property.maintenanceFee) + " / month" : undefined, icon: CircleDollarSign },
    { label: "Price per sqft", value: pricePerSqFt ? `RM ${pricePerSqFt.toLocaleString("en-MY", { maximumFractionDigits: 2 })}` : undefined, icon: CircleDollarSign },
  ].filter((d) => d.value) as { label: string; value: string; icon: typeof Tag }[];

  const additionalDetails = (property.additionalDetails ?? []).map((detail) => ({
    ...detail,
    icon: Building2,
  }));

  const detailGroups = [
    {
      label: "At a glance",
      items: details.filter((detail) => ["Price", "Monthly Rent", "Property Type", "Category", "Transaction", "Tenure"].includes(detail.label)),
    },
    {
      label: "Space & rooms",
      items: details.filter((detail) => ["Bedrooms", "Bathrooms", "Car Parks", "Built-up", "Land Area", "Dimensions"].includes(detail.label)),
    },
    {
      label: "Condition & costs",
      items: details.filter((detail) => ["Furnishing", "Completion", "Title Type", "Bumi Lot", "Direction", "Maintenance", "Price per sqft"].includes(detail.label)),
    },
    {
      label: "Operational details",
      items: additionalDetails,
    },
  ].filter((group) => group.items.length > 0);

  const locationLines = [
    { label: "State", value: property.state },
    { label: "Area", value: property.area },
    { label: "Sub-area", value: property.subArea },
    { label: "Address", value: property.hideAddressDetails ? undefined : property.address },
    { label: "Block", value: property.hideAddressDetails ? undefined : property.block },
    { label: "Unit / house no.", value: property.hideAddressDetails ? undefined : property.unitNumber },
    { label: "Floor", value: property.hideAddressDetails ? undefined : property.floor },
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
                        <video key={i} controls preload="metadata" poster={v.poster} className="detail-video__frame detail-video__frame--local">
                        <source src={v.url} />
                        Your browser does not support the video tag.
                      </video>
                    ),
                  )}
                </div>
              )}

              {/* Price prominent on mobile */}
              <div className="detail-price-mobile">
                <span className="detail-price-mobile__label">{priceLabel}</span>
                <span className="detail-price-mobile__value">
                  {displayPrice}
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
                <div className="detail-fact-groups">
                  {detailGroups.map((group) => (
                    <section key={group.label} className="detail-fact-group" aria-labelledby={`detail-group-${group.label.toLowerCase().replaceAll(" ", "-")}`}>
                      <h3 id={`detail-group-${group.label.toLowerCase().replaceAll(" ", "-")}`} className="detail-fact-group__title">{group.label}</h3>
                      <dl className="detail-specs">
                        {group.items.map((d) => {
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
                  ))}
                </div>
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

              {property.furnishingDetails && property.furnishingDetails.length > 0 && (
                <section className="detail-section" aria-labelledby="detail-furnishing">
                  <h2 id="detail-furnishing" className="detail-section__title">Furnishing details</h2>
                  <ul className="detail-features detail-features--chips" role="list">
                    {property.furnishingDetails.map((detail) => (
                      <li key={detail} className="detail-feature detail-feature--chip">
                        <Check size={16} aria-hidden="true" /> {detail}
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
                {property.hideAddressDetails && <p className="detail-location__note">Unit-level details are kept private. Ask Dennis Property for the exact address and a viewing.</p>}
                {property.mapUrl ? (
                  <a className="detail-map" href={property.mapUrl} target="_blank" rel="noopener noreferrer">
                    <Map size={20} aria-hidden="true" />
                    <span><strong>View approximate location</strong><small>Open map directions in a new tab</small></span>
                  </a>
                ) : (
                  <p className="detail-location__note"><Map size={16} aria-hidden="true" /> Approximate location shown. For exact directions or a viewing, just ask.</p>
                )}
              </section>
            </div>

            {/* Sidebar — enquiry */}
            <aside className="detail-sidebar">
              <div className="detail-sidebar__sticky">
                <div className="detail-sidebar__price">
                  <span className="detail-sidebar__price-label">{priceLabel}</span>
                  <span className="detail-sidebar__price-value">
                    {displayPrice}
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
