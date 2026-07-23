/**
 * Cria os 5 produtos que faltavam (antes "pendentes" no READY_STOCK), com
 * fotos do fornecedor (Yupoo KANG) já curadas — só as fotos LIMPAS da camisa
 * inteira, sem marca d'água. As fotos foram baixadas por
 * scripts/_tmp-pending-fetch.ts para o scratchpad; aqui convertemos para WebP
 * e gravamos o produto + variantes no Supabase. O estoque por tamanho vem do
 * lib/readyStock.ts (fonte única).
 *
 * Uso: npx tsx scripts/seed-pending.ts
 */
import { config } from "dotenv";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { getTeam } from "../data/teams";
import { READY_STOCK, PRE_ORDER_DELIVERY } from "../lib/readyStock";

config({ path: ".env.local" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltam variáveis em .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const SRC =
  "C:/Users/Rafael/AppData/Local/Temp/claude/C--Users-Rafael-Desktop-Xavier-s-Sports/8a4c6e9b-005f-4cc6-88bb-f432ccec57d3/scratchpad/pending";
const OUT = "public/images/produtos";

const CARE = [
  "Lavar à mão ou em ciclo delicado, com a peça do avesso",
  "Não usar alvejante nem secadora",
  "Não passar ferro sobre escudos, patrocínios e personalização",
];
const FULL = ["P", "M", "G", "GG", "2XL", "3XL", "4XL"];
const PGG = ["P", "M", "G", "GG"];

type Model = {
  folder: string; // pasta no scratchpad
  photos: number[]; // índices escolhidos (frente, costas...)
  slug: string;
  readyName: string; // nome no READY_STOCK (traz o stockBySize)
  productName: string;
  teamSlug: string;
  version: "torcedor" | "jogador" | "retro" | "treino";
  audience: "masculino" | "feminino";
  sleeve: "curta" | "longa";
  collection: "atual" | "retro";
  season: string;
  colors: string[];
  price: number;
  sizes: string[];
  description: string;
};

const MODELS: Model[] = [
  {
    folder: "brasil-1998",
    photos: [8, 7],
    slug: "camisa-retro-brasil-1998-home",
    readyName: "Brasil 1998 amarela",
    productName: "Camisa Retrô Brasil Home 1998",
    teamSlug: "brasil",
    version: "retro",
    audience: "masculino",
    sleeve: "curta",
    collection: "retro",
    season: "1998",
    colors: ["Amarelo", "Verde"],
    price: 249,
    sizes: PGG,
    description:
      "Camisa retrô amarela da Seleção Brasileira 1998, com gola verde e escudo CBF de 4 estrelas. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "palmeiras-women",
    photos: [9, 2],
    slug: "camisa-palmeiras-home-feminina",
    readyName: "Palmeiras verde Woman 2025",
    productName: "Camisa Palmeiras Home — Feminina",
    teamSlug: "palmeiras",
    version: "torcedor",
    audience: "feminino",
    sleeve: "curta",
    collection: "atual",
    season: "24/25",
    colors: ["Verde", "Branco"],
    price: 189,
    sizes: PGG,
    description:
      "Camisa feminina do Palmeiras, home verde com gola branca, corte feminino. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "argentina-ml",
    photos: [2, 1],
    slug: "camisa-argentina-home-2026-manga-longa",
    readyName: "Argentina manga longa Fan",
    productName: "Camisa Argentina Home 2026 Manga Longa — Versão Torcedor",
    teamSlug: "argentina",
    version: "torcedor",
    audience: "masculino",
    sleeve: "longa",
    collection: "atual",
    season: "2026",
    colors: ["Celeste", "Branco"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Argentina home 2026 de manga longa, listras celeste e branco, três estrelas e patch de campeã. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "alemanha-ml",
    photos: [1, 2],
    slug: "camisa-alemanha-home-2026-manga-longa",
    readyName: "Alemanha Fan manga longa",
    productName: "Camisa Alemanha Home 2026 Manga Longa — Versão Torcedor",
    teamSlug: "alemanha",
    version: "torcedor",
    audience: "masculino",
    sleeve: "longa",
    collection: "atual",
    season: "2026",
    colors: ["Branco", "Preto", "Vermelho", "Dourado"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Alemanha home 2026 de manga longa, branca com o chevron preto, vermelho e dourado. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "atletico-mg",
    photos: [8, 1],
    slug: "camisa-atletico-mineiro-home-26-27-torcedor",
    readyName: "Atlético-MG 2026 Fan I listrada",
    productName: "Camisa Atlético Mineiro Home 26/27 — Versão Torcedor",
    teamSlug: "atletico-mineiro",
    version: "torcedor",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "26/27",
    colors: ["Preto", "Branco", "Dourado"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Atlético Mineiro home 26/27, listrada em preto e branco com detalhes dourados. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "sao-paulo-preta",
    photos: [9, 8],
    slug: "camisa-sao-paulo-preta",
    readyName: "São Paulo 2026 Fan preta",
    productName: "Camisa São Paulo Preta — Edição Especial",
    teamSlug: "sao-paulo",
    version: "torcedor",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "25/26",
    colors: ["Preto", "Vermelho", "Dourado"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa São Paulo preta de edição especial, com faixa vermelha e branca e detalhes dourados. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "flamengo-bege",
    photos: [7, 6],
    slug: "camisa-flamengo-bege",
    readyName: "Flamengo bege 2024",
    productName: "Camisa Flamengo Bege — Edição Especial",
    teamSlug: "flamengo",
    version: "torcedor",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "2024",
    colors: ["Bege", "Grená"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Flamengo bege de edição especial, com monograma CRF em grená e padrão em mosaico. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "palmeiras-amarela-fem",
    photos: [7, 6],
    slug: "camisa-palmeiras-feminina-amarela",
    readyName: "Palmeiras Woman amarela",
    productName: "Camisa Palmeiras Amarela — Feminina",
    teamSlug: "palmeiras",
    version: "torcedor",
    audience: "feminino",
    sleeve: "curta",
    collection: "atual",
    season: "24/25",
    colors: ["Amarelo", "Verde"],
    price: 189,
    sizes: PGG,
    description:
      "Camisa feminina do Palmeiras, edição especial amarela com gola verde. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "corinthians-preta-laranja",
    photos: [8, 7],
    slug: "camisa-corinthians-preta-laranja",
    readyName: "Corinthians 2025 preta com laranja",
    productName: "Camisa Corinthians Third 25/26 — Preta com Laranja",
    teamSlug: "corinthians",
    version: "torcedor",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "25/26",
    colors: ["Preto", "Laranja"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Corinthians third 25/26, preta com detalhes em laranja. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "corinthians-treino",
    photos: [1, 2],
    slug: "camisa-corinthians-treino",
    readyName: "Corinthians Fan treino 2026",
    productName: "Camisa de Treino Corinthians 26/27",
    teamSlug: "corinthians",
    version: "treino",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "26/27",
    colors: ["Grená", "Preto"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa de treino do Corinthians 26/27, grená com mangas pretas. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
  {
    folder: "corinthians-allblack",
    photos: [9, 1],
    slug: "camisa-corinthians-all-black",
    readyName: "Corinthians All Black Fan",
    productName: "Camisa Corinthians All Black — Versão Torcedor",
    teamSlug: "corinthians",
    version: "torcedor",
    audience: "masculino",
    sleeve: "curta",
    collection: "atual",
    season: "22/23",
    colors: ["Preto", "Dourado"],
    price: 189,
    sizes: FULL,
    description:
      "Camisa Corinthians toda preta com detalhes dourados e padrão geométrico tonal. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.",
  },
];

function stockFor(readyName: string): Record<string, number> {
  const e = READY_STOCK.find((r) => r.name === readyName);
  if (!e) throw new Error(`READY_STOCK sem entrada "${readyName}"`);
  return e.stockBySize;
}

async function main() {
  let n = 0;
  let ok = 0;
  for (const m of MODELS) {
    n += 1;
    const team = getTeam(m.teamSlug);
    if (!team) {
      console.error(`✗ time não encontrado: ${m.teamSlug}`);
      continue;
    }

    // Converte as fotos escolhidas para WebP.
    const images: string[] = [];
    for (let i = 0; i < m.photos.length; i++) {
      const src = `${SRC}/${m.folder}/${m.photos[i]}.jpg`;
      const file = `${m.slug}-${i + 1}.webp`;
      await sharp(readFileSync(src)).webp({ quality: 82 }).toFile(`${OUT}/${file}`);
      images.push(`/images/produtos/${file}`);
    }

    const { data: row, error } = await supabase
      .from("products")
      .upsert(
        {
          slug: m.slug,
          name: m.productName,
          team: team.name,
          team_slug: team.slug,
          team_type: team.type,
          country: team.country,
          league: team.type === "selecao" ? "selecoes" : team.league ?? null,
          season: m.season,
          collection: m.collection,
          version: m.version,
          audience: m.audience,
          sleeve: m.sleeve,
          description: m.description,
          price: m.price,
          old_price: null,
          installments: 3,
          images,
          video: null,
          colors: m.colors,
          personalization_available: m.version !== "retro",
          personalization_price: m.version !== "retro" ? 40 : null,
          sku: `XS-YP4-${String(n).padStart(3, "0")}`,
          material: "Consulte composição com a equipe",
          care_instructions: CARE,
          featured: false,
          new_arrival: false,
          best_seller: false,
          on_sale: false,
          available: true,
          tags: [m.teamSlug, m.version, m.season, ...m.colors.map((c) => c.toLowerCase())],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !row) {
      console.error(`✗ ${m.slug}: ${error?.message ?? "sem retorno"}`);
      continue;
    }

    await supabase.from("product_variants").delete().eq("product_id", row.id);
    const stock = stockFor(m.readyName);
    const ins = await supabase.from("product_variants").insert(
      m.sizes.map((label, i) => ({
        product_id: row.id,
        label,
        position: i,
        active: true,
        stock: stock[label] ?? 0,
        allow_pre_order: true,
        estimated_delivery: PRE_ORDER_DELIVERY,
      }))
    );
    if (ins.error) {
      console.error(`✗ ${m.slug} (variantes): ${ins.error.message}`);
      continue;
    }
    ok += 1;
    const readySizes = Object.entries(stock).map(([s, q]) => `${s}:${q}`).join(" ");
    console.log(`✓ ${m.slug} — ${images.length} fotos — pronta entrega ${readySizes}`);
  }
  console.log(`\nConcluído: ${ok}/${MODELS.length} produtos.`);
  if (ok < MODELS.length) process.exitCode = 1;
}
main();
