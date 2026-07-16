"use client";

import { Trash2 } from "lucide-react";

export type VariantDraft = {
  id?: string;
  label: string;
  stock: string;
  allowPreOrder: boolean;
  estimatedDelivery: string;
  active: boolean;
};

export const DEFAULT_DELIVERY = "7 a 12 dias úteis";

/**
 * Estoque por tamanho: tabela em telas médias+, blocos empilhados no
 * celular. Compartilhado entre cadastro e edição de produto.
 */
export default function VariantsEditor({
  variants,
  onPatch,
  onRemove,
}: {
  variants: VariantDraft[];
  onPatch: (index: number, patch: Partial<VariantDraft>) => void;
  onRemove: (index: number) => void;
}) {
  const togglePreOrder = (index: number, checked: boolean) => {
    const v = variants[index];
    onPatch(index, {
      allowPreOrder: checked,
      estimatedDelivery:
        checked && !v.estimatedDelivery ? DEFAULT_DELIVERY : v.estimatedDelivery,
    });
  };

  return (
    <>
      {/* Cards no celular */}
      <ul className="space-y-2 md:hidden">
        {variants.map((v, i) => (
          <li key={v.id ?? `nova-${i}`} className="rounded-xl p-3 ring-1 ring-ink/10">
            <div className="flex items-center gap-2">
              <div>
                <label
                  htmlFor={`vm-label-${i}`}
                  className="mb-0.5 block text-[10px] font-bold uppercase text-steel"
                >
                  Tamanho
                </label>
                <input
                  id={`vm-label-${i}`}
                  value={v.label}
                  onChange={(e) => onPatch(i, { label: e.target.value })}
                  placeholder="P"
                  className="w-16 rounded border border-ink/15 px-2 py-2 text-sm uppercase"
                />
              </div>
              <div>
                <label
                  htmlFor={`vm-stock-${i}`}
                  className="mb-0.5 block text-[10px] font-bold uppercase text-steel"
                >
                  Estoque
                </label>
                <input
                  id={`vm-stock-${i}`}
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => onPatch(i, { stock: e.target.value })}
                  className="w-20 rounded border border-ink/15 px-2 py-2 text-sm tabular-nums"
                />
              </div>
              <label className="ml-auto flex cursor-pointer items-center gap-1.5 pt-4 text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={v.active}
                  onChange={(e) => onPatch(i, { active: e.target.checked })}
                  className="h-4 w-4 accent-roxo"
                />
                Ativo
              </label>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remover tamanho ${v.label || i + 1}`}
                className="mt-4 rounded p-1.5 text-steel hover:bg-cloud hover:text-promo"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <label className="mt-2.5 flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={v.allowPreOrder}
                onChange={(e) => togglePreOrder(i, e.target.checked)}
                className="h-4 w-4 accent-roxo"
              />
              Aceita encomenda quando zerar
            </label>
            {v.allowPreOrder && (
              <input
                value={v.estimatedDelivery}
                onChange={(e) => onPatch(i, { estimatedDelivery: e.target.value })}
                placeholder={DEFAULT_DELIVERY}
                aria-label={`Prazo de encomenda do tamanho ${v.label || i + 1}`}
                className="mt-2 w-full rounded border border-ink/15 px-2.5 py-2 text-sm"
              />
            )}
          </li>
        ))}
      </ul>

      {/* Tabela em telas médias+ */}
      <div className="hidden overflow-x-auto rounded-xl ring-1 ring-ink/10 md:block">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-cloud text-xs uppercase tracking-wide text-steel">
            <tr>
              <th className="px-3 py-2">Tamanho</th>
              <th className="px-3 py-2">Quantidade</th>
              <th className="px-3 py-2">Aceita encomenda</th>
              <th className="px-3 py-2">Prazo estimado</th>
              <th className="px-3 py-2">Ativo</th>
              <th className="px-3 py-2"><span className="sr-only">Remover</span></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={v.id ?? `nova-${i}`} className="border-t border-ink/5">
                <td className="px-3 py-2">
                  <input
                    value={v.label}
                    onChange={(e) => onPatch(i, { label: e.target.value })}
                    placeholder="P, M, G..."
                    aria-label={`Nome do tamanho ${i + 1}`}
                    className="w-20 rounded border border-ink/15 px-2 py-1.5 text-sm uppercase"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={v.stock}
                    onChange={(e) => onPatch(i, { stock: e.target.value })}
                    aria-label={`Estoque do tamanho ${v.label || i + 1}`}
                    className="w-20 rounded border border-ink/15 px-2 py-1.5 text-sm tabular-nums"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={v.allowPreOrder}
                    onChange={(e) => togglePreOrder(i, e.target.checked)}
                    aria-label={`Aceita encomenda no tamanho ${v.label || i + 1}`}
                    className="h-4 w-4 accent-roxo"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={v.estimatedDelivery}
                    onChange={(e) => onPatch(i, { estimatedDelivery: e.target.value })}
                    placeholder={v.allowPreOrder ? DEFAULT_DELIVERY : "—"}
                    disabled={!v.allowPreOrder}
                    aria-label={`Prazo de encomenda do tamanho ${v.label || i + 1}`}
                    className="w-36 rounded border border-ink/15 px-2 py-1.5 text-sm disabled:bg-cloud/60 disabled:text-steel"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => onPatch(i, { active: e.target.checked })}
                    aria-label={`Tamanho ${v.label || i + 1} ativo`}
                    className="h-4 w-4 accent-roxo"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    aria-label={`Remover tamanho ${v.label || i + 1}`}
                    className="rounded p-1.5 text-steel hover:bg-cloud hover:text-promo"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
