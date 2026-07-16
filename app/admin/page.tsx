import Link from "next/link";
import { getAdminCatalog } from "@/lib/products/db";
import { deriveStatus } from "@/lib/products/types";

export const dynamic = "force-dynamic";

/** Dados simulados do dashboard — claramente demonstrativos. */
const demoStats = {
  whatsappClicks: 128,
  topProducts: [
    "Camisa Corinthians Home — Versão Jogador",
    "Camisa Portugal Home",
    "Camisa Barcelona Retrô — Temporada 96/97",
  ],
  topSearches: ["corinthians branca", "brasil feminina", "retrô", "portugal"],
};

export default async function AdminDashboard() {
  let products: Awaited<ReturnType<typeof getAdminCatalog>> = [];
  try {
    products = await getAdminCatalog();
  } catch {
    // Cards zerados; a página de produtos mostra o erro detalhado.
  }

  const statuses = products.map((p) => deriveStatus(p.variants));
  const cards = [
    { label: "Produtos cadastrados", value: products.length },
    {
      label: "Pronta entrega",
      value: statuses.filter((s) => s === "pronta-entrega").length,
    },
    {
      label: "Sob encomenda",
      value: statuses.filter((s) => s === "sob-encomenda").length,
    },
    {
      label: "Esgotados",
      value: statuses.filter((s) => s === "esgotado").length,
    },
  ];

  return (
    <div>
      <h1 className="display text-3xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-steel">
        Visão geral da loja — contagens calculadas pelo estoque por tamanho.
        *Números marcados são simulados para demonstração.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <p className="tabular-nums display text-4xl text-roxo">{c.value}</p>
            <p className="mt-1 text-sm font-semibold text-steel">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="display-upright text-lg text-ink">
            Produtos mais consultados*
          </h2>
          <ol className="mt-3 space-y-2">
            {demoStats.topProducts.map((p, i) => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <span className="display w-6 text-xl text-roxo/40">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="display-upright text-lg text-ink">
            Pesquisas mais realizadas*
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoStats.topSearches.map((s) => (
              <span key={s} className="rounded-full bg-cloud px-3 py-1.5 text-sm">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-roxo/30 bg-roxo/5 p-5 text-sm text-ink/80">
        <p className="font-bold text-ink">Pendências antes de publicar</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Validar política de trocas, devoluções e reembolsos.</li>
          <li>Substituir medidas do guia de tamanhos pelas reais.</li>
          <li>Definir a classificação correta e legal dos produtos.</li>
          <li>Revisar textos jurídicos (privacidade e termos).</li>
        </ul>
        <p className="mt-3">
          O catálogo e o estoque vivem no Supabase — gerencie tudo em{" "}
          <Link href="/admin/produtos" className="font-bold text-roxo hover:underline">
            Produtos e estoque
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
