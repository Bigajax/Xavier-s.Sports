"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  exchangeStatuses,
  useAdminCollection,
  type ExchangeRecord,
  type ExchangeStatus,
} from "@/lib/adminStore";
import { toast } from "@/components/Toaster";

const seed: ExchangeRecord[] = [
  {
    id: "demo-1",
    protocolo: "XS-TROCA-001",
    cliente: "Cliente demonstrativo",
    pedido: "PED-0042",
    motivo: "Troca de tamanho",
    produto: "Camisa Corinthians Home — Versão Torcedor",
    tamanhoAtual: "M",
    tamanhoSolicitado: "G",
    data: "2026-07-10",
    status: "Em análise",
  },
];

export default function AdminTrocas() {
  const { items, ready, add, update } = useAdminCollection<ExchangeRecord>(
    "trocas",
    seed
  );
  const [justifying, setJustifying] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  if (!ready) return <p className="text-steel">Carregando…</p>;

  const setStatus = (rec: ExchangeRecord, status: ExchangeStatus) => {
    if (status === "Recusada") {
      setJustifying(rec.id);
      setReason(rec.justificativaRecusa ?? "");
      return;
    }
    update(rec.id, { status });
    toast(`Status atualizado: ${status}`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Trocas e devoluções</h1>
          <p className="mt-1 text-sm text-steel">
            Registros demonstrativos salvos neste navegador. Recusas exigem
            justificativa interna.
          </p>
        </div>
        <button
          onClick={() => {
            add({
              id: `t-${Date.now() % 100000}-${items.length}`,
              protocolo: `XS-TROCA-${String(items.length + 1).padStart(3, "0")}`,
              cliente: "Novo cliente (edite)",
              pedido: "PED-0000",
              motivo: "Troca de tamanho",
              produto: "Produto (edite)",
              data: new Date().toISOString().slice(0, 10),
              status: "Nova solicitação",
            });
            toast("Solicitação registrada (demo)");
          }}
          className="flex items-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar solicitação
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {items.map((rec) => (
          <div key={rec.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs font-bold tracking-widest text-roxo">
                  {rec.protocolo}
                </p>
                <h2 className="mt-1 font-bold text-ink">{rec.produto}</h2>
                <p className="text-sm text-steel">
                  {rec.cliente} · Pedido {rec.pedido} · {rec.data}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-semibold">{rec.motivo}</span>
                  {rec.tamanhoAtual && rec.tamanhoSolicitado && (
                    <span className="text-steel">
                      {" "}
                      — de {rec.tamanhoAtual} para {rec.tamanhoSolicitado}
                    </span>
                  )}
                </p>
                {rec.status === "Recusada" && rec.justificativaRecusa && (
                  <p className="mt-2 rounded-lg bg-promo/10 p-2 text-xs text-promo">
                    Justificativa interna: {rec.justificativaRecusa}
                  </p>
                )}
              </div>
              <div className="w-56">
                <label
                  htmlFor={`status-${rec.id}`}
                  className="mb-1 block text-xs font-bold text-steel"
                >
                  Status
                </label>
                <select
                  id={`status-${rec.id}`}
                  value={rec.status}
                  onChange={(e) => setStatus(rec, e.target.value as ExchangeStatus)}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
                >
                  {exchangeStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {justifying === rec.id && (
              <div className="mt-4 rounded-lg border border-promo/40 bg-promo/5 p-4">
                <label htmlFor={`just-${rec.id}`} className="mb-1 block text-sm font-bold text-ink">
                  Justificativa interna da recusa (obrigatória)
                </label>
                <textarea
                  id={`just-${rec.id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      if (reason.trim().length < 5) {
                        toast("Descreva a justificativa da recusa");
                        return;
                      }
                      update(rec.id, {
                        status: "Recusada",
                        justificativaRecusa: reason.trim(),
                      });
                      setJustifying(null);
                      toast("Solicitação recusada com justificativa");
                    }}
                    className="rounded-lg bg-promo px-4 py-2 text-sm font-bold text-white"
                  >
                    Confirmar recusa
                  </button>
                  <button
                    onClick={() => setJustifying(null)}
                    className="rounded-lg border border-ink/15 px-4 py-2 text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
