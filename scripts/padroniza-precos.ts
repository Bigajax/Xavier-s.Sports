/**
 * Aplica no Supabase a tabela de preços de config/catalogo.ts:
 *   - manga longa .......... preço único (LONG_SLEEVE_PRICE), qualquer versão;
 *   - manga curta .......... preço da versão (PRICE_BY_VERSION).
 *
 * Idempotente. Produtos em oferta (on_sale) de manga curta são PULADOS e
 * listados no fim — mexer neles apagaria uma promoção real. Na manga longa o
 * preço é lei: a oferta é desligada se o preço "de" ficar menor ou igual ao
 * novo preço (oferta de mentira). Antes de escrever, salva os preços atuais em
 * scripts/_price-snapshot.json.
 *
 * ⚠️ Isto SOBRESCREVE os preços do painel. O dia a dia de preço é em
 * /admin/produtos > "Preços em lote"; use este script só para forçar o catálogo
 * inteiro de volta à tabela do config. Por isso ele exige confirmação:
 *
 *   npx tsx scripts/padroniza-precos.ts            → só simula (não grava)
 *   npx tsx scripts/padroniza-precos.ts --aplicar  → grava
 */
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  LONG_SLEEVE_PRICE,
  PRICE_BY_VERSION,
  standardPrice,
} from "../config/catalogo";

config({ path: ".env.local" });
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (!url || !key) {
  throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local");
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

/** Sem --aplicar o script só mostra o que faria. */
const APLICAR = process.argv.includes("--aplicar");

type Row = {
  id: string;
  slug: string;
  sleeve: "curta" | "longa";
  version: keyof typeof PRICE_BY_VERSION;
  price: number | string;
  old_price: number | string | null;
  on_sale: boolean;
};

async function main() {
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, sleeve, version, price, old_price, on_sale");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  if (APLICAR) {
    writeFileSync("scripts/_price-snapshot.json", JSON.stringify(rows, null, 2));
    console.log(`Snapshot de ${rows.length} preços em scripts/_price-snapshot.json\n`);
  } else {
    console.log("SIMULAÇÃO — nada será gravado. Use --aplicar para valer.\n");
  }

  let changed = 0;
  const skipped: string[] = [];

  for (const row of rows) {
    const target = standardPrice(row);
    if (target === undefined) {
      console.warn(`? ${row.slug}: versão "${row.version}" sem preço de tabela — ignorado`);
      continue;
    }
    if (row.on_sale && row.sleeve === "curta") {
      skipped.push(`${row.slug} (em oferta, R$ ${row.price})`);
      continue;
    }

    const oldPrice = row.old_price === null ? null : Number(row.old_price);
    // Oferta só continua de pé se o preço "de" for maior que o novo preço.
    const keepOffer = oldPrice !== null && oldPrice > target;
    const patch = {
      price: target,
      old_price: keepOffer ? oldPrice : null,
      on_sale: keepOffer ? row.on_sale : false,
    };
    const unchanged =
      Number(row.price) === patch.price &&
      oldPrice === patch.old_price &&
      row.on_sale === patch.on_sale;
    if (unchanged) continue;

    if (APLICAR) {
      const { error: upErr } = await supabase.from("products").update(patch).eq("id", row.id);
      if (upErr) throw new Error(`${row.slug}: ${upErr.message}`);
    }
    changed++;
    console.log(
      `${APLICAR ? "✓" : "·"} ${row.slug} (${row.sleeve}/${row.version}): ${row.price} -> ${target}`
    );
  }

  const longa = rows.filter((r) => r.sleeve === "longa").length;
  console.log(
    `\n${changed} produto(s) ${APLICAR ? "atualizado(s)" : "seriam atualizados"}.` +
      ` Manga longa: ${longa} produto(s) a R$ ${LONG_SLEEVE_PRICE}.`
  );
  if (!APLICAR && changed > 0) {
    console.log("Rode de novo com --aplicar para gravar.");
  }
  if (skipped.length) {
    console.log(`\nPulados (oferta ativa, revise no painel):\n  ${skipped.join("\n  ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
