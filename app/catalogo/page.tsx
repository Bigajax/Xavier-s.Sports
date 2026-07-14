import type { Metadata } from "next";
import { Suspense } from "react";
import CatalogClient from "@/components/CatalogClient";
import CatalogSkeleton from "@/components/CatalogSkeleton";

export const metadata: Metadata = {
  title: "Catálogo de camisas",
  description:
    "Pesquise camisas por time, seleção, temporada, tamanho ou categoria. Modelos atuais e retrô com envio para todo o Brasil.",
};

export default function CatalogoPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogClient />
    </Suspense>
  );
}
