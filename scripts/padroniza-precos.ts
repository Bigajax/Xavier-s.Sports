import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
async function apply(version: string, price: number) {
  const { data, error } = await supabase
    .from("products")
    .update({ price, old_price: null, on_sale: false })
    .eq("version", version)
    .select("id");
  if (error) throw new Error(`${version}: ${error.message}`);
  console.log(`${version}: ${data?.length} produtos -> R$ ${price},00`);
}
async function main() {
  await apply("torcedor", 189);
  await apply("jogador", 249);
  await apply("retro", 229);
}
main();