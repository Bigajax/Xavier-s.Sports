"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { registerEntry, registerExit } from "@/app/admin/produtos/actions";
import {
  ENTRY_REASONS,
  EXIT_REASONS,
  type EntryReason,
  type ExitReason,
} from "@/lib/stock";
import { toast } from "@/components/Toaster";

export type StockAction = "saida" | "entrada";

/**
 * Registrar saída (baixa estoque) ou entrada, com motivo obrigatório,
 * confirmação explícita e movimentação gravada no histórico.
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
  const isExit = action === "saida";
  const activeVariants = product.variants.filter((v) => v.active);
  const selectable = isExit
    ? activeVariants
    : activeVariants; /* entrada aceita qualquer tamanho ativo */
  const firstSelectable = isExit
    ? activeVariants.find((v) => v.stock > 0)
    : activeVariants[0];
  const [variantId, setVariantId] = useState(firstSelectable?.id ?? "");
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<string>(
    isExit ? EXIT_REASONS[0] : ENTRY_REASONS[0]
  );
  const [relatedOrder, setRelatedOrder] = useState("");
  const [notes, setNotes] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const valid = !!variant && qty >= 1 && (!isExit || qty <= variant.stock);
  const reasons = isExit ? EXIT_REASONS : ENTRY_REASONS;

  const submit = async () => {
    if (!variant || busy) return;
    setBusy(true);
    const result = isExit
      ? await registerExit({
          variantId: variant.id,
          qty,
          reason: reason as ExitReason,
          relatedOrder: relatedOrder.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      : await registerEntry({
          variantId: variant.id,
          qty,
          reason: reason as EntryReason,
          notes: notes.trim() || undefined,
        });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      setConfirming(false);
      return;
    }
    toast(
      isExit
        ? `Saída registrada — estoque ${variant.label}: ${result.newStock}`
        : `Entrada registrada — estoque ${variant.label}: ${result.newStock}`
    );
    onDone();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isExit ? "Registrar saída" : "Registrar entrada"}
    >
      <div className="my-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-ink">
              {isExit ? "Registrar saída" : "Registrar entrada"}
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
                  {selectable.map((v) => (
                    <option
                      key={v.id}
                      value={v.id}
                      disabled={isExit && v.stock === 0}
                    >
                      {v.label} — {v.stock} em estoque
                      {isExit && v.stock === 0 ? " (sem saldo)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="stock-qty" className="mb-1 block text-xs font-bold text-ink">
                  {isExit ? "Quantidade da saída" : "Quantidade recebida"}
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

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="stock-motivo" className="mb-1 block text-xs font-bold text-ink">
                  Motivo
                </label>
                <select
                  id="stock-motivo"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setConfirming(false);
                  }}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm"
                >
                  {reasons.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {isExit && (
                <div>
                  <label htmlFor="stock-pedido" className="mb-1 block text-xs font-bold text-ink">
                    Pedido relacionado (opcional)
                  </label>
                  <input
                    id="stock-pedido"
                    value={relatedOrder}
                    onChange={(e) => setRelatedOrder(e.target.value)}
                    placeholder="Ex.: WA-123"
                    className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor="stock-obs" className="mb-1 block text-xs font-bold text-ink">
                Observação (opcional)
              </label>
              <input
                id="stock-obs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={200}
                placeholder={
                  isExit ? "Ex.: cliente da loja física" : "Ex.: nota fiscal 123"
                }
                className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
              />
            </div>

            {variant && (
              <p className="mt-3 rounded-lg bg-cloud px-3 py-2.5 text-sm text-ink/80">
                Estoque atual do {variant.label}:{" "}
                <strong className="tabular-nums">{variant.stock}</strong> → novo
                estoque:{" "}
                <strong className="tabular-nums">
                  {isExit ? variant.stock - qty : variant.stock + qty}
                </strong>
              </p>
            )}

            {isExit && variant && qty > variant.stock && (
              <p className="mt-2 text-sm font-semibold text-promo">
                Estoque insuficiente: o tamanho {variant.label} tem apenas{" "}
                {variant.stock} {variant.stock === 1 ? "unidade" : "unidades"}.
              </p>
            )}

            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                disabled={!valid}
                className="tap mt-5 w-full rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-50"
              >
                {isExit ? "Registrar saída" : "Adicionar unidades"}
              </button>
            ) : (
              <div className="mt-5 rounded-lg border border-roxo/30 bg-roxo/5 p-4">
                <p className="text-sm font-semibold text-ink">
                  {isExit
                    ? `Registrar saída de ${qty} ${
                        qty === 1 ? "unidade" : "unidades"
                      } do tamanho ${variant?.label} (${reason})?`
                    : `Somar ${qty} ${
                        qty === 1 ? "unidade" : "unidades"
                      } ao tamanho ${variant?.label} (${reason})?`}
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
