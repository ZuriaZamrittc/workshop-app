"use client";

import { useId, useState } from "react";
import { brand } from "@/lib/config/brand";

// ─────────────────────────────────────────────────────────────
// Shared pieces for the four auth forms (sign in, sign up,
// forgot password, reset password). Inline SVG only — no icon
// package, nothing new in package.json.
// ─────────────────────────────────────────────────────────────

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MailIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 6 10-6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SignInIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/** The rounded-square badge at the top of every auth card. */
export function CarBadge() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke={brand.primaryColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 17h14M4 17v-4.2a2 2 0 0 1 .2-.9l1.8-3.6A2 2 0 0 1 7.8 7h8.4a2 2 0 0 1 1.8 1.1l1.8 3.6a2 2 0 0 1 .2.9V17" />
        <path d="M4 13h16" />
        <circle cx="7.5" cy="17" r="1.6" />
        <circle cx="16.5" cy="17" r="1.6" />
      </svg>
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:outline-2 focus:outline-offset-1";

/** Labelled text input with a leading icon. */
export function TextField({
  id,
  label,
  icon,
  ...input
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          {icon}
        </span>
        <input id={id} className={fieldClass} {...input} />
      </div>
    </div>
  );
}

/** Password input with a working show/hide toggle. */
export function PasswordField({
  id,
  label,
  hint,
  ...input
}: {
  id: string;
  label: string;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  const hintId = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900">
        {label}
        {hint && <span className="ml-1 font-normal text-gray-500">{hint}</span>}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          <LockIcon />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-describedby={hint ? hintId : undefined}
          className={`${fieldClass} pr-10`}
          {...input}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        >
          {visible ? (
            <svg {...iconProps}>
              <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18 18 0 0 1-2.16 3.19M6.6 6.6A18 18 0 0 0 2 12s3 8 10 8a9 9 0 0 0 5.4-1.6" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="m2 2 20 20" />
            </svg>
          ) : (
            <svg {...iconProps}>
              <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm text-red-600">
      {children}
    </p>
  );
}

export function SubmitButton({
  busy,
  busyLabel,
  icon,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white disabled:opacity-60"
      style={{ backgroundColor: brand.primaryColor }}
    >
      {!busy && icon}
      {busy ? busyLabel : children}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs text-gray-500">or</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

/** Small reassurance line at the foot of the card. */
export function CardFootnote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
      <LockIcon />
      {children}
    </p>
  );
}
