import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import { onSaleProducts } from "@/lib/products/types";
import { getCatalog } from "@/lib/products/db";
import CatalogError from "@/components/CatalogError";

export const metadata: Metadata = {
  title: "Ofertas",
  description:
    "Camisas selecionadas com preço especial — aproveite enquanto durarem.",
};

export default async function OfertasPage() {
  let catalog: Awaited<ReturnType<typeof getCatalog>> | null = null;
  try {
    catalog = await getCatalog();
  } catch {
    catalog = null;
  }
  const ofertas = catalog ? onSaleProducts(catalog) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Ofertas"
        title="Preço de contra-ataque"
        subtitle="Modelos selecionados com desconto. Disponibilidade sujeita à confirmação."
      />
      <div className="mt-10">
        {!catalog ? (
          <CatalogError />
        ) : ofertas.length > 0 ? (
          <ProductGrid products={ofertas} />
        ) : (
          <p className="rounded-xl bg-cloud p-10 text-center text-steel">
            Nenhuma oferta ativa no momento — volte em breve ou consulte a
            equipe pelo WhatsApp.
          </p>
        )}
      </div>
    </div>
  );
}
