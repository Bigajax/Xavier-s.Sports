"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "@/components/Logo";
import TopBar from "@/components/TopBar";
import { useSearchUI } from "@/components/SearchProvider";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import CartDrawer from "@/components/CartDrawer";
import { mainNav, megaClubes, megaSelecoes } from "@/components/nav";
import { teamCrest } from "@/data/teams";
import { useFavorites } from "@/lib/favorites";
import { useCart } from "@/lib/cart";
import { waDefault } from "@/lib/whatsapp";

export default function Header() {
  const pathname = usePathname();
  const { openSearch } = useSearchUI();
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
        {/* O CABEÇALHO DO MOLDE (14/10/2026, pedido do Rafael: "coloca igual o
            molde e destaca o pronta entrega"). Primeira linha: a logo, a busca
            larga, Favoritos e Sacola com o nome e o "Falar com a loja".
            Segunda linha: os departamentos. No celular: menu, logo, coração e
            sacola em cima, e a busca larga logo embaixo. */}
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 md:px-6 lg:flex lg:gap-8 lg:py-3">
          <div className="flex items-center lg:hidden">
            <button
              className="rounded-lg p-2 hover:bg-white/10"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <Logo />

          {/* a busca larga, a partir do notebook: abre a busca da loja */}
          <button onClick={() => openSearch()} aria-label="Buscar camisas" className="xs-topo__busca hidden lg:flex">
            <Search className="h-5 w-5 shrink-0 text-roxo" aria-hidden="true" />
            <span className="truncate">Busque por time, seleção ou temporada</span>
          </button>

          {/* ações à direita */}
          <div className="flex items-center justify-self-end gap-0.5 lg:ml-auto lg:gap-1">
            <button
              onClick={() => setFavOpen(true)}
              aria-label={`Abrir favoritos${ready && count > 0 ? ` (${count})` : ""}`}
              className="xs-topo__acao"
            >
              <span className="relative">
                <Heart className="h-[1.375rem] w-[1.375rem]" aria-hidden="true" />
                {ready && count > 0 && <span className="xs-topo__conta">{count}</span>}
              </span>
              <span className="hidden xl:inline">Favoritos</span>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir minha sacola${cartReady && cartCount > 0 ? ` (${cartCount} ${cartCount === 1 ? "item" : "itens"})` : ""}`}
              className="xs-topo__acao"
            >
              <span className="relative">
                <ShoppingBag className="h-[1.375rem] w-[1.375rem]" aria-hidden="true" />
                {cartReady && cartCount > 0 && (
                  <motion.span key={cartCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="xs-topo__conta">
                    {cartCount}
                  </motion.span>
                )}
              </span>
              <span className="hidden xl:inline">Sacola</span>
            </button>
            <a href={waDefault()} target="_blank" rel="noopener noreferrer" className="xs-topo__whats hidden lg:inline-flex">
              <WhatsAppIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
              Falar com a loja
            </a>
          </div>
        </div>

        {/* a busca larga do celular, embaixo da linha da logo, como no molde */}
        <div className="px-3 pb-2.5 md:px-6 lg:hidden">
          <button onClick={() => openSearch()} aria-label="Buscar camisas" className="xs-topo__busca flex w-full">
            <Search className="h-5 w-5 shrink-0 text-roxo" aria-hidden="true" />
            <span className="truncate">Busque por time, seleção ou temporada</span>
          </button>
        </div>

          {/* a segunda linha: os departamentos. A Pronta entrega é um item igual
              aos outros, só que verde (o Rafael não quis a etiqueta amarela).
              O nav é a referência do mega menu: ele abre na largura do site,
              e não centralizado no item, que cortava "Clubes" à esquerda. */}
          <nav aria-label="Navegação principal" className="relative hidden border-t border-white/10 lg:block">
            <ul className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-6">
              {mainNav.map((item) => (
                <li
                  key={item.href}
                  onMouseEnter={() => setMega(item.mega ?? null)}
                  onMouseLeave={() => setMega(null)}
                >
                  <Link
                    href={item.href}
                    aria-expanded={item.mega ? mega === item.mega : undefined}
                    className={`flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/10 ${
                      item.href === "/pronta-entrega"
                        ? "text-[#4ade80] hover:text-[#86efac]"
                        : `hover:text-amarelo ${pathname === item.href ? "text-amarelo" : ""}`
                    }`}
                  >
                    {item.label}
                    {item.mega && (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Link>

                  {/* mega menu */}
                  {item.mega && mega === item.mega && (
                    <div className="absolute inset-x-0 top-full z-10 px-6">
                      <div className="mx-auto max-h-[calc(100vh-11rem)] max-w-7xl overflow-y-auto rounded-b-xl border border-t-0 border-white/10 bg-ink p-6 shadow-2xl">
                        {item.mega === "clubes" ? (
                          <div className="grid grid-cols-[1fr_2fr] gap-10">
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
                              <ul className="mt-3 grid grid-cols-4 gap-x-6 gap-y-1.5">
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
                      {/* a Pronta entrega em verde também aqui, como no menu do computador */}
                      <Link
                        href={item.href}
                        className={`display block rounded-lg px-3 py-2 text-xl hover:bg-white/10 ${
                          item.href === "/pronta-entrega" ? "text-[#4ade80]" : "hover:text-amarelo"
                        }`}
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
                  <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
                  Pedir pelo WhatsApp
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <FavoritesDrawer open={favOpen} onClose={() => setFavOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
