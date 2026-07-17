"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Star } from "lucide-react";

/** Link público de avaliação — a loja envia após a entrega. */
export default function AvaliarPage() {
  const [form, setForm] = useState({
    customerName: "",
    city: "",
    productName: "",
    orderNumber: "",
    comment: "",
  });
  const [rating, setRating] = useState(5);
  const [authorized, setAuthorized] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating, authorized }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Não foi possível enviar agora.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";

  return (
    <div className="mx-auto max-w-lg px-4 py-14 md:px-6">
      <p className="xavier-eyebrow text-roxo">Sua opinião</p>
      <h1 className="display mt-2 text-4xl text-ink">
        <span className="swoosh">Avalie sua compra</span>
      </h1>
      <p className="mt-3 text-steel">
        Conte como foi a experiência com a Xavier&apos;s Sports — sua avaliação
        passa pela aprovação da equipe antes de aparecer no site.
      </p>

      {sent ? (
        <div className="mt-8 rounded-2xl bg-whats/10 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-whats" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-ink">Avaliação enviada!</p>
          <p className="mt-1 text-sm text-steel">
            Obrigado por contar como foi — a equipe revisa e publica em breve.
          </p>
          <Link href="/" className="mt-5 inline-block rounded-lg bg-roxo px-6 py-3 text-sm font-bold text-white">
            Voltar à loja
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <div>
            <p className="mb-1 text-xs font-bold text-ink">Sua nota</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                  aria-pressed={rating === n}
                  className="rounded p-1"
                >
                  <Star
                    className={`h-8 w-8 ${n <= rating ? "fill-amarelo text-amarelo" : "text-ink/20"}`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input required value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="Seu nome" aria-label="Seu nome" className={input} />
            <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Cidade (opcional)" aria-label="Cidade" className={input} />
            <input value={form.productName} onChange={(e) => set("productName", e.target.value)} placeholder="Camisa comprada (opcional)" aria-label="Camisa comprada" className={input} />
            <input value={form.orderNumber} onChange={(e) => set("orderNumber", e.target.value)} placeholder="Nº do pedido (opcional)" aria-label="Número do pedido" className={input} />
          </div>
          <textarea
            required
            value={form.comment}
            onChange={(e) => set("comment", e.target.value)}
            rows={4}
            maxLength={600}
            placeholder="Como foi a experiência? Tamanho, qualidade, atendimento, entrega..."
            aria-label="Comentário"
            className={input}
          />
          <label className="flex cursor-pointer items-start gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-roxo"
            />
            Autorizo a publicação da minha avaliação (com nome e cidade) no site
            da Xavier&apos;s Sports.
          </label>
          {error && <p className="text-sm font-semibold text-promo">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="tap xavier-tag w-full bg-roxo px-6 py-3.5 text-center text-sm text-white disabled:opacity-60"
          >
            <span>{busy ? "Enviando..." : "Enviar avaliação"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
