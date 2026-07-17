"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, MessageCircle, Plus, RefreshCcw, X } from "lucide-react";
import {
  RETURN_STATUSES,
  type ReturnRow,
  type ReturnStatus,
} from "@/lib/atendimento";
import { saveReturn, updateReturn } from "@/app/admin/atendimento/actions";
import { toast } from "@/components/Toaster";

const tone = (s: string) =>
  s === "Recusada"
    ? "bg-promo/10 text-promo"
    : ["Concluída", "Reembolso realizado", "Novo produto enviado"].includes(s)
      ? "bg-whats/15 text-green-800"
      : ["Solicitação recebida", "Em análise"].includes(s)
        ? "bg-roxo/10 text-roxo"
        : "bg-amarelo/30 text-ink";

/** Trocas e devoluções em cards, com protocolo e recusa justificada. */
export default function ReturnsBoard({ rows }: { rows: ReturnRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("ativas");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ReturnRow | null>(null);
  const [refusing, setRefusing] = useState<ReturnRow | null>(null);
  const [refusalText, setRefusalText] = useState("");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () =>
      rows.filter((r) => {
        if (filter === "arquivadas") return Boolean(r.archived_at);
        if (r.archived_at) return false;
        if (filter === "ativas")
          return !["Concluída", "Recusada", "Reembolso realizado"].includes(r.status);
        if (filter === "todas") return true;
        return r.status === filter;
      }),
    [rows, filter]
  );

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível salvar.");
      return false;
    }
    toast(msg);
    router.refresh();
    return true;
  };

  const setStatus = (r: ReturnRow, status: ReturnStatus) => {
    if (status === "Recusada") {
      setRefusing(r);
      setRefusalText(r.refusal_reason ?? "");
      return;
    }
    run(() => updateReturn({ id: r.id, status }), `Status: ${status}`);
  };

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filtrar trocas"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:w-auto"
        >
          <option value="ativas">Em andamento</option>
          <option value="todas">Todas</option>
          {RETURN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="arquivadas">Arquivadas</option>
        </select>
        <button
          onClick={() => setCreating(true)}
          className="tap flex w-full items-center justify-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white sm:ml-auto sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nova solicitação
        </button>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <RefreshCcw className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Nenhuma solicitação neste filtro.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((r) => {
            const open = expanded === r.id;
            return (
              <li key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-ink">{r.protocol}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone(r.status)}`}>
                    {r.status}
                  </span>
                  {r.order_number && (
                    <span className="text-xs text-steel">Pedido {r.order_number}</span>
                  )}
                  <span className="ml-auto text-xs text-steel">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {r.customer_name}
                  {r.whatsapp ? ` · ${r.whatsapp}` : ""}
                </p>
                <p className="text-sm text-steel">
                  {r.qty}× {r.product_name}
                  {r.size_bought ? ` · comprou ${r.size_bought}` : ""}
                  {r.size_wanted ? ` → quer ${r.size_wanted}` : ""}
                </p>
                {r.reason && <p className="mt-1 text-xs italic text-steel">Motivo: {r.reason}</p>}
                {r.refusal_reason && (
                  <p className="mt-1 text-xs text-promo">Recusa: {r.refusal_reason}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={r.status}
                    disabled={busy}
                    onChange={(e) => setStatus(r, e.target.value as ReturnStatus)}
                    aria-label="Mudar status"
                    className="rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    {RETURN_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {r.whatsapp && (
                    <a
                      href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir WhatsApp"
                      className="rounded-lg bg-whats/10 p-2 text-whats"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(r)}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setExpanded(open ? null : r.id);
                      setNotesDraft((p) => ({ ...p, [r.id]: r.internal_notes ?? "" }));
                    }}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                  >
                    Anotações
                  </button>
                  <button
                    onClick={() =>
                      run(
                        () => updateReturn({ id: r.id, archived: !r.archived_at }),
                        r.archived_at ? "Restaurada" : "Arquivada"
                      )
                    }
                    disabled={busy}
                    aria-label={r.archived_at ? "Restaurar" : "Arquivar"}
                    className="ml-auto rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
                  >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {["Produto recebido", "Novo produto separado"].includes(r.status) && (
                  <p className="mt-2 rounded-lg bg-amarelo/15 p-2.5 text-xs text-ink">
                    Estoque: registre a <strong>entrada</strong> (motivo
                    &quot;Devolução ao estoque&quot;) ou a <strong>saída</strong> do
                    novo tamanho (motivo &quot;Troca&quot;) na tela de Produtos,
                    citando o pedido {r.order_number ?? r.protocol}.
                  </p>
                )}

                {open && (
                  <div className="mt-3 space-y-2 rounded-lg bg-cloud/40 p-3">
                    <textarea
                      value={notesDraft[r.id] ?? ""}
                      onChange={(e) =>
                        setNotesDraft((p) => ({ ...p, [r.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="Observação interna"
                      aria-label="Observação interna"
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() =>
                        run(
                          () => updateReturn({ id: r.id, internalNotes: notesDraft[r.id] }),
                          "Anotação salva"
                        )
                      }
                      disabled={busy}
                      className="w-full rounded-lg bg-roxo px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Salvar anotação
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(creating || editing) && (
        <ReturnModal
          row={editing ?? undefined}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            router.refresh();
          }}
        />
      )}

      {refusing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Recusar solicitação"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="display text-xl text-ink">Recusar {refusing.protocol}?</h2>
            <p className="mt-2 text-sm text-steel">
              A recusa exige uma justificativa interna (não aparece para o cliente).
            </p>
            <textarea
              value={refusalText}
              onChange={(e) => setRefusalText(e.target.value)}
              rows={3}
              placeholder="Ex.: peça usada, fora do prazo..."
              aria-label="Justificativa da recusa"
              className="mt-3 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  const r = refusing;
                  const ok = await run(
                    () =>
                      updateReturn({
                        id: r.id,
                        status: "Recusada",
                        refusalReason: refusalText,
                      }),
                    "Solicitação recusada"
                  );
                  if (ok) setRefusing(null);
                }}
                disabled={busy || !refusalText.trim()}
                className="flex-1 rounded-lg bg-promo px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Recusar
              </button>
              <button
                onClick={() => setRefusing(null)}
                className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReturnModal({
  row,
  onClose,
  onSaved,
}: {
  row?: ReturnRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    customerName: row?.customer_name ?? "",
    whatsapp: row?.whatsapp ?? "",
    orderNumber: row?.order_number ?? "",
    productName: row?.product_name ?? "",
    sizeBought: row?.size_bought ?? "",
    sizeWanted: row?.size_wanted ?? "",
    qty: row?.qty ?? 1,
    reason: row?.reason ?? "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setBusy(true);
    const result = await saveReturn({ id: row?.id, ...form, qty: Number(form.qty) || 1 });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(row ? "Solicitação atualizada ✓" : "Solicitação registrada ✓");
    onSaved();
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={row ? `Editar ${row.protocol}` : "Nova solicitação"}
    >
      <div className="my-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="display text-2xl text-ink">
            {row ? `Editar ${row.protocol}` : "Nova solicitação"}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-steel hover:bg-cloud">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Cliente" aria-label="Cliente" className={input} />
          <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="WhatsApp" aria-label="WhatsApp" className={input} />
          <input value={form.orderNumber} onChange={(e) => set("orderNumber", e.target.value)} placeholder="Pedido (ex.: XS-0001)" aria-label="Pedido" className={input} />
          <input value={form.productName} onChange={(e) => set("productName", e.target.value)} placeholder="Produto" aria-label="Produto" className={input} />
          <input value={form.sizeBought} onChange={(e) => set("sizeBought", e.target.value)} placeholder="Tamanho comprado" aria-label="Tamanho comprado" className={input} />
          <input value={form.sizeWanted} onChange={(e) => set("sizeWanted", e.target.value)} placeholder="Tamanho desejado" aria-label="Tamanho desejado" className={input} />
          <input type="number" min={1} value={form.qty} onChange={(e) => set("qty", Math.max(1, Number(e.target.value) || 1))} aria-label="Quantidade" className={input} />
          <textarea value={form.reason} onChange={(e) => set("reason", e.target.value)} rows={2} placeholder="Motivo da troca" aria-label="Motivo" className={`${input} sm:col-span-2`} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={submit} disabled={busy} className="tap flex-1 rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {busy ? "Salvando..." : "Salvar"}
          </button>
          <button onClick={onClose} disabled={busy} className="rounded-lg border border-ink/15 px-4 py-3 text-sm font-bold text-ink">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
