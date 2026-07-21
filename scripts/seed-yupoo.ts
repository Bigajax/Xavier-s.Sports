/**
 * Seed dos produtos vindos do catálogo do fornecedor (Yupoo KANG, 21/07/2026).
 *
 * ⚠️ NÃO re-rodar após 21/07/2026: as fotos foram depuradas (marca d'água
 * removida) e convertidas para WebP — este seed restauraria caminhos .jpg
 * inexistentes. O estado atual das imagens vem de scripts/update-images.ts.
 *
 * Uso: npx tsx scripts/seed-yupoo.ts
 * Insert-only por slug (upsert): NÃO altera os produtos que já existem no
 * catálogo — apenas cria/atualiza os slugs `camisa-<time>-<tipo>-<temporada>-<versão>`
 * desta lista. Fotos em public/images/produtos/<time>-<temporada>-<tipo>-<versão>-{1..5}.jpg.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { getTeam } from "../data/teams";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const PRECO = { torcedor: 189, jogador: 249 } as const;

type Versao = "torcedor" | "jogador";
type Kind = "home" | "away" | "third" | "fourth";

/** [teamSlug, season, kind, versao, cores] — auditado visualmente na folha de contato. */
const ITENS: Array<[string, string, Kind, Versao, string[]]> = [
  ["botafogo", "26/27", "home", "torcedor", ["Preto", "Branco"]],
  ["cruzeiro", "26/27", "away", "torcedor", ["Branco", "Azul"]],
  ["cruzeiro", "26/27", "home", "torcedor", ["Azul", "Branco"]],
  ["internacional", "26/27", "away", "torcedor", ["Branco", "Vermelho", "Dourado"]],
  ["internacional", "26/27", "home", "torcedor", ["Vermelho", "Branco"]],
  ["santos", "26/27", "home", "torcedor", ["Branco"]],
  ["santos", "26/27", "away", "torcedor", ["Preto", "Branco"]],
  ["corinthians", "26/27", "away", "torcedor", ["Preto", "Branco"]],
  ["corinthians", "26/27", "home", "torcedor", ["Branco", "Preto"]],
  ["bahia", "26/27", "away", "torcedor", ["Azul", "Vermelho", "Branco"]],
  ["bahia", "26/27", "home", "torcedor", ["Branco", "Azul", "Vermelho"]],
  ["flamengo", "26/27", "away", "torcedor", ["Branco", "Vermelho", "Preto"]],
  ["flamengo", "26/27", "home", "torcedor", ["Vermelho", "Preto"]],
  ["gremio", "26/27", "away", "torcedor", ["Celeste", "Branco"]],
  ["gremio", "26/27", "home", "torcedor", ["Azul", "Preto", "Branco"]],
  ["sao-paulo", "26/27", "home", "torcedor", ["Branco", "Vermelho", "Preto"]],
  ["vasco", "26/27", "away", "torcedor", ["Branco", "Preto"]],
  ["vasco", "26/27", "home", "torcedor", ["Preto", "Branco"]],
  ["fluminense", "26/27", "home", "torcedor", ["Grená", "Verde", "Branco"]],
  ["fluminense", "26/27", "away", "torcedor", ["Branco", "Grená"]],
  ["palmeiras", "26/27", "home", "torcedor", ["Verde"]],
  ["palmeiras", "26/27", "away", "torcedor", ["Branco", "Verde"]],
  ["santos", "26/27", "away", "jogador", ["Preto", "Branco"]],
  ["santos", "26/27", "home", "jogador", ["Branco"]],
  ["gremio", "26/27", "away", "jogador", ["Preto", "Azul"]],
  ["corinthians", "26/27", "away", "jogador", ["Preto", "Branco"]],
  ["corinthians", "26/27", "home", "jogador", ["Branco", "Preto"]],
  ["sao-paulo", "26/27", "away", "jogador", ["Vermelho", "Preto", "Branco"]],
  ["sao-paulo", "26/27", "home", "jogador", ["Branco", "Vermelho", "Preto"]],
  ["flamengo", "26/27", "away", "jogador", ["Branco", "Vermelho", "Preto"]],
  ["flamengo", "26/27", "home", "jogador", ["Vermelho", "Preto"]],
  ["vasco", "26/27", "away", "jogador", ["Branco", "Preto"]],
  ["vasco", "26/27", "home", "jogador", ["Preto", "Branco"]],
  ["palmeiras", "26/27", "home", "jogador", ["Verde"]],
  ["palmeiras", "26/27", "away", "jogador", ["Branco", "Verde"]],
  ["fluminense", "26/27", "away", "jogador", ["Branco", "Grená"]],

  ["chelsea", "26/27", "home", "torcedor", ["Azul"]],
  ["arsenal", "26/27", "third", "torcedor", ["Creme", "Dourado"]],
  ["arsenal", "26/27", "home", "torcedor", ["Vermelho", "Branco"]],
  ["arsenal", "26/27", "away", "torcedor", ["Azul-marinho", "Amarelo"]],
  ["newcastle", "26/27", "home", "torcedor", ["Preto", "Branco"]],
  ["manchester-city", "26/27", "home", "torcedor", ["Azul-celeste"]],
  ["manchester-city", "25/26", "away", "torcedor", ["Preto"]],
  ["tottenham", "25/26", "third", "torcedor", ["Amarelo", "Azul-marinho"]],
  ["tottenham", "26/27", "away", "jogador", ["Azul-marinho", "Rosa"]],
  ["tottenham", "26/27", "home", "jogador", ["Branco", "Azul-marinho"]],
  ["chelsea", "26/27", "third", "jogador", ["Preto", "Amarelo"]],
  ["arsenal", "26/27", "home", "jogador", ["Vermelho", "Branco"]],
  ["manchester-city", "26/27", "home", "jogador", ["Azul-celeste"]],
  ["manchester-city", "25/26", "away", "jogador", ["Branco", "Vermelho", "Preto"]],
  ["newcastle", "25/26", "third", "jogador", ["Azul-marinho", "Dourado"]],
  ["manchester-united", "25/26", "away", "jogador", ["Branco"]],

  ["barcelona", "26/27", "third", "torcedor", ["Verde-água"]],
  ["barcelona", "26/27", "home", "torcedor", ["Azul", "Grená"]],
  ["athletic-bilbao", "26/27", "home", "torcedor", ["Vermelho", "Branco"]],
  ["athletic-bilbao", "26/27", "away", "torcedor", ["Preto", "Vermelho"]],
  ["atletico-madrid", "26/27", "away", "torcedor", ["Preto", "Verde-limão"]],
  ["real-madrid", "26/27", "third", "torcedor", ["Rosa"]],
  ["real-madrid", "26/27", "home", "torcedor", ["Branco"]],
  ["barcelona", "26/27", "away", "jogador", ["Preto", "Roxo"]],
  ["barcelona", "26/27", "third", "jogador", ["Verde-água"]],
  ["barcelona", "26/27", "home", "jogador", ["Azul", "Grená"]],
  ["real-madrid", "26/27", "home", "jogador", ["Branco"]],
  ["atletico-madrid", "25/26", "third", "jogador", ["Azul", "Branco"]],

  ["bayern", "26/27", "away", "torcedor", ["Branco", "Vermelho", "Azul"]],
  ["bayern", "26/27", "home", "torcedor", ["Vermelho"]],
  ["borussia-dortmund", "26/27", "home", "torcedor", ["Amarelo", "Preto"]],
  ["bayer-leverkusen", "25/26", "home", "torcedor", ["Preto", "Vermelho"]],
  ["bayern", "26/27", "home", "jogador", ["Vermelho"]],
  ["borussia-dortmund", "26/27", "home", "jogador", ["Amarelo", "Preto"]],

  ["espanha", "2026", "home", "torcedor", ["Vermelho", "Amarelo", "Azul"]],
  ["espanha", "2026", "away", "torcedor", ["Branco", "Grená"]],
  ["espanha", "2026", "home", "jogador", ["Vermelho", "Amarelo"]],
  ["espanha", "2026", "away", "jogador", ["Branco", "Grená"]],
  ["alemanha", "2026", "home", "torcedor", ["Branco", "Preto", "Dourado"]],
  ["alemanha", "2026", "away", "torcedor", ["Azul-marinho"]],
  ["alemanha", "2026", "home", "jogador", ["Branco", "Preto"]],
  ["alemanha", "2026", "away", "jogador", ["Azul-marinho"]],
  ["brasil", "2026", "home", "torcedor", ["Amarelo", "Verde"]],
  ["brasil", "2026", "away", "torcedor", ["Azul-marinho"]],
  ["brasil", "2026", "home", "jogador", ["Amarelo", "Verde"]],
  ["brasil", "2026", "away", "jogador", ["Azul-marinho"]],
  ["argentina", "2026", "home", "torcedor", ["Celeste", "Branco"]],
  ["argentina", "2026", "away", "torcedor", ["Azul-marinho", "Azul"]],
  ["argentina", "2026", "home", "jogador", ["Celeste", "Branco"]],
  ["argentina", "2026", "away", "jogador", ["Azul-marinho", "Azul"]],
  ["portugal", "2026", "away", "torcedor", ["Verde-água", "Branco"]],
  ["portugal", "2026", "home", "jogador", ["Vermelho"]],
  ["portugal", "2026", "away", "jogador", ["Verde-água", "Branco"]],
  ["franca", "2026", "home", "torcedor", ["Azul-marinho"]],
  ["franca", "2026", "away", "torcedor", ["Verde-água"]],
  ["franca", "2026", "home", "jogador", ["Azul", "Branco"]],
  ["franca", "2026", "away", "jogador", ["Verde-água"]],
  ["mexico", "2026", "home", "torcedor", ["Verde"]],
  ["mexico", "2026", "away", "torcedor", ["Branco", "Vermelho", "Verde"]],
  ["mexico", "2026", "third", "torcedor", ["Preto", "Verde"]],
  ["mexico", "2026", "home", "jogador", ["Verde"]],
  ["mexico", "2026", "away", "jogador", ["Branco", "Vermelho", "Verde"]],
  ["mexico", "2026", "third", "jogador", ["Preto", "Verde"]],
  ["inglaterra", "2026", "home", "torcedor", ["Branco"]],
  ["inglaterra", "2026", "away", "torcedor", ["Vermelho"]],
  ["inglaterra", "2026", "home", "jogador", ["Branco"]],
  ["inglaterra", "2026", "away", "jogador", ["Vermelho"]],
  ["italia", "2026", "home", "torcedor", ["Azul"]],
  ["italia", "2026", "away", "torcedor", ["Branco", "Azul"]],
  ["italia", "2026", "home", "jogador", ["Azul"]],
  ["italia", "2026", "away", "jogador", ["Branco", "Azul"]],
  ["japao", "2026", "home", "torcedor", ["Azul"]],
  ["japao", "2026", "away", "torcedor", ["Branco"]],
  ["japao", "2026", "home", "jogador", ["Azul"]],
  ["japao", "2026", "away", "jogador", ["Branco"]],
  ["holanda", "2026", "home", "torcedor", ["Laranja"]],
  ["holanda", "2026", "away", "torcedor", ["Branco", "Laranja"]],
  ["holanda", "2026", "home", "jogador", ["Laranja"]],
  ["holanda", "2026", "away", "jogador", ["Branco", "Laranja"]],
  ["uruguai", "2026", "home", "torcedor", ["Celeste"]],
  ["uruguai", "2026", "away", "torcedor", ["Azul-marinho"]],
  ["uruguai", "2026", "home", "jogador", ["Celeste"]],
];

