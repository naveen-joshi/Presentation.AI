import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LivePlayground } from "./components/LivePlayground";

export default async function LandingPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.warn("LandingPage user check fallback:", err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow">
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
              <span className="text-lg font-bold tracking-tight text-foreground">
                Presentation<span className="text-brand-500">.AI</span>
              </span>
            </Link>

            <Link
              href="/playground"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800/40 hover:bg-brand-100 transition-colors flex items-center gap-1"
            >
              <span>⚡</span> Live Playground (No Login)
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-600/15 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/40 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300 mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Open source • Markdown native
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Markdown in.{" "}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Presentation
              </span>{" "}
              out.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Write your slides in Markdown, choose from 30+ themes, and present
              with style. Real-time collaboration, offline support, and a
              desktop app — all built on an open rendering engine.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/playground"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-brand-600 transition-all active:scale-[0.98]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Launch Live Playground (No Login) →
              </Link>
              <Link
                href={user ? "/dashboard" : "/sign-up"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-2 transition-all active:scale-[0.98]"
              >
                {user ? "Go to Dashboard" : "Start creating free →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Playground Section (No Login Required) ───────── */}
      <section id="try-it-now" className="py-12 border-t border-[var(--border)] bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-xs font-bold uppercase tracking-wider mb-2">
              Interactive Sandbox
            </span>
            <h2 className="text-3xl font-bold text-foreground">
              Try Presentation.AI Right Now
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
              Test live markdown rendering, 30+ themes, sample decks, full presentation mode, and instant exports — zero sign-up required.
            </p>
          </div>

          <LivePlayground />
        </div>
      </section>

      {/* ─── Features grid ────────────────────────────────────────────── */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground">
              Everything you need to present
            </h2>
            <p className="mt-3 text-[var(--text-secondary)] max-w-lg mx-auto">
              Built for developers, designers, and teams who think in Markdown.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            <FeatureCard
              icon={<rect x="2" y="3" width="20" height="14" rx="2" />}
              title="30+ themes"
              description="From dark mode to paper-style, every theme is carefully designed and fully customizable."
            />
            <FeatureCard
              icon={<><path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" /></>}
              title="Live editor"
              description="Split-pane editor with CodeMirror, syntax highlighting, and instant preview as you type."
            />
            <FeatureCard
              icon={<><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></>}
              title="Real-time collaboration"
              description="CRDT-powered sync over Supabase Realtime. See cursors, edits merge automatically."
            />
            <FeatureCard
              icon={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></>}
              title="Export anywhere"
              description="Download as Markdown, standalone HTML, or PDF. Your content, your format."
            />
            <FeatureCard
              icon={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
              title="Roles & sharing"
              description="Share with links, set roles (viewer, commenter, editor), and revoke access any time."
            />
            <FeatureCard
              icon={<><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="m7.5 10 2 2L14 8" /></>}
              title="Works offline"
              description="Edit without internet. Yjs + IndexedDB keeps your work safe and syncs when you're back."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 shadow-2xl shadow-brand-600/20">
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to build your next presentation?
            </h2>
            <p className="text-brand-200 mb-6 text-sm">
              Free to use. Open source. No credit card needed.
            </p>
            <Link
              href={user ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 hover:bg-brand-50 transition-all shadow-lg active:scale-[0.98]"
            >
              Get started now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-tertiary)]">
          <span>
            © {new Date().getFullYear()} Presentation.AI — rendering engine by{" "}
            <a
              href="https://github.com/arpitbbhayani/deckrun"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              deckrun
            </a>{" "}
            (MIT)
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/naveen-joshi/Presentation.AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-6 hover:border-[var(--border-hover)] hover:shadow-md transition-all group">
      <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30 transition-colors">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </div>
  );
}
