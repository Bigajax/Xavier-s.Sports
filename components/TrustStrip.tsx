import { MessageCircle, Package, Repeat, Truck } from "lucide-react";

const items = [
  {
    icon: MessageCircle,
    title: "Confirmação pelo WhatsApp",
    text: "A equipe verifica o pedido antes do pagamento.",
  },
  {
    icon: Truck,
    title: "Envio para todo o Brasil",
    text: "Prazo e valor calculados conforme o CEP.",
  },
  {
    icon: Repeat,
    title: "Troca de tamanho",
    text: "Consulte condições e disponibilidade.",
  },
  {
    icon: Package,
    title: "Pedido acompanhado",
    text: "Você recebe as atualizações pelo WhatsApp.",
  },
];

/**
 * Faixa compacta de confiança — usada perto do CTA na página de produto e
 * dentro do "Como funciona" da home.
 */
export default function TrustStrip({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className={`flex items-start gap-3 rounded-xl p-3 ${
            dark ? "bg-white/5" : "border border-ink/10 bg-cloud/40"
          }`}
        >
          <item.icon
            className={`mt-0.5 h-5 w-5 shrink-0 ${dark ? "text-amarelo" : "text-roxo"}`}
            aria-hidden="true"
          />
          <span>
            <span className={`block text-sm font-bold ${dark ? "text-white" : "text-ink"}`}>
              {item.title}
            </span>
            <span className={`block text-xs ${dark ? "text-white/60" : "text-steel"}`}>
              {item.text}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
