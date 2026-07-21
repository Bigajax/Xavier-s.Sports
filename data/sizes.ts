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
      { label: "P", length: "69–71 cm", width: "53–55 cm", height: "162–170 cm", weight: "50–62 kg" },
      { label: "M", length: "71–73 cm", width: "55–57 cm", height: "170–175 cm", weight: "62–75 kg" },
      { label: "G", length: "73–75 cm", width: "57–58 cm", height: "175–178 cm", weight: "78–83 kg" }, // ⚠ altura
      { label: "GG", length: "75–78 cm", width: "58–60 cm", height: "178–182 cm", weight: "83–90 kg" }, // ⚠ altura
      { label: "2XL", length: "78–81 cm", width: "60–62 cm", height: "180–185 cm", weight: "90–97 kg" },
      { label: "3XL", length: "81–83 cm", width: "62–64 cm", height: "192–197 cm", weight: "97–100 kg" }, // ⚠ peso
      { label: "4XL", length: "83–85 cm", width: "64–65 cm", height: "197–200 cm", weight: "100–110 kg" },
    ],
  },
  {
    slug: "masculino-jogador",
    name: "Jogador (Player) — corte mais justo, P a 4XL",
    note: NOTE_OFICIAL,
    rows: [
      { label: "P", length: "67–69 cm", width: "49–51 cm", height: "162–170 cm", weight: "50–62 kg" },
      { label: "M", length: "69–71 cm", width: "51–53 cm", height: "170–175 cm", weight: "62–75 kg" }, // ⚠ comprimento
      { label: "G", length: "71–73 cm", width: "51–53 cm", height: "170–175 cm", weight: "75–80 kg" }, // ⚠ peso
      { label: "GG", length: "73–78 cm", width: "53–55 cm", height: "175–180 cm", weight: "80–85 kg" }, // ⚠ largura
      { label: "2XL", length: "74–76 cm", width: "55–57 cm", height: "180–185 cm", weight: "80–85 kg" }, // ⚠ comprimento
      { label: "3XL", length: "76–78 cm", width: "57–60 cm", height: "185–195 cm", weight: "85–90 kg" },
      { label: "4XL", length: "78–79 cm", width: "60–63 cm", height: "190–195 cm", weight: "90–95 kg" }, // ⚠ rotulada "3XL" na arte
    ],
  },
  {
    slug: "feminino",
    name: "Feminina (Woman) — P a GG",
    note: NOTE_OFICIAL,
    rows: [
      { label: "P", length: "61–63 cm", width: "40–41 cm", height: "150–160 cm", weight: "50–62 kg" },
      { label: "M", length: "63–66 cm", width: "41–44 cm", height: "160–165 cm", weight: "62–75 kg" },
      { label: "G", length: "66–69 cm", width: "44–47 cm", height: "165–170 cm", weight: "75–85 kg" },
      { label: "GG", length: "69–71 cm", width: "47–50 cm", height: "170–175 cm", weight: "80–95 kg" }, // ⚠ altura
    ],
  },
  {
    slug: "infantil",
    name: "Infantil",
    note: NOTE_DEMO,
    rows: [
      { label: "4 anos", length: "48 cm", width: "36 cm" },
      { label: "6 anos", length: "52 cm", width: "38 cm" },
      { label: "8 anos", length: "56 cm", width: "40 cm" },
      { label: "10 anos", length: "60 cm", width: "42 cm" },
      { label: "12 anos", length: "64 cm", width: "44 cm" },
    ],
  },
  {
    slug: "retro",
    name: "Retrô (modelagem clássica, mais ampla)",
    note: NOTE_DEMO,
    rows: [
      { label: "P", length: "71 cm", width: "52 cm" },
      { label: "M", length: "73 cm", width: "55 cm" },
      { label: "G", length: "75 cm", width: "58 cm" },
      { label: "GG", length: "77 cm", width: "61 cm" },
    ],
  },
];
