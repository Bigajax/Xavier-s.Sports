/**
 * Seed rodada 3 — camisas RETRÔ do catálogo do fornecedor (Yupoo KANG,
 * 21/07/2026). Fotos já depuradas de marca d'água e em WebP; a lista de
 * imagens vem de scripts/rebuild-images3.json (capas auditadas).
 * Insert-only por slug (upsert) — não altera produtos existentes.
 *
 * Uso: npx tsx scripts/seed-yupoo3.ts
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { getTeam } from "../data/teams";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltam variáveis de ambiente em .env.local.");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const PRECO_RETRO = 249;
const SIZES = ["P", "M", "G", "GG"];
const CARE = [
  "Lavar à mão ou em ciclo delicado, com a peça do avesso",
  "Não usar alvejante nem secadora",
  "Não passar ferro sobre escudos, patrocínios e personalização",
];
const KIND_LABEL: Record<string, string> = {
  home: "Home",
  away: "Away",
  third: "Third",
  fourth: "Fourth",
};

/** Cores por stem — auditadas na folha de capas. */
const COLORS: Record<string, string[]> = {
  "retro-alemanha-1994-home": ["Branco", "Preto"],
  "retro-alemanha-1998-home": ["Branco", "Preto"],
  "retro-alemanha-2014-away": ["Vermelho", "Preto"],
  "retro-argentina-1996-97-home": ["Celeste", "Branco"],
  "retro-argentina-2002-away": ["Azul-marinho"],
  "retro-argentina-2006-home": ["Celeste", "Branco"],
  "retro-arsenal-01-02-away": ["Dourado", "Azul-marinho"],
  "retro-arsenal-01-02-home": ["Vermelho", "Branco"],
  "retro-arsenal-04-05-home": ["Vermelho", "Branco"],
  "retro-barcelona-1995-97-away": ["Verde-água"],
  "retro-barcelona-2008-09-home": ["Azul", "Grená"],
  "retro-barcelona-2010-11-home": ["Azul", "Grená"],
  "retro-bayern-1997-98-away": ["Azul-marinho", "Vermelho"],
  "retro-bayern-1998-00-away": ["Branco", "Vermelho", "Azul"],
  "retro-bayern-1998-99-away": ["Cinza", "Grená"],
  "retro-borussia-dortmund-1997-home": ["Amarelo", "Preto"],
  "retro-borussia-dortmund-96-97-home": ["Amarelo", "Preto"],
  "retro-botafogo-1995-away": ["Branco", "Preto"],
  "retro-brasil-1957-62-away": ["Azul"],
  "retro-brasil-1958-home": ["Amarelo", "Verde"],
  "retro-brasil-1971-home": ["Amarelo", "Verde"],
  "retro-chelsea-09-10-home": ["Azul"],
  "retro-chelsea-1999-01-home": ["Azul"],
  "retro-chelsea-2014-15-home": ["Azul"],
  "retro-corinthians-05-06-home": ["Branco"],
  "retro-corinthians-2010-away": ["Preto"],
  "retro-corinthians-99-00-home": ["Branco"],
  "retro-cruzeiro-93-94-away": ["Branco", "Azul"],
  "retro-espanha-11-12-away": ["Branco", "Vermelho"],
  "retro-espanha-1996-away": ["Azul-marinho", "Vermelho"],
  "retro-espanha-2006-away": ["Branco", "Vermelho", "Amarelo"],
  "retro-flamengo-15-16-away": ["Branco", "Vermelho", "Preto"],
  "retro-flamengo-1998-99-away": ["Branco", "Vermelho", "Preto"],
  "retro-flamengo-2001-02-away": ["Branco", "Preto"],
  "retro-fluminense-15-16-third": ["Vermelho", "Dourado"],
  "retro-fluminense-2009-10-away": ["Grená", "Verde", "Branco"],
  "retro-fluminense-2010-home": ["Grená", "Verde", "Branco"],
  "retro-franca-1994-away": ["Branco", "Azul", "Vermelho"],
  "retro-franca-2006-home": ["Azul", "Branco"],
  "retro-gremio-2000-home": ["Azul-celeste", "Preto", "Branco"],
  "retro-gremio-97-98-home": ["Azul-celeste", "Preto", "Branco"],
  "retro-holanda-1998-away": ["Azul", "Laranja"],
  "retro-holanda-2014-away": ["Azul-marinho", "Laranja"],
  "retro-holanda-97-98-home": ["Laranja"],
  "retro-inglaterra-13-14-away": ["Vermelho"],
  "retro-inglaterra-1990-away": ["Azul-claro"],
  "retro-inglaterra-94-95-home": ["Branco", "Azul-marinho"],
  "retro-inter-1998-99-away": ["Azul-marinho"],
  "retro-inter-1998-99-home": ["Azul", "Preto"],
  "retro-inter-90-91-away": ["Branco", "Preto", "Azul"],
  "retro-italia-1995-home": ["Azul"],
  "retro-italia-2006-home": ["Azul"],
  "retro-italia-2012-home": ["Azul"],
  "retro-manchester-city-07-08-away": ["Roxo", "Branco"],
  "retro-manchester-city-08-09-away": ["Grená", "Preto"],
  "retro-manchester-city-86-87-home": ["Azul-celeste"],
  "retro-manchester-united-1986-88-home": ["Vermelho"],
  "retro-manchester-united-1994-96-away": ["Azul", "Branco"],
  "retro-manchester-united-2010-11-away": ["Branco", "Vermelho", "Preto"],
  "retro-milan-02-03-away": ["Branco", "Vermelho", "Preto"],
  "retro-milan-02-03-home": ["Vermelho", "Preto"],
  "retro-milan-04-05-home": ["Vermelho", "Preto"],
  "retro-napoli-13-14-home": ["Verde", "Preto"],
  "retro-napoli-89-90-home": ["Azul"],
  "retro-napoli-90-91-home": ["Azul-celeste"],
  "retro-palmeiras-1996-away": ["Branco", "Verde"],
  "retro-palmeiras-1996-home": ["Verde", "Branco"],
  "retro-palmeiras-1997-98-home": ["Verde"],
  "retro-portugal-2010-home": ["Vermelho", "Verde"],
  "retro-portugal-2012-away": ["Branco", "Verde", "Vermelho"],
  "retro-portugal-2012-home": ["Vermelho"],
  "retro-psg-91-92-home": ["Azul-marinho", "Vermelho"],
  "retro-psg-92-93-home": ["Azul", "Branco"],
  "retro-psg-94-95-home": ["Azul", "Vermelho", "Branco"],
  "retro-real-madrid-2010-11-away": ["Azul-marinho"],
  "retro-real-madrid-2012-13-away": ["Azul-marinho"],
  "retro-real-madrid-2012-13-home": ["Branco"],
  "retro-santos-12-13-away": ["Preto", "Branco"],
  "retro-santos-2013-home": ["Branco"],
  "retro-vasco-1988-away": ["Branco", "Preto"],
  "retro-vasco-1988-home": ["Preto", "Branco"],
  "retro-vasco-1997-home": ["Preto", "Branco"],
};

