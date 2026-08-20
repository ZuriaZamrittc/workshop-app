import Link from "next/link";
import { brand } from "@/lib/config/brand";
import PhotoBackdrop from "./PhotoBackdrop";
import { CarBadge } from "./auth-fields";

/** Splits "Zuria's Car" into ["Zuria's", "Car"] so the last word can take
 *  the accent colour. Driven by brand.name — rename the app in
 *  lib/config/brand.ts and the wordmark follows. */
function splitWordmark(name: string): [string, string] {
  const at = name.lastIndexOf(" ");
  return at === -1 ? ["", name] : [name.slice(0, at), name.slice(at + 1)];
}

/** Two-column shell for every auth screen: photo and branding on the left,
 *  white card on the right. Below `lg` the left column drops away and the
 *  card centres. */
export default function AuthLayout({
  welcome,
  welcomeAccent,
  intro,
  title,
  titleAccent,
  subtitle,
  children,
}: {
  /** First line of the big left-hand heading, e.g. "Welcome back," */
  welcome: string;
  /** Second line, shown in the accent colour. */
  welcomeAccent: string;
  /** Paragraph under the heading. */
  intro: string;
  /** Card heading, dark part. */
  title: string;
  /** Card heading, accent part. */
  titleAccent: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const [lead, last] = splitWordmark(brand.name);

  return (
    <PhotoBackdrop className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        {/* Left: wordmark + welcome. Hidden on small screens, where the
            card alone is the whole story. */}
        <div className="hidden flex-1 lg:block">
          <Link href="/" className="inline-block text-3xl font-extrabold leading-none tracking-tight">
            {lead && <span className="block text-white">{lead.toUpperCase()}</span>}
            <span className="block" style={{ color: brand.primaryColor }}>
              {last.toUpperCase()}
            </span>
          </Link>

          <h1 className="mt-20 text-5xl font-bold leading-tight tracking-tight text-white">
            {welcome}
            <br />
            <span style={{ color: brand.primaryColor }}>{welcomeAccent}</span>
          </h1>

          <span
            className="mt-6 block h-1 w-14 rounded-full"
            style={{ backgroundColor: brand.primaryColor }}
            aria-hidden="true"
          />

          <p className="mt-6 max-w-sm text-gray-300">{intro}</p>
        </div>

        {/* Right: the card. */}
        <div className="flex w-full justify-center lg:w-[27rem] lg:shrink-0">
          <div className="w-full rounded-3xl bg-white p-8 shadow-2xl">
            <CarBadge />
            <h2 className="mt-5 text-center text-2xl font-bold">
              {title} <span style={{ color: brand.primaryColor }}>{titleAccent}</span>
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>

      <footer className="mx-auto hidden w-full max-w-6xl px-6 pb-8 text-xs text-gray-400 lg:block">
        <p>{brand.name} — {brand.tagline}</p>
        <p className="mt-1">© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
      </footer>
    </PhotoBackdrop>
  );
}
