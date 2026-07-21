/**
 * Seed rodada 2 do catálogo do fornecedor (Yupoo KANG, 21/07/2026):
 * Serie A (Milan, Inter, Napoli), Ligue 1 (PSG, Marseille) e Manchester United.
 *
 * ⚠️ NÃO re-rodar após 21/07/2026: as fotos foram depuradas (marca d'água
 * removida) e convertidas para WebP — este seed restauraria caminhos .jpg
 * inexistentes. O estado atual das imagens vem de scripts/update-images.ts.
 *
 * Uso: npx tsx scripts/seed-yupoo2.ts
 * Insert-only por slug (upsert) — não altera produtos existentes.
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
  ["milan", "26/27", "away", "torcedor", ["Branco", "Vermelho"]],
  ["milan", "26/27", "third", "torcedor", ["Preto", "Laranja"]],
  ["milan", "26/27", "home", "jogador", ["Vermelho", "Preto"]],
  ["milan", "26/27", "away", "jogador", ["Branco"]],
  ["inter", "26/27", "home", "torcedor", ["Azul", "Preto"]],
  ["inter", "26/27", "home", "jogador", ["Azul", "Preto"]],
  ["inter", "25/26", "third", "torcedor", ["Azul-marinho", "Laranja"]],
  ["inter", "25/26", "away", "jogador", ["Branco", "Verde-água"]],
  ["napoli", "25/26", "home", "torcedor", ["Azul"]],
  ["napoli", "25/26", "away", "torcedor", ["Branco"]],
  ["napoli", "25/26", "away", "jogador", ["Branco"]],
  ["psg", "26/27", "home", "torcedor", ["Azul", "Vermelho", "Branco"]],
  ["psg", "25/26", "fourth", "torcedor", ["Verde-escuro", "Preto"]],
  ["psg", "25/26", "third", "jogador", ["Vermelho"]],
  ["marseille", "26/27", "home", "jogador", ["Branco", "Azul"]],
  ["marseille", "25/26", "third", "torcedor", ["Dourado", "Azul"]],
  ["marseille", "25/26", "away", "jogador", ["Azul-marinho"]],
  ["manchester-united", "26/27", "home", "torcedor", ["Vermelho"]],
  ["manchester-united", "26/27", "home", "jogador", ["Vermelho"]],
  ["manchester-united", "26/27", "third", "jogador", ["Branco", "Grená"]],
];

const KIND_LABEL: Record<Kind, string> = {
  home: "Home",
  away: "Away",
  third: "Third",
  fourth: "Fourth",
};

const CARE = [
  "Lavar à mão ou em ciclo delicado, com a peça do avesso",
  "Não usar alvejante nem secadora",
  "Não passar ferro sobre escudos, patrocínios e personalização",
];

const SIZES = ["P", "M", "G", "GG", "XGG"];

async function main() {
  console.log(`Enviando ${ITENS.length} produtos (rodada 2) para ${url}...`);
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
    const description =
      versao === "jogador"
        ? `Camisa ${KIND_LABEL[kind].toLowerCase()} da temporada ${season} do ${team.name} na versão jogador: corte de jogo mais ajustado e tecido leve. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.`
        : `Camisa ${KIND_LABEL[kind].toLowerCase()} da temporada ${season} do ${team.name} na versão torcedor: caimento confortável para usar no estádio e no dia a dia. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.`;

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
          personalization_price: 30,
          sku: `XS-YP2-${String(n).padStart(3, "0")}`,
          material: "Consulte composição com a equipe",
          care_instructions: CARE,
          featured: false,
          new_arrival: season === "26/27",
          best_seller: false,
          on_sale: false,
          available: true,
          tags: [teamSlug, kind, versao, season, team.league ?? ""].filter(Boolean),
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
