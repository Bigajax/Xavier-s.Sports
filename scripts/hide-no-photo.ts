import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
config({ path: ".env.local" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
async function main() {
  const { data: all, error } = await supabase.from("products").select("id, slug, name, images, available");
  if (error || !all) throw new Error(error?.message);
  const semFoto = all.filter((p) => !p.images || p.images.length === 0);
  for (const p of semFoto) {
    await supabase.from("products").update({ available: false }).eq("id", p.id);
  }
  console.log(`Ocultados ${semFoto.length} produtos sem foto:`);
  semFoto.forEach((p) => console.log(`  - ${p.slug}`));
}
main();