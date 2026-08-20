import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";
import BrowseClient from "@/components/BrowseClient";
import { brand } from "@/lib/config/brand";

// ─────────────────────────────────────────────────────────────
// HOMEPAGE CONTENT — safe to customize in Module 4.
// Edit the words below, or reorder the sections in SECTION_ORDER.
// ─────────────────────────────────────────────────────────────

const headline = "Find your next car.";
const subcopy =
  "Browse cars for sale from local sellers. No account needed to look — sign up when you're ready to sell one of your own.";

// Reorder these to change the page layout (Module 4 layout edit).
const SECTION_ORDER = ["hero", "browse", "cta"] as const;

// ─────────────────────────────────────────────────────────────

type SectionId = (typeof SECTION_ORDER)[number];

const sections: Record<SectionId, React.ReactNode> = {
  hero: (
    <section key="hero" className="px-4 pt-12 pb-6 text-center">
      {brand.showWorkshopBadge && (
        <span className="mb-4 inline-block rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600">
          Built at the TimeTec AI Workshop
        </span>
      )}
      <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        {headline}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">{subcopy}</p>
      <p className="mt-2 text-sm font-medium" style={{ color: brand.primaryColor }}>
        {brand.tagline}
      </p>
    </section>
  ),
  browse: <BrowseClient key="browse" />,
  cta: (
    <section key="cta" className="border-t border-gray-200 px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold">Got a car to sell?</h2>
      <p className="mx-auto mt-2 max-w-md text-gray-600">
        List it in a minute. Your listing appears here for every visitor to see.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-md px-5 py-2.5 font-medium text-white"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Start selling
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          Sign in
        </Link>
      </div>
    </section>
  ),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main>{SECTION_ORDER.map((id) => sections[id])}</main>
      <footer className="border-t border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        {brand.name} — {brand.tagline}
      </footer>
    </div>
  );
}
