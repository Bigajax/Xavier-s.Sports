"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Cliente Supabase do navegador — usado na página de login do admin. */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
