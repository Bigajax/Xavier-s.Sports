/**
 * Baixa escudos oficiais do TheSportsDB para todos os times cujo
 * `crest` ainda aponta para o monograma SVG, convertendo para WebP em
 * public/images/escudos/<slug>.webp.
 *
 * Uso: npx tsx scripts/fetch-escudos.ts
 * Depois de baixar, remova o campo `crest` dos times em data/teams.ts —
 * o WebP passa a ser usado automaticamente (ver teamCrest()).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { teams } from "../data/teams";

const outDir = join(process.cwd(), "public", "images", "escudos");
mkdirSync(outDir, { recursive: true });

const API = "https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=";

/** slug → nomes de busca no TheSportsDB (+ país para desambiguar homônimos). */
const LOOKUP: Record<string, { q: string[]; country?: string }> = {
  // Clubes brasileiros
  botafogo: { q: ["Botafogo"], country: "Brazil" },
  cruzeiro: { q: ["Cruzeiro"], country: "Brazil" },
  "atletico-mineiro": { q: ["Atletico Mineiro"], country: "Brazil" },
  bahia: { q: ["Bahia"], country: "Brazil" },
  fortaleza: { q: ["Fortaleza"], country: "Brazil" },
  // Espanha
  "atletico-madrid": { q: ["Atletico Madrid"], country: "Spain" },
  "athletic-bilbao": { q: ["Athletic Bilbao", "Athletic Club"], country: "Spain" },
  villarreal: { q: ["Villarreal"], country: "Spain" },
  // Inglaterra
  chelsea: { q: ["Chelsea"], country: "England" },
  tottenham: { q: ["Tottenham Hotspur", "Tottenham"], country: "England" },
  newcastle: { q: ["Newcastle United"], country: "England" },
  // Alemanha
  "bayer-leverkusen": { q: ["Bayer Leverkusen"], country: "Germany" },
  "borussia-dortmund": { q: ["Borussia Dortmund"], country: "Germany" },
  "eintracht-frankfurt": { q: ["Eintracht Frankfurt"], country: "Germany" },
  // França
  marseille: { q: ["Marseille", "Olympique Marseille"], country: "France" },
  monaco: { q: ["Monaco", "AS Monaco"] },
  // Itália
  inter: { q: ["Inter Milan", "Internazionale"], country: "Italy" },
  atalanta: { q: ["Atalanta"], country: "Italy" },
  napoli: { q: ["Napoli", "SSC Napoli"], country: "Italy" },
  // Portugal
  benfica: { q: ["Benfica"], country: "Portugal" },
  sporting: { q: ["Sporting CP", "Sporting Lisbon"], country: "Portugal" },
  porto: { q: ["Porto", "FC Porto"], country: "Portugal" },
  // Holanda
  ajax: { q: ["Ajax"], country: "Netherlands" },
  psv: { q: ["PSV Eindhoven", "PSV"], country: "Netherlands" },
  // Demais clubes da Champions
  "club-brugge": { q: ["Club Brugge"], country: "Belgium" },
  "union-saint-gilloise": { q: ["Union Saint-Gilloise", "Royale Union Saint-Gilloise"], country: "Belgium" },
  galatasaray: { q: ["Galatasaray"], country: "Turkey" },
  olympiacos: { q: ["Olympiacos", "Olympiakos"], country: "Greece" },
  "slavia-praga": { q: ["Slavia Prague"] },
  "bodo-glimt": { q: ["Bodo Glimt", "Bodo/Glimt"], country: "Norway" },
  copenhague: { q: ["FC Copenhagen", "Copenhagen"], country: "Denmark" },
  kairat: { q: ["Kairat Almaty", "Kairat"], country: "Kazakhstan" },
  pafos: { q: ["Pafos", "Pafos FC"], country: "Cyprus" },
  qarabag: { q: ["Qarabag", "Qarabag FK"], country: "Azerbaijan" },
  // América do Sul e mundo árabe
  "boca-juniors": { q: ["Boca Juniors"], country: "Argentina" },
  "river-plate": { q: ["River Plate"], country: "Argentina" },
  "al-nassr": { q: ["Al-Nassr", "Al Nassr"], country: "Saudi Arabia" },
  "al-hilal": { q: ["Al-Hilal", "Al Hilal"], country: "Saudi Arabia" },
  // Seleções
  uruguai: { q: ["Uruguay"] },
  colombia: { q: ["Colombia"] },
  equador: { q: ["Ecuador"] },
  paraguai: { q: ["Paraguay"] },
  chile: { q: ["Chile"] },
  mexico: { q: ["Mexico"] },
  "estados-unidos": { q: ["USA", "United States"] },
  canada: { q: ["Canada"] },
  holanda: { q: ["Netherlands"] },
  belgica: { q: ["Belgium"] },
  croacia: { q: ["Croatia"] },
  suica: { q: ["Switzerland"] },
  polonia: { q: ["Poland"] },
  dinamarca: { q: ["Denmark"] },
  marrocos: { q: ["Morocco"] },
  senegal: { q: ["Senegal"] },
  nigeria: { q: ["Nigeria"] },
  camaroes: { q: ["Cameroon"] },
  gana: { q: ["Ghana"] },
  "coreia-do-sul": { q: ["South Korea", "Korea Republic"] },
  "arabia-saudita": { q: ["Saudi Arabia"] },
  australia: { q: ["Australia"] },
};

