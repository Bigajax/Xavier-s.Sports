"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Tag } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { priceBands, type PriceBandKey } from "@/lib/products/priceBands";
import { planBulkPrice } from "@/lib/products/bulkPrice";
import { brl } from "@/lib/format";
import { applyBulkPrice } from "@/app/admin/produtos/actions";
import MoneyInput from "@/components/admin/MoneyInput";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/Toaster";
import type { PriceBand } from "@/lib/products/priceBands";

/**
 * Aviso de produto que entrou fora do preço da faixa — o caso típico é uma
 * camisa nova cadastrada com o preço errado. O botão só preenche o campo da
 * faixa; quem grava continua sendo o "Aplicar preços", com prévia.
 */
function OutlierWarning({
  band,
  onFix,
}: {
  band: PriceBand;
  onFix: (band: PriceBand) => void;
}) {
  return (
    <span className="mt-1 block">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-promo">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {band.outliers.length} fora do padrão
      </span>
      <span className="mt-0.5 block truncate text-xs text-steel" title={band.outliers.map((p) => `${p.name} — ${brl(p.price)}`).join(" · ")}>
        {band.outliers
          .slice(0, 2)
          .map((p) => `${p.name} (${brl(p.price)})`)
          .join(", ")}
        {band.outliers.length > 2 && ` e mais ${band.outliers.length - 2}`}
      </span>
      <button
        type="button"
        onClick={() => onFix(band)}
        className="mt-1 rounded-lg border border-roxo px-2 py-1 text-xs font-bold text-roxo hover:bg-roxo hover:text-white"
      >
        Igualar a {brl(band.referencePrice!)}
      </button>
    </span>
  );
}

/**
 * Reprecificação por faixa — o caso comum da loja: o fornecedor sobe o preço e
 * todas as camisas Torcedor mudam junto. Digite o preço novo da faixa, confira
 * quantos produtos mudam e aplique.
 *
 * Produtos arquivados ficam fora das faixas; produtos em oferta são pulados
 * pela própria action, para não apagar promoção no meio.
 */
