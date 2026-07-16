"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  RefreshCcw,
  Settings,
  Shirt,
  Star,
} from "lucide-react";
import { signOut } from "@/app/admin/actions";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produtos", label: "Produtos", icon: Shirt },
  { href: "/admin/conteudo", label: "Times & banners", icon: ImageIcon },
  { href: "/admin/pedidos", label: "Pedidos WhatsApp", icon: MessageSquareText },
  { href: "/admin/trocas-devolucoes", label: "Trocas e devoluções", icon: RefreshCcw },
  { href: "/admin/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Menu administrativo" className="flex h-full flex-col">
      <div className="p-4">
        <p className="display text-xl text-white">Xavier&apos;s</p>
        <p className="text-xs font-bold uppercase tracking-widest text-amarelo">
          Painel da loja
        </p>
        {userEmail && (
          <p className="mt-1 truncate text-[11px] text-white/50">{userEmail}</p>
        )}
      </div>
      <ul className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
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
      <div className="space-y-1 p-2">
        <Link
          href="/"
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
    </nav>
  );
}
