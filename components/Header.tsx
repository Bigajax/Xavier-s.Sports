"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/Logo";
import TopBar from "@/components/TopBar";
import SearchModal from "@/components/SearchModal";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import CartDrawer from "@/components/CartDrawer";
import { mainNav, megaClubes, megaSelecoes } from "@/components/nav";
import { teamCrest } from "@/data/teams";
import { useFavorites } from "@/lib/favorites";
import { useCart } from "@/lib/cart";
import { waDefault } from "@/lib/whatsapp";

export default function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mega, setMega] = useState<"clubes" | "selecoes" | null>(null);
  const { count, ready } = useFavorites();
  const { count: cartCount, ready: cartReady } = useCart();

  useEffect(() => {
    setDrawerOpen(false);
    setFavOpen(false);
    setCartOpen(false);
    setMega(null);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 shadow-lg shadow-ink/20">
      <TopBar />
      <div className="bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          {/* mobile: hambúrguer */}
          <button
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <Logo />

          {/* nav desktop */}
          <nav aria-label="Navegação principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li
                  key={item.href}
                  onMouseEnter={() => setMega(item.mega ?? null)}
                  onMouseLeave={() => setMega(null)}
                  className="relative"
                >
                  <Link
                    href={item.href}
                    aria-expanded={item.mega ? mega === item.mega : undefined}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-amarelo ${
                      pathname === item.href ? "text-amarelo" : ""
                    }`}
                  >
                    {item.label}
                    {item.mega && (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Link>

                  {/* mega menu */}
                  {item.mega && mega === item.mega && (
                    <div className="absolute left-1/2 top-full w-max max-w-3xl -translate-x-1/2 pt-2">
                      <div className="rounded-xl border border-white/10 bg-ink p-6 shadow-2xl">
                        {item.mega === "clubes" ? (
                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <p className="xavier-eyebrow text-amarelo">Brasil</p>
                              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                                {megaClubes.brasil.map((t) => (
                                  <li key={t.href}>
                                    <Link
                                      href={t.href}
                                      className="text-sm text-white/80 hover:text-amarelo"
                                    >
                                      {t.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="xavier-eyebrow text-amarelo">
                                Internacionais
                              </p>
                              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                                {megaClubes.europa.map((t) => (
                                  <li key={t.href}>
                                    <Link
                                      href={t.href}
                                      className="text-sm text-white/80 hover:text-amarelo"
                                    >
                                      {t.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="xavier-eyebrow text-amarelo">Seleções</p>
                            <ul className="mt-3 grid grid-cols-3 gap-x-8 gap-y-1.5">
                              {megaSelecoes.map((t) => (
                                <li key={t.href}>
                                  <Link
                                    href={t.href}
                                    className="text-sm text-white/80 hover:text-amarelo"
                                  >
                                    {t.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-5 border-t border-white/10 pt-4">
                          <Link
                            href={item.href}
                            className="text-sm font-semibold text-amarelo hover:underline"
                          >
                            Ver todos →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* ações à direita */}
          <div className="flex items-center gap-1">
            {/* busca desktop: campo visível que abre o modal */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar camisas"
              className="mr-1 hidden w-44 items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/15 hover:text-white/80 lg:flex xl:w-56"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Buscar camisas…</span>
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar camisas"
              className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setFavOpen(true)}
              aria-label={`Abrir favoritos${ready && count > 0 ? ` (${count})` : ""}`}
              className="relative rounded-lg p-2 hover:bg-white/10"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              {ready && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarelo px-1 text-[10px] font-bold text-ink">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir meu pedido${cartReady && cartCount > 0 ? ` (${cartCount} ${cartCount === 1 ? "item" : "itens"})` : ""}`}
              className="relative rounded-lg p-2 hover:bg-white/10"
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartReady && cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amarelo px-1 text-[10px] font-bold text-ink"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-ink/70 lg:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-[56] flex w-[86%] max-w-sm flex-col overflow-y-auto bg-ink text-white lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <Logo />
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Fechar menu"
                  className="rounded-lg p-2 hover:bg-white/10"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Menu móvel" className="flex-1 p-4">
                <ul className="grid grid-cols-2 gap-x-2">
                  {mainNav.map((item) => (
                    <li
                      key={item.href}
                      className={item.href === "/catalogo" || item.href === "/como-comprar" ? "col-span-2" : ""}
                    >
                      <Link
                        href={item.href}
                        className="display block rounded-lg px-3 py-2 text-xl hover:bg-white/10 hover:text-amarelo"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="flex items-baseline justify-between">
                    <p className="xavier-eyebrow text-amarelo">Clubes populares</p>
                    <Link href="/clubes" className="text-xs font-bold text-white/60 hover:text-amarelo">
                      Ver todos →
                    </Link>
                  </div>
                  <ul className="mt-2 grid grid-cols-2 gap-x-3">
                    {[...megaClubes.brasil.slice(0, 6), ...megaClubes.europa.slice(0, 4)].map(
                      (t) => (
                        <li key={t.href}>
                          <Link
                            href={t.href}
                            className="flex items-center gap-2 rounded-lg py-1.5 pr-1 text-sm text-white/80 hover:text-amarelo"
                          >
                            <Image
                              src={teamCrest(t.href.split("/").pop() ?? "")}
                              alt=""
                              width={20}
                              height={20}
                              className="h-5 w-5 shrink-0 object-contain"
                            />
                            <span className="truncate">{t.label}</span>
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="xavier-eyebrow text-amarelo">Seleções</p>
                    <Link href="/selecoes" className="text-xs font-bold text-white/60 hover:text-amarelo">
                      Ver todas →
                    </Link>
                  </div>
                  <ul className="mt-2 grid grid-cols-2 gap-x-3">
                    {megaSelecoes.slice(0, 8).map((t) => (
                      <li key={t.href}>
                        <Link
                          href={t.href}
                          className="flex items-center gap-2 rounded-lg py-1.5 pr-1 text-sm text-white/80 hover:text-amarelo"
                        >
                          <Image
                            src={teamCrest(t.href.split("/").pop() ?? "")}
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5 shrink-0 object-contain"
                          />
                          <span className="truncate">{t.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
              <div className="border-t border-white/10 p-4">
                <a
                  href={waDefault()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-whats px-4 py-3 font-bold text-white"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  Pedir pelo WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FavoritesDrawer open={favOpen} onClose={() => setFavOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
