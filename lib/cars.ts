// ─────────────────────────────────────────────────────────────
// Shared car types and display helpers.
// No "use client" here on purpose: both server components
// (the listing detail page) and client components import this.
// ─────────────────────────────────────────────────────────────

export type CarCondition = "new" | "used";
export type CarStatus = "available" | "sold";

export type Car = {
  id: string;
  seller_id: string;
  make: string;
  model: string;
  year: number;
  /** Postgres `numeric` can arrive as a string — always coerce before maths. */
  price: number | string;
  mileage: number | null;
  condition: CarCondition;
  description: string | null;
  status: CarStatus;
  /** Path inside the `car-photos` bucket, or null when the seller added none. */
  photo_path: string | null;
  created_at: string;
};

/** The exact columns every query selects. Keeps them in one place. */
export const CAR_COLUMNS =
  "id, seller_id, make, model, year, price, mileage, condition, description, status, photo_path, created_at";

/** Storage bucket holding listing photos. Public-read; writes are owner-only. */
export const PHOTO_BUCKET = "car-photos";
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Public URL for a stored photo, or null when there isn't one.
 *  Built as a string rather than via getPublicUrl() so the server-rendered
 *  detail page can use it without instantiating a Supabase client. */
export function carPhotoUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

/** Most listings a browse query returns. No pagination yet. */
export const BROWSE_LIMIT = 50;

const currency = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  maximumFractionDigits: 0,
});

const plain = new Intl.NumberFormat("en-MY");

/** "RM 45,000" — change the locale/currency above to suit your market. */
export function formatPrice(price: number | string): string {
  const n = Number(price);
  return Number.isFinite(n) ? currency.format(n) : "—";
}

/** "120,000 km", or null when the seller left mileage blank. */
export function formatMileage(mileage: number | null): string | null {
  if (mileage === null || !Number.isFinite(mileage)) return null;
  return `${plain.format(mileage)} km`;
}

/** "2019 Toyota Corolla" — the one-line name used as each listing's heading. */
export function carTitle(car: Pick<Car, "year" | "make" | "model">): string {
  return `${car.year} ${car.make} ${car.model}`;
}
