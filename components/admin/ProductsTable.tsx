"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  MoreVertical,
  PackageMinus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  adminStatusLabel,
  deriveStatus,
  effectiveLowStock,
  type Product,
  type ProductStatus,
} from "@/lib/products/types";
import { norm } from "@/lib/catalog";
import { brl } from "@/lib/format";
import {
  archiveProduct,
  deleteProduct,
  duplicateProduct,
  toggleAvailable,
  unarchiveProduct,
} from "@/app/admin/produtos/actions";
import { toast } from "@/components/Toaster";
import ProductImage from "@/components/ProductImage";
import ProductForm from "@/components/admin/ProductForm";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StockDialog, { type StockAction } from "@/components/admin/StockDialog";

type StatusFilter = "todos" | ProductStatus | "estoque-baixo";
type VisibilityFilter = "todos" | "ativo" | "oculto" | "arquivados";

const statusTone: Record<ProductStatus, string> = {
  "pronta-entrega": "bg-whats/15 text-green-800",
  "sob-encomenda": "bg-amarelo/30 text-ink",
  esgotado: "bg-promo/15 text-promo",
};

/** Produto com algum tamanho ativo em estoque baixo (mas não zerado). */
function hasLowStock(p: Product): boolean {
  const limit = effectiveLowStock(p);
  return p.variants.some((v) => v.active && v.stock > 0 && v.stock <= limit);
}

