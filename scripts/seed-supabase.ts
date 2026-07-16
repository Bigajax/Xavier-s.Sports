/**
 * Seed do catálogo: converte data/products.ts para as tabelas do Supabase.
 *
 * Uso: npm run seed  (exige .env.local com NEXT_PUBLIC_SUPABASE_URL e
 * SUPABASE_SERVICE_ROLE_KEY — a service role ignora RLS e NUNCA deve ir
 * para o navegador nem para a Vercel).
 *
 * Idempotente: upsert por slug; as variantes de cada produto são recriadas.
 * Atenção: re-rodar o seed sobrescreve estoque editado no admin.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { products, type SizeStatus } from "../data/products";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam variáveis de ambiente. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (ver .env.example)."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

/** Prazo padrão para tamanhos que hoje são "sob consulta". */
const DEFAULT_PREORDER_DELIVERY = "7 a 12 dias úteis";

const variantDefaults: Record<
  SizeStatus,
  { stock: number; allow_pre_order: boolean; estimated_delivery: string | null }
> = {
  disponivel: { stock: 10, allow_pre_order: false, estimated_delivery: null },
  "poucas-unidades": { stock: 2, allow_pre_order: false, estimated_delivery: null },
  indisponivel: { stock: 0, allow_pre_order: false, estimated_delivery: null },
  consulta: {
    stock: 0,
    allow_pre_order: true,
    estimated_delivery: DEFAULT_PREORDER_DELIVERY,
  },
};

async function main() {
  console.log(`Enviando ${products.length} produtos para ${url}...`);

  for (const p of products) {
    const { data: row, error } = await supabase
      .from("products")
      .upsert(
        {
          slug: p.slug,
          name: p.name,
          team: p.team,
          team_slug: p.teamSlug,
          team_type: p.teamType,
          country: p.country,
          league: p.league ?? null,
          season: p.season ?? null,
          collection: p.collection,
          version: p.version,
          audience: p.audience,
          sleeve: p.sleeve,
          description: p.description,
          price: p.price,
          old_price: p.oldPrice ?? null,
          installments: p.installments ?? null,
          images: p.images,
          video: p.video ?? null,
          colors: p.colors,
          personalization_available: p.personalizationAvailable,
          personalization_price: p.personalizationPrice ?? null,
          sku: p.sku,
          material: p.material ?? null,
          care_instructions: p.careInstructions ?? null,
          featured: p.featured,
          new_arrival: p.newArrival,
          best_seller: p.bestSeller,
          on_sale: p.onSale,
          available: p.available,
          tags: p.tags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !row) {
      console.error(`✗ ${p.slug}: ${error?.message ?? "sem retorno"}`);
      process.exitCode = 1;
      continue;
    }

    // Recria as variantes do produto para refletir exatamente o array `sizes`.
    const del = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", row.id);
    if (del.error) {
      console.error(`✗ ${p.slug} (limpar variantes): ${del.error.message}`);
      process.exitCode = 1;
      continue;
    }

    const variants = p.sizes.map((s, i) => ({
      product_id: row.id,
      label: s.label,
      position: i,
      active: true,
      ...variantDefaults[s.status],
    }));

    const ins = await supabase.from("product_variants").insert(variants);
    if (ins.error) {
      console.error(`✗ ${p.slug} (variantes): ${ins.error.message}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`✓ ${p.slug} (${variants.length} tamanhos)`);
  }

  console.log("Seed concluído.");
}

main();
