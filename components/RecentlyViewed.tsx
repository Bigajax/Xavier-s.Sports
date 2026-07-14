"use client";

import { useRecentlyViewed } from "@/lib/recentlyViewed";
import { getProduct } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const slugs = useRecentlyViewed(excludeSlug);
  const items = slugs
    .map((s) => getProduct(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="display text-3xl text-ink">
          <span className="swoosh">Vistos recentemente</span>
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
