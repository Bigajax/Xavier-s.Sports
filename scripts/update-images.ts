/**
 * Atualiza o campo images de todos os produtos após a remoção das fotos com
 * marca d'água e a conversão para WebP (ver scripts/process-watermarks.mjs).
 * - Produtos do fornecedor (SKU XS-YP*): images = lista renumerada do
 *   scripts/rebuild-images.json (stem derivado do caminho antigo).
 * - Produtos demo: troca .jpg → .webp nos caminhos existentes.
 *
 * Uso: npx tsx scripts/update-images.ts
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltam variáveis de ambiente em .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const rebuild: Record<string, string[]> = JSON.parse(
  readFileSync("scripts/rebuild-images.json", "utf8")
);

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, sku, images");
  if (error || !products) throw new Error(error?.message ?? "sem retorno");

  let ok = 0;
  let fail = 0;
  const semFoto: string[] = [];

  for (const p of products) {
    let images: string[];
    if (String(p.sku).startsWith("XS-YP")) {
      const first = (p.images?.[0] ?? "").split("/").pop() ?? "";
      const stem = first.replace(/-\d+\.(jpg|webp)$/i, "");
      const list = rebuild[stem];
      if (!list || list.length === 0) {
        semFoto.push(p.slug);
        continue;
      }
      images = list.map((f) => `/images/produtos/${f}`);
    } else {
      images = (p.images ?? []).map((path: string) => path.replace(/\.jpg$/i, ".webp"));
    }
    const { error: e } = await supabase.from("products").update({ images }).eq("id", p.id);
    if (e) {
      console.error(`✗ ${p.slug}: ${e.message}`);
      fail++;
    } else {
      ok++;
    }
  }
  console.log(`Atualizados: ${ok}, falhas: ${fail}`);
  if (semFoto.length) console.log("SEM FOTO (não atualizados):", semFoto);
}

main();
