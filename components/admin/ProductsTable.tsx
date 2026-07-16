"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  PackageMinus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  deriveStatus,
  statusLabel,
  type Product,
  type ProductStatus,
} from "@/lib/products/types";
import { norm } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { deleteProduct, toggleAvailable } from "@/app/admin/produtos/actions";
import { toast } from "@/components/Toaster";
import ProductImage from "@/components/ProductImage";
import ProductForm from "@/components/admin/ProductForm";
import NewProductForm from "@/components/admin/NewProductForm";
import StockDialog, { type StockAction } from "@/components/admin/StockDialog";

type StatusFilter = "todos" | ProductStatus;
type VisibilityFilter = "todos" | "ativo" | "oculto";

const statusTone: Record<ProductStatus, string> = {
  "pronta-entrega": "bg-whats/15 text-green-800",
  "sob-encomenda": "bg-amarelo/30 text-ink",
  esgotado: "bg-promo/15 text-promo",
};

/** Lista de produtos e estoque do painel — dados vindos do Supabase. */
export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [visibility, setVisibility] = useState<VisibilityFilter>("todos");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [stockDialog, setStockDialog] = useState<{
    product: Product;
    action: StockAction;
  } | null>(null);

  const refresh = () => router.refresh();

  const rows = useMemo(() => {
    return products.filter((p) => {
      if (q.trim() && !norm(`${p.name} ${p.team} ${p.sku}`).includes(norm(q)))
        return false;
      if (status !== "todos" && deriveStatus(p.variants) !== status) return false;
      if (visibility === "ativo" && !p.available) return false;
      if (visibility === "oculto" && p.available) return false;
      return true;
    });
  }, [products, q, status, visibility]);

  const onToggle = async (p: Product) => {
    const result = await toggleAvailable(p.id, !p.available);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(p.available ? "Produto oculto da vitrine" : "Produto publicado na vitrine");
    refresh();
  };

  const onDelete = async (p: Product) => {
    if (
      !window.confirm(
        `Excluir "${p.name}" definitivamente? Os tamanhos e estoques deste produto também serão removidos.`
      )
    )
      return;
    const result = await deleteProduct(p.id);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Produto excluído");
    refresh();
  };

  return (
    <div>
      {/* Busca e filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, time ou código..."
            aria-label="Buscar produto"
            className="w-72 max-w-full rounded-lg border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filtrar por disponibilidade"
          className="rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm"
        >
          <option value="todos">Todas as disponibilidades</option>
          <option value="pronta-entrega">Pronta entrega</option>
          <option value="sob-encomenda">Sob encomenda</option>
          <option value="esgotado">Esgotado</option>
        </select>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
          aria-label="Filtrar por visibilidade"
          className="rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm"
        >
          <option value="todos">Publicados e ocultos</option>
          <option value="ativo">Somente publicados</option>
          <option value="oculto">Somente ocultos</option>
        </select>
        <p className="ml-auto text-sm text-steel" aria-live="polite">
          {rows.length} {rows.length === 1 ? "produto" : "produtos"}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="tap flex items-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Cadastrar produto
        </button>
      </div>

      {/* Tabela */}
      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-ink/5">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque por tamanho</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-steel">
                  Nenhum produto encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              rows.map((p, i) => {
                const st = deriveStatus(p.variants);
                const totalStock = p.variants.reduce(
                  (sum, v) => sum + (v.active ? v.stock : 0),
                  0
                );
                return (
                  <tr key={p.id} className={i % 2 ? "bg-cloud/40" : "bg-white"}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cloud">
                          <ProductImage product={p} sizes="44px" />
                        </span>
                        <span>
                          <span className="block font-semibold leading-snug">
                            {p.name}
                          </span>
                          <span className="block text-xs text-steel">
                            {p.team} · {p.sku}
                            {!p.available && " · oculto"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="tabular-nums px-4 py-2.5 font-semibold">
                      {brl(p.price)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        {p.variants.map((v) => (
                          <span
                            key={v.id}
                            title={
                              !v.active
                                ? `${v.label}: tamanho desativado`
                                : v.stock > 0
                                  ? `${v.label}: ${v.stock} em estoque`
                                  : v.allowPreOrder
                                    ? `${v.label}: sob encomenda${v.estimatedDelivery ? ` (${v.estimatedDelivery})` : ""}`
                                    : `${v.label}: indisponível`
                            }
                            className={`tabular-nums rounded px-1.5 py-0.5 text-xs font-bold ${
                              !v.active
                                ? "bg-cloud text-steel/50 line-through"
                                : v.stock > 0
                                  ? "bg-whats/15 text-green-800"
                                  : v.allowPreOrder
                                    ? "bg-amarelo/30 text-ink"
                                    : "bg-cloud text-steel"
                            }`}
                          >
                            {v.label}: {v.stock}
                          </span>
                        ))}
                      </span>
                      <span className="mt-1 block text-xs text-steel">
                        Total: {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[st]}`}
                      >
                        {statusLabel[st]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditing(p)}
                          title="Editar produto e estoque"
                          aria-label={`Editar ${p.name}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            setStockDialog({ product: p, action: "venda" })
                          }
                          title="Registrar venda (baixa estoque)"
                          aria-label={`Registrar venda de ${p.name}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                        >
                          <PackageMinus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() =>
                            setStockDialog({ product: p, action: "entrada" })
                          }
                          title="Adicionar estoque (entrada)"
                          aria-label={`Adicionar estoque de ${p.name}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                        >
                          <PackagePlus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => onToggle(p)}
                          title={p.available ? "Ocultar da vitrine" : "Publicar na vitrine"}
                          aria-label={`${p.available ? "Ocultar" : "Publicar"} ${p.name}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                        >
                          {p.available ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          title="Excluir produto"
                          aria-label={`Excluir ${p.name}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-promo"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
      {creating && (
        <NewProductForm onClose={() => setCreating(false)} onSaved={refresh} />
      )}
      {stockDialog && (
        <StockDialog
          product={stockDialog.product}
          action={stockDialog.action}
          onClose={() => setStockDialog(null)}
          onDone={refresh}
        />
      )}
    </div>
  );
}
