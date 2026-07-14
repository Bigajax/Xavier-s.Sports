import Image from "next/image";
import JerseyPlaceholder from "@/components/JerseyPlaceholder";
import type { Product } from "@/data/products";

/** Foto real quando existe; senão, prévia ilustrativa nas cores do time. */
export default function ProductImage({
  product,
  sizes,
  priority = false,
  className = "",
}: {
  product: Product;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (product.images.length === 0) {
    return (
      <JerseyPlaceholder
        teamSlug={product.teamSlug}
        teamName={product.team}
        className={className}
      />
    );
  }
  return (
    <Image
      src={product.images[0]}
      alt={`${product.name} — ${product.team}`}
      fill
      sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
