"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, PackageCheck, Shirt, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import CartDrawer from "@/components/CartDrawer";
import FavoritesDrawer from "@/components/FavoritesDrawer";

/**
 * Barra de navegação inferior estilo app (mobile/tablet), no chrome escuro
 * da marca: fundo ink, aba ativa em amarelo com indicador inclinado -8°
 * (assinatura "corte Xavier"). Favoritos e sacola moram aqui no mobile —
 * o header mantém só menu, logo e busca. Oculta no /admin e na página de
 * produto (que tem o próprio CTA fixo de pedido).
 */
export default function MobileTabBar() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const { count: cartCount, ready: cartReady } = useCart();
  const { count: favCount, ready: favReady } = useFavorites();

  if (pathname.startsWith("/admin") || pathname.startsWith("/produto/")) {
    return null;
  }

  const tabs = [
    { href: "/", label: "Início", icon: Home },
    { href: "/catalogo", label: "Catálogo", icon: Shirt },
    { href: "/pronta-entrega", label: "Pronta entrega", icon: PackageCheck },
  ] as const;

  const tabClass = (active: boolean) =>
    `tap relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 pb-1.5 pt-2 text-[9px] font-bold uppercase tracking-wide transition-colors ${
      active ? "text-amarelo" : "text-white/55"
    }`;

  const indicator = (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-0 h-0.5 w-8 -translate-x-1/2 -skew-x-[8deg] bg-amarelo"
    />
  );

  return (
    <>
      {/* espaçador para o conteúdo não ficar atrás da barra */}
      <div aria-hidden="true" className="h-[3.75rem] lg:hidden" />

      <nav
        aria-label="Navegação inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink text-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="flex items-stretch">
          {tabs.map((t) => {
            const active =
              t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            const Icon = t.icon;
            return (
              <Link key={t.href} href={t.href} className={tabClass(active)}>
                {active && indicator}
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.2 : 1.7}
                  aria-hidden="true"
                />
                <span className="truncate">{t.label}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setCartOpen(true)}
            className={tabClass(cartOpen)}
            aria-label={`Abrir sacola${cartReady && cartCount > 0 ? ` (${cartCount} itens)` : ""}`}
          >
            {cartOpen && indicator}
            <span className="relative">
              <ShoppingBag
                className="h-[22px] w-[22px]"
                strokeWidth={cartOpen ? 2.2 : 1.7}
                aria-hidden="true"
              />
              {cartReady && cartCount > 0 && (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarelo px-1 text-[10px] font-extrabold normal-case text-ink">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="truncate">Sacola</span>
          </button>

          <button
            onClick={() => setFavOpen(true)}
            className={tabClass(favOpen)}
            aria-label={`Abrir favoritos${favReady && favCount > 0 ? ` (${favCount})` : ""}`}
          >
            {favOpen && indicator}
            <span className="relative">
              <Heart
                className="h-[22px] w-[22px]"
                strokeWidth={favOpen ? 2.2 : 1.7}
                aria-hidden="true"
              />
              {favReady && favCount > 0 && (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarelo px-1 text-[10px] font-extrabold normal-case text-ink">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </span>
            <span className="truncate">Favoritos</span>
          </button>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesDrawer open={favOpen} onClose={() => setFavOpen(false)} />
    </>
  );
}
