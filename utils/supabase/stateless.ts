import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const auth = { persistSession: false, autoRefreshToken: false } as const;

function projectUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  }

  return url;
}

/** Anon/publishable client for Server Actions and route handlers. */
export function createStatelessClient(): SupabaseClient {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set.");
  }

  return createClient(projectUrl(), key, { auth });
}

/**
 * Bypasses RLS. Only for trusted server code (the Stripe webhook): listings
 * cannot otherwise be marked sold without a signed-in seller.
 */
export function createServiceClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return createClient(projectUrl(), key, { auth });
}
