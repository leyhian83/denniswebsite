import { useState } from "react";
import {
  getAreasForState,
  getAvailableStates,
  getSubAreasForArea,
} from "../../services/propertyService";
import { propertyOptions, type FiltersValue } from "./filterOptions";

interface FilterControlsProps {
  value: FiltersValue;
  onChange: (value: FiltersValue) => void;
  onReset: () => void;
  showApply?: boolean;
  /** When non-null, lock category selection (area pages). */
  lockedCategory?: FiltersValue["category"];
}

export function FilterControls({
  value,
  onChange,
  onReset,
  showApply = false,
  lockedCategory,
}: FilterControlsProps) {
  const [draft, setDraft] = useState<FiltersValue>(value);
  const states = getAvailableStates();
  const areas = getAreasForState(draft.state);
  const subAreas = getSubAreasForArea(draft.area);

  const update = (patch: Partial<FiltersValue>) => {
    const next = { ...draft, ...patch };
    // Changing state clears the previously chosen area.
    if ("state" in patch) {
      next.area = undefined;
      next.subArea = undefined;
    }
    if ("area" in patch) next.subArea = undefined;
    setDraft(next);
    if (!showApply) onChange(next);
  };

  const reset = () => {
    setDraft({});
    onReset();
  };

  return (
    <form
      className="filter-controls"
      onSubmit={(e) => {
        e.preventDefault();
        if (showApply) onChange(draft);
      }}
      aria-label="Property filters"
    >
      <div className="filter-group">
        <span className="filter-group__label" id="f-cat">Category</span>
        <select
          aria-labelledby="f-cat"
          aria-disabled={Boolean(lockedCategory)}
          disabled={Boolean(lockedCategory)}
          value={draft.category ?? ""}
          onChange={(e) =>
            update({ category: (e.target.value || undefined) as FiltersValue["category"] })
          }
        >
          <option value="">All categories</option>
          {propertyOptions.categories.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {draft.category === "residential" || (!draft.category && !lockedCategory) ? (
        <div className="filter-group">
          <span className="filter-group__label" id="f-type">Type</span>
          <select
            aria-labelledby="f-type"
            value={draft.residentialType ?? ""}
            onChange={(e) =>
              update({ residentialType: (e.target.value || undefined) as FiltersValue["residentialType"] })
            }
          >
            <option value="">All residential types</option>
            {propertyOptions.residentialTypes.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="filter-group filter-group--hidden" aria-hidden="true" />
      )}

      <div className="filter-group">
        <span className="filter-group__label" id="f-state">State</span>
        <select
          aria-labelledby="f-state"
          value={draft.state ?? ""}
          onChange={(e) => update({ state: e.target.value || undefined })}
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="f-area">Area</span>
        <select
          aria-labelledby="f-area"
          value={draft.area ?? ""}
          onChange={(e) => update({ area: e.target.value || undefined })}
        >
          <option value="">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="f-subarea">Sub-area</span>
        <select
          aria-labelledby="f-subarea"
          value={draft.subArea ?? ""}
          onChange={(e) => update({ subArea: e.target.value || undefined })}
        >
          <option value="">All sub-areas</option>
          {subAreas.map((subArea) => (
            <option key={subArea} value={subArea}>{subArea}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="f-price">Price</span>
        <select
          aria-labelledby="f-price"
          value={
            draft.minPrice != null && draft.maxPrice != null
              ? `${draft.minPrice}-${draft.maxPrice}`
              : ""
          }
          onChange={(e) => {
            const [min, max] = e.target.value.split("-").map(Number);
            update({
              minPrice: e.target.value ? min : undefined,
              maxPrice: e.target.value ? max : undefined,
            });
          }}
        >
          <option value="">Any price</option>
          {propertyOptions.priceRanges.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="f-bed">Bedrooms</span>
        <select
          aria-labelledby="f-bed"
          value={draft.bedrooms != null ? String(draft.bedrooms) : ""}
          onChange={(e) =>
            update({ bedrooms: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">Any</option>
          {propertyOptions.bedrooms.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="f-negotiable">Pricing</span>
        <select
          aria-labelledby="f-negotiable"
          value={draft.negotiable ?? ""}
          onChange={(e) =>
            update({ negotiable: (e.target.value || undefined) as FiltersValue["negotiable"] })
          }
        >
          <option value="">Any price</option>
          {propertyOptions.negotiable.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="filter-controls__actions">
        {showApply && (
          <button type="submit" className="btn btn--primary">
            Apply filters
          </button>
        )}
        <button type="button" className="btn btn--ghost-text" onClick={reset}>
          Reset
        </button>
      </div>
    </form>
  );
}
