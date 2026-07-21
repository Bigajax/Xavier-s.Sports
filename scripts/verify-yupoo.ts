import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
async function main() {
  const { count: total } = await supabase.from("products").select("*", { count: "exact", head: true });
  const { data: novos } = await supabase.from("products").select("slug, price, version, images").like("sku", "XS-YP-%");
  const { count: variantes } = await supabase.from("product_variants").select("*", { count: "exact", head: true });
  const precoErrado = (novos ?? []).filter(p => (p.version === "jogador" && Number(p.price) !== 249) || (p.version === "torcedor" && Number(p.price) !== 189));
  const semFotos = (novos ?? []).filter(p => !p.images || p.images.length !== 5);
  console.log("Total de produtos no banco:", total);
  console.log("Produtos do fornecedor (XS-YP):", novos?.length);
  console.log("Total de variantes (tamanhos):", variantes);
  console.log("Com preco errado:", precoErrado.length, "| Sem 5 fotos:", semFotos.length);
}
main();