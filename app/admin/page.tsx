import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { getAdminCatalog } from "@/lib/products/db";
import {
  deriveStatus,
  effectiveLowStock,
  type Product,
} from "@/lib/products/types";

export const dynamic = "force-dynamic";

function lowStockSizes(p: Product): string[] {
  const limit = effectiveLowStock(p);
  return p.variants
    .filter((v) => v.active && v.stock > 0 && v.stock <= limit)
    .map((v) => `${v.label} (${v.stock})`);
}

function deadSizes(p: Product): string[] {
  return p.variants
    .filter((v) => v.active && v.stock === 0 && !v.allowPreOrder)
    .map((v) => v.label);
}

export default async function AdminDashboard() {
  let products: Awaited<ReturnType<typeof getAdminCatalog>> = [];
  try {
    products = await getAdminCatalog();
  } catch {
    // Cards zerados; a página de produtos mostra o erro detalhado.
  }

  // Arquivados fora das contagens do dia a dia.
  const active = products.filter((p) => !p.archivedAt);
  const statuses = active.map((p) => deriveStatus(p.variants));

  const lowStock = active.filter((p) => lowStockSizes(p).length > 0);
  const soldOut = active.filter((_, i) => statuses[i] === "esgotado");
  const preOrder = active.filter((_, i) => statuses[i] === "sob-encomenda");
  const published = active.filter((p) => p.available);
  const hidden = active.filter((p) => !p.available);
  const noPhoto = active.filter((p) => p.images.length === 0);
  const withDeadSizes = active.filter((p) => deadSizes(p).length > 0);

  const cards = [
    {
      label: "Estoque baixo",
      value: lowStock.length,
      href: "/admin/produtos?filtro=estoque-baixo",
      alert: lowStock.length > 0,
    },
    {
      label: "Esgotados",
      value: soldOut.length,
      href: "/admin/produtos?filtro=esgotado",
      alert: soldOut.length > 0,
    },
    {
      label: "Sob encomenda",
      value: preOrder.length,
      href: "/admin/produtos?filtro=sob-encomenda",
      alert: false,
    },
    {
      label: `Publicados (${hidden.length} ocultos)`,
      value: published.length,
      href: "/admin/produtos",
      alert: false,
    },
  ];

  type Pending = {
    icon: typeof AlertTriangle;
    text: string;
    detail: string;
    href: string;
    action: string;
  };
  const pending: Pending[] = [
    ...noPhoto.slice(0, 5).map((p) => ({
      icon: Camera,
      text: `${p.name} está sem foto`,
      detail: "Produtos sem foto aparecem com arte genérica na vitrine.",
      href: "/admin/produtos",
      action: "Adicionar foto",
    })),
    ...lowStock.slice(0, 5).map((p) => ({
      icon: AlertTriangle,
      text: `${p.name} com estoque baixo`,
      detail: `Tamanhos: ${lowStockSizes(p).join(", ")}.`,
      href: "/admin/produtos?filtro=estoque-baixo",
      action: "Repor estoque",
    })),
    ...withDeadSizes.slice(0, 5).map((p) => ({
      icon: Clock,
      text: `${p.name} tem tamanho esgotado sem encomenda`,
      detail: `Tamanhos parados: ${deadSizes(p).join(", ")} — ative a encomenda ou reponha.`,
      href: "/admin/produtos",
      action: "Revisar produto",
    })),
  ];

  return (
    <div>
      <h1 className="display text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-steel">
        Visão geral da loja — toque em um cartão para abrir a lista
        correspondente.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group rounded-xl bg-white p-4 shadow-sm ring-1 transition-shadow hover:shadow-md sm:p-5 ${
              c.alert ? "ring-amarelo/70" : "ring-ink/5"
            }`}
          >
            <p
              className={`tabular-nums display text-3xl sm:text-4xl ${
                c.alert ? "text-promo" : "text-roxo"
              }`}
            >
              {c.value}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold leading-snug text-steel sm:text-sm">
              {c.label}
              <ArrowRight
                className="hidden h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                aria-hidden="true"
              />
            </p>
          </Link>
        ))}
      </div>

      {/* Ações pendentes */}
      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
        <h2 className="display-upright text-lg text-ink">Ações pendentes</h2>
        {pending.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-whats">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Tudo em dia — nenhum produto precisa de atenção agora.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/5">
            {pending.slice(0, 8).map((item, i) => (
              <li key={`${item.text}-${i}`} className="py-3">
                <div className="flex items-start gap-3">
                  <item.icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-amarelo"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{item.text}</p>
                    <p className="text-xs text-steel">{item.detail}</p>
                  </div>
                  <Link
                    href={item.href}
                    className="hidden shrink-0 rounded-lg border border-roxo px-3 py-1.5 text-xs font-bold text-roxo hover:bg-roxo hover:text-white sm:block"
                  >
                    {item.action}
                  </Link>
                </div>
                <Link
                  href={item.href}
                  className="mt-2 block rounded-lg border border-roxo px-3 py-2 text-center text-xs font-bold text-roxo sm:hidden"
                >
                  {item.action}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-xs text-steel">
        Os indicadores de consultas, pedidos e avaliações entram nas próximas
        atualizações do painel, junto com o acompanhamento pelo WhatsApp.
      </p>
    </div>
  );
}
