"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Plus, Star, Trash2, X } from "lucide-react";
import { REVIEW_STATUSES, type ReviewRow } from "@/lib/atendimento";
import {
  deleteReview,
  saveReview,
  updateReviewStatus,
} from "@/app/admin/atendimento/actions";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { toast } from "@/components/Toaster";

const tone: Record<string, string> = {
  "Aguardando aprovação": "bg-amarelo/30 text-ink",
  Publicada: "bg-whats/15 text-green-800",
  Oculta: "bg-cloud text-steel",
  Recusada: "bg-promo/10 text-promo",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amarelo text-amarelo" : "text-ink/15"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/** Avaliações em cards: aprovar, ocultar, destacar, excluir. */
export default function ReviewsBoard({ rows }: { rows: ReviewRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("Aguardando aprovação");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ReviewRow | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(
    () => rows.filter((r) => (filter === "todas" ? true : r.status === filter)),
    [rows, filter]
  );

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      toast(result.error ?? "Não foi possível salvar.");
      return;
    }
    toast(msg);
    router.refresh();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/avaliar`);
      toast("Link copiado — envie para o cliente ✓");
    } catch {
      toast(`Link: ${window.location.origin}/avaliar`);
    }
  };

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filtrar avaliações"
          className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:w-auto"
        >
          <option value="todas">Todas</option>
          {REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm font-bold text-ink"
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Copiar link de avaliação
        </button>
        <button
          onClick={() => setCreating(true)}
          className="tap flex w-full items-center justify-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white sm:ml-auto sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Cadastrar avaliação
        </button>
      </div>

      {list.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <Star className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Nenhuma avaliação neste filtro.</p>
          <p className="mt-1 text-sm text-steel">
            Envie o link /avaliar para clientes após a entrega — as respostas
            entram aqui aguardando a sua aprovação.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((r) => (
            <li key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
              <div className="flex flex-wrap items-center gap-2">
                <Stars rating={r.rating} />
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone[r.status]}`}>
                  {r.status}
                </span>
                {r.highlight && (
                  <span className="rounded-full bg-roxo/10 px-2.5 py-1 text-xs font-bold text-roxo">
                    ★ Destaque
                  </span>
                )}
                <span className="ml-auto text-xs text-steel">
                  {new Date(r.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">“{r.comment}”</p>
              <p className="mt-1.5 text-xs text-steel">
                {[r.customer_name, r.city, r.product_name, r.order_number]
                  .filter(Boolean)
                  .join(" · ")}
                {r.verified ? " · compra verificada" : ""}
                {!r.authorized ? " · SEM autorização de publicação" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "Publicada" && (
                  <button
                    onClick={() =>
                      run(() => updateReviewStatus({ id: r.id, status: "Publicada" }), "Avaliação publicada ✓")
                    }
                    disabled={busy || !r.authorized}
                    title={!r.authorized ? "Cliente não autorizou a publicação" : undefined}
                    className="rounded-lg bg-whats px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Publicar
                  </button>
                )}
                {r.status === "Publicada" && (
                  <button
                    onClick={() =>
                      run(() => updateReviewStatus({ id: r.id, status: "Oculta" }), "Avaliação oculta")
                    }
                    disabled={busy}
                    className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                  >
                    Ocultar
                  </button>
                )}
                {r.status === "Aguardando aprovação" && (
                  <button
                    onClick={() =>
                      run(() => updateReviewStatus({ id: r.id, status: "Recusada" }), "Avaliação recusada")
                    }
                    disabled={busy}
                    className="rounded-lg border border-promo/40 px-3 py-2 text-xs font-bold text-promo"
                  >
                    Recusar
                  </button>
                )}
                <button
                  onClick={() =>
                    run(
                      () => updateReviewStatus({ id: r.id, highlight: !r.highlight }),
                      r.highlight ? "Destaque removido" : "Marcada como destaque ★"
                    )
                  }
                  disabled={busy}
                  className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-bold text-ink"
                >
                  {r.highlight ? "Tirar destaque" : "Destacar"}
                </button>
                <button
                  onClick={() => setConfirmDelete(r)}
                  disabled={busy}
                  aria-label="Excluir avaliação"
                  className="ml-auto rounded-lg p-2 text-steel hover:bg-cloud hover:text-promo"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <ReviewModal
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Excluir avaliação?"
          message={`A avaliação de ${confirmDelete.customer_name} será excluída definitivamente.`}
          confirmLabel="Excluir"
          danger
          busy={busy}
          onConfirm={async () => {
            const r = confirmDelete;
            setConfirmDelete(null);
            await run(() => deleteReview(r.id), "Avaliação excluída");
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

function ReviewModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    customerName: "",
    city: "",
    productName: "",
    orderNumber: "",
    rating: 5,
    comment: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setBusy(true);
    const result = await saveReview({
      ...form,
      rating: Number(form.rating),
      verified: true,
      authorized: true,
    });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Avaliação cadastrada — aprove para publicar ✓");
    onSaved();
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cadastrar avaliação"
    >
      <div className="my-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="display text-2xl text-ink">Cadastrar avaliação</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-steel hover:bg-cloud">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Nome do cliente" aria-label="Nome" className={input} />
          <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Cidade" aria-label="Cidade" className={input} />
          <input value={form.productName} onChange={(e) => set("productName", e.target.value)} placeholder="Produto" aria-label="Produto" className={input} />
          <select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} aria-label="Nota" className={`${input} bg-white`}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrela{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <textarea value={form.comment} onChange={(e) => set("comment", e.target.value)} rows={3} placeholder="Comentário" aria-label="Comentário" className={`${input} sm:col-span-2`} />
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
