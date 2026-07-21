/**
 * Detecta a marca d'água "minkang. x. yupoo. com" nas fotos de produto.
 * Ela é estampada sempre na mesma posição (faixa central, ~47–55% da altura),
 * então: extrai a faixa, calcula o mapa de bordas (laplaciano) e correlaciona
 * com um template médio construído a partir de fotos sabidamente marcadas.
 *
 * Uso: node scripts/detect-watermark.mjs  → escreve scripts/watermark-report.json
 */
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images/produtos";
const W = 700; // faixa reduzida p/ correlação
const H = 56;

// Faixa da marca d'água (proporções da imagem original)
const BAND = { left: 0.15, top: 0.465, width: 0.7, height: 0.09 };

const KNOWN_MARKED = [
  "flamengo-26-27-home-torcedor-4.jpg",
  "brasil-2026-home-torcedor-3.jpg",
  "psg-26-27-home-torcedor-5.jpg",
  "real-madrid-26-27-home-torcedor-3.jpg",
  "argentina-2026-home-jogador-5.jpg",
];
const KNOWN_CLEAN = [
  "flamengo-26-27-home-torcedor-2.jpg",
  "corinthians-26-27-home-torcedor-2.jpg",
  "manchester-united-26-27-home-torcedor-1.jpg",
  "flamengo-26-27-home-torcedor-1.jpg",
];

async function edgeBand(file) {
  const img = sharp(join(DIR, file));
  const meta = await img.metadata();
  const region = {
    left: Math.round(meta.width * BAND.left),
    top: Math.round(meta.height * BAND.top),
    width: Math.round(meta.width * BAND.width),
    height: Math.round(meta.height * BAND.height),
  };
  const buf = await img
    .extract(region)
    .resize(W, H, { fit: "fill" })
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [0, -1, 0, -1, 4, -1, 0, -1, 0] })
    .raw()
    .toBuffer();
  const v = new Float64Array(W * H);
  for (let i = 0; i < v.length; i++) v[i] = buf[i];
  // normaliza (média 0, norma 1)
  let mean = 0;
  for (const x of v) mean += x;
  mean /= v.length;
  let norm = 0;
  for (let i = 0; i < v.length; i++) {
    v[i] -= mean;
    norm += v[i] * v[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

// Template = média dos mapas de borda das fotos marcadas (o texto reforça, o fundo cancela)
const template = new Float64Array(W * H);
for (const f of KNOWN_MARKED) {
  const v = await edgeBand(f);
  for (let i = 0; i < v.length; i++) template[i] += v[i] / KNOWN_MARKED.length;
}
let tnorm = 0;
for (const x of template) tnorm += x * x;
tnorm = Math.sqrt(tnorm) || 1;
for (let i = 0; i < template.length; i++) template[i] /= tnorm;

async function score(file) {
  const v = await edgeBand(file);
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * template[i];
  return s;
}

console.log("Calibração:");
for (const f of KNOWN_MARKED) console.log(`  marcada  ${f}: ${(await score(f)).toFixed(3)}`);
for (const f of KNOWN_CLEAN) console.log(`  limpa    ${f}: ${(await score(f)).toFixed(3)}`);

const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".jpg"));
const results = [];
for (const f of files) {
  try {
    results.push({ file: f, score: Number((await score(f)).toFixed(4)) });
  } catch (e) {
    results.push({ file: f, score: null, error: String(e) });
  }
}
results.sort((a, b) => (b.score ?? -9) - (a.score ?? -9));
writeFileSync("scripts/watermark-report.json", JSON.stringify(results, null, 1));

const buckets = { ">=0.30": 0, "0.15-0.30": 0, "0.08-0.15": 0, "<0.08": 0 };
for (const r of results) {
  if (r.score >= 0.3) buckets[">=0.30"]++;
  else if (r.score >= 0.15) buckets["0.15-0.30"]++;
  else if (r.score >= 0.08) buckets["0.08-0.15"]++;
  else buckets["<0.08"]++;
}
console.log(`\n${files.length} fotos analisadas. Distribuição de scores:`, buckets);
console.log("Relatório: scripts/watermark-report.json");
