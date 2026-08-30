import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-background to-brand-100 dark:from-brand-900/20 dark:via-background dark:to-brand-800/10 px-4">
      <div className="mb-8 text-center animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Presentation<span className="text-brand-500">.AI</span>
          </span>
        </Link>
      </div>
      <div className="w-full max-w-sm animate-fade-in-up">{children}</div>
    </div>
  );
}
