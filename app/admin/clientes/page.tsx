import { Users } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { CustomerRow, OrderRow } from "@/lib/crm";
import CustomersBoard from "@/components/admin/CustomersBoard";
import HelpButton from "@/components/admin/HelpButton";

export const dynamic = "force-dynamic";

export default async function AdminClientes() {
  let customers: CustomerRow[] = [];
  let orders: Pick<OrderRow, "customer_id" | "status" | "payment_status">[] = [];
  let itemsByOrder: Record<string, number> = {};
  let tablePending = false;

  try {
    const supabase = await supabaseServer();
    const [{ data: c, error: cError }, { data: o, error: oError }] =
      await Promise.all([
        supabase
          .from("customers")
          .select("*")
          .is("archived_at", null)
          .order("created_at", { ascending: false })
          .limit(300),
        supabase
          .from("orders")
          .select("id, customer_id, status, payment_status, order_items(qty, unit_price)"),
      ]);
    if (cError) throw cError;
    if (oError) throw oError;
    customers = (c ?? []) as CustomerRow[];
    orders = (o ?? []) as never[];
    itemsByOrder = Object.fromEntries(
      ((o ?? []) as { id: string; order_items?: { qty: number; unit_price: number | string }[] }[]).map(
        (row) => [
          row.id,
          (row.order_items ?? []).reduce(
            (s, i) => s + Number(i.unit_price) * i.qty,
            0
          ),
        ]
      )
    );
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    if (/customers|orders|does not exist|schema cache/i.test(message)) {
      tablePending = true;
    }
  }

  // Total de pedidos e gasto por cliente (pagos contam no total gasto).
  const stats: Record<string, { count: number; spent: number }> = {};
  for (const o of orders as (OrderRow & { id: string })[]) {
    if (!o.customer_id) continue;
    const s = (stats[o.customer_id] ??= { count: 0, spent: 0 });
    if (o.status !== "Cancelado") s.count += 1;
    if (o.payment_status === "Pago") s.spent += itemsByOrder[o.id] ?? 0;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Clientes</h1>
          <p className="mt-1 text-sm text-steel">
            Cadastro simples, sem duplicados — o telefone identifica cada
            cliente.
          </p>
        </div>
        <HelpButton topic="clientes" />
      </div>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-ink/40" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">
            Os clientes serão ativados após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Aplique a atualização (migration 0003) para cadastrar clientes e
            acompanhar o histórico de cada um.
          </p>
        </div>
      ) : (
        <CustomersBoard customers={customers} stats={stats} />
      )}
    </div>
  );
}
