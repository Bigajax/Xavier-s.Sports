"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  RefreshCcw,
  Settings,
  Shirt,
  Star,
  X,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const groups = [
  {
    heading: "Visão geral",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Pedidos",
    items: [
      { href: "/admin/pedidos", label: "Consultas do WhatsApp", icon: MessageSquareText },
    ],
  },
  {
    heading: "Produtos e estoque",
    items: [
      { href: "/admin/produtos", label: "Produtos", icon: Shirt },
      { href: "/admin/movimentacoes", label: "Movimentações", icon: History },
    ],
  },
  {
    heading: "Atendimento",
    items: [
      { href: "/admin/trocas-devolucoes", label: "Trocas e devoluções", icon: RefreshCcw },
      { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
    ],
  },
  {
    heading: "Conteúdo do site",
    items: [
      { href: "/admin/conteudo", label: "Times e categorias", icon: ImageIcon },
    ],
  },
  {
    heading: "Configurações",
    items: [
      { href: "/admin/configuracoes", label: "Dados da loja", icon: Settings },
    ],
  },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-2">
        {groups.map((group) => (
          <div key={group.heading}>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {group.heading}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-roxo text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1 p-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao site
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </button>
      </div>
    </>
  );
}

/**
 * Navegação do painel: sidebar no desktop, barra superior + gaveta no
 * celular — mesmo padrão de drawer do site.
 */
export default function AdminNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fecha a gaveta ao navegar.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Sidebar desktop */}
      <nav
        aria-label="Menu administrativo"
        className="hidden h-full flex-col lg:flex"
      >
        <div className="p-4">
          <p className="display text-xl text-white">Xavier&apos;s</p>
          <p className="text-xs font-bold uppercase tracking-widest text-amarelo">
            Painel da loja
          </p>
          {userEmail && (
            <p className="mt-1 truncate text-[11px] text-white/50">{userEmail}</p>
          )}
        </div>
        <NavLinks pathname={pathname} />
      </nav>

      {/* Barra mobile */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden">
        <div>
          <p className="display text-lg leading-none text-white">Xavier&apos;s</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amarelo">
            Painel da loja
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu do painel"
          className="tap rounded-lg p-2 text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Gaveta mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[75] bg-ink/70 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-[76] flex w-72 max-w-[85%] flex-col bg-ink pb-4 lg:hidden"
              aria-label="Menu administrativo"
            >
              <div className="flex items-start justify-between p-4">
                <div>
                  <p className="display text-xl text-white">Xavier&apos;s</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-amarelo">
                    Painel da loja
                  </p>
                  {userEmail && (
                    <p className="mt-1 truncate text-[11px] text-white/50">
                      {userEmail}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar menu"
                  className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
