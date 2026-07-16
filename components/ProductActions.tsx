"use client";

import { useState } from "react";
import { Clock, MessageCircle, PackageCheck, ShoppingBag } from "lucide-react";
import {
  purchasableVariants,
  variantAvailability,
  type Product,
} from "@/lib/products/types";
import { waProduct, type Personalization, type WaAvailability } from "@/lib/whatsapp";
import { brl } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import SizeGuideModal from "@/components/SizeGuideModal";
import { useCart } from "@/lib/cart";
import { toast } from "@/components/Toaster";

/**
 * Núcleo de conversão: seleção de tamanho obrigatória antes do envio,
 * disponibilidade por tamanho em tempo real, personalização opcional com
 * confirmação, CTA fixo no mobile.
 */
export default function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const [wantsPersonalization, setWantsPersonalization] = useState(false);
  const [pName, setPName] = useState("");
  const [pNumber, setPNumber] = useState("");
  const [pNotes, setPNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const { add } = useCart();

  // Esgotado (nenhum tamanho comprável): CTA vira consulta de reposição.
  const soldOut =
    product.variants.length > 0 && purchasableVariants(product).length === 0;
  const needsSize = product.variants.length > 0 && !soldOut;
  const selected = product.variants.find((v) => v.label === size);
  const selectedAvail = selected ? variantAvailability(selected) : null;

  const addToBag = () => {
    if (soldOut) {
      toast("Produto esgotado — consulte a reposição pelo WhatsApp");
      return;
    }
    if (needsSize && !size) {
      toast("Selecione um tamanho antes de adicionar");
      document
        .getElementById("tamanhos")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (selectedAvail?.kind === "indisponivel") {
      toast("Este tamanho está indisponível no momento");
      return;
    }
    add(
      product.slug,
      size ?? undefined,
      selectedAvail?.kind === "encomenda"
        ? {
            availability: "encomenda",
            estimatedDelivery: selectedAvail.estimatedDelivery,
          }
        : selectedAvail?.kind === "pronta-entrega"
          ? { availability: "pronta-entrega" }
          : undefined
    );
    toast("Adicionada à sacola 🛍️");
  };

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

  // A mensagem reflete a disponibilidade que o site já conhece.
  const waAvailability: WaAvailability | undefined =
    selectedAvail?.kind === "pronta-entrega"
      ? { kind: "pronta-entrega", stock: selectedAvail.stock, low: selectedAvail.low }
      : selectedAvail?.kind === "encomenda"
        ? { kind: "encomenda", estimatedDelivery: selectedAvail.estimatedDelivery }
        : undefined;

  const href = waProduct(product, size ?? undefined, personalization, waAvailability);

  const ctaLabel =
    selectedAvail?.kind === "pronta-entrega"
      ? "Fechar pedido pelo WhatsApp"
      : selectedAvail?.kind === "encomenda"
        ? "Encomendar pelo WhatsApp"
        : soldOut
          ? "Consultar reposição"
          : "Consultar disponibilidade";

  const blockedHint =
    needsSize && !size
      ? "Escolha o tamanho para consultar"
      : "Confirme a personalização";

  return (
    <div>
      {/* Tamanhos */}
      {product.variants.length > 0 && (
        <div id="tamanhos" className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="display-upright text-base text-ink">
              Selecione o tamanho
            </h2>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="text-xs font-semibold text-roxo hover:underline"
            >
              Guia de medidas
            </button>
          </div>
          <p className="mt-1 text-xs text-steel">
            Ficou em dúvida? Consulte o guia de medidas antes de pedir.
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Tamanhos">
            {product.variants.map((v) => {
              const avail = variantAvailability(v);
              const disabled = avail.kind === "indisponivel";
              const active = size === v.label;
              const lowPill =
                avail.kind === "pronta-entrega" && avail.low
                  ? avail.stock === 1
                    ? "última unidade"
                    : `últimas ${avail.stock}`
                  : null;
              return (
                <button
                  key={v.label}
                  disabled={disabled}
                  onClick={() => setSize(active ? null : v.label)}
                  aria-pressed={active}
                  aria-label={`Tamanho ${v.label}${
                    avail.kind === "encomenda" ? " (sob encomenda)" : ""
                  }`}
                  className={`relative min-w-12 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                    disabled
                      ? "cursor-not-allowed border-cloud text-steel/50 line-through"
                      : active
                        ? "border-roxo bg-roxo text-white"
                        : "border-ink/15 text-ink hover:border-roxo"
                  }`}
                >
                  {v.label}
                  {lowPill && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amarelo px-1.5 text-[9px] font-bold normal-case text-ink">
                      {lowPill}
                    </span>
                  )}
                  {avail.kind === "encomenda" && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-amarelo p-0.5"
                      title="Sob encomenda"
                    >
                      <Clock className="h-2.5 w-2.5 text-ink" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Disponibilidade do tamanho selecionado */}
          <div className="mt-3" aria-live="polite">
            {soldOut ? (
              <p className="text-sm font-semibold text-steel">
                Todos os tamanhos estão esgotados — consulte a reposição pelo
                WhatsApp.
              </p>
            ) : !selectedAvail ? (
              <p className="text-xs text-steel">
                Selecione um tamanho para ver a disponibilidade.
              </p>
            ) : selectedAvail.kind === "pronta-entrega" ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-whats">
                <PackageCheck className="h-4 w-4" aria-hidden="true" />
                {selectedAvail.low
                  ? selectedAvail.stock === 1
                    ? "Última unidade — pronta entrega"
                    : `Últimas ${selectedAvail.stock} unidades — pronta entrega`
                  : "Em estoque — pronta entrega"}
              </p>
            ) : selectedAvail.kind === "encomenda" ? (
              <div className="text-sm">
                <p className="flex items-center gap-1.5 font-semibold text-ink">
                  <Clock className="h-4 w-4 text-roxo" aria-hidden="true" />
                  Disponível por encomenda
                </p>
                {selectedAvail.estimatedDelivery && (
                  <p className="mt-0.5 pl-[22px] text-xs text-steel">
                    Prazo estimado: {selectedAvail.estimatedDelivery}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-steel">
                Tamanho indisponível no momento.
              </p>
            )}
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
      <div className="mt-6 hidden flex-wrap gap-3 md:flex">
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
          <span>{blocked ? blockedHint : ctaLabel}</span>
        </a>
        <button
          onClick={addToBag}
          disabled={soldOut}
          className="flex items-center gap-2 rounded-lg border-2 border-ink/15 px-5 py-3.5 text-sm font-bold text-ink transition-colors hover:border-roxo hover:text-roxo disabled:cursor-not-allowed disabled:border-cloud disabled:text-steel/50 disabled:hover:border-cloud disabled:hover:text-steel/50"
        >
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          Adicionar à sacola
        </button>
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
        <button
          onClick={addToBag}
          aria-label={`Adicionar ${product.name} à sacola`}
          className="tap flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white/90 shadow-md"
        >
          <ShoppingBag className="h-5 w-5 text-ink" aria-hidden="true" />
        </button>
        <a
          href={href}
          onClick={guard}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={blocked}
          className={`tap xavier-tag flex-1 px-4 py-3.5 text-center text-sm ${
            blocked
              ? "border-2 border-dashed border-roxo/40 bg-roxo/5 text-roxo"
              : "bg-whats text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4 skew-x-[8deg]" aria-hidden="true" />
            {blocked ? blockedHint : ctaLabel}
          </span>
        </a>
      </div>

      <SizeGuideModal
        product={product}
        selectedSize={size}
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
