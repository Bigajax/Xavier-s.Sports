"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  MessageCircle,
  MessageSquareText,
  ShoppingBag,
} from "lucide-react";
import { LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/crm";
import { convertLeadToOrder, updateLead } from "@/app/admin/crm/actions";
import { brl } from "@/lib/format";
import { toast } from "@/components/Toaster";

const statusTone: Record<string, string> = {
  "Nova consulta": "bg-roxo/10 text-roxo",
  "Aguardando resposta da loja": "bg-amarelo/30 text-ink",
  "Em atendimento": "bg-whats/15 text-green-800",
  "Aguardando resposta do cliente": "bg-cloud text-steel",
  Interessado: "bg-whats/15 text-green-800",
  "Não respondeu": "bg-cloud text-steel",
  "Convertido em pedido": "bg-whats/15 text-green-800",
  Perdido: "bg-promo/10 text-promo",
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

/** Lista de consultas em cards (funciona igual no desktop e no celular). */
export default function LeadsBoard({ leads }: { leads: LeadRow[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ativas");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { name: string; whatsapp: string; notes: string }>
  >({});
  const [busy, setBusy] = useState(false);

  const rows = useMemo(
    () =>
      leads.filter((l) => {
        if (statusFilter === "ativas") {
          return (
            !l.archived_at &&
            !["Convertido em pedido", "Perdido", "Cancelado"].includes(l.status)
          );
        }
        if (statusFilter === "arquivadas") return Boolean(l.archived_at);
        if (statusFilter === "todas") return !l.archived_at;
        return !l.archived_at && l.status === statusFilter;
      }),
    [leads, statusFilter]
  );

  const draftFor = (l: LeadRow) =>
    drafts[l.id] ?? {
      name: l.customer_name ?? "",
      whatsapp: l.whatsapp ?? "",
      notes: l.notes ?? "",
    };

  const patchDraft = (l: LeadRow, patch: Partial<{ name: string; whatsapp: string; notes: string }>) =>
    setDrafts((prev) => ({ ...prev, [l.id]: { ...draftFor(l), ...patch } }));

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível salvar.");
      return false;
    }
    toast(okMsg);
    router.refresh();
    return true;
  };

  const setStatus = (l: LeadRow, status: LeadStatus) =>
    run(() => updateLead({ id: l.id, status }), `Status: ${status}`);

  const saveContact = (l: LeadRow) => {
    const d = draftFor(l);
    return run(
      () => updateLead({ id: l.id, customerName: d.name, whatsapp: d.whatsapp, notes: d.notes }),
      "Dados da consulta salvos"
    );
  };

  const convert = async (l: LeadRow) => {
    setBusy(true);
    const result = await convertLeadToOrder(l.id);
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível converter.");
      return;
    }
    toast("Pedido criado a partir da consulta ✓");
    router.push("/admin/pedidos");
  };

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar consultas"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:w-auto"
        >
          <option value="ativas">Ativas (em andamento)</option>
          <option value="todas">Todas</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="arquivadas">Arquivadas</option>
        </select>
        <p className="ml-auto text-sm text-steel">
          {rows.length} {rows.length === 1 ? "consulta" : "consultas"}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <MessageSquareText className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Nenhuma consulta por aqui.</p>
          <p className="mt-1 text-sm text-steel">
            Quando alguém tocar num botão de WhatsApp no site, a consulta
            aparece nesta lista automaticamente.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((l) => {
            const d = draftFor(l);
            const open = expanded === l.id;
            return (
              <li key={l.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[l.status] ?? "bg-cloud text-steel"}`}
                  >
                    {l.status}
                  </span>
                  <span className="text-xs text-steel">{fmtDate(l.created_at)}</span>
                  <span className="ml-auto text-xs text-steel">
                    {l.origin === "sacola" ? "Veio da sacola" : l.origin === "produto" ? "Página de produto" : l.origin}
                  </span>
                </div>

                <p className="mt-2 font-semibold text-ink">
                  {l.product_name ?? "Consulta geral"}
                  {l.size ? ` · Tam. ${l.size}` : ""}
                </p>
                <p className="text-xs text-steel">
                  {[
                    l.product_sku,
                    l.version ? `Versão ${l.version}` : null,
                    l.personalization ? `Personalização: ${l.personalization}` : null,
                    l.shown_price ? `Valor exibido: ${brl(Number(l.shown_price))}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sem detalhes do produto"}
                </p>
                {(l.customer_name || l.whatsapp) && (
                  <p className="mt-1 text-sm text-ink">
                    {[l.customer_name, l.whatsapp].filter(Boolean).join(" · ")}
                  </p>
                )}
                {l.notes && !open && (
                  <p className="mt-1 text-xs italic text-steel">“{l.notes}”</p>
                )}

                {/* Status + ações */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={l.status}
                    disabled={busy}
                    onChange={(e) => setStatus(l, e.target.value as LeadStatus)}
                    aria-label="Mudar status da consulta"
                    className="rounded-lg border border-ink/15 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {l.whatsapp && (
                    <a
                      href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-whats px-3 py-2 text-xs font-bold text-white"
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Abrir WhatsApp
                    </a>
                  )}
                  {!l.order_id && (
                    <button
                      onClick={() => convert(l)}
                      disabled={busy}
                      className="flex items-center gap-1.5 rounded-lg bg-roxo px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                      Virar pedido
                    </button>
                  )}
                  <button
                    onClick={() => setExpanded(open ? null : l.id)}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                  >
                    {open ? "Fechar" : "Dados e anotações"}
                  </button>
                  <button
                    onClick={() =>
                      run(
                        () => updateLead({ id: l.id, archived: !l.archived_at }),
                        l.archived_at ? "Consulta restaurada" : "Consulta arquivada"
                      )
                    }
                    disabled={busy}
                    aria-label={l.archived_at ? "Restaurar consulta" : "Arquivar consulta"}
                    title={l.archived_at ? "Restaurar" : "Arquivar"}
                    className="ml-auto rounded-lg p-2 text-steel hover:bg-cloud hover:text-roxo"
                  >
                    <Archive className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {open && (
                  <div className="mt-3 grid gap-2 rounded-lg bg-cloud/40 p-3 sm:grid-cols-2">
                    <input
                      value={d.name}
                      onChange={(e) => patchDraft(l, { name: e.target.value })}
                      placeholder="Nome do cliente"
                      aria-label="Nome do cliente"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <input
                      value={d.whatsapp}
                      onChange={(e) => patchDraft(l, { whatsapp: e.target.value })}
                      placeholder="WhatsApp (ex.: 44 99999-0000)"
                      aria-label="WhatsApp do cliente"
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm"
                    />
                    <textarea
                      value={d.notes}
                      onChange={(e) => patchDraft(l, { notes: e.target.value })}
                      placeholder="Anotações do atendimento"
                      aria-label="Anotações"
                      rows={2}
                      className="rounded-lg border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
                    />
                    <button
                      onClick={() => saveContact(l)}
                      disabled={busy}
                      className="rounded-lg bg-roxo px-4 py-2 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2"
                    >
                      Salvar dados
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
