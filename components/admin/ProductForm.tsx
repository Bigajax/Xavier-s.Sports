"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { saveProduct, type SaveProductInput } from "@/app/admin/produtos/actions";
import { toast } from "@/components/Toaster";

type VariantDraft = {
  id?: string;
  label: string;
  stock: string;
  allowPreOrder: boolean;
  estimatedDelivery: string;
  active: boolean;
};

const DEFAULT_DELIVERY = "7 a 12 dias úteis";

/**
 * Edição completa do produto: dados gerais + "Estoque por tamanho".
 * A vitrine deriva pronta entrega/encomenda/esgotado destas linhas.
 */
export default function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [oldPrice, setOldPrice] = useState(
    product.oldPrice ? String(product.oldPrice) : ""
  );
  const [available, setAvailable] = useState(product.available);
  const [featured, setFeatured] = useState(product.featured);
  const [newArrival, setNewArrival] = useState(product.newArrival);
  const [bestSeller, setBestSeller] = useState(product.bestSeller);
  const [onSale, setOnSale] = useState(product.onSale);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product.variants.map((v) => ({
      id: v.id,
      label: v.label,
      stock: String(v.stock),
      allowPreOrder: v.allowPreOrder,
      estimatedDelivery: v.estimatedDelivery ?? "",
      active: v.active,
    }))
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  const touch = () => setDirty(true);

  const setVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
    touch();
  };

  const removeVariant = (index: number) => {
    const v = variants[index];
    if (
      !window.confirm(
        `Remover o tamanho ${v.label || "(sem nome)"} deste produto?`
      )
    )
      return;
    if (v.id) setDeletedIds((prev) => [...prev, v.id!]);
    setVariants((prev) => prev.filter((_, i) => i !== index));
    touch();
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        label: "",
        stock: "0",
        allowPreOrder: false,
        estimatedDelivery: "",
        active: true,
      },
    ]);
    touch();
  };

  const close = () => {
    if (dirty && !window.confirm("Sair sem salvar as alterações?")) return;
    onClose();
  };

  const submit = async () => {
    const priceValue = parseFloat(price.replace(",", "."));
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast("Informe um preço válido.");
      return;
    }
    const oldPriceValue = oldPrice.trim()
      ? parseFloat(oldPrice.replace(",", "."))
      : null;
    if (oldPriceValue !== null && (Number.isNaN(oldPriceValue) || oldPriceValue <= 0)) {
      toast("Preço promocional inválido — deixe em branco para remover.");
      return;
    }

    const payload: SaveProductInput = {
      id: product.id,
      name,
      description,
      price: priceValue,
      oldPrice: oldPriceValue,
      available,
      featured,
      newArrival,
      bestSeller,
      onSale,
      deletedVariantIds: deletedIds,
      variants: variants.map((v) => ({
        id: v.id,
        label: v.label.trim(),
        stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        allowPreOrder: v.allowPreOrder,
        estimatedDelivery: v.estimatedDelivery.trim() || undefined,
        active: v.active,
      })),
    };

    if (payload.variants.some((v) => !v.label)) {
      toast("Todo tamanho precisa de um nome (ex.: P, M, G).");
      return;
    }

    setBusy(true);
    const result = await saveProduct(payload);
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Alterações salvas — a vitrine já foi atualizada ✓");
    setDirty(false);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${product.name}`}
    >
      <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-ink">Editar produto</h2>
            <p className="mt-0.5 text-sm text-steel">
              {product.team} · {product.sku}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Fechar"
            className="rounded-lg p-2 text-steel hover:bg-cloud"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Dados gerais */}
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="pf-nome" className="mb-1 block text-xs font-bold text-ink">
              Nome
            </label>
            <input
              id="pf-nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="pf-desc" className="mb-1 block text-xs font-bold text-ink">
              Descrição
            </label>
            <textarea
              id="pf-desc"
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                touch();
              }}
              className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="pf-preco" className="mb-1 block text-xs font-bold text-ink">
                Preço (R$)
              </label>
              <input
                id="pf-preco"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  touch();
                }}
                className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="pf-preco-antigo" className="mb-1 block text-xs font-bold text-ink">
                Preço &quot;de&quot; (riscado — opcional)
              </label>
              <input
                id="pf-preco-antigo"
                inputMode="decimal"
                value={oldPrice}
                placeholder="Sem promoção"
                onChange={(e) => {
                  setOldPrice(e.target.value);
                  touch();
                }}
                className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {(
              [
                ["Visível na loja", available, setAvailable],
                ["Destaque", featured, setFeatured],
                ["Novo", newArrival, setNewArrival],
                ["Mais procurada", bestSeller, setBestSeller],
                ["Em oferta", onSale, setOnSale],
              ] as const
            ).map(([label, value, setter]) => (
              <label key={label} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => {
                    setter(e.target.checked);
                    touch();
                  }}
                  className="h-4 w-4 accent-roxo"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Estoque por tamanho */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="display-upright text-lg text-ink">
              Estoque por tamanho
            </h3>
            <button
              onClick={addVariant}
              className="flex items-center gap-1.5 rounded-lg border border-roxo px-3 py-1.5 text-xs font-bold text-roxo hover:bg-roxo hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Adicionar tamanho
            </button>
          </div>
          <p className="mt-1 text-xs text-steel">
            Estoque maior que zero = pronta entrega. Estoque zero com
            &quot;aceita encomenda&quot; = sob encomenda (informe o prazo).
            Estoque zero sem encomenda = indisponível.
          </p>

          <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-ink/10">
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
                        onChange={(e) => setVariant(i, { label: e.target.value })}
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
                        onChange={(e) => setVariant(i, { stock: e.target.value })}
                        aria-label={`Estoque do tamanho ${v.label || i + 1}`}
                        className="w-20 rounded border border-ink/15 px-2 py-1.5 text-sm tabular-nums"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={v.allowPreOrder}
                        onChange={(e) =>
                          setVariant(i, {
                            allowPreOrder: e.target.checked,
                            estimatedDelivery:
                              e.target.checked && !v.estimatedDelivery
                                ? DEFAULT_DELIVERY
                                : v.estimatedDelivery,
                          })
                        }
                        aria-label={`Aceita encomenda no tamanho ${v.label || i + 1}`}
                        className="h-4 w-4 accent-roxo"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={v.estimatedDelivery}
                        onChange={(e) =>
                          setVariant(i, { estimatedDelivery: e.target.value })
                        }
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
                        onChange={(e) => setVariant(i, { active: e.target.checked })}
                        aria-label={`Tamanho ${v.label || i + 1} ativo`}
                        className="h-4 w-4 accent-roxo"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeVariant(i)}
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
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={submit}
            disabled={busy}
            className="tap rounded-lg bg-roxo px-5 py-3 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-60"
          >
            {busy ? "Salvando..." : "Salvar alterações"}
          </button>
          <button
            onClick={close}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-5 py-3 text-sm font-bold text-ink hover:bg-cloud"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
