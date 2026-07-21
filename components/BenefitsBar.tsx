import { Package, Shirt, Sparkles } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const benefits = [
  {
    icon: Package,
    title: "Envio nacional",
    text: "Receba seu pedido em qualquer região do Brasil.",
  },
  {
    icon: WhatsAppIcon,
    title: "Atendimento pelo WhatsApp",
    text: "Consulte tamanhos, modelos e disponibilidade rapidamente.",
  },
  {
    icon: Shirt,
    title: "Modelos atuais e retrô",
    text: "Encontre lançamentos e camisas que marcaram época.",
  },
  {
    icon: Sparkles,
    title: "Personalização",
    text: "Consulte opções de nome e número para cada modelo.",
  },
];

export default function BenefitsBar() {
  return (
    <section aria-label="Benefícios" className="bg-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-8 sm:gap-6 sm:py-10 md:px-6 lg:grid-cols-4">
        {benefits.map((b) => (
          <li
            key={b.title}
            className="flex flex-col gap-2 rounded-xl border border-ink/10 bg-cloud/60 p-3.5 sm:flex-row sm:items-start sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0"
          >
            <span className="flex h-9 w-9 shrink-0 -skew-x-[8deg] items-center justify-center bg-roxo/10 sm:h-11 sm:w-11">
              <b.icon className="h-4 w-4 skew-x-[8deg] text-roxo sm:h-5 sm:w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="display-upright text-sm leading-tight text-ink sm:text-base">
                {b.title}
              </h3>
              <p className="mt-1 text-xs leading-snug text-steel sm:text-sm sm:leading-normal">
                {b.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
