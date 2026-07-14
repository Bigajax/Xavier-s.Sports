import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import ProductGrid from "@/components/ProductGrid";
import { newArrivals } from "@/data/products";

export const metadata: Metadata = {
  title: "Lançamentos",
  description:
    "Os modelos mais recentes disponíveis na Xavier's Sports — clubes e seleções.",
};

export default function LancamentosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Lançamentos"
        title="Acabaram de entrar em campo"
        subtitle="Confira os modelos mais recentes disponíveis na Xavier's Sports."
      />
      <div className="mt-10">
        <ProductGrid products={newArrivals} />
      </div>
    </div>
  );
}
