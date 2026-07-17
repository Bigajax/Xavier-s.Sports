"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCatalog } from "@/components/CatalogProvider";
import { applyFilters } from "@/lib/catalog";
import { brl } from "@/lib/format";

/** Atalhos para os destinos mais procurados — editáveis. */
const shortcuts = [
  { label: "Corinthians", href: "/clubes/corinthians" },
  { label: "São Paulo", href: "/clubes/sao-paulo" },
  { label: "Palmeiras", href: "/clubes/palmeiras" },
  { label: "Brasil", href: "/selecoes/brasil" },
  { label: "Portugal", href: "/selecoes/portugal" },
  { label: "Retrô", href: "/retro" },
  { label: "Ver todas", href: "/catalogo" },
];

/**
 * Busca da home: campo grande com resultados inline e atalhos por time.
 * Enter leva ao catálogo filtrado; clicar num resultado abre o produto.
 */
export default function HomeSearch() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { products } = useCatalog();

  const results = useMemo(
    () => (q.trim() ? applyFilters(products, { q }).slice(0, 5) : []),
    [q, products]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/catalogo?q=${encodeURIComponent(q.trim())}`);
  };

  const showResults = focused && q.trim() !== "";

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto max-w-2xl"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) {
          setFocused(false);
        }
      }}
    >
      <form
        onSubmit={submit}
        role="search"
        className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white p-2 pl-5 shadow-sm transition-colors focus-within:border-roxo"
      >
        <Search className="h-5 w-5 shrink-0 text-steel" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Busque por time, seleção ou jogador"
          aria-label="Buscar por time, seleção ou jogador"
          className="w-full bg-transparent py-2 text-base outline-none placeholder:text-steel"
        />
        <button
          type="submit"
          className="tap xavier-tag shrink-0 bg-roxo px-5 py-2.5 text-sm text-white transition-colors hover:bg-roxo-escuro"
        >
          <span>Buscar</span>
        </button>
      </form>

      {showResults && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-ink/10">
          {results.length === 0 ? (
            <p className="p-5 text-center text-sm text-steel">
              Nenhuma camisa encontrada — tente outro time ou temporada, ou
              consulte a equipe pelo WhatsApp.
            </p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.slug} className="border-b border-cloud last:border-0">
                  <Link
                    href={`/produto/${p.slug}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-cloud/50"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {p.name}
                      </span>
                      <span className="block text-xs text-steel">
                        {p.team}
                        {p.season ? ` · ${p.season}` : ""}
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
                  className="text-sm font-semibold text-roxo hover:underline"
                >
                  Ver todos os resultados no catálogo →
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-full border border-ink/10 bg-white px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-roxo hover:text-roxo"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