type Cur = { album: string; team: string; season: string; kind: string; stem: string; titulo: string };

async function main() {
  const cur: Cur[] = JSON.parse(
    readFileSync(
      "C:/Users/Rafael/AppData/Local/Temp/claude/C--Users-Rafael/ab836896-919a-482b-8915-478f9fae65b7/scratchpad/curadoria3.json",
      "utf8"
    ).replace(/^﻿/, "")
  );
  const rebuild: Record<string, string[]> = JSON.parse(
    readFileSync("scripts/rebuild-images3.json", "utf8")
  );

  console.log(`Enviando produtos retrô para ${url}...`);
  let n = 0;
  let ok = 0;
  let fail = 0;
  const semFoto: string[] = [];

  for (const c of cur) {
    n += 1;
    const team = getTeam(c.team);
    if (!team) {
      console.error(`✗ time não encontrado: ${c.team}`);
      fail += 1;
      continue;
    }
    const files = rebuild[c.stem];
    if (!files || files.length === 0) {
      semFoto.push(`${c.stem} (${c.titulo})`);
      continue;
    }
    const seasonLabel = c.season.includes("-")
      ? c.season.replace(/-(?=\d\d(?:$|\D))/, "/")
      : c.season;
    const slug = `camisa-retro-${c.team}-${c.season}-${c.kind}`;
    const name = `Camisa Retrô ${team.name} ${KIND_LABEL[c.kind] ?? c.kind} ${seasonLabel}`;
    const description = `Camisa retrô ${(KIND_LABEL[c.kind] ?? c.kind).toLowerCase()} ${seasonLabel} do ${team.name}, com modelagem clássica da época. Fotos reais do produto — fale com a equipe pelo WhatsApp para confirmar disponibilidade.`;

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
          season: seasonLabel,
          collection: "retro",
          version: "retro",
          audience: "masculino",
          sleeve: "curta",
          description,
          price: PRECO_RETRO,
          old_price: null,
          installments: 3,
          images: files.map((f) => `/images/produtos/${f}`),
          video: null,
          colors: COLORS[c.stem] ?? [],
          personalization_available: true,
          personalization_price: 40,
          sku: `XS-YP3-${String(n).padStart(3, "0")}`,
          material: "Consulte composição com a equipe",
          care_instructions: CARE,
          featured: false,
          new_arrival: false,
          best_seller: false,
          on_sale: false,
          available: true,
          tags: [c.team, "retro", c.kind, seasonLabel],
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
      console.error(`✗ ${slug} (variantes): ${del.error.message}`);
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
    ok += 1;
    console.log(`✓ ${slug} (${files.length} fotos)`);
  }

  console.log(`Concluído: ${ok} ok, ${fail} falhas.`);
  if (semFoto.length) console.log("Sem foto limpa (não subiram):", semFoto);
  if (fail > 0) process.exitCode = 1;
}

main();
