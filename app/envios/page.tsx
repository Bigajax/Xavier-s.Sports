import type { Metadata } from "next";
import { MapPin, PackageCheck, Search, Truck } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Envios",
  description:
    "Enviamos para todo o Brasil. Frete e prazo informados no atendimento, com código de rastreamento quando aplicável.",
};

const cards = [
  {
    icon: Truck,
    title: "Envio para todo o Brasil",
    text: "Atendemos todas as regiões. A modalidade de envio é combinada no atendimento.",
  },
  {
    icon: Search,
    title: "Frete calculado no atendimento",
    text: "O valor e o prazo estimado são informados pela equipe junto com a confirmação do pedido.",
  },
  {
    icon: PackageCheck,
    title: "Código de rastreamento",
    text: "Quando aplicável, você recebe o código para acompanhar a entrega.",
  },
  {
    icon: MapPin,
    title: "Endereço correto é essencial",
    text: "Confira CEP, número e complemento antes de confirmar — as informações de entrega são de responsabilidade do cliente.",
  },
];

export default function EnviosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Envios"
        title="Da nossa prateleira para o seu jogo"
        subtitle={site.shippingText}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-ink/10 bg-white p-5">
            <span className="flex h-11 w-11 -skew-x-[8deg] items-center justify-center bg-roxo/10">
              <c.icon className="h-5 w-5 skew-x-[8deg] text-roxo" aria-hidden="true" />
            </span>
            <h2 className="display-upright mt-3 text-lg text-ink">{c.title}</h2>
            <p className="mt-1 text-sm text-steel">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-3 rounded-xl bg-cloud p-6 text-sm leading-relaxed text-steel">
        <p>
          Prazos de entrega começam a contar após a confirmação do pedido e do
          pagamento pela equipe.
        </p>
        <p>
          Atrasos externos (transportadora, clima, greves e fatores logísticos)
          podem acontecer e fogem do controle da loja — quando ocorrerem,
          acompanharemos o caso com você pelo WhatsApp.
        </p>
        <p className="text-xs">
          Conteúdo demonstrativo e editável: transportadoras, prazos e valores
          reais serão definidos pelo proprietário antes da publicação.
        </p>
      </div>
    </div>
  );
}
