/**
 * Gera folhas de contato com a FAIXA da marca d'água (região fixa) de todas
 * as fotos de produto, ordenadas pelo score combinado dos detectores v1+v2,
 * para revisão visual definitiva. Cada folha tem 20 faixas numeradas.
 *
 * Uso: node scripts/gen-strips.mjs <dirSaida>
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images/produtos";
const OUT = process.argv[2] ?? "scripts/strips";
mkdirSync(OUT, { recursive: true });

const SW = 900, SH = 78; // tamanho de cada faixa
const PER_SHEET = 20;
const BAND = { left: 0.12, top: 0.46, width: 0.76, height: 0.1 };

const r1 = Object.fromEntries(JSON.parse(readFileSync("scripts/watermark-report.json", "utf8")).map((r) => [r.file, r.score ?? 0]));
const r2 = JSON.parse(readFileSync("scripts/watermark-report2.json", "utf8"));
const combo = r2
  .map((r) => ({ file: r.file, v1: r1[r.file] ?? 0, v2: r.score, c: Math.max((r1[r.file] ?? 0) / 0.4, r.score / 6) }))
  .sort((a, b) => b.c - a.c);
writeFileSync(join(OUT, "order.json"), JSON.stringify(combo, null, 1));

let sheet = 0;
for (let s = 0; s * PER_SHEET < combo.length; s++) {
  const chunk = combo.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const parts = [];
  for (let i = 0; i < chunk.length; i++) {
    const f = chunk[i].file;
    const img = sharp(join(DIR, f));
    const meta = await img.metadata();
    const buf = await img
      .extract({
        left: Math.round(meta.width * BAND.left),
        top: Math.round(meta.height * BAND.top),
        width: Math.round(meta.width * BAND.width),
        height: Math.round(meta.height * BAND.height),
      })
      .resize(SW, SH, { fit: "fill" })
      .toBuffer();
    parts.push({ input: buf, left: 60, top: i * (SH + 4) });
  }
  const height = chunk.length * (SH + 4);
  const labels = chunk
    .map((_, i) => `<text x="6" y="${i * (SH + 4) + SH / 2 + 6}" font-family="monospace" font-size="20" fill="black">${s * PER_SHEET + i + 1}</text>`)
    .join("");
  const svg = Buffer.from(`<svg width="${SW + 60}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e8e8e8"/>${labels}</svg>`);
  await sharp(svg).composite(parts).jpeg({ quality: 88 }).toFile(join(OUT, `sheet-${String(s + 1).padStart(2, "0")}.jpg`));
  sheet++;
}
console.log(`${combo.length} faixas em ${sheet} folhas → ${OUT}`);
