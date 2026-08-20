import Link from "next/link";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import { type Car, carPhotoUrl, carTitle, formatMileage, formatPrice } from "@/lib/cars";

/** One listing, shown as a card.
 *  Read-only by design — the seller dashboard passes its own buttons
 *  in via `footer`, so this component never knows about editing. */
export default function CarCard({
  car,
  href,
  footer,
}: {
  car: Car;
  /** When set, the heading links to the full listing. */
  href?: string;
  /** Optional action buttons rendered under the details. */
  footer?: React.ReactNode;
}) {
  const mileage = formatMileage(car.mileage);
  const sold = car.status === "sold";
  const photo = carPhotoUrl(car.photo_path);

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 p-4">
      {/* Fixed 16:9 box so cards stay aligned whether or not there's a photo. */}
      <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={carTitle(car)}
            fill
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            No photo
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        {/* Seller text is rendered as plain text (React escapes it) — data, not markup. */}
        <h2 className="min-w-0 break-words font-semibold">
          {href ? (
            <Link href={href} className="hover:underline">
              {carTitle(car)}
            </Link>
          ) : (
            carTitle(car)
          )}
        </h2>
        {sold && (
          <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
            Sold
          </span>
        )}
      </div>

      <p className="mt-2 text-lg font-semibold" style={{ color: brand.primaryColor }}>
        {formatPrice(car.price)}
      </p>

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <div className="flex gap-1">
          <dt className="sr-only">Condition</dt>
          <dd className="capitalize">{car.condition}</dd>
        </div>
        {mileage && (
          <div className="flex gap-1">
            <dt className="sr-only">Mileage</dt>
            <dd>{mileage}</dd>
          </div>
        )}
      </dl>

      {car.description && (
        <p className="mt-2 line-clamp-3 break-words whitespace-pre-wrap text-sm text-gray-600">
          {car.description}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-400">
        Listed {new Date(car.created_at).toLocaleDateString()}
      </p>

      {footer && <div className="mt-4 flex flex-wrap gap-2 text-sm">{footer}</div>}
    </div>
  );
}
