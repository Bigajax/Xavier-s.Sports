"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCatalog } from "@/components/CatalogProvider";
import { applyFilters } from "@/lib/catalog";
import { brl } from "@/lib/format";

const suggestions = [
  "Corinthians branca",
  "São Paulo 2025",
  "Portugal feminina",
  "Barcelona retrô",
  "Brasil amarela",
  "Japão branca",
];

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useCatalog();

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 50);
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [open, onClose]);

  const results = useMemo(
    () => (q.trim() ? applyFilters(products, { q }).slice(0, 8) : []),
    [q, products]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-ink/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Buscar camisas"
        >
          <div className="mx-auto max-w-2xl px-4 pt-20">
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-2xl">
              <Search className="h-5 w-5 shrink-0 text-steel" aria-hidden="true" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busque por time, seleção, temporada, cor..."
                className="w-full bg-transparent text-base outline-none placeholder:text-steel"
                aria-label="Buscar por time, seleção, temporada ou cor"
              />
              <button
                onClick={onClose}
                aria-label="Fechar busca"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 max-h-[65vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
              {q.trim() === "" ? (
                <div className="p-5">
                  <p className="xavier-eyebrow text-roxo">Buscas populares</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQ(s)}
                        className="rounded-full border border-cloud bg-cloud/60 px-3 py-1.5 text-sm hover:border-roxo hover:text-roxo"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="display text-xl text-ink">
                    Nenhuma camisa entrou em campo com essa busca.
                  </p>
                  <p className="mt-2 text-sm text-steel">
                    Tente outro time, temporada ou cor — ou consulte a equipe
                    pelo WhatsApp.
                  </p>
                </div>
              ) : (
                <ul>
                  {results.map((p) => (
                    <li key={p.slug} className="border-b border-cloud last:border-0">
                      <Link
                        href={`/produto/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-cloud/50"
                      >
                        <span>
                          <span className="block text-sm font-semibold">
                            {p.name}
                          </span>
                          <span className="block text-xs text-steel">
                            {p.team} · {p.season} · {p.version}
                          </span>
                        </span>
                        <span className="tabular-nums text-sm font-bold text-roxo">
                          {brl(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li className="bg-cloud/40 px-5 py-3 text-center">
                    <Link
                      href={`/catalogo?q=${encodeURIComponent(q)}`}
                      onClick={onClose}
                      className="text-sm font-semibold text-roxo hover:underline"
                    >
                      Ver todos os resultados no catálogo →
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
