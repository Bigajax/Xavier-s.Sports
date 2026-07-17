import Link from "next/link";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import HelpButton from "@/components/admin/HelpButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

type MovementRow = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_sku: string;
  variant_label: string;
  type: "entrada" | "saida" | "correcao";
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string;
  related_order: string | null;
  notes: string | null;
  created_by_email: string | null;
  created_at: string;
};

const typeLabel: Record<MovementRow["type"], string> = {
  entrada: "Entrada",
  saida: "Saída",
  correcao: "Correção",
};

const periods = [
  { value: "hoje", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "todos", label: "Todo o período" },
] as const;

function periodStart(periodo: string): string | null {
  const now = new Date();
  if (periodo === "hoje") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  if (periodo === "7" || periodo === "30") {
    now.setDate(now.getDate() - Number(periodo));
    return now.toISOString();
  }
  return null;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TypeBadge({ type }: { type: MovementRow["type"] }) {
  const entrada = type === "entrada";
  const Icon = entrada ? ArrowUpCircle : ArrowDownCircle;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
        entrada ? "bg-whats/10 text-whats" : "bg-promo/10 text-promo"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {typeLabel[type]}
    </span>
  );
}

export default async function AdminMovimentacoes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const tipo = params.tipo ?? "";
  const periodo = params.periodo ?? "30";
  const produto = params.produto ?? "";
  const pagina = Math.max(1, Number(params.pagina) || 1);

  let rows: MovementRow[] = [];
  let total = 0;
  let tablePending = false;
  let loadError = "";

  try {
    const supabase = await supabaseServer();
    let query = supabase
      .from("stock_movements")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, pagina * PAGE_SIZE - 1);

    if (produto) query = query.eq("product_id", produto);
    if (tipo) query = query.eq("type", tipo);
    if (q) {
      const safe = q.replace(/[%,()]/g, " ").trim();
      if (safe) {
        query = query.or(
          `product_name.ilike.%${safe}%,product_sku.ilike.%${safe}%`
        );
      }
    }
    const start = periodStart(periodo);
    if (start) query = query.gte("created_at", start);

    const { data, error, count } = await query;
    if (error) throw error;
    rows = (data ?? []) as MovementRow[];
    total = count ?? rows.length;
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
    if (/stock_movements|does not exist|42P01|schema cache/i.test(message)) {
      tablePending = true;
    } else {
      loadError = message;
    }
  }

  const hasMore = rows.length < total;
  const filteredByProduct = produto && rows.length > 0 ? rows[0] : null;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (tipo) baseParams.set("tipo", tipo);
  if (periodo) baseParams.set("periodo", periodo);
  if (produto) baseParams.set("produto", produto);

  const moreParams = new URLSearchParams(baseParams);
  moreParams.set("pagina", String(pagina + 1));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Movimentações de estoque</h1>
          <p className="mt-1 text-sm text-steel">
            Histórico de todas as entradas e saídas — cada registro é
            permanente e mostra o saldo antes e depois.
          </p>
        </div>
        <HelpButton topic="movimentacoes" />
      </div>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <History className="mx-auto h-8 w-8 text-ink/40" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">
            O histórico será ativado após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Assim que a atualização for aplicada, todas as entradas e saídas
            registradas passam a aparecer aqui automaticamente.
          </p>
        </div>
      ) : loadError ? (
        <div className="mt-6 rounded-xl border border-promo/40 bg-promo/5 p-5 text-sm text-ink">
          Não foi possível carregar o histórico agora. Tente recarregar a
          página.
        </div>
      ) : (
        <>
          {/* Filtros via query string — página continua 100% server */}
          <form
            method="get"
            className="mt-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5 sm:flex sm:flex-wrap sm:items-end"
          >
            {produto && <input type="hidden" name="produto" value={produto} />}
            <div className="min-w-0 sm:flex-1 sm:basis-52">
              <label htmlFor="mov-q" className="mb-1 block text-xs font-bold text-ink">
                Produto ou código
              </label>
              <input
                id="mov-q"
                name="q"
                defaultValue={q}
                placeholder="Ex.: Corinthians ou XS-COR-001"
                className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:contents">
              <div>
                <label htmlFor="mov-tipo" className="mb-1 block text-xs font-bold text-ink">
                  Tipo
                </label>
                <select
                  id="mov-tipo"
                  name="tipo"
                  defaultValue={tipo}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm sm:w-auto"
                >
                  <option value="">Todos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="correcao">Correção</option>
                </select>
              </div>
              <div>
                <label htmlFor="mov-periodo" className="mb-1 block text-xs font-bold text-ink">
                  Período
                </label>
                <select
                  id="mov-periodo"
                  name="periodo"
                  defaultValue={periodo}
                  className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm sm:w-auto"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white hover:bg-roxo-escuro sm:w-auto sm:py-2"
            >
              Filtrar
            </button>
            {(q || tipo || produto || periodo !== "30") && (
              <Link
                href="/admin/movimentacoes"
                className="py-1 text-center text-sm font-semibold text-steel hover:text-roxo sm:py-2"
              >
                Limpar
              </Link>
            )}
          </form>

          {filteredByProduct && (
            <p className="mt-3 text-sm text-steel">
              Mostrando apenas movimentações de{" "}
              <span className="font-bold text-ink">
                {filteredByProduct.product_name}
              </span>{" "}
              ({filteredByProduct.product_sku}).
            </p>
          )}

          {rows.length === 0 ? (
            <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
              <History className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
              <p className="mt-3 font-bold text-ink">
                Nenhuma movimentação neste período.
              </p>
              <p className="mt-1 text-sm text-steel">
                Registre entradas e saídas na tela de Produtos — cada operação
                aparece aqui automaticamente.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-4 text-xs text-steel">
                {total} {total === 1 ? "movimentação" : "movimentações"} no
                período selecionado.
              </p>

              {/* Tabela desktop */}
              <div className="mt-2 hidden overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-ink/5 md:block">
                <table className="w-full min-w-[880px] text-left text-sm">
                  <thead className="bg-ink text-white">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Tam.</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3 text-right">Qtd.</th>
                      <th className="px-4 py-3 text-right">Estoque</th>
                      <th className="px-4 py-3">Motivo</th>
                      <th className="px-4 py-3">Pedido</th>
                      <th className="px-4 py-3">Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((m, i) => (
                      <tr key={m.id} className={i % 2 ? "bg-cloud/40" : "bg-white"}>
                        <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                          {fmtDate(m.created_at)}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-ink">
                            {m.product_name}
                          </span>
                          <span className="block text-xs text-steel">
                            {m.product_sku}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-bold">{m.variant_label}</td>
                        <td className="px-4 py-2.5">
                          <TypeBadge type={m.type} />
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums font-bold">
                          {m.type === "saida" ? "−" : "+"}
                          {m.quantity}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
                          {m.stock_before} → {m.stock_after}
                        </td>
                        <td className="px-4 py-2.5">
                          {m.reason}
                          {m.notes && (
                            <span className="block text-xs text-steel">{m.notes}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">{m.related_order ?? "—"}</td>
                        <td className="max-w-40 truncate px-4 py-2.5 text-xs text-steel">
                          {m.created_by_email ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards mobile */}
              <ul className="mt-2 space-y-3 md:hidden">
                {rows.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <TypeBadge type={m.type} />
                      <span className="text-xs tabular-nums text-steel">
                        {fmtDate(m.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-ink">{m.product_name}</p>
                    <p className="text-xs text-steel">{m.product_sku}</p>
                    <p className="mt-2 text-sm">
                      Tamanho <span className="font-bold">{m.variant_label}</span>{" "}
                      · {m.type === "saida" ? "−" : "+"}
                      {m.quantity} un. · estoque {m.stock_before} →{" "}
                      <span className="font-bold">{m.stock_after}</span>
                    </p>
                    <p className="mt-1 text-sm text-steel">
                      {m.reason}
                      {m.related_order ? ` · Pedido: ${m.related_order}` : ""}
                    </p>
                    {m.notes && <p className="mt-1 text-xs text-steel">{m.notes}</p>}
                    {m.created_by_email && (
                      <p className="mt-1 text-[11px] text-steel/70">
                        {m.created_by_email}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="mt-4 text-center">
                  <Link
                    href={`/admin/movimentacoes?${moreParams.toString()}`}
                    className="inline-block rounded-lg border-2 border-ink/15 px-5 py-2.5 text-sm font-bold text-ink hover:border-roxo hover:text-roxo"
                  >
                    Carregar mais
                  </Link>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
