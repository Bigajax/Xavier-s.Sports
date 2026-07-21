"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  orderTotal,
  type OrderRow,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/crm";
import {
  cancelOrder,
  createOrder,
  markOrderPaid,
  updateOrder,
} from "@/app/admin/crm/actions";
import { brl } from "@/lib/format";
import MoneyInput from "@/components/admin/MoneyInput";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/Toaster";

type PickerProduct = {
  id: string;
  name: string;
  sku: string;
  price: number;
  variants: { id: string; label: string; stock: number }[];
};

type DraftItem = {
  productId: string | null;
  variantId: string | null;
  productName: string;
  productSku: string;
  size: string | null;
  qty: number;
  unitPrice: number;
};

const statusTone: Record<string, string> = {
  Rascunho: "bg-cloud text-steel",
  "Aguardando confirmação": "bg-roxo/10 text-roxo",
  "Aguardando pagamento": "bg-amarelo/30 text-ink",
  Pago: "bg-whats/15 text-green-800",
  "Separando produtos": "bg-roxo/10 text-roxo",
  "Aguardando envio": "bg-amarelo/30 text-ink",
  Enviado: "bg-whats/15 text-green-800",
  Entregue: "bg-whats/15 text-green-800",
  Concluído: "bg-whats/15 text-green-800",
  Cancelado: "bg-promo/10 text-promo",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Pedidos em cards, com criação manual, pagamento e envio. */
export default function OrdersBoard({
  orders,
  products,
}: {
  orders: OrderRow[];
  products: PickerProduct[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ativos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirmPaid, setConfirmPaid] = useState<OrderRow | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<OrderRow | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});

  const rows = useMemo(
    () =>
      orders.filter((o) => {
        if (statusFilter === "ativos") {
          return !["Concluído", "Cancelado"].includes(o.status);
        }
        if (statusFilter === "todos") return true;
        return o.status === statusFilter;
      }),
    [orders, statusFilter]
  );

  const draftFor = (o: OrderRow): Record<string, string> =>
    drafts[o.id] ?? {
      customerName: o.customer_name,
      whatsapp: o.whatsapp ?? "",
      address: o.address ?? "",
      trackingCode: o.tracking_code ?? "",
      notes: o.notes ?? "",
    };

  const patchDraft = (o: OrderRow, patch: Record<string, string>) =>
    setDrafts((prev) => ({ ...prev, [o.id]: { ...draftFor(o), ...patch } }));

  const run = async (
    fn: () => Promise<{ ok: boolean; error?: string; warnings?: string[] }>,
    okMsg: string
  ) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível salvar.");
      return;
    }
    for (const w of result.warnings ?? []) toast(w);
    toast(okMsg);
    router.refresh();
  };

  const saveDetails = (o: OrderRow) => {
    const d = draftFor(o);
    return run(
      () =>
        updateOrder({
          id: o.id,
          customerName: d.customerName,
          whatsapp: d.whatsapp,
          address: d.address,
          trackingCode: d.trackingCode,
          notes: d.notes,
        }),
      "Pedido atualizado"
    );
  };

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar pedidos"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:w-auto"
        >
          <option value="ativos">Em andamento</option>
          <option value="todos">Todos</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCreating(true)}
          className="tap flex w-full items-center justify-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white sm:ml-auto sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Criar pedido
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <ShoppingBag className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Nenhum pedido neste filtro.</p>
          <p className="mt-1 text-sm text-steel">
            Crie um pedido manual ou transforme uma consulta do WhatsApp em
            pedido.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((o) => {
            const d = draftFor(o);
            const open = expanded === o.id;
            const total = orderTotal(o);
            return (
              <li key={o.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{o.number}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[o.status] ?? "bg-cloud text-steel"}`}
                  >
                    {o.status}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      o.payment_status === "Pago"
                        ? "bg-whats/15 text-green-800"
                        : "bg-cloud text-steel"
                    }`}
                  >
                    {o.payment_status === "Pago" ? "✓ Pago" : o.payment_status}
                  </span>
                  <span className="ml-auto text-xs text-steel">{fmtDate(o.created_at)}</span>
                </div>

                <p className="mt-2 text-sm font-semibold text-ink">
                  {o.customer_name || "Cliente a definir"}
                  {o.whatsapp ? ` · ${o.whatsapp}` : ""}
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-steel">
                  {(o.order_items ?? []).map((i) => (
                    <li key={i.id}>
                      {i.qty}× {i.product_name}
                      {i.size ? ` (${i.size})` : ""} —{" "}
                      <span className="tabular-nums">{brl(Number(i.unit_price) * i.qty)}</span>
                      {i.personalization ? ` · Pers.: ${i.personalization}` : ""}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-sm font-bold text-ink">
                  Total: <span className="tabular-nums">{brl(total)}</span>
                  {o.stock_deducted_at && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-whats">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      estoque baixado
                    </span>
                  )}
                </p>
                {o.tracking_code && (
                  <p className="text-xs text-steel">Rastreio: {o.tracking_code}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={o.status}
                    disabled={busy || o.status === "Cancelado"}
                    onChange={(e) =>
                      run(
                        () => updateOrder({ id: o.id, status: e.target.value as OrderStatus }),
                        `Status: ${e.target.value}`
                      )
                    }
                    aria-label="Mudar status do pedido"
                    className="rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {o.payment_status !== "Pago" && o.status !== "Cancelado" && (
                    <button
                      onClick={() => setConfirmPaid(o)}
                      disabled={busy}
                      className="rounded-lg bg-whats px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      Marcar como pago
                    </button>
                  )}
                  {o.whatsapp && (
                    <a
                      href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir conversa no WhatsApp"
                      className="rounded-lg bg-whats/10 p-2 text-whats"
                    >
                      <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    onClick={() => setExpanded(open ? null : o.id)}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                  >
                    {open ? "Fechar" : "Detalhes"}
                  </button>
                  {o.status !== "Cancelado" && (
                    <button
                      onClick={() => setConfirmCancel(o)}
                      disabled={busy}
                      className="ml-auto rounded-lg px-3 py-2 text-xs font-bold text-promo hover:bg-promo/5"
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>

                {open && (
                  <div className="mt-3 grid gap-2 rounded-lg bg-cloud/40 p-3 sm:grid-cols-2">
                    <input
                      value={d.customerName}
                      onChange={(e) => patchDraft(o, { customerName: e.target.value })}
                      placeholder="Nome do cliente"
                      aria-label="Nome do cliente"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <input
                      value={d.whatsapp}
                      onChange={(e) => patchDraft(o, { whatsapp: e.target.value })}
                      placeholder="WhatsApp"
                      aria-label="WhatsApp"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <input
                      value={d.address}
                      onChange={(e) => patchDraft(o, { address: e.target.value })}
                      placeholder="Endereço de entrega"
                      aria-label="Endereço"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
                    />
                    <input
                      value={d.trackingCode}
                      onChange={(e) => patchDraft(o, { trackingCode: e.target.value })}
                      placeholder="Código de rastreamento"
                      aria-label="Código de rastreamento"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <select
                      value={o.payment_status}
                      disabled={busy}
                      onChange={(e) =>
                        run(
                          () =>
                            updateOrder({
                              id: o.id,
                              paymentStatus: e.target.value as PaymentStatus,
                            }),
                          "Pagamento atualizado"
                        )
                      }
                      aria-label="Status do pagamento"
                      className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          Pagamento: {s}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={d.notes}
                      onChange={(e) => patchDraft(o, { notes: e.target.value })}
                      placeholder="Observações"
                      aria-label="Observações"
                      rows={2}
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
                    />
                    <button
                      onClick={() => saveDetails(o)}
                      disabled={busy}
                      className="rounded-lg bg-roxo px-4 py-2 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
                    >
                      Salvar detalhes
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {creating && (
        <NewOrderModal
          products={products}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}

      {confirmPaid && (
        <ConfirmDialog
          title={`Confirmar pagamento de ${confirmPaid.number}?`}
          message={`O pedido será marcado como pago e o estoque dos itens será baixado UMA única vez (com registro nas Movimentações). Total: ${brl(orderTotal(confirmPaid))}.`}
          confirmLabel="Confirmar pagamento"
          busy={busy}
          onConfirm={async () => {
            const order = confirmPaid;
            setConfirmPaid(null);
            await run(() => markOrderPaid(order.id), "Pagamento confirmado ✓");
          }}
          onCancel={() => setConfirmPaid(null)}
        />
      )}

      {confirmCancel && (
        <CancelOrderDialog
          order={confirmCancel}
          busy={busy}
          onClose={() => setConfirmCancel(null)}
          onConfirm={async (returnStock) => {
            const order = confirmCancel;
            setConfirmCancel(null);
            await run(() => cancelOrder(order.id, returnStock), "Pedido cancelado");
          }}
        />
      )}
    </div>
  );
}

/** Cancelamento com a pergunta explícita sobre devolver o estoque. */
function CancelOrderDialog({
  order,
  busy,
  onClose,
  onConfirm,
}: {
  order: OrderRow;
  busy: boolean;
  onClose: () => void;
  onConfirm: (returnStock: boolean) => void;
}) {
  const deducted = Boolean(order.stock_deducted_at);
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={`Cancelar ${order.number}`}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="display text-xl text-ink">Cancelar {order.number}?</h2>
        <p className="mt-2 text-sm leading-relaxed text-steel">
          {deducted
            ? "O estoque deste pedido já foi baixado. Os produtos devem voltar ao estoque? (cada devolução gera uma movimentação de entrada)"
            : "O pedido será marcado como cancelado. O estoque ainda não havia sido baixado."}
        </p>
        <div className="mt-5 space-y-2">
          {deducted ? (
            <>
              <button
                onClick={() => onConfirm(true)}
                disabled={busy}
                className="w-full rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Cancelar e devolver ao estoque
              </button>
              <button
                onClick={() => onConfirm(false)}
                disabled={busy}
                className="w-full rounded-lg border border-promo/40 px-4 py-2.5 text-sm font-bold text-promo disabled:opacity-60"
              >
                Cancelar sem devolver
              </button>
            </>
          ) : (
            <button
              onClick={() => onConfirm(false)}
              disabled={busy}
              className="w-full rounded-lg bg-promo px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              Cancelar pedido
            </button>
          )}
          <button
            onClick={onClose}
            disabled={busy}
            className="w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Criação manual de pedido: cliente + itens do catálogo (ou avulsos). */
function NewOrderModal({
  products,
  onClose,
  onCreated,
}: {
  products: PickerProduct[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const product = products.find((p) => p.id === productId);

  const addItem = () => {
    if (!product) {
      toast("Selecione um produto.");
      return;
    }
    const variant = product.variants.find((v) => v.id === variantId) ?? null;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        productSku: product.sku,
        size: variant?.label ?? null,
        qty,
        unitPrice: price ?? product.price,
      },
    ]);
    setProductId("");
    setVariantId("");
    setQty(1);
    setPrice(null);
  };

  const submit = async () => {
    if (items.length === 0) {
      toast("Adicione ao menos um item ao pedido.");
      return;
    }
    setBusy(true);
    const result = await createOrder({
      customerName,
      whatsapp: whatsapp || undefined,
      notes: notes || undefined,
      items: items.map((i) => ({ ...i, personalization: null })),
    });
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível criar o pedido.");
      return;
    }
    toast("Pedido criado ✓");
    onCreated();
  };

  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-stretch justify-center overflow-y-auto bg-ink/60 sm:items-start sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Criar pedido"
    >
      <div className="flex h-full w-full flex-col bg-white shadow-xl sm:my-4 sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 p-4 sm:p-5">
          <div>
            <h2 className="display text-2xl text-ink">Criar pedido</h2>
            <p className="mt-0.5 text-sm text-steel">
              Venda presencial, encomenda ou atendimento fora do site.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-steel hover:bg-cloud"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do cliente"
              aria-label="Nome do cliente"
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp (opcional)"
              aria-label="WhatsApp"
              className="rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="rounded-xl border border-ink/10 bg-cloud/40 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-roxo">
              Adicionar item
            </p>
            <div className="mt-2 grid gap-2">
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setVariantId("");
                  const p = products.find((x) => x.id === e.target.value);
                  setPrice(p ? p.price : null);
                }}
                aria-label="Produto"
                className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">Selecione o produto...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  disabled={!product}
                  aria-label="Tamanho"
                  className="rounded-lg border border-ink/15 bg-white px-2 py-2.5 text-sm disabled:bg-cloud/60"
                >
                  <option value="">Tam.</option>
                  {product?.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} ({v.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  aria-label="Quantidade"
                  className="rounded-lg border border-ink/15 px-2 py-2.5 text-sm tabular-nums"
                />
                <MoneyInput value={price} onChange={setPrice} />
              </div>
              <button
                onClick={addItem}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-roxo px-3 py-2 text-sm font-bold text-roxo hover:bg-roxo hover:text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar ao pedido
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <ul className="space-y-1.5">
              {items.map((i, idx) => (
                <li
                  key={`${i.productId}-${idx}`}
                  className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    {i.qty}× {i.productName}
                    {i.size ? ` (${i.size})` : ""}
                  </span>
                  <span className="tabular-nums font-bold">{brl(i.unitPrice * i.qty)}</span>
                  <button
                    onClick={() => setItems((prev) => prev.filter((_, j) => j !== idx))}
                    aria-label="Remover item"
                    className="rounded p-1 text-steel hover:text-promo"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
              <li className="px-3 text-right text-sm font-bold text-ink">
                Total: <span className="tabular-nums">{brl(total)}</span>
              </li>
            </ul>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações (opcional)"
            aria-label="Observações"
            rows={2}
            className="w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm"
          />
        </div>

        <div className="flex gap-2 border-t border-ink/10 p-4 sm:p-5">
          <button
            onClick={submit}
            disabled={busy}
            className="tap flex-1 rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Criando..." : "Criar pedido"}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-4 py-3 text-sm font-bold text-ink"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
