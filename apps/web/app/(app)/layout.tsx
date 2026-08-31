import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth-actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const initials = (
    user.user_metadata?.full_name ??
    user.email ??
    "U"
  )
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Top nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow group-hover:scale-105 transition-transform">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground hidden sm:inline">
                Presentation<span className="text-brand-500">.AI</span>
              </span>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className="text-[var(--text-secondary)] hover:text-foreground transition-colors"
              >
                Decks
              </Link>
              <Link
                href="/templates"
                className="text-[var(--text-secondary)] hover:text-foreground transition-colors"
              >
                Templates
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-[var(--text-secondary)] hover:text-foreground transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>

            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-bold text-white shadow-sm"
              title={user.email ?? ""}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
