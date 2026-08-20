"use client";

import { brand } from "@/lib/config/brand";

export type Filters = {
  make: string;
  minPrice: string;
  maxPrice: string;
  yearFrom: string;
  yearTo: string;
  condition: "" | "new" | "used";
};

export const EMPTY_FILTERS: Filters = {
  make: "",
  minPrice: "",
  maxPrice: "",
  yearFrom: "",
  yearTo: "",
  condition: "",
};

export function hasAnyFilter(filters: Filters): boolean {
  return Object.values(filters).some((v) => v.trim() !== "");
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-2 focus:outline-offset-1";

export default function CarFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
}) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Find a car</h2>
        {hasAnyFilter(filters) && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="filter-make" className="block text-sm font-medium">
            Make
          </label>
          <input
            id="filter-make"
            value={filters.make}
            onChange={(e) => set("make", e.target.value)}
            placeholder="Any make"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="filter-condition" className="block text-sm font-medium">
            Condition
          </label>
          <select
            id="filter-condition"
            value={filters.condition}
            onChange={(e) => set("condition", e.target.value as Filters["condition"])}
            className={inputClass}
          >
            <option value="">Any</option>
            <option value="used">Used</option>
            <option value="new">New</option>
          </select>
        </div>

        <fieldset>
          <legend className="block text-sm font-medium">Price (RM)</legend>
          <div className="flex gap-2">
            <input
              aria-label="Minimum price"
              inputMode="numeric"
              value={filters.minPrice}
              onChange={(e) => set("minPrice", e.target.value)}
              placeholder="Min"
              className={inputClass}
            />
            <input
              aria-label="Maximum price"
              inputMode="numeric"
              value={filters.maxPrice}
              onChange={(e) => set("maxPrice", e.target.value)}
              placeholder="Max"
              className={inputClass}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-sm font-medium">Year</legend>
          <div className="flex gap-2">
            <input
              aria-label="Earliest year"
              inputMode="numeric"
              value={filters.yearFrom}
              onChange={(e) => set("yearFrom", e.target.value)}
              placeholder="From"
              className={inputClass}
            />
            <input
              aria-label="Latest year"
              inputMode="numeric"
              value={filters.yearTo}
              onChange={(e) => set("yearTo", e.target.value)}
              placeholder="To"
              className={inputClass}
            />
          </div>
        </fieldset>
      </div>

      <p className="mt-3 text-xs" style={{ color: brand.primaryColor }}>
        Results update as you type.
      </p>
    </div>
  );
}
