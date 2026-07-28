"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchUI } from "@/components/SearchProvider";

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
 * Busca da home: o campo é um gatilho — tocar abre a folha de pesquisa em
 * tela cheia, com resultados enquanto se digita. Não há botão "Buscar":
 * digitar já é buscar.
 */
export default function HomeSearch() {
  const { openSearch } = useSearchUI();

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => openSearch()}
        aria-label="Buscar por time, camisa ou temporada"
        className="search-field font-system flex h-14 w-full items-center gap-3 rounded-2xl bg-[#F2F2F7] px-4 text-left transition-colors hover:bg-[#EAEAEF]"
      >
        <Search className="h-5 w-5 shrink-0 text-steel" aria-hidden="true" />
        <span className="truncate text-[16px] text-steel">
          Buscar por time, camisa ou temporada
        </span>
      </button>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-full bg-cloud px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/[0.08] hover:text-roxo"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
