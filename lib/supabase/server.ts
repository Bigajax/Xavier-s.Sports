import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente Supabase de servidor com a sessão do admin (via cookies).
 * Usar SOMENTE no painel (layout, Server Actions) — a vitrine usa o cliente
 * anon puro de lib/products/db.ts para não quebrar o cache.
 */
export async function supabaseServer() {
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
            // Chamado de um Server Component: o middleware renova a sessão.
          }
        },
      },
    }
  );
}
