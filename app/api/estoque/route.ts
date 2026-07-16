import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Estoque fresco por slug para a reconciliação da sacola — sem cache, porque
 * a quantidade pode ter mudado desde que o item foi adicionado.
 * GET /api/estoque?slugs=a,b → { a: Variant[], b: Variant[] }
 */
export const dynamic = "force-dynamic";

type VariantPayload = {
  id: string;
  label: string;
  stock: number;
  allowPreOrder: boolean;
  estimatedDelivery?: string;
  active: boolean;
};

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Supabase não configurado" },
      { status: 503 }
    );
  }

  const slugs = (new URL(request.url).searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
  if (slugs.length === 0) return NextResponse.json({});

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase
    .from("products")
    .select(
      "slug, available, product_variants(id, label, stock, allow_pre_order, estimated_delivery, active, position)"
    )
    .in("slug", slugs);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  const result: Record<string, VariantPayload[]> = {};
  for (const row of data ?? []) {
    if (!row.available) continue;
    result[row.slug] = [...row.product_variants]
      .sort((a, b) => a.position - b.position)
      .map((v) => ({
        id: v.id,
        label: v.label,
        stock: v.stock,
        allowPreOrder: v.allow_pre_order,
        estimatedDelivery: v.estimated_delivery ?? undefined,
        active: v.active,
      }));
  }
  return NextResponse.json(result);
}
