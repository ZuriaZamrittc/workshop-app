"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";
import {
  CardFootnote,
  ErrorText,
  MailIcon,
  OrDivider,
  ShieldIcon,
  SubmitButton,
  TextField,
} from "./auth-fields";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    setError(null);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
    });
    setBusy(false);

    // Show the SAME confirmation whether or not that address has an account.
    // Reporting "no such user" would turn this form into a way of discovering
    // who is registered. Only a transport-level failure surfaces an error.
    if (error && error.status && error.status >= 500) {
      setError("Couldn't send the email just now. Please try again in a moment.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full text-center">
        <p className="text-gray-600">
          If an account exists for <strong className="break-words">{email}</strong>, we&apos;ve
          sent it a link to reset the password. The link expires in about an hour.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Nothing arrived? Check your spam folder, then try again.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-medium hover:underline"
          style={{ color: brand.primaryColor }}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isSupabaseConfigured() && (
        <div className="mb-5">
          <BackendNotConnected />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          id="email"
          label="Email address"
          icon={<MailIcon />}
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton busy={busy} busyLabel="Sending…" icon={<MailIcon />}>
          Send reset link
        </SubmitButton>
      </form>

      <div className="mt-6 space-y-4">
        <OrDivider />

        <Link
          href="/login"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          <ShieldIcon />
          Back to sign in
        </Link>

        <CardFootnote>We never reveal whether an address has an account.</CardFootnote>
      </div>
    </div>
  );
}
