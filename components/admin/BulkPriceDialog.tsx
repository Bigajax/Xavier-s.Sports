"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Percent, Tag } from "lucide-react";
import type { Product } from "@/lib/products/types";
import {
  planBulkPrice,
  type BulkPriceMode,
} from "@/lib/products/bulkPrice";
import { brl } from "@/lib/format";
import { applyBulkPrice } from "@/app/admin/produtos/actions";
import MoneyInput from "@/components/admin/MoneyInput";
import { toast } from "@/components/Toaster";

/**
 * Ajuste de preço dos produtos selecionados: preço fixo ou reajuste em %.
 * A prévia é o mesmo cálculo que a Server Action refaz no banco, então o que
 * está escrito aqui é o que vai acontecer.
 */
export default function BulkPriceDialog({
  products,
  onClose,
  onDone,
}: {
  products: Product[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<BulkPriceMode>("fixo");
  const [price, setPrice] = useState<number | null>(null);
  const [percent, setPercent] = useState("");
  const [busy, setBusy] = useState(false);

  const value = mode === "fixo" ? price : Number(percent.replace(",", "."));
  const filled =
    value !== null && Number.isFinite(value) && (mode === "fixo" ? value > 0 : value !== 0);

  const plan = useMemo(() => {
    if (!filled) return null;
    return planBulkPrice(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        onSale: p.onSale,
      })),
      mode,
      value as number
    );
  }, [products, mode, value, filled]);

  const apply = async () => {
    if (!plan || plan.changes.length === 0) return;
    setBusy(true);
    const result = await applyBulkPrice({
      ids: products.map((p) => p.id),
      mode,
      value: value as number,
    });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(
      `${result.changed} produto(s) reprecificado(s)` +
        (result.skippedOnSale ? ` · ${result.skippedOnSale} em oferta pulado(s)` : "")
    );
    onDone();
    onClose();
  };

  const faixaAtual = useMemo(() => {
    const precos = [...new Set(products.map((p) => p.price))].sort((a, b) => a - b);
    if (precos.length === 0) return "—";
    if (precos.length === 1) return brl(precos[0]);
    return `${brl(precos[0])} a ${brl(precos[precos.length - 1])}`;
  }, [products]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar preço em lote"
    >
      <div className="my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="display text-xl text-ink">Ajustar preço</h2>
        <p className="mt-1 text-sm text-steel">
          {products.length} produto(s) selecionado(s) · preço atual: {faixaAtual}
        </p>

        {/* Modo */}
        <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Tipo de ajuste">
          {(
            [
              ["fixo", "Definir preço", Tag],
              ["percentual", "Reajustar %", Percent],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`flex items-center justify-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                mode === key
                  ? "border-roxo bg-roxo text-white"
                  : "border-ink/15 text-ink hover:border-roxo"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Valor */}
        <div className="mt-4">
          {mode === "fixo" ? (
            <>
              <label htmlFor="bulk-preco" className="mb-1 block text-xs font-bold text-ink">
                Novo preço para todos os selecionados
              </label>
              <MoneyInput id="bulk-preco" value={price} onChange={setPrice} />
            </>
          ) : (
            <>
              <label htmlFor="bulk-pct" className="mb-1 block text-xs font-bold text-ink">
                Reajuste (use - para reduzir)
              </label>
              <div className="relative">
                <input
                  id="bulk-pct"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value.replace(/[^\d,.-]/g, "").slice(0, 7))}
                  inputMode="decimal"
                  placeholder="10"
                  className="w-full rounded-lg border border-ink/15 py-2.5 pl-3 pr-9 text-sm tabular-nums"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-steel">
                  %
                </span>
              </div>
            </>
          )}
        </div>

        {/* Prévia */}
        <div className="mt-4 rounded-xl bg-cloud/70 p-3 text-sm" aria-live="polite">
          {!plan ? (
            <p className="text-steel">
              Informe o {mode === "fixo" ? "preço" : "percentual"} para ver a prévia.
            </p>
          ) : plan.invalid.length > 0 ? (
            <p className="flex items-start gap-2 font-semibold text-promo">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              O ajuste deixaria {plan.invalid.length} produto(s) com preço inválido. Revise o
              valor.
            </p>
          ) : (
            <>
              <p className="font-bold text-ink">
                {plan.changes.length} produto(s) serão alterados
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs text-steel">
                {plan.changes.slice(0, 3).map((c) => (
                  <li key={c.id} className="truncate tabular-nums">
                    {c.name}: {brl(c.from)} → <b className="text-ink">{brl(c.to)}</b>
                  </li>
                ))}
                {plan.changes.length > 3 && (
                  <li>e mais {plan.changes.length - 3}...</li>
                )}
                {plan.unchanged > 0 && (
                  <li>{plan.unchanged} já está(ão) nesse preço — sem alteração.</li>
                )}
                {plan.skippedOnSale.length > 0 && (
                  <li className="font-semibold text-ink">
                    {plan.skippedOnSale.length} em oferta: pulado(s) para não apagar a
                    promoção.
                  </li>
                )}
              </ul>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-cloud"
          >
            Cancelar
          </button>
          <button
            onClick={apply}
            disabled={busy || !plan || plan.changes.length === 0 || plan.invalid.length > 0}
            className="rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-50"
          >
            {busy
              ? "Aplicando..."
              : plan?.changes.length
                ? `Aplicar em ${plan.changes.length}`
                : "Aplicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
