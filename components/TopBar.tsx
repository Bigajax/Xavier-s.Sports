const messages = [
  "Enviamos para todo o Brasil",
  "Consulte disponibilidade pelo WhatsApp",
  "Camisas atuais e retrô",
  "Personalização sujeita à disponibilidade",
];

/** Barra superior com mensagens rotativas (CSS puro, pausa em reduced-motion). */
export default function TopBar() {
  return (
    <div className="bg-roxo-escuro text-white">
      {/* mobile: rotativo vertical */}
      <div className="h-8 overflow-hidden md:hidden" aria-hidden="true">
        <div className="animate-topbar">
          {[...messages, messages[0]].map((m, i) => (
            <p
              key={i}
              className="flex h-8 items-center justify-center text-xs font-medium tracking-wide"
            >
              {m}
            </p>
          ))}
        </div>
      </div>
      {/* desktop: estático */}
      <div className="hidden h-8 items-center justify-center gap-8 md:flex">
        {messages.map((m) => (
          <p key={m} className="text-xs font-medium tracking-wide">
            <span className="mr-2 inline-block h-1.5 w-1.5 -skew-x-12 bg-amarelo align-middle" aria-hidden="true" />
            {m}
          </p>
        ))}
      </div>
      {/* leitura acessível única */}
      <p className="sr-only">{messages.join(". ")}</p>
    </div>
  );
}
