"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { brand } from "@/lib/config/brand";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import BackendNotConnected from "./BackendNotConnected";
import {
  CardFootnote,
  ErrorText,
  MailIcon,
  OrDivider,
  PasswordField,
  ShieldIcon,
  SignInIcon,
  SubmitButton,
  TextField,
} from "./auth-fields";

export default function LoginForm({ confirmError = false }: { confirmError?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    confirmError ? "That confirmation link didn't work. Try signing in, or sign up again." : null
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return; // banner above already explains
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      // Deliberately generic: never reveal whether an account exists.
      setError("Sign-in failed. Check your email and password and try again.");
      return;
    }
    router.push("/app");
    router.refresh();
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

        <PasswordField
          id="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium hover:underline"
            style={{ color: brand.primaryColor }}
          >
            Forgot password?
          </Link>
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <SubmitButton busy={busy} busyLabel="Signing in…" icon={<SignInIcon />}>
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-6 space-y-4">
        <OrDivider />

        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
        >
          <ShieldIcon />
          Back to website
        </Link>

        <p className="text-center text-sm text-gray-600">
          No account yet?{" "}
          <Link
            href="/signup"
            className="font-medium hover:underline"
            style={{ color: brand.primaryColor }}
          >
            Sign up
          </Link>
        </p>

        <CardFootnote>Secure sign-in. Your listings are private to you.</CardFootnote>
      </div>
    </div>
  );
}
