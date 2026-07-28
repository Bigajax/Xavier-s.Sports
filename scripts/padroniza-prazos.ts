/**
 * Normaliza o prazo de encomenda no Supabase com o valor de config/catalogo.ts:
 *   - variante que aceita encomenda ..... estimated_delivery = prazo padrão;
 *   - variante que não aceita ............ estimated_delivery = null.
 *
 * O site já não depende disso para exibir (lib/products/db.ts deriva o prazo do
 * config), mas manter o banco alinhado evita confusão em exportações e
 * consultas diretas. Idempotente. Não mexe em estoque nem em pronta entrega.
 *
 * Uso: npx tsx scripts/padroniza-prazos.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PRE_ORDER_DELIVERY_RANGE } from "../config/catalogo";

config({ path: ".env.local" });
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
if (!url || !key) {
  throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local");
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // Prazo antigo ("7 a 12 dias úteis" e variações) -> padrão.
  const desatualizadas = await supabase
    .from("product_variants")
    .update({ estimated_delivery: PRE_ORDER_DELIVERY_RANGE })
    .eq("allow_pre_order", true)
    .neq("estimated_delivery", PRE_ORDER_DELIVERY_RANGE)
    .select("id");
  if (desatualizadas.error) throw new Error(desatualizadas.error.message);

  // `neq` não pega NULL no Postgres — as sem prazo vão numa passada própria.
  const semPrazo = await supabase
    .from("product_variants")
    .update({ estimated_delivery: PRE_ORDER_DELIVERY_RANGE })
    .eq("allow_pre_order", true)
    .is("estimated_delivery", null)
    .select("id");
  if (semPrazo.error) throw new Error(semPrazo.error.message);

  console.log(
    `✓ ${(desatualizadas.data?.length ?? 0) + (semPrazo.data?.length ?? 0)} variante(s) sob encomenda -> "${PRE_ORDER_DELIVERY_RANGE}"`
  );

  // Encomenda desligada não deve carregar prazo nenhum.
  const semEncomenda = await supabase
    .from("product_variants")
    .update({ estimated_delivery: null })
    .eq("allow_pre_order", false)
    .not("estimated_delivery", "is", null)
    .select("id");
  if (semEncomenda.error) throw new Error(semEncomenda.error.message);
  console.log(`✓ ${semEncomenda.data?.length ?? 0} variante(s) sem encomenda -> prazo removido`);

  const { data: todas, error } = await supabase
    .from("product_variants")
    .select("estimated_delivery, allow_pre_order");
  if (error) throw new Error(error.message);
  const fora = (todas ?? []).filter((v) =>
    v.allow_pre_order
      ? v.estimated_delivery !== PRE_ORDER_DELIVERY_RANGE
      : v.estimated_delivery !== null
  );
  console.log(
    fora.length
      ? `⚠ Ainda restam ${fora.length} variante(s) fora do padrão.`
      : `\nTodas as ${todas?.length ?? 0} variantes estão com o prazo padronizado.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
