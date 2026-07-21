"use client";

import { RotateCw } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waGeneric } from "@/lib/whatsapp";

/** Estado de erro quando o catálogo não pôde ser carregado do banco. */
export default function CatalogError() {
  return (
    <div className="mx-auto max-w-lg rounded-xl bg-cloud px-6 py-12 text-center">
      <p className="xavier-tag inline-block bg-ink px-3 py-1 text-xs text-white">
        <span>Fora do ar temporariamente</span>
      </p>
      <h2 className="display mt-4 text-2xl text-ink">
        Não foi possível carregar o catálogo agora
      </h2>
      <p className="mt-2 text-sm text-steel">
        Tente novamente em instantes. Se preferir, chame a gente no WhatsApp e
        atendemos seu pedido por lá.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="tap inline-flex items-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-roxo-escuro"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Recarregar página
        </button>
        <a
          href={waGeneric()}
          target="_blank"
          rel="noopener noreferrer"
          className="tap inline-flex items-center gap-2 rounded-lg border border-whats px-4 py-2.5 text-sm font-bold text-whats transition-colors hover:bg-whats hover:text-white"
        >
          <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
