import type { Product } from "@/lib/products/types";
import ProductCard from "@/components/ProductCard";

/**
 * Vitrine de produtos das seções da home: grade de 2 colunas no mobile
 * (nada de rolagem lateral) e 4 colunas no desktop.
 */
export default function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {products.map((p) => (
        <div key={p.slug} className="h-full">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
