"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/data/products";
import { waProduct, type Personalization } from "@/lib/whatsapp";
import { brl } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import { toast } from "@/components/Toaster";

const sizeStatusLabel: Record<string, string> = {
  "poucas-unidades": "poucas unidades",
  consulta: "sob consulta",
};

/**
 * Núcleo de conversão: seleção de tamanho obrigatória antes do envio,
 * personalização opcional com confirmação, CTA fixo no mobile.
 */
export default function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [wantsPersonalization, setWantsPersonalization] = useState(false);
  const [pName, setPName] = useState("");
  const [pNumber, setPNumber] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const needsSize = product.sizes.length > 0;

  const personalization: Personalization = {
    wanted: wantsPersonalization,
    name: pName.trim() || undefined,
    number: pNumber.trim() || undefined,
    notes: pNotes.trim() || undefined,
  };

  const blocked =
    (needsSize && !size) || (wantsPersonalization && !confirmed);

  const guard = (e: React.MouseEvent) => {
    if (needsSize && !size) {
      e.preventDefault();
      toast("Selecione um tamanho antes de consultar");
      document
        .getElementById("tamanhos")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (wantsPersonalization && !confirmed) {
      e.preventDefault();
      toast("Confirme os dados da personalização");
    }
  };

  const href = waProduct(product, size ?? undefined, personalization);

  const blockedHint =
    needsSize && !size
      ? "Escolha o tamanho para consultar"
      : "Confirme a personalização";

  return (
    <div>
      {/* Tamanhos */}
      {needsSize && (
        <div id="tamanhos" className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="display-upright text-base text-ink">
              Selecione o tamanho
            </h2>
            <a
              href="/guia-de-tamanhos"
              className="text-xs font-semibold text-roxo hover:underline"
            >
              Guia de medidas
            </a>
          </div>
          <p className="mt-1 text-xs text-steel">
            Ficou em dúvida? Consulte o guia de medidas antes de pedir.
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tamanhos">
            {product.sizes.map((s) => {
              const disabled = s.status === "indisponivel";
              const active = size === s.label;
              return (
                <button
                  key={s.label}
                  disabled={disabled}
                  onClick={() => setSize(active ? null : s.label)}
                  aria-pressed={active}
                  className={`relative min-w-12 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                    disabled
                      ? "cursor-not-allowed border-cloud text-steel/50 line-through"
                      : active
                        ? "border-roxo bg-roxo text-white"
                        : "border-ink/15 text-ink hover:border-roxo"
                  }`}
                >
                  {s.label}
                  {!disabled && s.status !== "disponivel" && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amarelo px-1.5 text-[9px] font-bold normal-case text-ink">
                      {sizeStatusLabel[s.status]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Personalização */}
      {product.personalizationAvailable ? (
        <div className="mt-6 rounded-xl border border-ink/10 bg-cloud/50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={wantsPersonalization}
              onChange={(e) => setWantsPersonalization(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-roxo"
            />
            <span>
              <span className="font-bold text-ink">
                Desejo consultar personalização
              </span>
              <span className="block text-xs text-steel">
                Nome e número sujeitos à disponibilidade
                {product.personalizationPrice
                  ? ` · a partir de ${brl(product.personalizationPrice)} (valor de referência)`
                  : ""}
              </span>
            </span>
          </label>

          {wantsPersonalization && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-[1fr_100px] gap-3">
                <div>
                  <label htmlFor="p-nome" className="mb-1 block text-xs font-bold text-ink">
                    Nome (opcional)
                  </label>
                  <input
                    id="p-nome"
                    value={pName}
                    onChange={(e) => setPName(e.target.value.slice(0, 14))}
                    maxLength={14}
                    placeholder="Ex.: XAVIER"
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm uppercase"
                  />
                </div>
                <div>
                  <label htmlFor="p-numero" className="mb-1 block text-xs font-bold text-ink">
                    Número
                  </label>
                  <input
                    id="p-numero"
                    value={pNumber}
                    onChange={(e) =>
                      setPNumber(e.target.value.replace(/\D/g, "").slice(0, 2))
                    }
                    inputMode="numeric"
                    placeholder="10"
                    className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="p-obs" className="mb-1 block text-xs font-bold text-ink">
                  Observações (opcional)
                </label>
                <input
                  id="p-obs"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value.slice(0, 120))}
                  placeholder="Ex.: patch, fonte específica..."
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                />
              </div>
              <label className="flex cursor-pointer items-start gap-2 text-xs text-ink/80">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-roxo"
                />
                Confirmo que revisei o nome, o número, o tamanho e as
                informações da personalização.
              </label>
              <p className="text-[11px] leading-relaxed text-steel">
                Peças personalizadas podem ter condições específicas para troca
                e devolução. A personalização depende do modelo escolhido e da
                confirmação da equipe.
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-cloud/60 p-3 text-xs text-steel">
          Este modelo não possui personalização disponível no momento.
        </p>
      )}

      {/* CTAs */}
      <div className="mt-6 hidden gap-3 md:flex">
        <a
          href={href}
          onClick={guard}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={blocked}
          className={`xavier-tag flex-1 px-6 py-4 text-center text-base ${
            blocked
              ? "border-2 border-dashed border-roxo/40 bg-roxo/5 text-roxo"
              : "bg-roxo text-white transition-transform hover:scale-[1.01]"
          }`}
        >
          <span>{blocked ? blockedHint : "Consultar disponibilidade"}</span>
        </a>
        <a
          href={href}
          onClick={guard}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border-2 border-whats px-5 py-3.5 text-sm font-bold text-whats transition-colors hover:bg-whats hover:text-white"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Pedir pelo WhatsApp
        </a>
        <FavoriteButton
          slug={product.slug}
          name={product.name}
          className="!h-[52px] !w-[52px] border border-ink/10"
        />
      </div>

      <p className="mt-3 hidden text-xs text-steel md:block">
        Trocas de tamanho estão sujeitas à disponibilidade e às condições da
        política da loja. O pedido é confirmado pela equipe no atendimento.
      </p>

      {/* CTA fixo mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink/10 bg-white p-3 md:hidden">
        <FavoriteButton
          slug={product.slug}
          name={product.name}
          className="border border-ink/10"
        />
        <a
          href={href}
          onClick={guard}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={blocked}
          className={`xavier-tag flex-1 px-4 py-3.5 text-center text-sm ${
            blocked
              ? "border-2 border-dashed border-roxo/40 bg-roxo/5 text-roxo"
              : "bg-whats text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4 skew-x-[8deg]" aria-hidden="true" />
            {blocked ? blockedHint : "Consultar disponibilidade"}
          </span>
        </a>
      </div>
    </div>
  );
}
