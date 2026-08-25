import { Search, SlidersHorizontal } from "lucide-react";
import type { PropertySort } from "../../services/propertyService";

interface ListingToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sort: PropertySort;
  onSortChange: (s: PropertySort) => void;
  resultCount: number;
  onShowFilters: () => void;
  activeFilterCount: number;
}

const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function ListingToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
  onShowFilters,
  activeFilterCount,
}: ListingToolbarProps) {
  return (
    <div className="listing-toolbar">
      <div className="listing-toolbar__search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search properties"
          placeholder="Search area, condo, name…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="listing-toolbar__right">
        <button
          type="button"
          className="listing-toolbar__filters-btn"
          onClick={onShowFilters}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="listing-toolbar__count">{activeFilterCount}</span>
          )}
        </button>

        <label className="listing-toolbar__sort">
          <span className="u-sr-only">Sort by</span>
          <select
            aria-label="Sort by"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as PropertySort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <p className="listing-toolbar__count-text" aria-live="polite">
        {resultCount} {resultCount === 1 ? "property" : "properties"}
      </p>
    </div>
  );
}
