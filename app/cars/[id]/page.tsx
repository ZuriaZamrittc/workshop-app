import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import BrandHeader from "@/components/BrandHeader";
import BackendNotConnected from "@/components/BackendNotConnected";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  CAR_COLUMNS,
  type Car,
  carPhotoUrl,
  carTitle,
  formatMileage,
  formatPrice,
} from "@/lib/cars";
import { brand } from "@/lib/config/brand";

/** Public listing detail. No sign-in required — the `cars` table
 *  allows anyone to read, which is what makes this a marketplace. */
export default async function CarDetailPage({ params }: PageProps<"/cars/[id]">) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <BackendNotConnected />
        </main>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("cars")
    .select(CAR_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) notFound();
  const car = data as Car;
  const mileage = formatMileage(car.mileage);
  const photo = carPhotoUrl(car.photo_path);

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to all cars
        </Link>

        <div className="mt-4 flex items-start justify-between gap-3">
          {/* Seller text is rendered as plain text (React escapes it) — data, not markup. */}
          <h1 className="min-w-0 break-words text-3xl font-bold">{carTitle(car)}</h1>
          {car.status === "sold" && (
            <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
              Sold
            </span>
          )}
        </div>

        <p className="mt-2 text-2xl font-semibold" style={{ color: brand.primaryColor }}>
          {formatPrice(car.price)}
        </p>

        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-gray-100">
          {photo ? (
            <Image
              src={photo}
              alt={carTitle(car)}
              fill
              sizes="(min-width: 768px) 672px, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
              No photo provided
            </span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-200 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Year</dt>
            <dd className="mt-1 font-medium">{car.year}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Condition</dt>
            <dd className="mt-1 font-medium capitalize">{car.condition}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Mileage</dt>
            <dd className="mt-1 font-medium">{mileage ?? "Not stated"}</dd>
          </div>
        </dl>

        {car.description && (
          <div className="mt-6">
            <h2 className="font-semibold">Description</h2>
            <p className="mt-2 break-words whitespace-pre-wrap text-gray-700">
              {car.description}
            </p>
          </div>
        )}

        <p className="mt-8 text-xs text-gray-400">
          Listed {new Date(car.created_at).toLocaleDateString()}
        </p>
      </main>
    </div>
  );
}
