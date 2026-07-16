"use client";

import CatalogError from "@/components/CatalogError";

/** Boundary da página de produto — cobre falha ao carregar o catálogo. */
export default function ProdutoError() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <CatalogError />
    </div>
  );
}
