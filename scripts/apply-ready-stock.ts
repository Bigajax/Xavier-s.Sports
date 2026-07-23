/**
 * Grava o estoque real (lib/readyStock.ts) no Supabase, tornando o BANCO a
 * fonte de verdade — o admin passa a controlar o estoque pela sua UI.
 *
 *   - modelos casados (slug) ...... tamanho listado recebe a quantidade real;
 *   - todos os demais tamanhos ..... stock 0 + encomenda (7 a 12 dias úteis);
 *   - todos os outros produtos ..... zerados + encomenda.
 *
 * Antes de escrever, salva um snapshot completo em scripts/_stock-snapshot.json
 * (use scripts/restore-stock.ts para reverter). Idempotente: rode quantas vezes
 * quiser para redefinir o estoque à lista do cliente.
 *
 * Uso: npx tsx scripts/apply-ready-stock.ts
 */
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { READY_STOCK, PRE_ORDER_DELIVERY } from "../lib/readyStock";

config({ path: ".env.local" });
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (!url || !key) throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local");
const c = createClient(url, key, { auth: { persistSession: false } });

const stockBySlug = new Map<string, Record<string, number>>();
for (const e of READY_STOCK) if (e.slug) stockBySlug.set(e.slug, e.stockBySize);

type VRow = {
  id: string;
  product_id: string;
  label: string;
  stock: number;
  allow_pre_order: boolean;
  estimated_delivery: string | null;
  active: boolean;
  position: number;
};

async function main() {
  const { data: prods, error: pErr } = await c
    .from("products")
    .select("id,slug,product_variants(id,product_id,label,stock,allow_pre_order,estimated_delivery,active,position)");
  if (pErr) throw new Error(pErr.message);

  const rows = (prods ?? []) as { id: string; slug: string; product_variants: VRow[] }[];

  // Snapshot para reversão.
  writeFileSync(
    "scripts/_stock-snapshot.json",
    JSON.stringify(
      rows.flatMap((p) => p.product_variants ?? []),
      null,
      2
    )
  );

  const updates: VRow[] = [];
  let readyProducts = 0;
  let readyUnits = 0;
  for (const p of rows) {
    const stock = stockBySlug.get(p.slug);
    if (stock) readyProducts++;
    for (const v of p.product_variants ?? []) {
      const qty = stock?.[v.label] ?? 0;
      readyUnits += qty;
      updates.push({
        id: v.id,
        product_id: v.product_id,
        label: v.label,
        stock: qty,
        allow_pre_order: true,
        estimated_delivery: PRE_ORDER_DELIVERY,
        active: true,
        position: v.position,
      });
    }
  }

  // Upsert em lotes (por id).
  const CHUNK = 500;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const slice = updates.slice(i, i + CHUNK);
    const { error } = await c.from("product_variants").upsert(slice, { onConflict: "id" });
    if (error) throw new Error(`upsert lote ${i}: ${error.message}`);
    console.log(`  gravadas ${Math.min(i + CHUNK, updates.length)}/${updates.length} variantes`);
  }

  console.log(`\nOK. Produtos com pronta entrega: ${readyProducts} · unidades: ${readyUnits}`);
  console.log(`Variantes atualizadas: ${updates.length}. Snapshot: scripts/_stock-snapshot.json`);
}
main();
