/**
 * Folhas de contato das capas dos produtos retrô (stem-1.webp) para
 * auditoria visual e definição de cores. 20 por folha, com rótulo.
 * Uso: node scripts/gen-covers.mjs <dirSaida>
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images/produtos";
const OUT = process.argv[2] ?? "scripts/covers";
mkdirSync(OUT, { recursive: true });

const rebuild = JSON.parse(readFileSync("scripts/rebuild-images3.json", "utf8"));
const stems = Object.keys(rebuild).filter((s) => s.startsWith("retro-")).sort();

const CELL = 220;
const LABEL_H = 26;
const COLS = 4;
const PER_SHEET = 20;

for (let s = 0; s * PER_SHEET < stems.length; s++) {
  const chunk = stems.slice(s * PER_SHEET, (s + 1) * PER_SHEET);
  const rows = Math.ceil(chunk.length / COLS);
  const W = COLS * (CELL + 6);
  const H = rows * (CELL + LABEL_H + 6);
  const parts = [];
  const labels = [];
  for (let i = 0; i < chunk.length; i++) {
    const x = (i % COLS) * (CELL + 6) + 3;
    const y = Math.floor(i / COLS) * (CELL + LABEL_H + 6) + 3;
    const buf = await sharp(join(DIR, rebuild[chunk[i]][0]))
      .resize(CELL, CELL, { fit: "cover" })
      .toBuffer();
    parts.push({ input: buf, left: x, top: y });
    labels.push(
      `<text x="${x + CELL / 2}" y="${y + CELL + 18}" text-anchor="middle" font-family="monospace" font-size="13" fill="black">${s * PER_SHEET + i + 1}. ${chunk[i].replace("retro-", "").slice(0, 30)}</text>`
    );
  }
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#e8e8e8"/>${labels.join("")}</svg>`
  );
  await sharp(svg).composite(parts).jpeg({ quality: 85 }).toFile(join(OUT, `covers-${s + 1}.jpg`));
}
console.log(`${stems.length} capas em ${Math.ceil(stems.length / PER_SHEET)} folhas → ${OUT}`);
