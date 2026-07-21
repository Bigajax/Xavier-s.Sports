/**
 * Detector v2 da marca d'água "minkang. x. yupoo. com" (posição fixa).
 * Filtro casado: máscara dos glifos construída pela média de |passa-alta|
 * das fotos sabidamente marcadas (fundo cancela, texto persiste); o score é
 * a diferença entre a energia de alta frequência nos pixels dos glifos e na
 * vizinhança imediata — robusto a tecidos texturizados e a texto claro/escuro.
 *
 * Uso: node scripts/detect-watermark2.mjs → scripts/watermark-report2.json
 */
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "public/images/produtos";
const W = 1000;
const H = 90;
const BAND = { left: 0.14, top: 0.455, width: 0.72, height: 0.105 };

async function highpassAbs(file) {
  const img = sharp(join(DIR, file));
  const meta = await img.metadata();
  const region = {
    left: Math.round(meta.width * BAND.left),
    top: Math.round(meta.height * BAND.top),
    width: Math.round(meta.width * BAND.width),
    height: Math.round(meta.height * BAND.height),
  };
  const base = img.extract(region).resize(W, H, { fit: "fill" }).greyscale();
  const [sharpBuf, blurBuf] = await Promise.all([
    base.clone().raw().toBuffer(),
    base.clone().blur(2.5).raw().toBuffer(),
  ]);
  const v = new Float64Array(W * H);
  for (let i = 0; i < v.length; i++) v[i] = Math.abs(sharpBuf[i] - blurBuf[i]);
  return v;
}

// 1) Máscara dos glifos: média de |passa-alta| das fotos confiáveis (score v1 >= 0.20)
const report1 = JSON.parse(readFileSync("scripts/watermark-report.json", "utf8"));
const confident = report1.filter((r) => r.score >= 0.2).map((r) => r.file);
console.log(`Construindo máscara com ${confident.length} fotos confiáveis...`);
const avg = new Float64Array(W * H);
for (const f of confident) {
  const v = await highpassAbs(f);
  for (let i = 0; i < v.length; i++) avg[i] += v[i] / confident.length;
}
// glifos = top 8% dos pixels da média; anel = vizinhança (dilatação 3px) sem os glifos
const sorted = [...avg].sort((a, b) => b - a);
const cut = sorted[Math.floor(avg.length * 0.08)];
const glyph = new Uint8Array(W * H);
for (let i = 0; i < avg.length; i++) glyph[i] = avg[i] >= cut ? 1 : 0;
const ring = new Uint8Array(W * H);
const R = 3;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (glyph[y * W + x]) continue;
    let near = false;
    for (let dy = -R; dy <= R && !near; dy++) {
      for (let dx = -R; dx <= R && !near; dx++) {
        const ny = y + dy, nx = x + dx;
        if (ny >= 0 && ny < H && nx >= 0 && nx < W && glyph[ny * W + nx]) near = true;
      }
    }
    if (near) ring[y * W + x] = 1;
  }
}
const nGlyph = glyph.reduce((a, b) => a + b, 0);
const nRing = ring.reduce((a, b) => a + b, 0);
console.log(`Máscara: ${nGlyph} px de glifo, ${nRing} px de anel.`);

async function score(file) {
  const v = await highpassAbs(file);
  let g = 0, r = 0;
  for (let i = 0; i < v.length; i++) {
    if (glyph[i]) g += v[i];
    else if (ring[i]) r += v[i];
  }
  return g / nGlyph - r / nRing;
}

const CHECKS = [
  ["marcada", "retro-brasil-1958-home-4.jpg"],
  ["marcada (busy)", "retro-milan-02-03-home-3.jpg"],
  ["marcada", "retro-psg-92-93-home-5.jpg"],
  ["limpa capa", "retro-real-madrid-2012-13-home-1.jpg"],
  ["limpa capa", "retro-brasil-1958-home-1.jpg"],
  ["limpa capa", "retro-palmeiras-1996-home-1.jpg"],
];
console.log("Validação:");
for (const [label, f] of CHECKS) console.log(`  ${label.padEnd(24)} ${f}: ${(await score(f)).toFixed(2)}`);

const files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".jpg"));
const results = [];
for (const f of files) {
  results.push({ file: f, score: Number((await score(f)).toFixed(3)) });
}
results.sort((a, b) => b.score - a.score);
writeFileSync("scripts/watermark-report2.json", JSON.stringify(results, null, 1));
console.log(`\n${files.length} fotos analisadas → scripts/watermark-report2.json`);