/** Lista de produtos e estoque do painel — dados vindos do Supabase. */
export default function ProductsTable({
  products,
  initialFilter,
}: {
  products: Product[];
  initialFilter?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>(
    ["estoque-baixo", "esgotado", "sob-encomenda", "pronta-entrega"].includes(
      initialFilter ?? ""
    )
      ? (initialFilter as StatusFilter)
      : "todos"
  );
  const [visibility, setVisibility] = useState<VisibilityFilter>(
    initialFilter === "arquivados"
      ? "arquivados"
      : initialFilter === "oculto"
        ? "oculto"
        : "todos"
  );
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [confirmArchive, setConfirmArchive] = useState<Product | null>(null);
  const [busyAction, setBusyAction] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [stockDialog, setStockDialog] = useState<{
    product: Product;
    action: StockAction;
  } | null>(null);

  const refresh = () => router.refresh();

  // Fecha o menu "mais ações" ao clicar fora.
  useEffect(() => {
    if (!menuFor) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuFor(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuFor]);

  const rows = useMemo(() => {
    return products.filter((p) => {
      const archived = Boolean(p.archivedAt);
      if (visibility === "arquivados") {
        if (!archived) return false;
      } else if (archived) {
        return false;
      }
      if (q.trim() && !norm(`${p.name} ${p.team} ${p.sku}`).includes(norm(q)))
        return false;
      if (status === "estoque-baixo") {
        if (!hasLowStock(p)) return false;
      } else if (status !== "todos" && deriveStatus(p.variants) !== status) {
        return false;
      }
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

  const onDuplicate = async (p: Product) => {
    setBusyAction(true);
    const result = await duplicateProduct(p.id);
    setBusyAction(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Cópia criada oculta e com estoque zerado — edite e publique.");
    refresh();
  };

  const onArchiveConfirmed = async () => {
    if (!confirmArchive) return;
    setBusyAction(true);
    const result = confirmArchive.archivedAt
      ? await unarchiveProduct(confirmArchive.id)
      : await archiveProduct(confirmArchive.id);
    setBusyAction(false);
    setConfirmArchive(null);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(
      confirmArchive.archivedAt
        ? "Produto restaurado — ele volta oculto; publique quando quiser."
        : "Produto arquivado — fora da vitrine e da listagem padrão."
    );
    refresh();
  };

  const onDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    setBusyAction(true);
    const result = await deleteProduct(confirmDelete.id);
    setBusyAction(false);
    setConfirmDelete(null);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Produto excluído definitivamente");
    refresh();
  };

  /**
   * Menu "mais ações": gaveta que sobe de baixo no celular (com fundo
   * escurecido) e dropdown ao lado do botão no desktop.
   */
  const moreMenu = (p: Product, dropUp = false) => (
    <>
      <button
        aria-label="Fechar menu"
        onClick={() => setMenuFor(null)}
        className="fixed inset-0 z-40 cursor-default bg-ink/50 md:hidden"
      />
      <div
        ref={menuRef}
        className={`fixed inset-x-2 bottom-2 z-50 overflow-hidden rounded-2xl bg-white py-1 shadow-2xl ring-1 ring-ink/10 md:absolute md:inset-auto md:right-0 md:z-20 md:w-56 md:rounded-xl md:shadow-xl ${
          dropUp ? "md:bottom-full md:mb-1" : "md:top-full md:mt-1"
        }`}
        role="menu"
      >
        <p className="border-b border-ink/5 px-3.5 py-2.5 text-xs font-bold text-steel md:hidden">
          {p.name}
        </p>
        {[
          {
            label: "Registrar saída",
            icon: PackageMinus,
            mobileOnly: true,
            run: () => setStockDialog({ product: p, action: "saida" }),
          },
          {
            label: "Registrar entrada",
            icon: PackagePlus,
            mobileOnly: true,
            run: () => setStockDialog({ product: p, action: "entrada" }),
          },
          {
            label: "Histórico de estoque",
            icon: History,
            run: () => router.push(`/admin/movimentacoes?produto=${p.id}`),
          },
          {
            label: "Duplicar produto",
            icon: Copy,
            run: () => onDuplicate(p),
          },
          ...(p.available && !p.archivedAt
            ? [
                {
                  label: "Ver no site",
                  icon: ExternalLink,
                  run: () => window.open(`/produto/${p.slug}`, "_blank"),
                },
              ]
            : []),
          {
            label: p.available ? "Ocultar da vitrine" : "Publicar na vitrine",
            icon: p.available ? EyeOff : Eye,
            run: () => onToggle(p),
          },
          {
            label: p.archivedAt ? "Restaurar produto" : "Arquivar produto",
            icon: p.archivedAt ? ArchiveRestore : Archive,
            run: () => setConfirmArchive(p),
          },
          {
            label: "Excluir definitivamente",
            icon: Trash2,
            danger: true,
            run: () => setConfirmDelete(p),
          },
        ].map((item) => (
          <button
            key={item.label}
            role="menuitem"
            onClick={() => {
              setMenuFor(null);
              item.run();
            }}
            className={`flex w-full items-center gap-2.5 px-3.5 py-3 text-left text-sm font-semibold hover:bg-cloud md:py-2.5 ${
              "danger" in item && item.danger ? "text-promo" : "text-ink"
            } ${"mobileOnly" in item && item.mobileOnly ? "md:hidden" : ""}`}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>
    </>
  );

  /** Ações da linha — ícones principais + menu "mais ações". */
  const actionsFor = (p: Product, dropUp = false) => (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => setEditing(p)}
        title="Editar produto e estoque"
        aria-label={`Editar ${p.name}`}
        className="tap rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => setStockDialog({ product: p, action: "saida" })}
        title="Registrar saída (baixa estoque)"
        aria-label={`Registrar saída de ${p.name}`}
        className="tap rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
      >
        <PackageMinus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => setStockDialog({ product: p, action: "entrada" })}
        title="Registrar entrada de estoque"
        aria-label={`Registrar entrada de ${p.name}`}
        className="tap rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
      >
        <PackagePlus className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
        title="Mais ações"
        aria-label={`Mais ações para ${p.name}`}
        aria-expanded={menuFor === p.id}
        className="tap rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
      >
        <MoreVertical className="h-4 w-4" aria-hidden="true" />
      </button>
      {menuFor === p.id && moreMenu(p, dropUp)}
    </div>
  );

  /** Chips de estoque por tamanho, com aviso textual de baixo/esgotado. */
  const variantChips = (p: Product) => {
    const limit = effectiveLowStock(p);
    return (
      <span className="flex flex-wrap gap-1">
        {p.variants.map((v) => {
          const low = v.active && v.stock > 0 && v.stock <= limit;
          const out = v.active && v.stock === 0 && !v.allowPreOrder;
          return (
            <span
              key={v.id}
              title={
                !v.active
                  ? `${v.label}: tamanho desativado`
                  : v.stock > 0
                    ? `${v.label}: ${v.stock} em estoque${low ? " (estoque baixo)" : ""}`
                    : v.allowPreOrder
                      ? `${v.label}: sob encomenda${v.estimatedDelivery ? ` (${v.estimatedDelivery})` : ""}`
                      : `${v.label}: esgotado`
              }
              className={`inline-flex items-center gap-0.5 tabular-nums rounded px-1.5 py-0.5 text-xs font-bold ${
                !v.active
                  ? "bg-cloud text-steel/50 line-through"
                  : low
                    ? "bg-amarelo/40 text-ink"
                    : v.stock > 0
                      ? "bg-whats/15 text-green-800"
                      : v.allowPreOrder
                        ? "bg-amarelo/20 text-ink"
                        : "bg-promo/15 text-promo"
              }`}
            >
              {v.label}: {v.stock}
              {low && <AlertTriangle className="h-3 w-3" aria-label="estoque baixo" />}
              {out && <span className="text-[9px] uppercase">esg.</span>}
              {v.active && v.stock === 0 && v.allowPreOrder && (
                <Clock className="h-3 w-3" aria-label="sob encomenda" />
              )}
            </span>
          );
        })}
      </span>
    );
  };

  const statusBadge = (p: Product) => {
    const st = deriveStatus(p.variants);
    return (
      <span
        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
          p.archivedAt ? "bg-cloud text-steel" : statusTone[st]
        }`}
      >
        {p.archivedAt ? "Arquivado" : p.available ? adminStatusLabel(p) : "Oculto"}
      </span>
    );
  };

  return (
    <div>
      {/* Busca, filtros e cadastro */}
      <div className="mt-5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, time ou código..."
              aria-label="Buscar produto"
              className="w-full rounded-lg border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <button
            onClick={() => setCreating(true)}
            className="tap flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Cadastrar produto
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por disponibilidade"
            className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:flex-none"
          >
            <option value="todos">Todas as disponibilidades</option>
            <option value="pronta-entrega">Pronta entrega</option>
            <option value="estoque-baixo">Estoque baixo</option>
            <option value="sob-encomenda">Sob encomenda</option>
            <option value="esgotado">Esgotado</option>
          </select>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as VisibilityFilter)}
            aria-label="Filtrar por visibilidade"
            className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:flex-none"
          >
            <option value="todos">Publicados e ocultos</option>
            <option value="ativo">Somente publicados</option>
            <option value="oculto">Somente ocultos</option>
            <option value="arquivados">Arquivados</option>
          </select>
          <p className="ml-auto shrink-0 text-sm text-steel" aria-live="polite">
            {rows.length} {rows.length === 1 ? "produto" : "produtos"}
          </p>
        </div>
      </div>

      {/* Cards no celular */}
      <ul className="mt-4 space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-xl bg-white p-8 text-center text-sm text-steel shadow-sm ring-1 ring-ink/5">
            Nenhum produto encontrado com esses filtros.
          </li>
        ) : (
          rows.map((p) => (
            <li
              key={p.id}
              className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-ink/5"
            >
              <div className="flex items-start gap-3">
                <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cloud">
                  <ProductImage product={p} sizes="56px" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                    {p.name}
                  </p>
                  <p className="text-xs text-steel">
                    {p.team} · {p.sku}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-sm font-bold text-ink">
                      {brl(p.price)}
                    </span>
                    {statusBadge(p)}
                  </div>
                </div>
              </div>
              <div className="mt-2">{variantChips(p)}</div>
              <div className="mt-2 border-t border-ink/5 pt-2">
                <p className="text-xs text-steel">
                  Total em estoque:{" "}
                  <span className="font-bold text-ink">
                    {p.variants.reduce((sum, v) => sum + (v.active ? v.stock : 0), 0)}
                  </span>
                </p>
                <div className="relative mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="tap flex items-center justify-center gap-2 rounded-lg bg-roxo px-3 py-2.5 text-sm font-bold text-white"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                    aria-expanded={menuFor === p.id}
                    className="tap flex items-center justify-center gap-2 rounded-lg border-2 border-ink/15 px-3 py-2.5 text-sm font-bold text-ink"
                  >
                    <MoreVertical className="h-4 w-4" aria-hidden="true" />
                    Mais ações
                  </button>
                  {menuFor === p.id && moreMenu(p)}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Tabela em telas médias+ */}
      <div className="mt-4 hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-ink/5 md:block">
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
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="tabular-nums px-4 py-2.5 font-semibold">
                      {brl(p.price)}
                    </td>
                    <td className="px-4 py-2.5">
                      {variantChips(p)}
                      <span className="mt-1 block text-xs text-steel">
                        Total: {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{statusBadge(p)}</td>
                    <td className="px-4 py-2.5">
                      {actionsFor(p, rows.length > 4 && i >= rows.length - 3)}
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
        <ProductForm onClose={() => setCreating(false)} onSaved={refresh} />
      )}
      {stockDialog && (
        <StockDialog
          product={stockDialog.product}
          action={stockDialog.action}
          onClose={() => setStockDialog(null)}
          onDone={refresh}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Excluir produto?"
          message={`"${confirmDelete.name}" será excluído definitivamente, junto com os tamanhos e estoques. Se quiser apenas tirá-lo da loja, prefira arquivar.`}
          confirmLabel="Excluir definitivamente"
          danger
          busy={busyAction}
          onConfirm={onDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmArchive && (
        <ConfirmDialog
          title={confirmArchive.archivedAt ? "Restaurar produto?" : "Arquivar produto?"}
          message={
            confirmArchive.archivedAt
              ? `"${confirmArchive.name}" volta para a listagem como oculto — publique quando quiser.`
              : `"${confirmArchive.name}" sai da vitrine e da listagem padrão, mas nada é apagado. Você pode restaurá-lo no filtro "Arquivados".`
          }
          confirmLabel={confirmArchive.archivedAt ? "Restaurar" : "Arquivar"}
          busy={busyAction}
          onConfirm={onArchiveConfirmed}
          onCancel={() => setConfirmArchive(null)}
        />
      )}
    </div>
  );
}
