/**
 * Converte os PNGs de public/images (escudos e logo) para WebP e remove os
 * originais. O favicon.png fica de fora — favicon WebP não tem suporte
 * confiável no Safari.
 *
 * Uso: node scripts/png-to-webp.mjs
 */
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const dirs = ["public/images/escudos", "public/images/logo"];
let before = 0;
let after = 0;
let count = 0;

for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.toLowerCase().endsWith(".png")) continue;
    const src = join(dir, f);
    const dst = join(dir, f.replace(/\.png$/i, ".webp"));
    before += statSync(src).size;
    await sharp(src).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(dst);
    after += statSync(dst).size;
    unlinkSync(src);
    count += 1;
  }
}

console.log(`${count} PNGs convertidos para WebP.`);
console.log(`Antes: ${(before / 1024).toFixed(0)} KB — Depois: ${(after / 1024).toFixed(0)} KB (economia ${(100 - (after / before) * 100).toFixed(0)}%)`);
