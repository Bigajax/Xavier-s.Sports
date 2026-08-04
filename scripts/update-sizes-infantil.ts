/**
 * Aplica a grade oficial infantil (arte "Tabela de Medidas — INFANTIL / KIT
 * KIDS", 03/08/2026): tamanhos numéricos 16, 18, 20, 22, 24, 26, 28 no lugar
 * dos rótulos por idade ("4 anos" … "12 anos").
 *
 * Estoque, encomenda e prazo são transferidos pelo de-para DE_PARA abaixo
 * (idade → número, pela faixa de idade da tabela oficial). Tamanhos sem
 * correspondente entram com estoque 0 e inativos, para o dono ativar no
 * painel só o que realmente tem — nunca inventamos estoque.
 *
 * Uso: npx tsx scripts/update-sizes-infantil.ts          (simulação)
 *      npx tsx scripts/update-sizes-infantil.ts --aplicar (grava)
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

const APLICAR = process.argv.includes("--aplicar");

/** Grade oficial, na ordem em que aparece na tabela. */
const INFANTIL = ["16", "18", "20", "22", "24", "26", "28"];

/** Rótulo antigo por idade → tamanho numérico cuja faixa cobre aquela idade. */
const DE_PARA: Record<string, string> = {
  "4 anos": "18", // faixa 4 – 5
  "6 anos": "22", // faixa 6 – 7
  "8 anos": "24", // faixa 8 – 9
  "10 anos": "26", // faixa 10 – 11
  "12 anos": "28", // faixa 12 – 13
};

type Variant = {
  label: string;
  stock: number;
  allow_pre_order: boolean;
  estimated_delivery: string | null;
  active: boolean;
};

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, slug, audience, product_variants(id, label, stock, allow_pre_order, estimated_delivery, active)"
    )
    .eq("audience", "infantil");
  if (error || !products) throw new Error(error?.message ?? "sem retorno");

  let ok = 0;
  let pulados = 0;

  for (const p of products) {
    const atuais = (p.product_variants ?? []) as Variant[];

    // Já migrado (ou grade customizada só com números): não mexe.
    if (atuais.every((v) => /^\d+$/.test(v.label))) {
      pulados++;
      console.log(`- ${p.slug}: já está na grade numérica`);
      continue;
    }

    const herdado = new Map<string, Variant>();
    for (const v of atuais) {
      const novo = DE_PARA[v.label];
      if (novo) herdado.set(novo, v);
      else console.warn(`  ! ${p.slug}: rótulo "${v.label}" sem de-para — estoque descartado`);
    }

    const linhas = INFANTIL.map((label, i) => {
      const old = herdado.get(label);
      return {
        product_id: p.id,
        label,
        position: i,
        active: old ? old.active : false,
        stock: old ? old.stock : 0,
        allow_pre_order: old ? old.allow_pre_order : false,
        estimated_delivery: old ? old.estimated_delivery : null,
      };
    });

    const resumo = linhas
      .map((l) => `${l.label}=${l.stock}${l.active ? "" : "(inativo)"}`)
      .join("  ");
    console.log(`${APLICAR ? "→" : "·"} ${p.slug}: ${resumo}`);

    if (!APLICAR) {
      ok++;
      continue;
    }

    const del = await supabase.from("product_variants").delete().eq("product_id", p.id);
    if (del.error) {
      console.error(`✗ ${p.slug} (limpar): ${del.error.message}`);
      continue;
    }
    const ins = await supabase.from("product_variants").insert(linhas);
    if (ins.error) {
      console.error(`✗ ${p.slug} (inserir): ${ins.error.message}`);
      continue;
    }
    ok++;
  }

  console.log(
    APLICAR
      ? `\nGrade infantil atualizada em ${ok} produtos; ${pulados} já estavam migrados.`
      : `\nSimulação: ${ok} produtos seriam atualizados; ${pulados} já migrados. Rode com --aplicar para gravar.`
  );
}

main();
