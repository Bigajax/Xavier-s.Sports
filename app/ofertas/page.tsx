import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import { onSaleProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Ofertas",
  description:
    "Camisas selecionadas com preço especial — aproveite enquanto durarem.",
};

export default function OfertasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Ofertas"
        title="Preço de contra-ataque"
        subtitle="Modelos selecionados com desconto. Disponibilidade sujeita à confirmação."
      />
      <div className="mt-10">
        {onSaleProducts.length > 0 ? (
          <ProductGrid products={onSaleProducts} />
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
