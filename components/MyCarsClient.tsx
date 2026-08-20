"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { CAR_COLUMNS, PHOTO_BUCKET, type Car } from "@/lib/cars";
import CarCard from "./CarCard";
import CarForm, { type CarDraft, draftFromCar } from "./CarForm";

/** Turns the all-strings form draft into a row the database accepts.
 *  photo_path is added separately, after any upload succeeds. */
function payloadFrom(draft: CarDraft) {
  return {
    make: draft.make.trim(),
    model: draft.model.trim(),
    year: Number(draft.year),
    price: Number(draft.price),
    mileage: draft.mileage.trim() === "" ? null : Number(draft.mileage),
    condition: draft.condition,
    description: draft.description.trim() || null,
  };
}

/** File extension from the MIME type — never from the filename, which
 *  the user controls and could leave off or fake. */
function extensionFor(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export default function MyCarsClient({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    if (!supabase) return;
    // No seller_id filter needed — RLS already limits writes to you, and
    // this filter makes the "my listings" intent explicit and uses the index.
    const { data, error } = await supabase
      .from("cars")
      .select(CAR_COLUMNS)
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      setError("Couldn't load your listings. Refresh the page to try again.");
    } else {
      setCars((data ?? []) as Car[]);
      setError(null);
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount
    void loadCars();
  }, [loadCars]);

  /** Uploads into {userId}/{random}.{ext} — the folder name is what the
   *  storage policy checks, so a file can only ever land in your own folder.
   *  Returns the stored path, or throws so the caller can show an error. */
  async function uploadPhoto(file: File): Promise<string> {
    if (!supabase) throw new Error("no client");
    const path = `${userId}/${crypto.randomUUID()}.${extensionFor(file)}`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file);
    if (error) throw error;
    return path;
  }

  /** Best-effort cleanup. A stray file is harmless; a failed delete here
   *  must never undo or block the database change that already succeeded. */
  async function removePhotoFile(path: string | null) {
    if (!supabase || !path) return;
    await supabase.storage.from(PHOTO_BUCKET).remove([path]);
  }

  async function handleCreate(draft: CarDraft) {
    if (!supabase) return "Backend not connected.";

    // Upload first: a random filename means we don't need the row's id,
    // so creating a listing stays a single database write.
    let photoPath: string | null = null;
    if (draft.photoFile) {
      try {
        photoPath = await uploadPhoto(draft.photoFile);
      } catch {
        return "Couldn't upload that photo. Please try again.";
      }
    }

    // seller_id comes from the server-verified session — NEVER from the form.
    const { error } = await supabase
      .from("cars")
      .insert({ ...payloadFrom(draft), photo_path: photoPath, seller_id: userId });
    if (error) {
      await removePhotoFile(photoPath); // don't strand the file we just uploaded
      return "Couldn't save that listing. Please try again.";
    }
    await loadCars();
    return null;
  }

  async function handleUpdate(id: string, draft: CarDraft) {
    if (!supabase) return "Backend not connected.";
    const previousPath = draft.existingPhotoPath;

    let photoPath: string | null = previousPath;
    if (draft.photoFile) {
      try {
        photoPath = await uploadPhoto(draft.photoFile);
      } catch {
        return "Couldn't upload that photo. Please try again.";
      }
    } else if (draft.removePhoto) {
      photoPath = null;
    }

    const { error } = await supabase
      .from("cars")
      .update({ ...payloadFrom(draft), photo_path: photoPath })
      .eq("id", id);
    if (error) {
      if (photoPath !== previousPath) await removePhotoFile(photoPath);
      return "Couldn't update that listing. Please try again.";
    }

    // Row is saved — now retire the file it no longer points at.
    if (previousPath && previousPath !== photoPath) await removePhotoFile(previousPath);

    await loadCars();
    setEditingId(null);
    return null;
  }

  async function handleDelete(id: string) {
    if (!supabase) return;
    const photoPath = cars.find((c) => c.id === id)?.photo_path ?? null;
    const { error } = await supabase.from("cars").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete that listing. Please try again.");
      return;
    }
    await removePhotoFile(photoPath); // cascade doesn't reach Storage
    setError(null);
    setConfirmingDeleteId(null);
    await loadCars();
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            style={{ color: brand.primaryColor }}
          >
            <Image src={brand.logo} alt={`${brand.name} logo`} width={28} height={28} />
            {brand.name}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-500 sm:inline">{userEmail}</span>
            <button
              onClick={handleSignOut}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-bold">Your listings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Anyone can see these on the homepage. Only you can edit or remove them.
        </p>

        <div className="mt-6">
          <CarForm onSubmit={handleCreate} submitLabel="List this car" busyLabel="Listing…" />
        </div>

        {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {loading ? (
            <p className="text-gray-500">Loading…</p>
          ) : cars.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500 sm:col-span-2">
              No listings yet — add your first car above.
            </p>
          ) : (
            cars.map((car) =>
              editingId === car.id ? (
                <div key={car.id} className="sm:col-span-2">
                  <CarForm
                    initial={draftFromCar(car)}
                    submitLabel="Save changes"
                    onSubmit={(draft) => handleUpdate(car.id, draft)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <CarCard
                  key={car.id}
                  car={car}
                  href={`/cars/${car.id}`}
                  footer={
                    confirmingDeleteId === car.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(car.id)}
                          className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white"
                        >
                          Really delete?
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
                        >
                          Keep
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingId(car.id)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(car.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    )
                  }
                />
              )
            )
          )}
        </div>
      </main>
    </div>
  );
}
