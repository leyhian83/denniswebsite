import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilterControls } from "../components/filters/FilterControls";
import { ListingToolbar } from "../components/filters/ListingToolbar";
import { MobileFilterSheet } from "../components/filters/MobileFilterSheet";
import { PropertyCard } from "../components/property/PropertyCard";
import { NotFoundPage } from "./NotFoundPage";
import { usePageMeta } from "../hooks/usePageMeta";
import { getDistrictBySlugs } from "../services/areaService";
import { filterProperties, countPropertiesForArea, type PropertySort } from "../services/propertyService";
import type { FiltersValue } from "../components/filters/filterOptions";

export function AreaDetailPage() {
  const { stateSlug, areaSlug } = useParams<{ stateSlug: string; areaSlug: string }>();
  const found = stateSlug && areaSlug ? getDistrictBySlugs(stateSlug, areaSlug) : undefined;

  // base filters lock the state + area to this location
  const base: FiltersValue = found
    ? { state: found.state.state, area: found.district.name }
    : {};

  const [filters, setFilters] = useState<FiltersValue>(base);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PropertySort>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  usePageMeta(
    found
      ? {
          title: `${found.district.name}`,
          description: `${found.district.name}, ${found.state.state} — ${found.district.description}`,
        }
      : { title: "Area Not Found" },
  );

  // Reset the (non-locked) filters when the area route changes.
  useEffect(() => {
    setFilters(base);
    setQuery("");
  }, [stateSlug, areaSlug]);

  if (!found) return <NotFoundPage />;

  const { state, district } = found;
  const total = countPropertiesForArea(state.state, district.name);
  const activeFilterCount = countActive(filters);

  const results = filterProperties({ ...filters, query }, sort);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/areas">Areas</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/areas/${state.slug}`}>{state.state}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{district.name}</span>
          </nav>
          <p className="page-header__eyebrow u-eyebrow">{state.state}</p>
          <h1 className="page-header__title">{district.name}</h1>
          <p className="page-header__desc">{district.description}</p>
          <span className="area-detail__count">
            {total} listing{total === 1 ? "" : "s"} available
          </span>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="listing-layout">
            <aside className="filter-sidebar">
              <FilterControls
                value={filters}
                onChange={setFilters}
                onReset={() => setFilters(base)}
                lockedCategory={undefined}
              />
            </aside>

            <div>
              <ListingToolbar
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                resultCount={results.length}
                onShowFilters={() => setSheetOpen(true)}
                activeFilterCount={activeFilterCount}
              />

              {results.length > 0 ? (
                <div className="property-grid">
                  {results.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2 className="empty-state__title">No properties found here</h2>
                  <p className="empty-state__text">
                    Try widening your filters to see more properties in {district.name}.
                  </p>
                  <Link to="/subsale" className="btn btn--primary">
                    Browse all properties
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <MobileFilterSheet
        open={sheetOpen}
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters(base)}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

function countActive(f: FiltersValue): number {
  let n = 0;
  if (f.category) n++;
  if (f.residentialType) n++;
  if (f.minPrice != null && f.maxPrice != null) n++;
  if (f.bedrooms) n++;
  return n;
}