type ApiTeam = {
  strTeam: string;
  strTeamAlternate?: string | null;
  strSport: string;
  strCountry?: string | null;
  strBadge?: string | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function search(query: string): Promise<ApiTeam[]> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(API + encodeURIComponent(query));
    if (res.status === 429) {
      await sleep(10_000);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} em "${query}"`);
    const data = (await res.json()) as { teams: ApiTeam[] | null };
    return data.teams ?? [];
  }
  throw new Error(`Rate limit persistente em "${query}"`);
}

function pick(results: ApiTeam[], query: string, country?: string): ApiTeam | undefined {
  const soccer = results.filter(
    (t) =>
      t.strSport === "Soccer" &&
      t.strBadge &&
      !/women|\bU-?\d\d\b/i.test(t.strTeam)
  );
  const score = (t: ApiTeam) => {
    let s = 0;
    if (t.strTeam.toLowerCase() === query.toLowerCase()) s += 4;
    else if (t.strTeamAlternate?.toLowerCase().split(",").map((x) => x.trim()).includes(query.toLowerCase())) s += 2;
    if (country && t.strCountry === country) s += 3;
    else if (country && t.strCountry && t.strCountry !== country) s -= 3;
    return s;
  };
  return soccer.sort((a, b) => score(b) - score(a))[0];
}

async function main() {
  const pending = teams.filter((t) => t.crest?.endsWith(".svg"));
  console.log(`${pending.length} escudos para baixar.\n`);
  const ok: string[] = [];
  const failed: { slug: string; reason: string }[] = [];

  for (const team of pending) {
    const lookup = LOOKUP[team.slug];
    if (!lookup) {
      failed.push({ slug: team.slug, reason: "sem mapeamento" });
      continue;
    }
    let found: ApiTeam | undefined;
    let matchedQuery = "";
    try {
      for (const q of lookup.q) {
        const results = await search(q);
        await sleep(2200); // limite da API gratuita
        found = pick(results, q, lookup.country);
        if (found) {
          matchedQuery = q;
          break;
        }
      }
      if (!found?.strBadge) {
        failed.push({ slug: team.slug, reason: "nenhum resultado com escudo" });
        console.log(`✗ ${team.slug} — não encontrado`);
        continue;
      }
      const img = await fetch(found.strBadge);
      if (!img.ok) throw new Error(`download HTTP ${img.status}`);
      const buf = Buffer.from(await img.arrayBuffer());
      if (buf.length < 1000) throw new Error("arquivo suspeito (<1KB)");
      // Converte para WebP — a vitrine referencia /images/escudos/<slug>.webp.
      const webp = await sharp(buf).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
      writeFileSync(join(outDir, `${team.slug}.webp`), webp);
      ok.push(team.slug);
      console.log(`✓ ${team.slug} ← ${found.strTeam} (${found.strCountry ?? "?"}) [busca: ${matchedQuery}]`);
    } catch (err) {
      failed.push({ slug: team.slug, reason: String(err) });
      console.log(`✗ ${team.slug} — ${err}`);
    }
  }

  console.log(`\n${ok.length} baixados, ${failed.length} falhas.`);
  if (failed.length) {
    console.log("Falhas:");
    for (const f of failed) console.log(`  - ${f.slug}: ${f.reason}`);
  }
  writeFileSync(
    join(process.cwd(), "scripts", "fetch-escudos-report.json"),
    JSON.stringify({ ok, failed }, null, 2)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
