"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { brand } from "@/lib/config/brand";
import {
  type Car,
  type CarCondition,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  carPhotoUrl,
} from "@/lib/cars";

export const MAKE_MAX = 60;
export const MODEL_MAX = 60;
export const DESCRIPTION_MAX = 2000;
export const YEAR_MIN = 1900;
export const YEAR_MAX = 2100;

/** The raw form values — all strings, because that's what inputs give us. */
export type CarDraft = {
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  condition: CarCondition;
  description: string;
  /** A newly chosen file, not yet uploaded. */
  photoFile: File | null;
  /** The photo already stored for this listing, if any. */
  existingPhotoPath: string | null;
  /** True when the seller asked to clear the existing photo. */
  removePhoto: boolean;
};

export const EMPTY_DRAFT: CarDraft = {
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  condition: "used",
  description: "",
  photoFile: null,
  existingPhotoPath: null,
  removePhoto: false,
};

/** Pre-fills the form when editing an existing listing. */
export function draftFromCar(car: Car): CarDraft {
  return {
    make: car.make,
    model: car.model,
    year: String(car.year),
    price: String(Number(car.price)),
    mileage: car.mileage === null ? "" : String(car.mileage),
    condition: car.condition,
    description: car.description ?? "",
    photoFile: null,
    existingPhotoPath: car.photo_path,
    removePhoto: false,
  };
}

/** Returns a friendly error message, or null when the draft is valid.
 *  These rules mirror the CHECK constraints in supabase/cars-schema.sql. */
export function validateCar(draft: CarDraft): string | null {
  if (draft.make.trim().length === 0) return "Please enter the make, e.g. Toyota.";
  if (draft.make.length > MAKE_MAX) return `Keep the make under ${MAKE_MAX} characters.`;

  if (draft.model.trim().length === 0) return "Please enter the model, e.g. Corolla.";
  if (draft.model.length > MODEL_MAX) return `Keep the model under ${MODEL_MAX} characters.`;

  const year = Number(draft.year);
  if (draft.year.trim().length === 0) return "Please enter the year.";
  if (!Number.isInteger(year) || year < YEAR_MIN || year > YEAR_MAX) {
    return `Enter a year between ${YEAR_MIN} and ${YEAR_MAX}.`;
  }

  const price = Number(draft.price);
  if (draft.price.trim().length === 0) return "Please enter a price.";
  if (!Number.isFinite(price) || price < 0) return "Enter a price of 0 or more.";

  if (draft.mileage.trim().length > 0) {
    const mileage = Number(draft.mileage);
    if (!Number.isInteger(mileage) || mileage < 0) {
      return "Mileage must be a whole number of kilometres, or left blank.";
    }
  }

  if (draft.description.length > DESCRIPTION_MAX) {
    return `Keep the description under ${DESCRIPTION_MAX} characters.`;
  }

  // Checked here so create and edit share one rule set, and so a bad
  // file is refused before any upload is attempted.
  if (draft.photoFile) {
    if (!PHOTO_TYPES.includes(draft.photoFile.type as (typeof PHOTO_TYPES)[number])) {
      return "Photos must be a JPEG, PNG or WebP image.";
    }
    if (draft.photoFile.size > PHOTO_MAX_BYTES) {
      return `Photos must be under ${Math.round(PHOTO_MAX_BYTES / 1024 / 1024)} MB.`;
    }
  }

  return null;
}

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-2 focus:outline-offset-1";

export default function CarForm({
  initial = EMPTY_DRAFT,
  submitLabel = "List this car",
  busyLabel = "Saving…",
  onSubmit,
  onCancel,
}: {
  initial?: CarDraft;
  submitLabel?: string;
  busyLabel?: string;
  onSubmit: (draft: CarDraft) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState<CarDraft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof CarDraft>(key: K, value: CarDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Local preview of a newly picked file. Derived from the file, so it's a
  // memo rather than state-in-an-effect; the effect only handles cleanup so
  // the browser doesn't hold the object URL forever.
  const previewUrl = useMemo(
    () => (draft.photoFile ? URL.createObjectURL(draft.photoFile) : null),
    [draft.photoFile]
  );
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const existingUrl =
    !draft.photoFile && !draft.removePhoto ? carPhotoUrl(draft.existingPhotoPath) : null;

  function clearPhoto() {
    setDraft((d) => ({ ...d, photoFile: null, removePhoto: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const invalid = validateCar(draft);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(null);
    const submitError = await onSubmit(draft);
    setBusy(false);
    if (submitError) {
      setError(submitError);
      return;
    }
    if (!onCancel) setDraft(EMPTY_DRAFT); // creating: clear for the next listing
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="car-make" className="block text-sm font-medium">
            Make
          </label>
          <input
            id="car-make"
            value={draft.make}
            onChange={(e) => set("make", e.target.value)}
            placeholder="e.g. Toyota"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="car-model" className="block text-sm font-medium">
            Model
          </label>
          <input
            id="car-model"
            value={draft.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="e.g. Corolla"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="car-year" className="block text-sm font-medium">
            Year
          </label>
          <input
            id="car-year"
            inputMode="numeric"
            value={draft.year}
            onChange={(e) => set("year", e.target.value)}
            placeholder="e.g. 2019"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="car-price" className="block text-sm font-medium">
            Price <span className="font-normal text-gray-500">(RM)</span>
          </label>
          <input
            id="car-price"
            inputMode="decimal"
            value={draft.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 45000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="car-mileage" className="block text-sm font-medium">
            Mileage <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="car-mileage"
            inputMode="numeric"
            value={draft.mileage}
            onChange={(e) => set("mileage", e.target.value)}
            placeholder="e.g. 62000"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="car-condition" className="block text-sm font-medium">
          Condition
        </label>
        <select
          id="car-condition"
          value={draft.condition}
          onChange={(e) => set("condition", e.target.value as CarCondition)}
          className={inputClass}
        >
          <option value="used">Used</option>
          <option value="new">New</option>
        </select>
      </div>

      <div>
        <label htmlFor="car-description" className="block text-sm font-medium">
          Description <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <textarea
          id="car-description"
          value={draft.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Service history, condition, extras…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="car-photo" className="block text-sm font-medium">
          Photo <span className="font-normal text-gray-500">(optional)</span>
        </label>

        {(previewUrl || existingUrl) && (
          <div className="mt-2 flex items-start gap-3">
            <div className="relative h-24 w-32 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
              <Image
                src={previewUrl ?? existingUrl!}
                alt="Photo of this car"
                fill
                sizes="128px"
                className="object-cover"
                // A blob: preview can't go through the image optimiser.
                unoptimized={Boolean(previewUrl)}
              />
            </div>
            <button
              type="button"
              onClick={clearPhoto}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Remove photo
            </button>
          </div>
        )}

        <input
          id="car-photo"
          type="file"
          accept={PHOTO_TYPES.join(",")}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              photoFile: e.target.files?.[0] ?? null,
              removePhoto: false,
            }))
          }
          className="mt-2 block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          JPEG, PNG or WebP, up to {Math.round(PHOTO_MAX_BYTES / 1024 / 1024)} MB.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md px-4 py-2 font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: brand.primaryColor }}
        >
          {busy ? busyLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
