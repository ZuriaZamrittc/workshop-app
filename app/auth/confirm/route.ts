import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Only allow relative in-app paths. Without this check, `?next=` could be
 *  pointed at another site and this route would become an open redirect —
 *  a phishing link that genuinely starts on your domain. */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

/** Handles the link from Supabase confirmation AND password-recovery emails.
 *  Recovery links pass ?next=/reset-password so the visitor is asked to set a
 *  new password instead of being dropped straight into the app. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const supabase = await getSupabaseServerClient();
  if (!supabase || !tokenHash || !type) {
    return NextResponse.redirect(`${siteUrl}/login?error=confirm`);
  }

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  return NextResponse.redirect(error ? `${siteUrl}/login?error=confirm` : `${siteUrl}${next}`);
}
