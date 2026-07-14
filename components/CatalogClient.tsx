"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { products, type Product } from "@/data/products";
import {
  applyFilters,
  facets,
  sortLabels,
  sortProducts,
  type Filters,
  type SortKey,
} from "@/lib/catalog";
import { getCategory } from "@/data/categories";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import ProductGrid from "@/components/ProductGrid";

const PAGE_SIZE = 12;

const versionLabels: Record<string, string> = {
  torcedor: "Torcedor",
  jogador: "Jogador",
  treino: "Treino",
  "pre-jogo": "Pré-jogo",
  goleiro: "Goleiro",
  retro: "Retrô",
};

const audienceLabels: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  infantil: "Infantil",
  unissex: "Unissex",
};

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-ink/10 py-4">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="display-upright text-sm text-ink">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-steel transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink/80 hover:text-roxo">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-roxo"
      />
      {label}
    </label>
  );
}

export default function CatalogClient({
  title = "Encontre a sua próxima camisa",
  subtitle = "Pesquise por time, seleção, temporada, tamanho ou categoria.",
  baseFilters = {},
  hideTeamFilter = false,
}: {
  title?: string;
  subtitle?: string;
  baseFilters?: Filters;
  hideTeamFilter?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();

  // filtros vindos da URL
  const urlFilters: Filters = useMemo(() => {
    const f: Filters = {};
    const q = params.get("q");
    if (q) f.q = q;
    const cat = params.get("categoria");
    if (cat) Object.assign(f, getCategory(cat)?.filters ?? {});
    const liga = params.get("liga");
    if (liga) f.league = liga;
    const time = params.get("time");
    if (time) f.teamSlug = time;
    const decada = params.get("decada");
    if (decada) f.decade = decada;
    return f;
  }, [params]);

  const [local, setLocal] = useState<Filters>({});
  const [sort, setSort] = useState<SortKey>("recentes");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const merged: Filters = { ...baseFilters, ...urlFilters, ...local };

  const filtered = useMemo(
    () => sortProducts(applyFilters(products, merged), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(merged), sort]
  );

  const pooled = useMemo(
    () => applyFilters(products, { ...baseFilters, ...urlFilters }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(baseFilters), JSON.stringify(urlFilters)]
  );
  const f = facets(pooled);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const set = (patch: Partial<Filters>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };
  const toggleValue = (key: keyof Filters, value: string) =>
    set({ [key]: merged[key] === value ? undefined : value } as Partial<Filters>);

  const hasActive =
    Object.values(local).some((v) => v !== undefined) ||
    Object.keys(urlFilters).length > 0;

  const clearAll = () => {
    setLocal({});
    setPage(1);
    router.replace("/catalogo");
  };

  const filterPanel = (
    <div>
      {!hideTeamFilter && (
        <FilterGroup title="Time ou seleção">
          <select
            value={merged.teamSlug ?? ""}
            onChange={(e) => set({ teamSlug: e.target.value || undefined })}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
            aria-label="Filtrar por time ou seleção"
          >
            <option value="">Todos</option>
            {teams.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </FilterGroup>
      )}

      <FilterGroup title="Coleção">
        <Check
          label="Atual"
          checked={merged.collection === "atual"}
          onChange={() => toggleValue("collection", "atual")}
        />
        <Check
          label="Retrô"
          checked={merged.collection === "retro"}
          onChange={() => toggleValue("collection", "retro")}
        />
      </FilterGroup>

      <FilterGroup title="Campeonato" defaultOpen={false}>
        {leagues.map((l) => (
          <Check
            key={l.slug}
            label={l.name}
            checked={merged.league === l.slug}
            onChange={() => toggleValue("league", l.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Versão">
        {f.versions.map((v) => (
          <Check
            key={v}
            label={versionLabels[v] ?? v}
            checked={merged.version === v}
            onChange={() => toggleValue("version", v)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Público">
        {f.audiences.map((a) => (
          <Check
            key={a}
            label={audienceLabels[a] ?? a}
            checked={merged.audience === a}
            onChange={() => toggleValue("audience", a)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Tamanho" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {f.sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleValue("size", s)}
              aria-pressed={merged.size === s}
              className={`min-w-10 rounded-lg border px-2.5 py-1.5 text-sm font-semibold ${
                merged.size === s
                  ? "border-roxo bg-roxo text-white"
                  : "border-ink/15 bg-white text-ink hover:border-roxo"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Cor" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {f.colors.map((c) => (
            <button
              key={c}
              onClick={() => toggleValue("color", c)}
              aria-pressed={merged.color === c}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                merged.color === c
                  ? "border-roxo bg-roxo text-white"
                  : "border-ink/15 bg-white text-ink hover:border-roxo"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Preço" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="preco-min">
            Preço mínimo
          </label>
          <input
            id="preco-min"
            type="number"
            inputMode="numeric"
            placeholder="Mín"
            value={merged.priceMin ?? ""}
            onChange={(e) =>
              set({ priceMin: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
          <span className="text-steel">—</span>
          <label className="sr-only" htmlFor="preco-max">
            Preço máximo
          </label>
          <input
            id="preco-max"
            type="number"
            inputMode="numeric"
            placeholder="Máx"
            value={merged.priceMax ?? ""}
            onChange={(e) =>
              set({ priceMax: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Mais opções" defaultOpen={false}>
        <Check
          label="Somente disponíveis"
          checked={!!merged.onlyAvailable}
          onChange={() => set({ onlyAvailable: merged.onlyAvailable ? undefined : true })}
        />
        <Check
          label="Personalizáveis"
          checked={!!merged.onlyPersonalizable}
          onChange={() =>
            set({ onlyPersonalizable: merged.onlyPersonalizable ? undefined : true })
          }
        />
        <Check
          label="Em oferta"
          checked={!!merged.onlyOnSale}
          onChange={() => set({ onlyOnSale: merged.onlyOnSale ? undefined : true })}
        />
        <Check
          label="Manga longa"
          checked={merged.sleeve === "longa"}
          onChange={() => toggleValue("sleeve", "longa")}
        />
      </FilterGroup>

      {hasActive && (
        <button
          onClick={clearAll}
          className="mt-4 w-full rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:border-promo hover:text-promo"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <header>
        <p className="xavier-eyebrow text-roxo">Catálogo</p>
        <h1 className="display mt-2 text-4xl text-ink sm:text-5xl">
          <span className="swoosh">{title}</span>
        </h1>
        <p className="mt-3 text-steel">{subtitle}</p>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-steel" aria-live="polite">
          {filtered.length}{" "}
          {filtered.length === 1 ? "camisa encontrada" : "camisas encontradas"}
        </p>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-2 text-sm font-bold lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filtrar
          </button>
          <label className="sr-only" htmlFor="ordenar">
            Ordenar por
          </label>
          <select
            id="ordenar"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(sortLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* sidebar desktop */}
        <aside className="hidden lg:block" aria-label="Filtros">
          {filterPanel}
        </aside>

        <div>
          {pageItems.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-steel/30 bg-cloud/50 p-12 text-center">
              <p className="display text-3xl text-ink">
                Nenhuma camisa entrou em campo com esses filtros.
              </p>
              <p className="mt-3 text-steel">
                Ajuste os filtros ou consulte a equipe — pode ser que a camisa
                exista fora do catálogo do site.
              </p>
              <button
                onClick={clearAll}
                className="xavier-tag mt-6 bg-roxo px-6 py-3 text-sm text-white"
              >
                <span>Limpar filtros</span>
              </button>
            </div>
          ) : (
            <>
              <ProductGrid products={pageItems} />
              {totalPages > 1 && (
                <nav
                  aria-label="Paginação"
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setPage(n);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      aria-current={page === n ? "page" : undefined}
                      className={`h-10 w-10 rounded-lg text-sm font-bold ${
                        page === n
                          ? "bg-roxo text-white"
                          : "border border-ink/15 text-ink hover:border-roxo"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      {/* drawer de filtros mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-ink/70 lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar filtros"
            />
            <motion.aside
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-x-0 bottom-0 z-[56] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="display text-2xl text-ink">Filtros</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fechar filtros"
                  className="rounded-lg p-2 hover:bg-cloud"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {filterPanel}
              <button
                onClick={() => setDrawerOpen(false)}
                className="xavier-tag mt-5 w-full bg-roxo px-6 py-3.5 text-center text-sm text-white"
              >
                <span>Ver {filtered.length} resultados</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
