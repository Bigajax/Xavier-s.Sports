import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, MessageCircle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { waGeneric } from "@/lib/whatsapp";
import { faqGeral } from "@/data/faq";

export const metadata: Metadata = {
  title: "Como comprar",
  description:
    "Passo a passo para pedir sua camisa pelo WhatsApp: escolha, tamanho, personalização e confirmação.",
};

const steps = [
  { title: "Escolha o produto", text: "Navegue por clubes, seleções, retrô ou use a busca." },
  { title: "Selecione o tamanho", text: "Confira o guia de medidas antes de solicitar." },
  { title: "Informe personalização, caso deseje", text: "Nome e número sujeitos à disponibilidade do modelo." },
  { title: "Envie a consulta pelo WhatsApp", text: "O site monta a mensagem completa com todos os detalhes." },
  { title: "Aguarde confirmação", text: "A equipe confirma estoque, valor final e condições." },
  { title: "Pague com Pix ou cartão", text: "A chave Pix ou o link do cartão são enviados no atendimento." },
  { title: "Receba o código de acompanhamento, quando aplicável", text: "Acompanhe a entrega até a sua casa." },
];

const notices = [
  "Estoque sujeito à confirmação.",
  "Preços podem ser atualizados.",
  "O pedido só está confirmado após validação da equipe.",
  "O prazo de envio começa após a confirmação.",
  "Personalizações podem alterar o prazo.",
  "O botão do site envia uma consulta — não é uma confirmação automática de compra.",
];

export default function ComoComprarPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Como comprar"
        title="Do site ao seu guarda-roupa"
        subtitle="A compra é finalizada pelo WhatsApp, com atendimento humano em cada etapa."
      />

      <ol className="mt-10 space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex items-start gap-4 rounded-xl border border-ink/10 bg-white p-5"
          >
            <span className="display w-10 shrink-0 text-center text-4xl text-roxo/30">
              {i + 1}
            </span>
            <div>
              <h2 className="display-upright text-lg text-ink">{s.title}</h2>
              <p className="mt-1 text-sm text-steel">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl border border-amarelo/60 bg-amarelo/10 p-5">
        <p className="flex items-center gap-2 font-bold text-ink">
          <AlertTriangle className="h-5 w-5 text-roxo" aria-hidden="true" />
          Importante saber
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink/80">
          {notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>

      <section className="mt-12">
        <h2 className="display text-3xl text-ink">
          <span className="swoosh">Perguntas frequentes</span>
        </h2>
        <div className="mt-6 space-y-3">
          {faqGeral.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-ink/10 bg-white p-5"
            >
              <summary className="cursor-pointer list-none font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={waGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Falar com a equipe
        </a>
        <Link
          href="/catalogo"
          className="xavier-tag bg-roxo px-6 py-4 text-sm text-white"
        >
          <span>Explorar camisas</span>
        </Link>
      </div>
    </div>
  );
}
