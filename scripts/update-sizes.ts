/**
 * Aplica a grade oficial de tamanhos (tabela do cliente, 21/07/2026):
 * - Torcedor e Jogador adultos (masculino/unissex, exceto retrô): P, M, G, GG, 2XL, 3XL, 4XL
 * - Feminino adulto: P, M, G, GG
 * - Infantil, retrô, treino, pré-jogo e goleiro: inalterados
 * Estoque/encomenda são preservados por rótulo; tamanhos novos entram com
 * estoque 10; rótulos removidos (ex.: XGG) são descartados.
 *
 * Uso: npx tsx scripts/update-sizes.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltam variáveis de ambiente em .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const ADULTO = ["P", "M", "G", "GG", "2XL", "3XL", "4XL"];
const FEMININO = ["P", "M", "G", "GG"];

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, version, audience, collection, product_variants(id, label, stock, allow_pre_order, estimated_delivery, active)");
  if (error || !products) throw new Error(error?.message ?? "sem retorno");

  let ok = 0;
  let skip = 0;
  for (const p of products) {
    let labels: string[] | null = null;
    if (
      (p.version === "torcedor" || p.version === "jogador") &&
      (p.audience === "masculino" || p.audience === "unissex") &&
      p.collection !== "retro"
    ) {
      labels = ADULTO;
    } else if (p.audience === "feminino" && p.collection !== "retro") {
      labels = FEMININO;
    }
    if (!labels) {
      skip++;
      continue;
    }

    const byLabel = new Map(
      (p.product_variants ?? []).map((v: { label: string } & Record<string, unknown>) => [v.label, v])
    );
    const del = await supabase.from("product_variants").delete().eq("product_id", p.id);
    if (del.error) {
      console.error(`✗ ${p.slug} (limpar): ${del.error.message}`);
      continue;
    }
    const ins = await supabase.from("product_variants").insert(
      labels.map((label, i) => {
        const old = byLabel.get(label) as
          | { stock: number; allow_pre_order: boolean; estimated_delivery: string | null; active: boolean }
          | undefined;
        return {
          product_id: p.id,
          label,
          position: i,
          active: old?.active ?? true,
          stock: old?.stock ?? 10,
          allow_pre_order: old?.allow_pre_order ?? false,
          estimated_delivery: old?.estimated_delivery ?? null,
        };
      })
    );
    if (ins.error) {
      console.error(`✗ ${p.slug} (inserir): ${ins.error.message}`);
      continue;
    }
    ok++;
  }
  console.log(`Grade atualizada em ${ok} produtos; ${skip} mantidos como estavam.`);
}

main();
