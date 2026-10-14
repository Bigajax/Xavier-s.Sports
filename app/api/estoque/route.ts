import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { variantesDa, type LinhaProduto } from "@/lib/products/db";
import type { Variant } from "@/lib/products/types";

/**
 * Estoque fresco por slug para a reconciliação da sacola: sem cache, porque
 * a quantidade pode ter mudado desde que o item foi adicionado.
 * GET /api/estoque?slugs=a,b → { a: Variant[], b: Variant[] }
 *
 * Desde 14/10/2026 lê as tabelas do painel do pacote (produtos), com a mesma
 * regra da vitrine (lib/products/db.ts, variantesDa).
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = supabaseUrl();
  const anonKey = supabaseAnonKey();
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const slugs = (new URL(request.url).searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (slugs.length === 0) return NextResponse.json({});

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("produtos")
    .select("id, slug, ativo, tamanhos, tamanhos_esgotados, estoque")
    .in("slug", slugs);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  const result: Record<string, Variant[]> = {};
  for (const row of (data ?? []) as (Pick<LinhaProduto, "id" | "slug" | "ativo" | "tamanhos" | "tamanhos_esgotados" | "estoque">)[]) {
    if (!row.ativo) continue;
    result[row.slug] = variantesDa(row);
  }
  return NextResponse.json(result);
}
