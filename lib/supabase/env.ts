/**
 * Normaliza as variáveis do Supabase. A URL do projeto às vezes é colada
 * com o sufixo do endpoint (ex.: .../rest/v1/) — removemos para que auth,
 * storage e REST funcionem a partir da mesma base.
 */
export function supabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
    .trim()
    .replace(/\/(rest|auth|storage|realtime)\/v1\/?$/, "")
    .replace(/\/+$/, "");
}

export function supabaseAnonKey(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
}
