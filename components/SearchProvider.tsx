"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Estado global da pesquisa. Fica acima do header, da barra inferior e do
 * botão de WhatsApp para que esses elementos possam se desmontar enquanto a
 * folha de pesquisa estiver aberta — em vez de só ficarem escondidos atrás
 * dela, o que no mobile ainda roubava toque e espaço de tela.
 */

type SearchUI = {
  open: boolean;
  /** Termo com que a folha abre (usado por atalhos). */
  initialQuery: string;
  openSearch: (query?: string) => void;
  closeSearch: () => void;
};

const SearchContext = createContext<SearchUI>({
  open: false,
  initialQuery: "",
  openSearch: () => {},
  closeSearch: () => {},
});

export function useSearchUI(): SearchUI {
  return useContext(SearchContext);
}

export default function SearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState("");

  const openSearch = useCallback((query = "") => {
    setInitialQuery(query);
    setOpen(true);
  }, []);

  const closeSearch = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, initialQuery, openSearch, closeSearch }),
    [open, initialQuery, openSearch, closeSearch]
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}
