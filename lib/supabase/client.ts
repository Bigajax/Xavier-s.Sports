"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/** Cliente Supabase do navegador — usado na página de login do admin. */
export function supabaseBrowser() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
