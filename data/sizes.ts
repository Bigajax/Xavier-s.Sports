/**
 * Guia de tamanhos — TABELAS DEMONSTRATIVAS, totalmente editáveis.
 * ⚠️ PENDÊNCIA DO PROPRIETÁRIO: substituir pelas medidas reais de cada
 * fornecedor/versão antes da publicação. Valores marcados como referência.
 */

export type SizeRow = {
  label: string;
  chest: string; // largura do peito (axila a axila)
  length: string; // comprimento (ombro à barra)
  sleeve: string; // manga
};

export type SizeTable = {
  slug: string;
  name: string;
  note: string;
  rows: SizeRow[];
};

const NOTE_DEMO =
  "Medidas de referência (demonstrativas). Podem variar entre modelos e versões — compare sempre com uma peça que você já utiliza.";

export const sizeTables: SizeTable[] = [
  {
    slug: "masculino-torcedor",
    name: "Masculino — versão torcedor",
    note: NOTE_DEMO,
    rows: [
      { label: "P", chest: "50 cm", length: "70 cm", sleeve: "22 cm" },
      { label: "M", chest: "53 cm", length: "72 cm", sleeve: "23 cm" },
      { label: "G", chest: "56 cm", length: "74 cm", sleeve: "24 cm" },
      { label: "GG", chest: "59 cm", length: "76 cm", sleeve: "25 cm" },
      { label: "XGG", chest: "62 cm", length: "78 cm", sleeve: "26 cm" },
    ],
  },
  {
    slug: "masculino-jogador",
    name: "Masculino — versão jogador (corte mais justo)",
    note: NOTE_DEMO,
    rows: [
      { label: "P", chest: "48 cm", length: "69 cm", sleeve: "21 cm" },
      { label: "M", chest: "51 cm", length: "71 cm", sleeve: "22 cm" },
      { label: "G", chest: "54 cm", length: "73 cm", sleeve: "23 cm" },
      { label: "GG", chest: "57 cm", length: "75 cm", sleeve: "24 cm" },
      { label: "XGG", chest: "60 cm", length: "77 cm", sleeve: "25 cm" },
    ],
  },
  {
    slug: "feminino",
    name: "Feminino",
    note: NOTE_DEMO,
    rows: [
      { label: "PP", chest: "44 cm", length: "62 cm", sleeve: "18 cm" },
      { label: "P", chest: "46 cm", length: "64 cm", sleeve: "19 cm" },
      { label: "M", chest: "49 cm", length: "66 cm", sleeve: "20 cm" },
      { label: "G", chest: "52 cm", length: "68 cm", sleeve: "21 cm" },
      { label: "GG", chest: "55 cm", length: "70 cm", sleeve: "22 cm" },
    ],
  },
  {
    slug: "infantil",
    name: "Infantil",
    note: NOTE_DEMO,
    rows: [
      { label: "4 anos", chest: "36 cm", length: "48 cm", sleeve: "14 cm" },
      { label: "6 anos", chest: "38 cm", length: "52 cm", sleeve: "15 cm" },
      { label: "8 anos", chest: "40 cm", length: "56 cm", sleeve: "16 cm" },
      { label: "10 anos", chest: "42 cm", length: "60 cm", sleeve: "17 cm" },
      { label: "12 anos", chest: "44 cm", length: "64 cm", sleeve: "18 cm" },
    ],
  },
  {
    slug: "retro",
    name: "Retrô (modelagem clássica, mais ampla)",
    note: NOTE_DEMO,
    rows: [
      { label: "P", chest: "52 cm", length: "71 cm", sleeve: "23 cm" },
      { label: "M", chest: "55 cm", length: "73 cm", sleeve: "24 cm" },
      { label: "G", chest: "58 cm", length: "75 cm", sleeve: "25 cm" },
      { label: "GG", chest: "61 cm", length: "77 cm", sleeve: "26 cm" },
    ],
  },
];
