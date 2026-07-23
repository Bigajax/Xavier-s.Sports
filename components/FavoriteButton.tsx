"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { toast } from "@/components/Toaster";

export default function FavoriteButton({
  slug,
  name,
  className = "",
  size = "md",
}: {
  slug: string;
  name: string;
  className?: string;
  /** "sm" encolhe no mobile (h-8) e volta ao normal no desktop (sm:h-10) —
   *  usado nos cards do catálogo, onde o botão cobria muito a imagem.
   *  "ready" fica ~42px no mobile (pronta entrega) e volta a 40px no desktop. */
  size?: "sm" | "md" | "ready";
}) {
  const { has, toggle, ready } = useFavorites();
  const active = ready && has(slug);

  const box =
    size === "sm"
      ? "h-8 w-8 sm:h-10 sm:w-10"
      : size === "ready"
        ? "h-[42px] w-[42px] sm:h-10 sm:w-10"
        : "h-10 w-10";
  const icon =
    size === "sm" ? "h-[18px] w-[18px] sm:h-5 sm:w-5" : "h-5 w-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
        toast(active ? "Removida dos favoritos" : "Salva nos favoritos ⚽");
      }}
      aria-pressed={active}
      aria-label={
        active
          ? `Remover ${name} dos favoritos`
          : `Salvar ${name} nos favoritos`
      }
      className={`flex ${box} items-center justify-center rounded-full bg-white/90 shadow-md transition-transform hover:scale-110 ${className}`}
    >
      <Heart
        className={`${icon} transition-colors ${
          active ? "fill-promo text-promo" : "text-ink"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
