import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react";
import { site } from "@/config/site";
import { waDefault } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Sobre a Xavier's Sports",
  description:
    "A Xavier's Sports conecta torcedores às camisas que representam seus clubes, seleções, memórias e paixões.",
};

export default function SobrePage() {
  return (
    <>
      <section className="field-lines bg-ink text-white">
        <div className="mx-auto max-w-4xl px-4 py-20 md:px-6">
          <p className="xavier-eyebrow text-amarelo">Sobre a loja</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">
            Futebol não é só um esporte.{" "}
            <span className="text-amarelo">É identidade.</span>
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <div className="grid items-start gap-10 md:grid-cols-[1fr_280px]">
          <div className="space-y-5 text-base leading-relaxed text-ink/80">
            <p>
              A Xavier&apos;s Sports nasceu para conectar torcedores às camisas
              que representam seus clubes, seleções, memórias e paixões. Nosso
              objetivo é facilitar a descoberta de modelos atuais e retrô,
              oferecendo atendimento próximo em cada etapa da compra.
            </p>
            <p>
              À frente da loja está {site.founder}, que transformou a paixão
              por camisas de futebol em um catálogo que vai dos lançamentos da
              temporada aos clássicos que marcaram época.
              {/* ⚠️ EDITÁVEL: complementar com a história real da loja,
                  cidade, bastidores e fotos reais do proprietário. */}
            </p>
            <p>
              Todo atendimento é feito pelo WhatsApp: você escolhe a camisa no
              site, envia a consulta e conversa com gente de verdade sobre
              tamanhos, personalização, pagamento e envio.
            </p>
            <p className="text-xs text-steel">
              Texto demonstrativo e editável — informações como ano de
              fundação, cidade e equipe devem ser preenchidas pelo proprietário.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-ink/5">
            <div className="relative mx-auto aspect-square w-40">
              <Image
                src="/images/logo/xaviers-sports-logo.jpg"
                alt="Logo da Xavier's Sports"
                fill
                sizes="160px"
                className="object-contain"
              />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href={waDefault()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-ink hover:text-roxo"
              >
                <MessageCircle className="h-4 w-4 text-whats" aria-hidden="true" />
                Atendimento pelo WhatsApp
              </a>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-ink hover:text-roxo"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                {site.instagram}
              </a>
              <p className="text-steel">{site.businessHours}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-roxo-escuro p-8 text-center text-white">
          <h2 className="display text-3xl">Nosso compromisso</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Catálogo organizado, comunicação transparente e atendimento humano
            do primeiro contato à entrega. Disponibilidade, pagamento e envio
            sempre confirmados pela equipe antes de qualquer cobrança.
          </p>
          <Link
            href="/catalogo"
            className="xavier-tag mt-6 inline-block bg-amarelo px-6 py-3 text-sm text-ink"
          >
            <span>Explorar o catálogo</span>
          </Link>
        </div>
      </div>
    </>
  );
}
