"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  PackageCheck,
  RotateCw,
  Search,
  SearchX,
  X,
} from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import ProductImage from "@/components/ProductImage";
import { useCatalog } from "@/components/CatalogProvider";
import { useSearchUI } from "@/components/SearchProvider";
import {
  isReadyToShip,
  searchProducts,
  searchScopes,
  versionLabels,
  type SearchScope,
} from "@/lib/search";
import {
  clearRecentSearches,
  readRecentSearches,
  saveRecentSearch,
} from "@/lib/recentSearches";
import { brl } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/products/types";

/** Mínimo de letras para valer uma busca — 1 letra traz o catálogo inteiro. */
const MIN_CHARS = 2;
/** Espera entre a última tecla e a busca. */
const DEBOUNCE_MS = 220;
/** Resultados na folha; o restante vai para o catálogo. */
const MAX_RESULTS = 30;
/** Duração da saída — precisa casar com `search-out` no globals.css. */
const EXIT_MS = 150;

const POPULAR = [
  "Corinthians",
  "Palmeiras",
  "São Paulo",
  "Brasil",
  "Portugal",
  "Retrô",
];

function countLabel(n: number): string {
  return n === 1 ? "1 produto encontrado" : `${n} produtos encontrados`;
}

/**
 * Camada de pesquisa. No mobile ocupa a tela inteira (o teclado é o único
 * outro elemento na tela); no desktop vira um diálogo centralizado. Montada
 * uma única vez no layout e aberta pelo header ou pela busca da home.
 */
export default function SearchOverlay() {
  const { open, initialQuery, closeSearch } = useSearchUI();
  const [render, setRender] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      setClosing(false);
      return;
    }
    if (!render) return;
    setClosing(true);
    const t = setTimeout(() => {
      setRender(false);
      setClosing(false);
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [open, render]);

  if (!render) return null;
  return (
    <SearchSheet
      closing={closing}
      initialQuery={initialQuery}
      onClose={closeSearch}
    />
  );
}

