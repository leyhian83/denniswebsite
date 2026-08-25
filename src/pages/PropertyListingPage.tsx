import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FilterControls } from "../components/filters/FilterControls";
import { ListingToolbar } from "../components/filters/ListingToolbar";
import { MobileFilterSheet } from "../components/filters/MobileFilterSheet";
import { PropertyCard } from "../components/property/PropertyCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { filterProperties, type PropertySort } from "../services/propertyService";
import type { FiltersValue } from "../components/filters/filterOptions";
import type { PropertyCategory } from "../types";
import { CATEGORY_LABELS, RESIDENTIAL_TYPES_LABELS } from "../types/property";
import { Button } from "../components/common/Button";

function countActive(f: FiltersValue): number {
  let n = 0;
  if (f.category) n++;
  if (f.residentialType) n++;
  if (f.state) n++;
  if (f.area) n++;
  if (f.minPrice != null && f.maxPrice != null) n++;
  if (f.bedrooms) n++;
  if (f.negotiable) n++;
  return n;
}

export function PropertyListingPage() {
  // e.g. /subsale, /subsale/residential, /subsale/residential/condominium
  usePageMeta({
    title: "Subsale Properties",
    description:
      "Browse subsale condominiums, landed homes, commercial and industrial properties across Kuala Lumpur and Selangor, with smart search and filters.",
  });

  const { categorySeg, typeSeg } = useParams<{
    categorySeg?: string;
    typeSeg?: string;
  }>();

  // Validate segments — redirect to 404 handled by NotFound page on bad data.
  const category = resolveCategory(categorySeg);
  const residentialType = resolveType(typeSeg);

  const [filters, setFilters] = useState<FiltersValue>(() => ({
    category,
    residentialType,
  }));
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PropertySort>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Keep the category/type filters in sync when navigating between
  // /subsale, /subsale/residential, /subsale/residential/condominium, etc.
  useEffect(() => {
    setFilters((prev) => ({ ...prev, category, residentialType }));
  }, [category, residentialType]);

  const results = filterProperties(
    { ...filters, query },
    sort,
  );

  const isResidential =
    filters.category === "residential" || category === "residential";

  const heading = buildHeading(category, residentialType);

  return (
    <>
      <section className="page-header">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/subsale">Subsale</Link>
            {category && (
              <>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{CATEGORY_LABELS[category]}</span>
              </>
            )}
            {residentialType && category === "residential" && (
              <>
                <span aria-hidden="true">/</span>
                <span>{RESIDENTIAL_TYPES_LABELS[residentialType]}</span>
              </>
            )}
          </nav>
          <p className="page-header__eyebrow u-eyebrow">Subsale</p>
          <h1 className="page-header__title">{heading}</h1>
          <p className="page-header__desc">
            Resale properties currently on the market. Browse by category and type,
            then refine by area, price and size.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Category navigation */}
          <nav className="category-nav" aria-label="Property categories">
            <Link
              to="/subsale"
              className={`category-nav__item ${!category ? "is-active" : ""}`}
            >
              All
            </Link>
            {(Object.keys(CATEGORY_LABELS) as PropertyCategory[]).map((c) => (
              <Link
                key={c}
                to={`/subsale/${c}`}
                className={`category-nav__item ${category === c ? "is-active" : ""}`}
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
          </nav>

          {isResidential && (
            <nav className="category-nav" aria-label="Residential types">
              <Link
                to="/subsale/residential"
                className={`category-nav__item ${!residentialType ? "is-active" : ""}`}
              >
                Residential · All
              </Link>
              <Link
                to="/subsale/residential/condominium"
                className={`category-nav__item ${
                  residentialType === "condominium" ? "is-active" : ""
                }`}
              >
                Condominium
              </Link>
              <Link
                to="/subsale/residential/landed"
                className={`category-nav__item ${
                  residentialType === "landed" ? "is-active" : ""
                }`}
              >
                Landed
              </Link>
            </nav>
          )}

          <div className="listing-layout">
            {/* Desktop sidebar */}
            <aside className="filter-sidebar">
              <FilterControls
                value={filters}
                onChange={(v) => setFilters(v)}
                onReset={() => setFilters({ category, residentialType })}
                lockedCategory={category}
              />
            </aside>

            {/* Results */}
            <div>
              <ListingToolbar
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={setSort}
                resultCount={results.length}
                onShowFilters={() => setSheetOpen(true)}
                activeFilterCount={countActive(filters)}
              />

              {results.length > 0 ? (
                <div className="property-grid">
                  {results.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h2 className="empty-state__title">No properties found</h2>
                  <p className="empty-state__text">
                    Try adjusting your filters or search term to see more results.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ category, residentialType });
                      setQuery("");
                    }}
                  >
                    Reset all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <MobileFilterSheet
        open={sheetOpen}
        value={filters}
        onChange={(v) => setFilters(v)}
        onReset={() => setFilters({ category, residentialType })}
        onClose={() => setSheetOpen(false)}
        lockedCategory={category}
      />
    </>
  );
}

function resolveCategory(seg?: string): "residential" | "commercial" | "industrial" | undefined {
  if (seg === "residential" || seg === "commercial" || seg === "industrial") return seg;
  return undefined;
}

function resolveType(seg?: string): "condominium" | "landed" | undefined {
  if (seg === "condominium" || seg === "landed") return seg;
  return undefined;
}

function buildHeading(
  category?: "residential" | "commercial" | "industrial",
  type?: "condominium" | "landed",
): string {
  if (category === "residential" && type) return `${RESIDENTIAL_TYPES_LABELS[type]} Properties`;
  if (category) return `${CATEGORY_LABELS[category]} Properties`;
  return "Subsale Properties";
}
