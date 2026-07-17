import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import TrustStrip from "@/components/TrustStrip";
import Reveal from "@/components/Reveal";

const steps = [
  {
    title: "Escolha camisa e tamanho",
    text: "Veja modelos, versões e a disponibilidade de cada tamanho.",
  },
  {
    title: "Envie o pedido pelo WhatsApp",
    text: "O site monta a mensagem com todos os detalhes do seu pedido.",
  },
  {
    title: "A equipe confirma tudo",
    text: "Estoque, pagamento e envio confirmados antes de você pagar.",
  },
];

/** Como funciona em 3 passos + faixa de confiança — seção da home. */
export default function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Passo a passo" title="Como funciona" />
            <Link
              href="/como-comprar"
              className="text-sm font-bold text-roxo hover:underline"
            >
              Ver como funciona em detalhes →
            </Link>
          </div>
        </Reveal>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="rounded-xl border border-ink/10 bg-cloud/50 p-5"
            >
              <span className="display text-4xl text-roxo/30">{i + 1}</span>
              <h3 className="display-upright mt-2 text-lg text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-steel">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <TrustStrip />
        </div>
      </div>
    </section>
  );
}