function SearchSheet({
  closing,
  initialQuery,
  onClose,
}: {
  closing: boolean;
  initialQuery: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { products, error: catalogError } = useCatalog();

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  /** Termo efetivamente buscado (depois do debounce). */
  const [committed, setCommitted] = useState(
    initialQuery.trim().length >= MIN_CHARS ? initialQuery.trim() : ""
  );
  const [searching, setSearching] = useState(false);
  const [scope, setScope] = useState<SearchScope>("todos");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => setRecent(readRecentSearches()), []);

  // ---------- foco ----------
  // O foco precisa acontecer ainda dentro do toque que abriu a folha, senão o
  // iOS não abre o teclado — por isso layout effect, e não setTimeout.
  useLayoutEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // ---------- trava a página atrás ----------
  useEffect(() => {
    const y = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      Object.assign(body.style, prev);
      // `scroll-behavior: smooth` animaria a volta; restaura seco.
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      html.style.scrollBehavior = prevBehavior;
    };
  }, []);

  // ---------- altura real da viewport ----------
  // No iPhone (e nos navegadores internos do Instagram e do WhatsApp) o
  // teclado encolhe a viewport visual sem mudar a layout viewport: sem isto,
  // os últimos resultados ficam embaixo do teclado.
  useEffect(() => {
    const el = rootRef.current;
    const vv = window.visualViewport;
    if (!el || !vv) return;
    const compact = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (compact.matches) {
        el.style.height = `${vv.height}px`;
        el.style.top = `${vv.offsetTop}px`;
      } else {
        el.style.height = "";
        el.style.top = "";
      }
    };
    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    compact.addEventListener("change", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      compact.removeEventListener("change", apply);
    };
  }, []);

  // ---------- busca enquanto digita ----------
  const term = query.trim();
  useEffect(() => {
    if (term.length < MIN_CHARS) {
      setCommitted("");
      setSearching(false);
      return;
    }
    if (term === committed) {
      setSearching(false);
      return;
    }
    setSearching(true);
    // O cleanup cancela a busca anterior a cada tecla — só a última roda.
    const t = setTimeout(() => {
      setCommitted(term);
      setSearching(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [term, committed]);

  const results = useMemo(
    () => (committed ? searchProducts(products, committed, scope) : []),
    [products, committed, scope]
  );

  const close = useCallback(() => {
    inputRef.current?.blur();
    onClose();
  }, [onClose]);

  /** Busca imediata (chip, histórico, Enter) — sem esperar o debounce. */
  const runSearch = useCallback((value: string) => {
    const clean = value.trim();
    setQuery(clean);
    if (clean.length >= MIN_CHARS) {
      setCommitted(clean);
      setSearching(false);
      setRecent(saveRecentSearch(clean));
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.length < MIN_CHARS) return;
    runSearch(term);
    // fecha o teclado: a lista ganha a tela inteira
    inputRef.current?.blur();
  };

  const clearQuery = () => {
    setQuery("");
    setCommitted("");
    setSearching(false);
    setScope("todos");
    inputRef.current?.focus({ preventScroll: true });
  };

  /** Ao abrir um produto, guarda o termo e fecha a folha. */
  const pick = () => {
    if (committed) setRecent(saveRecentSearch(committed));
    onClose();
  };

  // ---------- teclado ----------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const root = rootRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const showInitial = term.length < MIN_CHARS;
  const showSkeleton = !catalogError && searching && results.length === 0;
  const showEmpty =
    !catalogError && !showInitial && !searching && results.length === 0;

  return (
    <div
      ref={rootRef}
      className="search-root font-system"
      data-state={closing ? "closing" : "open"}
      onKeyDown={onKeyDown}
    >
      {/* fundo escurecido só no desktop; no mobile a folha é a própria tela */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Fechar pesquisa"
        onClick={close}
        className="absolute inset-0 hidden cursor-default bg-ink/60 backdrop-blur-sm md:block"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar camisas"
        className="search-sheet relative mx-auto flex h-full w-full flex-col bg-white md:mt-[8vh] md:h-auto md:max-h-[76vh] md:w-[min(40rem,92vw)] md:overflow-hidden md:rounded-2xl md:shadow-2xl"
      >
        {/* ---------- cabeçalho ---------- */}
        <div className="shrink-0 border-b border-ink/[0.07] px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+0.625rem)] md:pt-2.5">
          <form role="search" onSubmit={submit} className="flex items-center gap-1">
            <div className="search-field flex h-12 min-w-0 flex-1 items-center gap-1.5 rounded-[13px] bg-[#F2F2F7] pl-2.5 pr-0.5">
              <Search
                className="h-[18px] w-[18px] shrink-0 text-steel"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por time, camisa ou temporada"
                aria-label="Buscar por time, camisa ou temporada"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                enterKeyHint="search"
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-steel"
              />
              {query !== "" && (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="Limpar pesquisa"
                  className="flex h-11 w-11 shrink-0 scale-100 items-center justify-center transition-transform duration-150 active:scale-90"
                >
                  <span className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-steel/50">
                    <X
                      className="h-3.5 w-3.5 text-white"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={close}
              className="h-12 shrink-0 rounded-lg px-1.5 text-[15px] font-medium text-roxo transition-colors active:bg-roxo/5"
            >
              Cancelar
            </button>
          </form>
        </div>

        {/* ---------- escopos ---------- */}
        {!showInitial && !catalogError && (
          <div className="no-scrollbar shrink-0 overflow-x-auto border-b border-ink/[0.07] px-3 py-2">
            <div className="flex w-max gap-2">
              {searchScopes.map((s) => {
                const active = scope === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setScope(s.key)}
                    aria-pressed={active}
                    className={`flex h-11 items-center rounded-full px-4 text-[14px] font-medium transition-colors ${
                      active
                        ? "bg-roxo text-white"
                        : "bg-[#F2F2F7] text-ink/70 active:bg-[#E5E5EA]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------- conteúdo ---------- */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(24px+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
          aria-busy={searching}
        >
          {catalogError ? (
            <CatalogErrorState onRetry={() => router.refresh()} />
          ) : showInitial ? (
            <InitialState
              recent={recent}
              onPick={runSearch}
              onClearRecent={() => setRecent(clearRecentSearches())}
            />
          ) : showSkeleton ? (
            <ResultSkeleton />
          ) : showEmpty ? (
            <EmptyState
              term={term}
              onClear={clearQuery}
              onNavigate={pick}
            />
          ) : (
            <div className="search-fade">
              <p
                className="px-4 pb-1 pt-3 text-[13px] text-steel"
                aria-live="polite"
              >
                {countLabel(results.length)}
              </p>
              <ul className="divide-y divide-ink/[0.07]">
                {results.slice(0, MAX_RESULTS).map((p) => (
                  <ResultRow key={p.slug} product={p} onPick={pick} />
                ))}
              </ul>
              {results.length > MAX_RESULTS && (
                <div className="px-4 pt-3">
                  <Link
                    href={`/catalogo?q=${encodeURIComponent(committed)}`}
                    onClick={pick}
                    className="flex h-12 items-center justify-center rounded-xl bg-[#F2F2F7] text-[15px] font-semibold text-roxo"
                  >
                    Ver os {results.length} resultados no catálogo
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- peças ----------

function ResultRow({
  product,
  onPick,
}: {
  product: Product;
  onPick: () => void;
}) {
  const ready = isReadyToShip(product);
  const meta = [product.season, versionLabels[product.version]]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <Link
        href={`/produto/${product.slug}`}
        onClick={onPick}
        className="flex items-center gap-3 px-3 py-2.5 transition-colors active:bg-[#F2F2F7]"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-cloud">
          <ProductImage product={product} sizes="64px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-semibold leading-[1.28] text-ink">
            {product.name}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-steel">
            {product.team}
            {meta ? ` · ${meta}` : ""}
          </p>
          {ready && (
            <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-whats">
              <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Pronta entrega
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <span className="tabular-nums text-[15px] font-bold text-roxo">
            {brl(product.price)}
          </span>
          <ChevronRight
            className="h-4 w-4 text-steel/50"
            aria-hidden="true"
          />
        </div>
      </Link>
    </li>
  );
}

function InitialState({
  recent,
  onPick,
  onClearRecent,
}: {
  recent: string[];
  onPick: (term: string) => void;
  onClearRecent: () => void;
}) {
  return (
    <div className="search-fade px-4 pt-4">
      {recent.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="search-label">Pesquisas recentes</h2>
            <button
              type="button"
              onClick={onClearRecent}
              className="-mr-2 h-11 px-2 text-[14px] font-medium text-roxo"
            >
              Limpar
            </button>
          </div>
          <ul className="mt-1 divide-y divide-ink/[0.07]">
            {recent.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onPick(t)}
                  className="flex h-12 w-full items-center gap-3 text-left transition-colors active:bg-[#F2F2F7]"
                >
                  <Clock
                    className="h-4 w-4 shrink-0 text-steel"
                    aria-hidden="true"
                  />
                  <span className="truncate text-[15px] text-ink">{t}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="search-label">Buscas populares</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="flex h-11 items-center rounded-full bg-[#F2F2F7] px-4 text-[15px] font-medium text-ink transition-colors active:bg-[#E5E5EA]"
            >
              {t}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <ul className="divide-y divide-ink/[0.07]" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="search-skeleton h-16 w-16 shrink-0 rounded-[10px] bg-ink/[0.07]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="search-skeleton h-3.5 w-4/5 rounded bg-ink/[0.07]" />
            <div className="search-skeleton h-3 w-1/2 rounded bg-ink/[0.05]" />
          </div>
          <div className="search-skeleton h-3.5 w-14 shrink-0 rounded bg-ink/[0.07]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({
  term,
  onClear,
  onNavigate,
}: {
  term: string;
  onClear: () => void;
  onNavigate: () => void;
}) {
  const wa = waLink(
    `Olá! Procurei por "${term}" no site da Xavier's Sports e não encontrei. Vocês têm esse modelo disponível?`
  );
  return (
    <div className="search-fade px-6 pt-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F2F7]">
        <SearchX className="h-6 w-6 text-steel" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold text-ink">
        Nenhum produto encontrado
      </h2>
      <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-steel">
        Tente buscar por outro time, modelo ou temporada.
      </p>
      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2.5">
        <Link
          href="/catalogo"
          onClick={onNavigate}
          className="flex h-12 items-center justify-center rounded-xl bg-roxo text-[15px] font-semibold text-white transition-colors active:bg-roxo-escuro"
        >
          Ver todos os produtos
        </Link>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-whats/40 text-[15px] font-semibold text-whats transition-colors active:bg-whats/10"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          Consultar no WhatsApp
        </a>
        <button
          type="button"
          onClick={onClear}
          className="flex h-12 items-center justify-center text-[15px] font-medium text-roxo"
        >
          Limpar pesquisa
        </button>
      </div>
    </div>
  );
}

function CatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-6 pt-10 text-center">
      <h2 className="text-[17px] font-semibold text-ink">
        A busca está fora do ar
      </h2>
      <p className="mx-auto mt-1.5 max-w-xs text-[14px] leading-relaxed text-steel">
        Não foi possível carregar o catálogo. Verifique a conexão e tente de
        novo.
      </p>
      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-roxo text-[15px] font-semibold text-white transition-colors active:bg-roxo-escuro"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Tentar de novo
        </button>
        <a
          href={waLink(
            "Olá! O site não está carregando os produtos. Podem me ajudar a encontrar uma camisa?"
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-whats/40 text-[15px] font-semibold text-whats transition-colors active:bg-whats/10"
        >
          <WhatsAppIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
