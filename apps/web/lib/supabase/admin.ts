import { createClient } from "@supabase/supabase-js";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

/**
 * Service-role client. Server-only: resolves share links and anonymous public
 * reads that RLS intentionally keeps out of the anon key. Never import this
 * from client code.
 */
export function createAdminClient() {
  if (!isSupabaseConfigured()) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error("Supabase is not configured") }),
            order: async () => ({ data: [], error: null }),
          }),
          order: async () => ({ data: [], error: null }),
          single: async () => ({ data: null, error: new Error("Supabase is not configured") }),
        }),
      }),
    } as unknown as ReturnType<typeof createClient>;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
