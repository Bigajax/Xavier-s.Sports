"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import JerseyPlaceholder from "@/components/JerseyPlaceholder";
import type { Product } from "@/lib/products/types";

/**
 * Galeria da página de produto: imagem grande + miniaturas no desktop,
 * carrossel por gestos com contador no mobile e modal de zoom.
 * Zoom estilo e-commerce: no desktop a imagem principal amplia seguindo o
 * cursor (lupa); no modal, clique/toque alterna 2,5× e o movimento do
 * mouse/dedo faz o pan da área ampliada.
 */
export default function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const images = product.images;

  // Zoom de quadrado (estilo marketplace) na imagem principal — desktop
  const LENS = 42; // lado do quadrado, em % da imagem
  const [hovering, setHovering] = useState(false);
  const [lens, setLens] = useState({ x: 50, y: 50 }); // centro do quadrado (%)

  // Pan/zoom do modal
  const [zoomed, setZoomed] = useState(false);
  const [modalOrigin, setModalOrigin] = useState("50% 50%");
  const modalRef = useRef<HTMLDivElement>(null);

  // Carrossel mobile: rolagem programada (setas/pontos/arrasto com mouse)
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragX = useRef<number | null>(null);
  const slideTo = useCallback(
    (i: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(images.length - 1, i));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    },
    [images.length]
  );

  const pointOrigin = useCallback((e: React.PointerEvent, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    return `${x}% ${y}%`;
  }, []);

  const closeZoom = useCallback(() => {
    setZoom(false);
    setZoomed(false);
    setModalOrigin("50% 50%");
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + images.length) % images.length);
      setZoomed(false);
      setModalOrigin("50% 50%");
    },
    [images.length]
  );

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
      if (e.key === "ArrowRight" && images.length > 1) step(1);
      if (e.key === "ArrowLeft" && images.length > 1) step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, images.length, closeZoom, step]);

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
          ref={scrollerRef}
          className="no-scrollbar flex snap-x snap-mandatory touch-pan-x overflow-x-auto rounded-xl md:block md:overflow-hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(
              Math.max(
                0,
                Math.min(
                  images.length - 1,
                  Math.round(el.scrollLeft / el.clientWidth)
                )
              )
            );
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") dragX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse" || dragX.current === null) return;
            const dx = e.clientX - dragX.current;
            dragX.current = null;
            if (Math.abs(dx) > 40) slideTo(index + (dx < 0 ? 1 : -1));
          }}
        >
          {/* mobile: carrossel por gestos (arrastar vira a foto), sem modal */}
          {images.map((src, i) => (
            <div
              key={src}
              className="relative aspect-square w-full shrink-0 snap-center bg-cloud md:hidden"
            >
              <Image
                src={src}
                alt={`${product.name} — imagem ${i + 1}`}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
                draggable={false}
              />
            </div>
          ))}
          {/* desktop: imagem ativa com quadrado de zoom (estilo marketplace) */}
          <button
            onClick={() => setZoom(true)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") setHovering(true);
            }}
            onPointerLeave={() => setHovering(false)}
            onPointerMove={(e) => {
              if (e.pointerType !== "mouse") return;
              const r = e.currentTarget.getBoundingClientRect();
              const half = LENS / 2;
              const x = ((e.clientX - r.left) / r.width) * 100;
              const y = ((e.clientY - r.top) / r.height) * 100;
              setLens({
                x: Math.min(100 - half, Math.max(half, x)),
                y: Math.min(100 - half, Math.max(half, y)),
              });
            }}
            className="relative hidden aspect-square w-full cursor-crosshair overflow-hidden bg-cloud md:block"
            aria-label="Ampliar imagem"
          >
            <Image
              src={images[index]}
              alt={`${product.name} — imagem ${index + 1} de ${images.length}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            {/* quadrado que acompanha o cursor */}
            {hovering && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-roxo/80 bg-white/25 backdrop-brightness-110"
                style={{
                  width: `${LENS}%`,
                  height: `${LENS}%`,
                  left: `${lens.x - LENS / 2}%`,
                  top: `${lens.y - LENS / 2}%`,
                }}
              />
            )}
            <span
              className={`absolute bottom-3 right-3 rounded-full bg-ink/70 p-2 text-white transition-opacity ${
                hovering ? "opacity-0" : "opacity-100"
              }`}
            >
              <ZoomIn className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>

        {/* painel de zoom ao lado da imagem (desktop) */}
        {hovering && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 z-30 hidden aspect-square w-full overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-ink/10 md:block"
            style={{
              left: "calc(100% + 12px)",
              backgroundImage: `url(${images[index]})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: `${(100 / LENS) * 100}%`,
              backgroundPosition: `${((lens.x - LENS / 2) / (100 - LENS)) * 100}% ${((lens.y - LENS / 2) / (100 - LENS)) * 100}%`,
            }}
          />
        )}
        {images.length > 1 && (
          <>
            <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white md:hidden">
              {index + 1} / {images.length}
            </span>
            {/* setas mobile */}
            <button
              onClick={() => slideTo(index - 1)}
              aria-label="Foto anterior"
              className={`tap absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/45 p-1.5 text-white transition-opacity md:hidden ${
                index === 0 ? "pointer-events-none opacity-0" : "opacity-90"
              }`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => slideTo(index + 1)}
              aria-label="Próxima foto"
              className={`tap absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink/45 p-1.5 text-white transition-opacity md:hidden ${
                index === images.length - 1
                  ? "pointer-events-none opacity-0"
                  : "opacity-90"
              }`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            {/* pontos indicadores */}
            <div
              aria-hidden="true"
              className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden"
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
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

      {/* modal de zoom com pan */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/95 p-0 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Imagem ampliada"
            onClick={closeZoom}
          >
            <button
              onClick={closeZoom}
              aria-label="Fechar zoom"
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Imagem anterior"
                  className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-4 sm:p-3"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Próxima imagem"
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-4 sm:p-3"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
                <span className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                  {index + 1} / {images.length}
                </span>
              </>
            )}

            <div
              ref={modalRef}
              onClick={(e) => {
                e.stopPropagation();
                const el = modalRef.current;
                if (!el) return;
                if (!zoomed) {
                  setModalOrigin(
                    pointOrigin(e as unknown as React.PointerEvent, el)
                  );
                }
                setZoomed((z) => !z);
              }}
              onPointerMove={(e) => {
                if (zoomed && modalRef.current)
                  setModalOrigin(pointOrigin(e, modalRef.current));
              }}
              className={`relative h-[100dvh] w-full overflow-hidden sm:h-[88vh] sm:max-w-3xl sm:rounded-xl ${
                zoomed ? "cursor-zoom-out touch-none" : "cursor-zoom-in"
              }`}
            >
              <Image
                src={images[index]}
                alt={`${product.name} — imagem ampliada`}
                fill
                sizes="100vw"
                quality={90}
                style={{ transformOrigin: modalOrigin }}
                className={`object-contain transition-transform duration-200 ease-out ${
                  zoomed ? "scale-[2.5]" : "scale-100"
                }`}
              />
              {!zoomed && (
                <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white sm:text-sm">
                  Clique para ampliar
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
