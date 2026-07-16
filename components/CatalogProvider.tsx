"use client";

import { createContext, useContext } from "react";
import type { Product } from "@/lib/products/types";

/**
 * Distribui o catálogo (buscado no servidor pelo layout) para os client
 * components que antes importavam o array estático — busca, sacola,
 * favoritos, vistos recentemente.
 */

type CatalogContextValue = {
  products: Product[];
  /** true quando o Supabase falhou e o catálogo veio vazio. */
  error: boolean;
};

const CatalogContext = createContext<CatalogContextValue>({
  products: [],
  error: false,
});

export function useCatalog(): CatalogContextValue {
  return useContext(CatalogContext);
}

/** Resolve um produto pelo slug — troca direta do antigo getProduct. */
export function useProductLookup(): (slug: string) => Product | undefined {
  const { products } = useCatalog();
  return (slug: string) => products.find((p) => p.slug === slug);
}

export default function CatalogProvider({
  products,
  error = false,
  children,
}: {
  products: Product[];
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <CatalogContext.Provider value={{ products, error }}>
      {children}
    </CatalogContext.Provider>
  );
}
