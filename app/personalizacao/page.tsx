import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import PersonalizationSimulator from "@/components/PersonalizationSimulator";
import { waPersonalizacao } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Personalização",
  description:
    "Nome, número e detalhes na sua camisa: veja como funciona a personalização na Xavier's Sports.",
};

const rules = [
  ["Disponibilidade", "Nem todo modelo aceita personalização — a equipe confirma caso a caso."],
  ["Limite de caracteres", "Em geral até 14 caracteres no nome e números de 0 a 99 (varia por modelo)."],
  ["Aplicação e fonte", "Tipo de aplicação e fonte variam conforme o modelo e o fornecedor."],
  ["Prazo", "Personalização pode adicionar dias ao prazo — informado no atendimento."],
  ["Custo adicional", "O valor é confirmado junto com o pedido."],
  ["Trocas", "Peças personalizadas podem ter regras específicas de troca e devolução."],
] as const;

export default function PersonalizacaoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Personalização"
        title="Deixe a camisa com a sua identidade"
        subtitle="A personalização depende do modelo escolhido e da confirmação da equipe."
      />

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
        <h2 className="display text-2xl text-ink">Simulador de prévia</h2>
        <p className="mb-6 mt-1 text-sm text-steel">
          Brinque com nome e número para visualizar a ideia — o resultado real
          depende do modelo.
        </p>
        <PersonalizationSimulator />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {rules.map(([title, text]) => (
          <div key={title} className="rounded-xl border border-ink/10 bg-cloud/50 p-5">
            <h3 className="display-upright text-base text-ink">{title}</h3>
            <p className="mt-1 text-sm text-steel">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <a
          href={waPersonalizacao()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Consultar personalização
        </a>
      </div>
    </div>
  );
}
