import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
async function main() {
  const { data, error } = await supabase
    .from("products")
    .update({ personalization_price: 40 })
    .eq("personalization_available", true)
    .select("id");
  if (error) throw new Error(error.message);
  console.log(`Personalizacao atualizada para R$ 40 em ${data?.length} produtos.`);
}
main();