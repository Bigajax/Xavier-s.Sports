import type { Metadata } from "next";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import CatalogError from "@/components/CatalogError";
import ProntaEntregaClient from "@/components/ProntaEntregaClient";
import { getCatalog } from "@/lib/products/db";
import { deriveStatus } from "@/lib/products/types";
import { waGeneric } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Camisas à Pronta Entrega",
  description:
    "Confira camisas de clubes e seleções com tamanhos à pronta entrega na Xavier's Sports. Escolha seu modelo e peça pelo WhatsApp.",
};

export default async function ProntaEntregaPage() {
  let ready: Awaited<ReturnType<typeof getCatalog>> | null = null;
  try {
    const catalog = await getCatalog();
    ready = catalog.filter((p) => deriveStatus(p.variants) === "pronta-entrega");
  } catch {
    ready = null;
  }

  return (
    <div>
      {/* Hero */}
      <section className="field-lines bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <p className="xavier-eyebrow flex items-center gap-2 text-amarelo">
            <PackageCheck className="h-4 w-4" aria-hidden="true" />
            Pronta entrega
          </p>
          <h1 className="display mt-3 max-w-3xl text-4xl leading-[0.95] sm:text-5xl md:text-6xl">
            <span className="swoosh">Camisas prontas para entrar em campo</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 md:text-lg">
            Escolha um dos tamanhos disponíveis e faça seu pedido pelo WhatsApp.
            Sem esperar o prazo de encomenda.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#camisas"
              className="xavier-tag bg-amarelo px-6 py-3 text-sm text-ink transition-transform hover:scale-[1.03]"
            >
              <span>Ver camisas disponíveis</span>
            </a>
            <span className="text-xs text-white/55">
              Disponibilidade sujeita à confirmação da equipe.
            </span>
          </div>
        </div>
      </section>

      {/* Grade */}
      <section id="camisas" className="scroll-mt-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          {ready === null ? (
            <CatalogError />
          ) : (
            <ProntaEntregaClient products={ready} />
          )}
        </div>
      </section>

      {/* Ajuda pelo WhatsApp */}
      <section className="bg-cloud">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 md:px-6">
          <div>
            <h2 className="display text-3xl text-ink sm:text-4xl">
              Não achou o tamanho que queria?
            </h2>
            <p className="mt-2 max-w-lg text-steel">
              Fale com a equipe: consultamos reposição, outros tamanhos e modelos
              por encomenda com prazo estimado de 7 a 12 dias úteis.
            </p>
          </div>
          <a
            href={waGeneric()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-whats px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
            Falar no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
