"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { toast } from "@/components/Toaster";

export default function FavoriteButton({
  slug,
  name,
  className = "",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const { has, toggle, ready } = useFavorites();
  const active = ready && has(slug);

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
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform hover:scale-110 ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          active ? "fill-promo text-promo" : "text-ink"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
