/**
 * Gera escudos-monograma SVG para todos os times cujo `crest` aponta para
 * um .svg — escudo nas cores do time com a dupla faixa diagonal da marca.
 *
 * Uso: npm run escudos
 * Para usar um escudo real, salve o PNG em public/images/escudos/<slug>.png
 * e remova o campo `crest` do time em data/teams.ts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { teams } from "../data/teams";

const outDir = join(process.cwd(), "public", "images", "escudos");
mkdirSync(outDir, { recursive: true });

const SHIELD =
  "M48 4 L88 14 V52 C88 75 67 88 48 93 C29 88 8 75 8 52 V14 Z";

function crestSvg(
  short: string,
  primary: string,
  secondary: string,
  textOnPrimary?: "light" | "dark"
): string {
  const textFill = textOnPrimary === "dark" ? "#090909" : "#ffffff";
  const fontSize = short.length >= 3 ? 22 : 26;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
  <defs>
    <clipPath id="shield"><path d="${SHIELD}"/></clipPath>
  </defs>
  <path d="${SHIELD}" fill="${primary}"/>
  <g clip-path="url(#shield)">
    <rect x="72" y="-10" width="13" height="120" fill="${secondary}" transform="skewX(-8)"/>
    <rect x="89" y="-10" width="4" height="120" fill="${secondary}" transform="skewX(-8)"/>
  </g>
  <path d="${SHIELD}" fill="none" stroke="rgba(9,9,9,0.2)" stroke-width="2"/>
  <text x="38" y="56" text-anchor="middle" font-family="'Arial Black','Arial',sans-serif" font-style="italic" font-weight="900" font-size="${fontSize}" letter-spacing="-1" fill="${textFill}">${short}</text>
</svg>
`;
}

let count = 0;
for (const t of teams) {
  if (!t.crest?.endsWith(".svg")) continue;
  const file = join(outDir, `${t.slug}.svg`);
  writeFileSync(file, crestSvg(t.short, t.colors[0], t.colors[1], t.textOnPrimary));
  console.log(`✓ ${t.slug}.svg`);
  count++;
}
console.log(`${count} escudos gerados em public/images/escudos.`);
