import { X } from "lucide-react";
import { FilterControls } from "./FilterControls";
import type { FiltersValue } from "./filterOptions";
import type { PropertyCategory } from "../../types";

interface MobileFilterSheetProps {
  open: boolean;
  value: FiltersValue;
  onChange: (value: FiltersValue) => void;
  onReset: () => void;
  onClose: () => void;
  lockedCategory?: PropertyCategory;
}

export function MobileFilterSheet({
  open,
  value,
  onChange,
  onReset,
  onClose,
  lockedCategory,
}: MobileFilterSheetProps) {
  return (
    <div
      className={`filter-sheet ${open ? "is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
    >
      <button
        type="button"
        className="filter-sheet__overlay"
        onClick={onClose}
        aria-label="Close filters"
        tabIndex={open ? 0 : -1}
      />
      <div className="filter-sheet__panel">
        <div className="filter-sheet__head">
          <h2 className="filter-sheet__title">Filters</h2>
          <button
            type="button"
            className="filter-sheet__close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <X size={22} />
          </button>
        </div>
        <FilterControls
          value={value}
          onChange={onChange}
          onReset={onReset}
          showApply
          lockedCategory={lockedCategory}
        />
      </div>
    </div>
  );
}
