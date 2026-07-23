/**
 * Reverte o estoque ao snapshot salvo por scripts/apply-ready-stock.ts.
 * Uso: npx tsx scripts/restore-stock.ts
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
const c = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const snap = JSON.parse(readFileSync("scripts/_stock-snapshot.json", "utf8"));
  const CHUNK = 500;
  for (let i = 0; i < snap.length; i += CHUNK) {
    const slice = snap.slice(i, i + CHUNK);
    const { error } = await c.from("product_variants").upsert(slice, { onConflict: "id" });
    if (error) throw new Error(`restore lote ${i}: ${error.message}`);
    console.log(`  restauradas ${Math.min(i + CHUNK, snap.length)}/${snap.length}`);
  }
  console.log("Estoque restaurado do snapshot.");
}
main();