const KIND_LABEL: Record<Kind, string> = {
  home: "Home",
  away: "Away",
  third: "Third",
  fourth: "Fourth",
};

/** Produtos em destaque na home. */
const FEATURED = new Set([
  "camisa-flamengo-home-26-27-torcedor",
  "camisa-corinthians-home-26-27-torcedor",
  "camisa-palmeiras-home-26-27-torcedor",
  "camisa-real-madrid-home-26-27-jogador",
  "camisa-brasil-home-2026-torcedor",
  "camisa-argentina-home-2026-jogador",
]);

const CARE = [
  "Lavar à mão ou em ciclo delicado, com a peça do avesso",
  "Não usar alvejante nem secadora",
  "Não passar ferro sobre escudos, patrocínios e personalização",
];

const SIZES = ["P", "M", "G", "GG", "XGG"];

async function main() {
  console.log(`Enviando ${ITENS.length} produtos do fornecedor para ${url}...`);
  let n = 0;
  let fail = 0;

  for (const [teamSlug, season, kind, versao, colors] of ITENS) {
    n += 1;
    const team = getTeam(teamSlug);
    if (!team) {
      console.error(`✗ time não encontrado em data/teams.ts: ${teamSlug}`);
      fail += 1;
      continue;
    }
    const seasonSlug = season.replace("/", "-");
    const slug = `camisa-${teamSlug}-${kind}-${seasonSlug}-${versao}`;
    const stem = `${teamSlug}-${seasonSlug}-${kind}-${versao}`;
    const versaoLabel = versao === "jogador" ? "Jogador" : "Torcedor";
    const name = `Camisa ${team.name} ${KIND_LABEL[kind]} ${season} — Versão ${versaoLabel}`;
    const seasonDesc = season === "2026" ? "da Copa 2026" : `da temporada ${season}`;
    const description =
      versao === "jogador"
        ? `Camisa ${KIND_LABEL[kind].toLowerCase()} ${seasonDesc} do ${team.name} na versão jogador: corte de jogo mais ajustado e tecido leve. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.`
        : `Camisa ${KIND_LABEL[kind].toLowerCase()} ${seasonDesc} do ${team.name} na versão torcedor: caimento confortável para usar no estádio e no dia a dia. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.`;

    const { data: row, error } = await supabase
      .from("products")
      .upsert(
        {
          slug,
          name,
          team: team.name,
          team_slug: team.slug,
          team_type: team.type,
          country: team.country,
          league: team.type === "selecao" ? "selecoes" : team.league ?? null,
          season,
          collection: "atual",
          version: versao,
          audience: "masculino",
          sleeve: "curta",
          description,
          price: PRECO[versao],
          old_price: null,
          installments: 3,
          images: [1, 2, 3, 4, 5].map((i) => `/images/produtos/${stem}-${i}.jpg`),
          video: null,
          colors,
          personalization_available: true,
          personalization_price: 40,
          sku: `XS-YP-${String(n).padStart(3, "0")}`,
          material: "Consulte composição com a equipe",
          care_instructions: CARE,
          featured: FEATURED.has(slug),
          new_arrival: season !== "25/26",
          best_seller: false,
          on_sale: false,
          available: true,
          tags: [teamSlug, kind, versao, season, team.type === "selecao" ? "selecoes" : team.league ?? ""].filter(Boolean),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !row) {
      console.error(`✗ ${slug}: ${error?.message ?? "sem retorno"}`);
      fail += 1;
      continue;
    }

    const del = await supabase.from("product_variants").delete().eq("product_id", row.id);
    if (del.error) {
      console.error(`✗ ${slug} (limpar variantes): ${del.error.message}`);
      fail += 1;
      continue;
    }
    const ins = await supabase.from("product_variants").insert(
      SIZES.map((label, i) => ({
        product_id: row.id,
        label,
        position: i,
        active: true,
        stock: 10,
        allow_pre_order: false,
        estimated_delivery: null,
      }))
    );
    if (ins.error) {
      console.error(`✗ ${slug} (variantes): ${ins.error.message}`);
      fail += 1;
      continue;
    }
    console.log(`✓ ${slug}`);
  }

  console.log(`Concluído: ${ITENS.length - fail} ok, ${fail} falhas.`);
  if (fail > 0) process.exitCode = 1;
}

main();
