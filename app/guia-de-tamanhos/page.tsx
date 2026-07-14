import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { sizeTables } from "@/data/sizes";

export const metadata: Metadata = {
  title: "Guia de tamanhos",
  description:
    "Aprenda a medir sua camisa e compare com as tabelas de referência por versão e público.",
};

const instructions = [
  "Estenda uma camisa sobre uma superfície plana.",
  "Meça a largura de uma axila à outra.",
  "Meça o comprimento do ombro até a barra.",
  "Compare com a tabela do produto.",
];

/** Ilustração simples da medição (SVG inline). */
function MeasureIllustration() {
  return (
    <svg
      viewBox="0 0 300 220"
      className="mx-auto h-auto w-full max-w-sm"
      role="img"
      aria-label="Ilustração de como medir a camisa: largura entre as axilas e comprimento do ombro até a barra"
    >
      <path
        d="M95 30 L125 18 Q150 32 175 18 L205 30 L245 60 L225 92 L210 82 L210 200 L90 200 L90 82 L75 92 L55 60 Z"
        fill="#f4f4f4"
        stroke="#090909"
        strokeWidth="3"
      />
      {/* largura */}
      <line x1="92" y1="105" x2="208" y2="105" stroke="#6f16a8" strokeWidth="3" strokeDasharray="6 4" />
      <text x="150" y="98" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6f16a8">
        Largura do peito
      </text>
      {/* comprimento */}
      <line x1="255" y1="32" x2="255" y2="198" stroke="#e53935" strokeWidth="3" strokeDasharray="6 4" />
      <text
        x="266"
        y="115"
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#e53935"
        transform="rotate(90 266 115)"
      >
        Comprimento
      </text>
    </svg>
  );
}

export default function GuiaDeTamanhosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Guia de tamanhos"
        title="Meça antes, acerte de primeira"
        subtitle="As medidas podem variar entre modelos e versões. Compare com uma peça que você já utiliza."
      />

      <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
        <ol className="space-y-3">
          {instructions.map((s, i) => (
            <li key={s} className="flex items-center gap-4 rounded-xl bg-cloud/60 p-4">
              <span className="display w-8 shrink-0 text-center text-3xl text-roxo/40">
                {i + 1}
              </span>
              <span className="font-medium text-ink">{s}</span>
            </li>
          ))}
        </ol>
        <MeasureIllustration />
      </div>

      <div className="mt-12 space-y-8">
        {sizeTables.map((t) => (
          <section key={t.slug}>
            <h2 className="display-upright text-xl text-ink">{t.name}</h2>
            <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10">
              <table className="w-full min-w-[480px] text-left text-sm">
                <caption className="sr-only">{t.name}</caption>
                <thead className="bg-ink text-white">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">Tamanho</th>
                    <th scope="col" className="px-4 py-3 font-bold">Largura do peito</th>
                    <th scope="col" className="px-4 py-3 font-bold">Comprimento</th>
                    <th scope="col" className="px-4 py-3 font-bold">Manga</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, i) => (
                    <tr key={r.label} className={i % 2 ? "bg-cloud/50" : "bg-white"}>
                      <th scope="row" className="px-4 py-2.5 font-bold text-roxo">
                        {r.label}
                      </th>
                      <td className="tabular-nums px-4 py-2.5">{r.chest}</td>
                      <td className="tabular-nums px-4 py-2.5">{r.length}</td>
                      <td className="tabular-nums px-4 py-2.5">{r.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-steel">{t.note}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 rounded-xl bg-cloud p-5 text-sm text-steel">
        As tabelas acima são referências demonstrativas e editáveis. Cada
        produto pode ter medidas próprias — em caso de dúvida, consulte a
        equipe pelo WhatsApp antes de pedir. Não garantimos ajuste perfeito.
      </p>
    </div>
  );
}
