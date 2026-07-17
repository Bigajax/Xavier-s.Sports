import { MessageCircle, PackageCheck, Repeat, Ruler, Truck } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

const reasons = [
  {
    icon: MessageCircle,
    title: "Atendimento direto",
    text: "Você fala com a equipe da loja, não com um robô.",
  },
  {
    icon: Ruler,
    title: "Tamanho confirmado antes",
    text: "Disponibilidade e medidas verificadas antes do pagamento.",
  },
  {
    icon: PackageCheck,
    title: "Pedido acompanhado",
    text: "Atualizações do pedido direto no seu WhatsApp.",
  },
  {
    icon: Repeat,
    title: "Troca de tamanho",
    text: "Troca conforme a política da loja, combinada no atendimento.",
  },
  {
    icon: Truck,
    title: "Envio com rastreio",
    text: "Código de rastreamento para acompanhar a entrega.",
  },
];

/**
 * Substitui a área de avaliações enquanto não há depoimentos reais —
 * argumentos concretos em vez de uma seção vazia.
 */
export default function WhyXaviers() {
  return (
    <section className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Compra assistida"
            title="Por que comprar com a Xavier's?"
          />
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((r) => (
            <li key={r.title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
              <r.icon className="h-6 w-6 text-roxo" aria-hidden="true" />
              <h3 className="display-upright mt-3 text-base text-ink">{r.title}</h3>
              <p className="mt-1 text-sm text-steel">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
