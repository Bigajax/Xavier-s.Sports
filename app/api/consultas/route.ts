import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Registra uma consulta iniciada pelo WhatsApp (clique num CTA do site).
 * Chamado em fire-and-forget pelo site público — nunca bloqueia o clique.
 * A tabela só aceita INSERT do anon (RLS); leitura é exclusiva do painel.
 */
export async function POST(request: NextRequest) {
  try {
    const url = supabaseUrl();
    const key = supabaseAnonKey();
    if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });

    const body = (await request.json()) as Record<string, unknown>;
    const str = (v: unknown, max = 200) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
    const num = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("whatsapp_leads").insert({
      product_id: str(body.productId, 40),
      product_name: str(body.productName),
      product_sku: str(body.productSku, 60),
      version: str(body.version, 40),
      size: str(body.size, 20),
      personalization: str(body.personalization, 200),
      shown_price: num(body.shownPrice),
      origin: str(body.origin, 40) ?? "site",
      page: str(body.page, 200),
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch {
    // Registro de consulta nunca deve travar a experiência do cliente.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
