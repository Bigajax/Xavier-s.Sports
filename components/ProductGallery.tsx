"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import JerseyPlaceholder from "@/components/JerseyPlaceholder";
import type { Product } from "@/lib/products/types";

/**
 * Galeria da página de produto: imagem grande + miniaturas no desktop,
 * carrossel por gestos com contador no mobile e zoom em modal.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const images = product.images;

  if (images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <JerseyPlaceholder teamSlug={product.teamSlug} teamName={product.team} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse md:items-start">
      {/* imagem principal */}
      <div className="relative flex-1">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-xl md:block md:overflow-hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setZoom(true)}
              className="relative aspect-square w-full shrink-0 snap-center bg-cloud md:hidden"
              aria-label="Ampliar imagem"
            >
              <Image
                src={src}
                alt={`${product.name} — imagem ${i + 1}`}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </button>
          ))}
          {/* desktop: só a imagem ativa */}
          <button
            onClick={() => setZoom(true)}
            className="group relative hidden aspect-square w-full bg-cloud md:block"
            aria-label="Ampliar imagem"
          >
            <Image
              src={images[index]}
              alt={`${product.name} — imagem ${index + 1} de ${images.length}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 p-2 text-white">
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
        {images.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white md:hidden">
            {index + 1} / {images.length}
          </span>
        )}
      </div>

      {/* miniaturas desktop */}
      {images.length > 1 && (
        <div className="hidden flex-col gap-2 md:flex">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={index === i}
              className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${
                index === i ? "border-roxo" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* modal de zoom */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/90 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Imagem ampliada"
            onClick={() => setZoom(false)}
          >
            <button
              onClick={() => setZoom(false)}
              aria-label="Fechar zoom"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="relative h-[85vh] w-full max-w-3xl">
              <Image
                src={images[index]}
                alt={`${product.name} — imagem ampliada`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
