"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { BROWSE_LIMIT, CAR_COLUMNS, type Car } from "@/lib/cars";
import CarCard from "./CarCard";
import CarFilters, { EMPTY_FILTERS, type Filters, hasAnyFilter } from "./CarFilters";
import BackendNotConnected from "./BackendNotConnected";

/** Parses a filter box into a number, or null when it's blank or nonsense. */
function num(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export default function BrowseClient() {
  const supabase = getSupabaseBrowserClient();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guards against out-of-order responses: only the newest request may
  // write to state, so a slow early query can't overwrite a fast later one.
  const latestRequest = useRef(0);

  const load = useCallback(
    async (f: Filters) => {
      if (!supabase) return;
      const requestId = ++latestRequest.current;

      let query = supabase.from("cars").select(CAR_COLUMNS).eq("status", "available");

      // Commas separate filters in PostgREST, so strip them from free text.
      const make = f.make.replace(/,/g, " ").trim();
      if (make) query = query.ilike("make", `%${make}%`);

      const minPrice = num(f.minPrice);
      if (minPrice !== null) query = query.gte("price", minPrice);
      const maxPrice = num(f.maxPrice);
      if (maxPrice !== null) query = query.lte("price", maxPrice);

      const yearFrom = num(f.yearFrom);
      if (yearFrom !== null) query = query.gte("year", yearFrom);
      const yearTo = num(f.yearTo);
      if (yearTo !== null) query = query.lte("year", yearTo);

      if (f.condition) query = query.eq("condition", f.condition);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(BROWSE_LIMIT);

      if (requestId !== latestRequest.current) return; // a newer search won

      if (error) {
        setError("Couldn't load listings. Refresh the page to try again.");
      } else {
        setCars((data ?? []) as Car[]);
        setError(null);
      }
      setLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    // Debounced so typing a make doesn't fire a query per keystroke.
    const timer = setTimeout(() => void load(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, load]);

  if (!supabase) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <BackendNotConnected />
      </section>
    );
  }

  const filtering = hasAnyFilter(filters);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <CarFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : cars.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
            {filtering
              ? "No cars match your filters — try widening your search."
              : "No cars listed yet. Be the first to sell one."}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {cars.length === 1 ? "1 car" : `${cars.length} cars`}
              {cars.length === BROWSE_LIMIT && " (showing the newest)"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} href={`/cars/${car.id}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
