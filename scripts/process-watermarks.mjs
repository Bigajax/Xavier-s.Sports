/**
 * 1) Exclui as fotos com marca d'água (lista da revisão visual das 36 folhas
 *    de contato — índices 1-based na ordem de strips/order.json);
 * 2) Renumera as fotos sobreviventes de cada produto (stem-1..n);
 * 3) Converte todos os JPG restantes para WebP (q82) e remove os JPG;
 * 4) Grava scripts/rebuild-images.json com stem → [arquivos .webp] para
 *    atualização do Supabase.
 *
 * Uso: node scripts/process-watermarks.mjs <caminho de order.json>
 */
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync, unlinkSync, renameSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images/produtos";
const orderPath = process.argv[2];
const order = JSON.parse(readFileSync(orderPath, "utf8"));

const RANGES =
  "1-186,188-228,230-237,239-249,251-253,255-262,264-268,270-272,274-275,277-279," +
  "281-287,289-291,295-300,303-321,325,327-328,331-333,336-339,341-343,345-347,349," +
  "351-352,354-355,357-359,361-368,370,372-373,376-378,381,383,385-386,388-389,391," +
  "401,403,409,412,415,417-419,423,427,430-432,434,436,442,445-446,449,451,459,461," +
  "465,467,469,471,474,477,480-481,485,487,492,494,502-503,506,511-514,516,525-526," +
  "530,537,542-547,554-556,562,565,575,581,584-585,587,615,626,633,638,651,665";

const marked = new Set();
for (const part of RANGES.split(",")) {
  const [a, b] = part.split("-").map(Number);
  for (let i = a; i <= (b ?? a); i++) marked.add(i);
}

let deleted = 0;
for (let i = 1; i <= order.length; i++) {
  if (!marked.has(i)) continue;
  try {
    unlinkSync(join(DIR, order[i - 1].file));
    deleted++;
  } catch {}
}
console.log(`Excluídas ${deleted} fotos com marca d'água (${marked.size} na lista).`);

// Agrupa sobreviventes
const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".jpg"));
const groups = new Map(); // stem -> [{file, n}]
const singles = []; // fotos demo (sufixo -a/-b etc.)
for (const f of files) {
  const m = f.match(/^(.*)-(\d+)\.jpg$/);
  if (m) {
    if (!groups.has(m[1])) groups.set(m[1], []);
    groups.get(m[1]).push({ file: f, n: Number(m[2]) });
  } else {
    singles.push(f);
  }
}

const rebuild = {};
let converted = 0;
for (const [stem, list] of groups) {
  list.sort((a, b) => a.n - b.n);
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const dst = `${stem}-${i + 1}.webp`;
    await sharp(join(DIR, list[i].file)).webp({ quality: 82 }).toFile(join(DIR, dst));
    unlinkSync(join(DIR, list[i].file));
    out.push(dst);
    converted++;
  }
  rebuild[stem] = out;
}
for (const f of singles) {
  const dst = f.replace(/\.jpg$/i, ".webp");
  await sharp(join(DIR, f)).webp({ quality: 82 }).toFile(join(DIR, dst));
  unlinkSync(join(DIR, f));
  rebuild[f.replace(/\.jpg$/i, "")] = [dst];
  converted++;
}

writeFileSync("scripts/rebuild-images.json", JSON.stringify(rebuild, null, 1));

const zero = [...groups.entries()].filter(([, l]) => l.length === 0).map(([s]) => s);
const dist = {};
for (const [, l] of groups) dist[l.length] = (dist[l.length] ?? 0) + 1;
console.log(`Convertidas ${converted} fotos para WebP.`);
console.log("Distribuição de fotos por produto (fornecedor):", dist);
console.log("Produtos sem nenhuma foto:", zero.length ? zero : "nenhum");
