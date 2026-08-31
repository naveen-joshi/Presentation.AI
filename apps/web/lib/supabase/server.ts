import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && (url.startsWith("http://") || url.startsWith("https://")));
}

export async function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a safe mock client when Supabase is unconfigured
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signOut: async () => ({ error: null }),
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
        insert: async () => ({ data: null, error: new Error("Supabase is not configured") }),
        update: async () => ({ data: null, error: new Error("Supabase is not configured") }),
        delete: async () => ({ data: null, error: new Error("Supabase is not configured") }),
      }),
    } as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore when the
            // middleware refreshes sessions.
          }
        },
      },
    }
  );
}
