"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";
import {
  CardFootnote,
  ErrorText,
  PasswordField,
  ShieldIcon,
  SubmitButton,
} from "./auth-fields";

const MIN_LENGTH = 8;

type SessionState = "checking" | "ready" | "expired";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Initial value is derived, not set from inside the effect: with no client
  // there is nothing to wait for.
  const [session, setSession] = useState<SessionState>(() =>
    getSupabaseBrowserClient() ? "checking" : "expired"
  );

  // Arriving here without a recovery session means the link was already used,
  // has expired, or the page was opened directly. Say so instead of showing a
  // form that cannot possibly work.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setSession(data.user ? "ready" : "expired");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }

    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setError("Couldn't update the password. Request a fresh link and try again.");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  if (!isSupabaseConfigured()) {
    return <BackendNotConnected />;
  }

  if (session === "checking") {
    return <p className="text-center text-gray-500">Checking your link…</p>;
  }

  if (session === "expired") {
    return (
      <div className="w-full text-center">
        <p className="text-gray-600">
          This reset link has expired or has already been used. Request a new one and it will
          arrive in a moment.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block font-medium hover:underline"
          style={{ color: brand.primaryColor }}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordField
          id="new-password"
          label="New password"
          hint={`(at least ${MIN_LENGTH} characters)`}
          required
          autoComplete="new-password"
          placeholder="Enter a new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          required
          autoComplete="new-password"
          placeholder="Type it once more"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton busy={busy} busyLabel="Saving…" icon={<ShieldIcon />}>
          Set new password
        </SubmitButton>
      </form>

      <div className="mt-6">
        <CardFootnote>You&apos;ll be signed in as soon as this is saved.</CardFootnote>
      </div>
    </div>
  );
}
