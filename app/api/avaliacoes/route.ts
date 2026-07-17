import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/** Recebe a avaliação do cliente — entra como "Aguardando aprovação". */
export async function POST(request: NextRequest) {
  try {
    const url = supabaseUrl();
    const key = supabaseAnonKey();
    if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });

    const body = (await request.json()) as Record<string, unknown>;
    const str = (v: unknown, max = 200) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
    const rating = Math.min(5, Math.max(1, Math.floor(Number(body.rating)) || 5));
    const name = str(body.customerName, 120);
    const comment = str(body.comment, 600);
    if (!name || !comment) {
      return NextResponse.json(
        { ok: false, error: "Informe seu nome e o comentário." },
        { status: 400 }
      );
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("reviews").insert({
      customer_name: name,
      city: str(body.city, 80),
      product_name: str(body.productName, 160),
      order_number: str(body.orderNumber, 20),
      rating,
      comment,
      authorized: body.authorized === true,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Não foi possível enviar agora — tente de novo." },
      { status: 500 }
    );
  }
}
