import { MessageCircle } from "lucide-react";
import HeroVideos from "@/components/HeroVideos";
import { waGeneric } from "@/lib/whatsapp";

export default function Hero() {
  return (
    <section className="field-lines relative overflow-hidden bg-ink text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 md:grid-cols-[1.05fr_1fr] md:px-6 md:pb-24 md:pt-20">
        <div className="relative z-10">
          <p className="rise-in xavier-eyebrow text-amarelo">
            Clubes · Seleções · Atuais · Retrô
          </p>
          <h1 className="rise-in rise-d1 display mt-4 text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
            Sua paixão pelo
            <br />
            futebol{" "}
            <span className="relative inline-block text-amarelo">
              veste aqui
              <span
                aria-hidden="true"
                className="absolute -bottom-2 left-0 h-[5px] w-full -skew-x-[30deg] rounded-full bg-amarelo"
              />
            </span>
            .
          </h1>
          <p className="rise-in rise-d2 mt-6 max-w-md text-lg text-white/75">
            Camisas de clubes e seleções, modelos atuais e retrô, com envio
            para todo o Brasil.
          </p>
          <div className="rise-in rise-d3 mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#busca"
              className="tap xavier-tag bg-amarelo px-7 py-3.5 text-base text-ink transition-transform hover:scale-[1.03]"
            >
              <span>Encontrar minha camisa</span>
            </a>
            <a
              href={waGeneric()}
              target="_blank"
              rel="noopener noreferrer"
              className="tap flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-bold transition-colors hover:border-whats hover:text-whats"
            >
              <MessageCircle className="h-5 w-5 text-whats" aria-hidden="true" />
              Pedir pelo WhatsApp
            </a>
          </div>
          <p className="rise-in rise-d4 mt-4 text-sm text-white/50">
            Consulte tamanhos e disponibilidade sem compromisso.
          </p>
        </div>

        <div className="rise-in rise-d2">
          <HeroVideos />
        </div>
      </div>

      {/* recorte diagonal na base */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-10 bg-white"
        style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
      />
    </section>
  );
}
