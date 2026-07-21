/**
 * Guia de tamanhos — TABELA OFICIAL Xavier's Sports (enviada pelo cliente em
 * 21/07/2026, arte "Tabela de Medidas"). Torcedor e Jogador vão de P a 4XL;
 * Feminina de P a GG. Comprimento/largura são da PEÇA (cm); altura/peso são
 * da PESSOA (indicação de caimento).
 *
 * Células com erro evidente na arte original foram normalizadas (progressão
 * entre tamanhos vizinhos) e estão marcadas com "⚠" no comentário da linha —
 * confirmar com o cliente: torcedor G/GG altura e 3XL peso; jogador M
 * comprimento, G peso, GG largura, 2XL comprimento e a última coluna
 * duplicada "3XL" (tratada como 4XL); feminina GG altura.
 */

export type SizeRow = {
  label: string;
  length: string; // comprimento da peça (ombro à barra)
  width: string; // largura da peça (axila a axila)
  height?: string; // altura indicada da pessoa
  weight?: string; // peso indicado da pessoa
};

export type SizeTable = {
  slug: string;
  name: string;
  note: string;
  rows: SizeRow[];
};

const NOTE_OFICIAL =
  "Tabela oficial Xavier's Sports. Comprimento e largura são medidas da peça; altura e peso são indicações de caimento. Em caso de dúvida, fale com a equipe pelo WhatsApp.";

const NOTE_DEMO =
  "Medidas de referência (demonstrativas). Podem variar entre modelos e versões — compare sempre com uma peça que você já utiliza.";

export const sizeTables: SizeTable[] = [
  {
    slug: "masculino-torcedor",
    name: "Torcedor (Fan) — P a 4XL",
    note: NOTE_OFICIAL,
    rows: [
      { label: "P", length: "69–71", width: "53–55", height: "162–170", weight: "50–62" },
      { label: "M", length: "71–73", width: "55–57", height: "170–175", weight: "62–75" },
      { label: "G", length: "73–75", width: "57–58", height: "175–178", weight: "78–83" }, // ⚠ altura
      { label: "GG", length: "75–78", width: "58–60", height: "178–182", weight: "83–90" }, // ⚠ altura
      { label: "2XL", length: "78–81", width: "60–62", height: "180–185", weight: "90–97" },
      { label: "3XL", length: "81–83", width: "62–64", height: "192–197", weight: "97–100" }, // ⚠ peso
      { label: "4XL", length: "83–85", width: "64–65", height: "197–200", weight: "100–110" },
    ],
  },
  {
    slug: "masculino-jogador",
    name: "Jogador (Player) — corte mais justo, P a 4XL",
    note: NOTE_OFICIAL,
    rows: [
      { label: "P", length: "67–69", width: "49–51", height: "162–170", weight: "50–62" },
      { label: "M", length: "69–71", width: "51–53", height: "170–175", weight: "62–75" }, // ⚠ comprimento
      { label: "G", length: "71–73", width: "51–53", height: "170–175", weight: "75–80" }, // ⚠ peso
      { label: "GG", length: "73–78", width: "53–55", height: "175–180", weight: "80–85" }, // ⚠ largura
      { label: "2XL", length: "74–76", width: "55–57", height: "180–185", weight: "80–85" }, // ⚠ comprimento
      { label: "3XL", length: "76–78", width: "57–60", height: "185–195", weight: "85–90" },
      { label: "4XL", length: "78–79", width: "60–63", height: "190–195", weight: "90–95" }, // ⚠ rotulada "3XL" na arte
    ],
  },
  {
    slug: "feminino",
    name: "Feminina (Woman) — P a GG",
    note: NOTE_OFICIAL,
    rows: [
      { label: "P", length: "61–63", width: "40–41", height: "150–160", weight: "50–62" },
      { label: "M", length: "63–66", width: "41–44", height: "160–165", weight: "62–75" },
      { label: "G", length: "66–69", width: "44–47", height: "165–170", weight: "75–85" },
      { label: "GG", length: "69–71", width: "47–50", height: "170–175", weight: "80–95" }, // ⚠ altura
    ],
  },
  {
    slug: "infantil",
    name: "Infantil",
    note: NOTE_DEMO,
    rows: [
      { label: "4 anos", length: "48", width: "36" },
      { label: "6 anos", length: "52", width: "38" },
      { label: "8 anos", length: "56", width: "40" },
      { label: "10 anos", length: "60", width: "42" },
      { label: "12 anos", length: "64", width: "44" },
    ],
  },
  {
    slug: "retro",
    name: "Retrô (modelagem clássica, mais ampla)",
    note: NOTE_DEMO,
    rows: [
      { label: "P", length: "71", width: "52" },
      { label: "M", length: "73", width: "55" },
      { label: "G", length: "75", width: "58" },
      { label: "GG", length: "77", width: "61" },
    ],
  },
];
