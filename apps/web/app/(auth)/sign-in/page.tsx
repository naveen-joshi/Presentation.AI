"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, Suspense } from "react";
import { signIn } from "@/lib/actions/auth-actions";

function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await signIn(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="glass rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">
        Sign in to your account to continue.
      </p>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-fade-in">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-[var(--border)] bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-[var(--text-tertiary)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-lg border border-[var(--border)] bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-[var(--text-tertiary)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-brand-700 hover:to-brand-600 focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in…
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="glass rounded-2xl p-8 shadow-xl animate-pulse h-96" />}>
      <SignInForm />
    </Suspense>
  );
}
