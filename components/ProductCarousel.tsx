import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";

/** Trilho horizontal com scroll por gesto no mobile e grid no desktop. */
export default function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
      {products.map((p) => (
        <div key={p.slug} className="w-64 shrink-0 snap-start md:w-auto md:h-full">
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
