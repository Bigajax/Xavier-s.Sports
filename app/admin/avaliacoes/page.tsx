"use client";

import { useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useAdminCollection, type ReviewRecord } from "@/lib/adminStore";
import { toast } from "@/components/Toaster";

export default function AdminAvaliacoes() {
  const { items, ready, add, update, remove } = useAdminCollection<ReviewRecord>(
    "avaliacoes",
    []
  );
  const [form, setForm] = useState({
    nome: "",
    cidade: "",
    avaliacao: "5",
    comentario: "",
    produto: "",
  });

  if (!ready) return <p className="text-steel">Carregando…</p>;

  const field = "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="display text-3xl text-ink">Avaliações</h1>
      <p className="mt-1 text-sm text-steel">
        Cadastre somente avaliações reais e autorizadas pelos clientes. O site
        exibe “em breve” enquanto não houver avaliações aprovadas.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.nome || !form.comentario) {
              toast("Preencha nome e comentário");
              return;
            }
            add({
              id: `r-${Date.now() % 100000}-${items.length}`,
              nome: form.nome,
              cidade: form.cidade,
              avaliacao: Number(form.avaliacao),
              comentario: form.comentario,
              produto: form.produto,
              aprovado: false,
            });
            setForm({ nome: "", cidade: "", avaliacao: "5", comentario: "", produto: "" });
            toast("Avaliação cadastrada (aguardando aprovação)");
          }}
          className="space-y-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5"
        >
          <h2 className="display-upright text-lg text-ink">Nova avaliação</h2>
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Nome do cliente"
            aria-label="Nome do cliente"
            className={field}
          />
          <input
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
            placeholder="Cidade"
            aria-label="Cidade"
            className={field}
          />
          <input
            value={form.produto}
            onChange={(e) => setForm({ ...form, produto: e.target.value })}
            placeholder="Produto comprado"
            aria-label="Produto comprado"
            className={field}
          />
          <select
            value={form.avaliacao}
            onChange={(e) => setForm({ ...form, avaliacao: e.target.value })}
            aria-label="Nota"
            className={field}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrela{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <textarea
            value={form.comentario}
            onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            placeholder="Comentário"
            aria-label="Comentário"
            rows={3}
            className={field}
          />
          <p className="text-xs text-steel">
            O envio de foto do cliente será ativado em uma próxima atualização.
          </p>
          <button className="w-full rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white">
            Cadastrar avaliação
          </button>
        </form>

        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-steel/30 bg-white p-10 text-center text-steel">
              Nenhuma avaliação cadastrada — o site exibe “Avaliações de
              clientes serão adicionadas em breve.”
            </p>
          ) : (
            items.map((r) => (
              <div key={r.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex gap-0.5" aria-label={`${r.avaliacao} de 5 estrelas`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.avaliacao ? "fill-amarelo text-amarelo" : "text-steel/30"
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-ink/80">“{r.comentario}”</p>
                    <p className="mt-2 text-xs font-semibold text-steel">
                      {r.nome}
                      {r.cidade ? ` · ${r.cidade}` : ""}
                      {r.produto ? ` · ${r.produto}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => {
                        update(r.id, { aprovado: !r.aprovado });
                        toast(r.aprovado ? "Avaliação despublicada" : "Avaliação aprovada");
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        r.aprovado
                          ? "bg-whats/15 text-green-800"
                          : "bg-cloud text-steel"
                      }`}
                    >
                      {r.aprovado ? "Aprovada" : "Pendente"}
                    </button>
                    <button
                      onClick={() => {
                        remove(r.id);
                        toast("Avaliação removida");
                      }}
                      aria-label="Remover avaliação"
                      className="rounded p-1.5 text-steel hover:text-promo"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
