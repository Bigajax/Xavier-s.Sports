"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/lib/products/types";
import { norm } from "@/lib/catalog";
import { readyUnits, readySizes } from "@/lib/readyStock";
import ProductCard from "@/components/ProductCard";

type SortKey = "mais" | "ultimas" | "nome";

const sortLabels: Record<SortKey, string> = {
  mais: "Mais unidades",
  ultimas: "Últimas unidades",
  nome: "Nome A–Z",
};

/** Ordem de exibição dos tamanhos nos filtros. */
const SIZE_ORDER = ["P", "M", "G", "GG", "2XL", "3XL", "4XL", "XGG"];

type ChipKey = string;

/**
 * Grade de pronta entrega: busca, filtros que só aparecem quando retornam
 * resultado, contagem e ordenação. Tudo em memória sobre a lista já filtrada
 * no servidor (produtos com ao menos um tamanho em estoque).
 */
export default function ProntaEntregaClient({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<ChipKey>("todos");
  const [sort, setSort] = useState<SortKey>("mais");

  // Predicados de cada filtro possível. Só entram na barra os que têm produto.
  const chipDefs = useMemo(() => {
    const defs: { key: ChipKey; label: string; test: (p: Product) => boolean }[] = [
      { key: "todos", label: "Todos", test: () => true },
      { key: "clubes", label: "Clubes", test: (p) => p.teamType === "clube" },
      { key: "selecoes", label: "Seleções", test: (p) => p.teamType === "selecao" },
    ];

    // Tamanhos realmente disponíveis (com estoque) em algum produto.
    const sizeSet = new Set<string>();
    for (const p of products) for (const s of readySizes(p)) sizeSet.add(s);
    const rank = (s: string) => {
      const i = SIZE_ORDER.indexOf(s);
      return i === -1 ? SIZE_ORDER.length : i;
    };
    const sizes = [...sizeSet].sort((a, b) => rank(a) - rank(b));
    for (const s of sizes) {
      defs.push({ key: `size:${s}`, label: s, test: (p) => readySizes(p).includes(s) });
    }

    // Atributos — só se houver produto correspondente.
    const attr: { key: ChipKey; label: string; test: (p: Product) => boolean }[] = [
      { key: "fan", label: "Fan", test: (p) => p.version === "torcedor" },
      { key: "player", label: "Player", test: (p) => p.version === "jogador" },
      { key: "feminina", label: "Feminina", test: (p) => p.audience === "feminino" },
      { key: "longa", label: "Manga longa", test: (p) => p.sleeve === "longa" },
    ];
    for (const a of attr) {
      if (products.some(a.test)) defs.push(a);
    }
    return defs;
  }, [products]);

  const activeDef = chipDefs.find((c) => c.key === active) ?? chipDefs[0];

  const results = useMemo(() => {
    const query = norm(q).split(/\s+/).filter(Boolean);
    const matchesQ = (p: Product) => {
      if (query.length === 0) return true;
      const hay = norm([p.name, p.team, p.country, p.season ?? "", ...p.tags].join(" "));
      return query.every((t) => hay.includes(t));
    };
    const list = products.filter((p) => activeDef.test(p) && matchesQ(p));
    const sorted = [...list];
    if (sort === "mais") sorted.sort((a, b) => readyUnits(b) - readyUnits(a));
    else if (sort === "ultimas") sorted.sort((a, b) => readyUnits(a) - readyUnits(b));
    else sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return sorted;
  }, [products, activeDef, q, sort]);

  return (
    <div>
      {/* Busca + ordenação */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, time ou seleção…"
            aria-label="Buscar camisas à pronta entrega"
            className="w-full rounded-lg border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-roxo"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="pe-ordenar" className="sr-only">
            Ordenar por
          </label>
          <select
            id="pe-ordenar"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-roxo sm:w-auto"
          >
            {Object.entries(sortLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtros — rolagem horizontal no mobile, sem quebra de linha */}
      <div className="mt-4 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div
          className="flex w-max gap-2 md:w-auto md:flex-wrap"
          role="group"
          aria-label="Filtrar por categoria, tamanho e versão"
        >
          {chipDefs.map((c) => {
            const on = c.key === active;
            return (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                aria-pressed={on}
                className={`tap shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-bold transition-colors ${
                  on
                    ? "border-roxo bg-roxo text-white"
                    : "border-ink/15 bg-white text-ink hover:border-roxo"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contagem */}
      <p className="mt-5 text-sm text-steel" aria-live="polite">
        {results.length}{" "}
        {results.length === 1
          ? "camisa à pronta entrega"
          : "camisas à pronta entrega"}
      </p>

      {/* Grade */}
      {results.length === 0 ? (
        <div className="mt-4 rounded-xl border-2 border-dashed border-steel/30 bg-cloud/50 p-10 text-center">
          <p className="display text-2xl text-ink sm:text-3xl">
            Nenhuma camisa com esses filtros.
          </p>
          <p className="mt-3 text-steel">
            Ajuste a busca ou os filtros — ou fale com a equipe pelo WhatsApp
            para consultar outros modelos.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} ready />
          ))}
        </div>
      )}
    </div>
  );
}