export default function PriceBandsPanel({
  products,
  onDone,
}: {
  products: Product[];
  onDone: () => void;
}) {
  const bands = useMemo(() => priceBands(products), [products]);
  const [novo, setNovo] = useState<Partial<Record<PriceBandKey, number | null>>>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  /** Faixas com preço digitado e que de fato mudam alguma coisa. */
  const pendentes = useMemo(() => {
    return bands
      .map((band) => {
        const preco = novo[band.key];
        if (preco === null || preco === undefined || preco <= 0) return null;
        const plan = planBulkPrice(
          band.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.oldPrice,
            onSale: p.onSale,
          })),
          "fixo",
          preco
        );
        if (plan.changes.length === 0 && plan.invalid.length === 0) return null;
        return { band, preco, plan };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [bands, novo]);

  /** "Igualar ao padrão": preenche o campo da faixa com o preço da maioria. */
  const fixBand = (band: PriceBand) => {
    if (band.referencePrice === null) return;
    setNovo((prev) => ({ ...prev, [band.key]: band.referencePrice }));
  };

  const totalForaDoPadrao = bands.reduce((n, b) => n + b.outliers.length, 0);
  const totalAlterados = pendentes.reduce((n, p) => n + p.plan.changes.length, 0);
  const totalPulados = pendentes.reduce((n, p) => n + p.plan.skippedOnSale.length, 0);
  const totalInvalidos = pendentes.reduce((n, p) => n + p.plan.invalid.length, 0);

  const aplicar = async () => {
    setBusy(true);
    let alterados = 0;
    let pulados = 0;
    for (const { band, preco } of pendentes) {
      const result = await applyBulkPrice({
        ids: band.products.map((p) => p.id),
        mode: "fixo",
        value: preco,
      });
      if (!result.ok) {
        setBusy(false);
        setConfirming(false);
        toast(`${band.label}: ${result.error}`);
        onDone();
        return;
      }
      alterados += result.changed ?? 0;
      pulados += result.skippedOnSale ?? 0;
    }
    setBusy(false);
    setConfirming(false);
    setNovo({});
    toast(
      `${alterados} produto(s) reprecificado(s)` +
        (pulados ? ` · ${pulados} em oferta pulado(s)` : "")
    );
    onDone();
  };

  return (
    <div className="mt-5">
      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
        <h2 className="display flex items-center gap-2 text-xl text-ink">
          <Tag className="h-5 w-5 text-roxo" aria-hidden="true" />
          Preço por faixa
        </h2>
        <p className="mt-1 text-sm text-steel">
          As faixas se montam sozinhas a partir do catálogo — camisa nova entra na faixa
          dela na hora. Digite o preço novo só nas faixas que mudaram e aplique. Produtos
          em oferta são preservados, e arquivados não entram na conta.
        </p>

        {totalForaDoPadrao > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-promo/10 p-3 text-sm font-semibold text-ink">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-promo" aria-hidden="true" />
            <span>
              {totalForaDoPadrao} produto(s) estão com preço diferente do resto da sua
              faixa — geralmente é cadastro novo com preço digitado errado. Use{" "}
              <b>Igualar</b> na faixa para acertar.
            </span>
          </p>
        )}

        {/* Cards no celular */}
        <ul className="mt-4 space-y-2 md:hidden">
          {bands.map((band) => (
            <li key={band.key} className="rounded-xl p-3 ring-1 ring-ink/10">
              <p className="text-sm font-bold text-ink">{band.label}</p>
              <p className="mt-0.5 text-xs text-steel">
                {band.products.length} produto(s) ·{" "}
                {band.referencePrice !== null
                  ? brl(band.referencePrice)
                  : `${band.prices.length} preços diferentes, sem maioria`}
                {band.onSaleCount > 0 && ` · ${band.onSaleCount} em oferta`}
              </p>
              {band.outliers.length > 0 && <OutlierWarning band={band} onFix={fixBand} />}
              <div className="mt-2">
                <MoneyInput
                  value={novo[band.key] ?? null}
                  onChange={(v) => setNovo((prev) => ({ ...prev, [band.key]: v }))}
                  placeholder="novo preço"
                />
              </div>
            </li>
          ))}
        </ul>

        {/* Tabela em telas médias+ */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-cloud text-xs uppercase tracking-wide text-steel">
              <tr>
                <th className="px-3 py-2">Faixa</th>
                <th className="px-3 py-2">Produtos</th>
                <th className="px-3 py-2">Preço atual</th>
                <th className="px-3 py-2">Novo preço</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((band) => (
                <tr key={band.key} className="border-t border-ink/5">
                  <td className="px-3 py-2.5 font-semibold text-ink">
                    {band.label}
                    {band.onSaleCount > 0 && (
                      <span className="ml-2 rounded-full bg-amarelo/30 px-2 py-0.5 text-xs font-bold text-ink">
                        {band.onSaleCount} em oferta
                      </span>
                    )}
                  </td>
                  <td className="tabular-nums px-3 py-2.5 text-steel">
                    {band.products.length}
                  </td>
                  <td className="tabular-nums px-3 py-2.5 text-ink">
                    {band.referencePrice !== null ? brl(band.referencePrice) : "—"}
                    {band.outliers.length > 0 && (
                      <OutlierWarning band={band} onFix={fixBand} />
                    )}
                    {band.referencePrice === null && (
                      <span className="mt-1 block text-xs text-steel">
                        {band.prices.length} preços diferentes, sem maioria
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <MoneyInput
                      value={novo[band.key] ?? null}
                      onChange={(v) => setNovo((prev) => ({ ...prev, [band.key]: v }))}
                      className="w-40"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo + aplicar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-4">
          <p className="text-sm" aria-live="polite">
            {totalInvalidos > 0 ? (
              <span className="flex items-center gap-2 font-semibold text-promo">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {totalInvalidos} produto(s) ficariam com preço inválido — revise.
              </span>
            ) : totalAlterados > 0 ? (
              <>
                <b className="text-ink">{totalAlterados} produto(s)</b>{" "}
                <span className="text-steel">
                  serão alterados em {pendentes.length} faixa(s)
                  {totalPulados > 0 && ` · ${totalPulados} em oferta pulado(s)`}
                </span>
              </>
            ) : (
              <span className="text-steel">
                Nenhuma alteração pendente — digite um preço novo em alguma faixa.
              </span>
            )}
          </p>
          <button
            onClick={() => setConfirming(true)}
            disabled={totalAlterados === 0 || totalInvalidos > 0 || busy}
            className="tap rounded-lg bg-roxo px-5 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-50"
          >
            Aplicar preços
          </button>
        </div>
      </div>

      {confirming && (
        <ConfirmDialog
          title="Aplicar os novos preços?"
          message={
            `${totalAlterados} produto(s) serão reprecificados em ${pendentes.length} faixa(s): ` +
            pendentes.map((p) => `${p.band.label} → ${brl(p.preco)}`).join("; ") +
            `.${totalPulados > 0 ? ` ${totalPulados} produto(s) em oferta serão pulados.` : ""}` +
            " A vitrine atualiza na hora."
          }
          confirmLabel="Aplicar"
          busy={busy}
          onConfirm={aplicar}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
