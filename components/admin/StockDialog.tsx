"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { addStock, registerSale } from "@/app/admin/produtos/actions";
import { toast } from "@/components/Toaster";

export type StockAction = "venda" | "entrada";

/**
 * Registrar venda (baixa estoque) ou adicionar estoque (entrada), com
 * confirmação explícita antes de alterar o saldo.
 */
export default function StockDialog({
  product,
  action,
  onClose,
  onDone,
}: {
  product: Product;
  action: StockAction;
  onClose: () => void;
  onDone: () => void;
}) {
  const activeVariants = product.variants.filter((v) => v.active);
  const [variantId, setVariantId] = useState(activeVariants[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const isSale = action === "venda";
  const valid =
    !!variant && qty >= 1 && (!isSale || qty <= variant.stock);

  const submit = async () => {
    if (!variant || busy) return;
    setBusy(true);
    const result = isSale
      ? await registerSale(variant.id, qty)
      : await addStock(variant.id, qty);
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      setConfirming(false);
      return;
    }
    toast(
      isSale
        ? `Venda registrada — estoque ${variant.label}: ${result.newStock}`
        : `Entrada registrada — estoque ${variant.label}: ${result.newStock}`
    );
    onDone();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isSale ? "Registrar venda" : "Adicionar estoque"}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-ink">
              {isSale ? "Registrar venda" : "Adicionar estoque"}
            </h2>
            <p className="mt-0.5 text-sm text-steel">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-steel hover:bg-cloud"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {activeVariants.length === 0 ? (
          <p className="mt-5 rounded-lg bg-cloud p-4 text-sm text-steel">
            Este produto não tem tamanhos ativos. Edite o produto para
            adicionar tamanhos.
          </p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="stock-tam" className="mb-1 block text-xs font-bold text-ink">
                  Tamanho
                </label>
                <select
                  id="stock-tam"
                  value={variantId}
                  onChange={(e) => {
                    setVariantId(e.target.value);
                    setConfirming(false);
                  }}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm"
                >
                  {activeVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} — {v.stock} em estoque
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="stock-qty" className="mb-1 block text-xs font-bold text-ink">
                  {isSale ? "Quantidade vendida" : "Quantidade recebida"}
                </label>
                <input
                  id="stock-qty"
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => {
                    setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)));
                    setConfirming(false);
                  }}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {variant && (
              <p className="mt-3 rounded-lg bg-cloud px-3 py-2.5 text-sm text-ink/80">
                Estoque atual do {variant.label}:{" "}
                <strong className="tabular-nums">{variant.stock}</strong> → novo
                estoque:{" "}
                <strong className="tabular-nums">
                  {isSale ? variant.stock - qty : variant.stock + qty}
                </strong>
              </p>
            )}

            {isSale && variant && qty > variant.stock && (
              <p className="mt-2 text-sm font-semibold text-promo">
                Estoque insuficiente: o tamanho {variant.label} tem apenas{" "}
                {variant.stock}{" "}
                {variant.stock === 1 ? "unidade" : "unidades"}.
              </p>
            )}

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={!valid}
                className="tap mt-5 w-full rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-50"
              >
                {isSale ? "Registrar venda" : "Adicionar unidades"}
              </button>
            ) : (
              <div className="mt-5 rounded-lg border border-roxo/30 bg-roxo/5 p-4">
                <p className="text-sm font-semibold text-ink">
                  {isSale
                    ? `Deseja registrar esta venda e reduzir ${qty} ${
                        qty === 1 ? "unidade" : "unidades"
                      } do estoque ${variant?.label}?`
                    : `Deseja somar ${qty} ${
                        qty === 1 ? "unidade" : "unidades"
                      } ao estoque ${variant?.label}?`}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="tap flex-1 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-60"
                  >
                    {busy ? "Salvando..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={busy}
                    className="flex-1 rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-cloud"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
