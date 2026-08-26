import { Link } from "react-router-dom";
import { BedDouble, Bath, Car, Maximize, MapPin } from "lucide-react";
import type { Property } from "../../types";
import { ResponsiveImage } from "../common/ResponsiveImage";
import { formatPrice, slugToTitle } from "../../utils/format";
import { CATEGORY_LABELS, RESIDENTIAL_TYPES_LABELS } from "../../types/property";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

/** Which detail rows are relevant for a given category. */
function detailRows(property: Property) {
  const rows: { icon: typeof BedDouble; value?: number }[] = [];
  if (property.category === "residential") {
    if (property.bedrooms != null)
      rows.push({ icon: BedDouble, value: property.bedrooms });
    if (property.bathrooms != null)
      rows.push({ icon: Bath, value: property.bathrooms });
    if (property.builtUpSqFt != null)
      rows.push({ icon: Maximize, value: property.builtUpSqFt });
    if (property.carParks != null) rows.push({ icon: Car, value: property.carParks });
  } else {
    if (property.builtUpSqFt != null)
      rows.push({ icon: Maximize, value: property.builtUpSqFt });
    if (property.carParks != null) rows.push({ icon: Car, value: property.carParks });
  }
  return rows.filter((r) => r.value != null) as {
    icon: typeof BedDouble;
    value: number;
  }[];
}

export function PropertyCard({ property, className = "" }: PropertyCardProps) {
  const typeLabel =
    property.category === "residential" && property.propertyType in RESIDENTIAL_TYPES_LABELS
      ? RESIDENTIAL_TYPES_LABELS[property.propertyType]
      : slugToTitle(property.propertyType);

  const rows = detailRows(property);

  return (
    <article className={`property-card ${className}`.trim()}>
      <Link
        to={`/properties/${property.slug}`}
        className="property-card__media"
        aria-label={`View ${property.title}`}
      >
        <ResponsiveImage
          src={property.photos[0]}
          alt={`${property.title} — ${slugToTitle(property.propertyType)} in ${property.area}`}
          className="property-card__img"
        />
        <span className="property-card__status property-card__status--available">
          {property.status}
        </span>
        {property.featured && (
          <span className="property-card__featured">Featured</span>
        )}
      </Link>

      <div className="property-card__body">
        <div className="property-card__meta">
          <span className="property-card__type">{typeLabel}</span>
          <span className="property-card__dot" aria-hidden="true">·</span>
          <span className="property-card__category">{CATEGORY_LABELS[property.category]}</span>
        </div>

        <h3 className="property-card__title">
          <Link to={`/properties/${property.slug}`}>{property.title}</Link>
        </h3>

        <p className="property-card__price">
          {formatPrice(property.price)}
          {property.negotiable && (
            <span className="property-card__negotiable">Negotiable</span>
          )}
        </p>

        <p className="property-card__location">
          <MapPin size={14} aria-hidden="true" />
          <span>
            {property.area}
            {property.subArea && property.subArea !== property.area
              ? `, ${property.subArea}`
              : ""}
            , {property.state}
          </span>
        </p>

        {property.furnishing && (
          <p className="property-card__highlight">
            <span>{property.furnishing}</span>
            {property.maintenanceFee ? <span>RM {property.maintenanceFee.toLocaleString("en-MY")} / mo</span> : null}
          </p>
        )}

        {rows.length > 0 && (
          <dl className="property-card__specs">
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <div key={i} className="property-card__spec">
                  <Icon size={15} aria-hidden="true" />
                  <span>{row.value.toLocaleString()}</span>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </article>
  );
}
