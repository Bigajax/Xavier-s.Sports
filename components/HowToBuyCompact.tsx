const steps = [
  "Escolha versão e tamanho",
  "Envie o pedido pelo WhatsApp",
  "A equipe confirma pagamento e entrega",
];

/** Três passos em uma linha — fica perto do CTA na página de produto. */
export default function HowToBuyCompact() {
  return (
    <ol className="mt-4 space-y-1.5">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2.5 text-xs text-steel">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-roxo/10 text-[10px] font-bold text-roxo">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}
