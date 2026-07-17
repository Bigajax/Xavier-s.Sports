import { ShoppingBag } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import { getAdminCatalog } from "@/lib/products/db";
import type { OrderRow } from "@/lib/crm";
import OrdersBoard from "@/components/admin/OrdersBoard";
import HelpButton from "@/components/admin/HelpButton";

export const dynamic = "force-dynamic";

export default async function AdminPedidos() {
  let orders: OrderRow[] = [];
  let tablePending = false;
  let catalog: Awaited<ReturnType<typeof getAdminCatalog>> = [];

  try {
    catalog = await getAdminCatalog();
  } catch {
    // Sem catálogo o pedido manual fica sem sugestões — ainda funciona.
  }

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    orders = (data ?? []) as OrderRow[];
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    if (/orders|does not exist|schema cache/i.test(message)) {
      tablePending = true;
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Pedidos</h1>
          <p className="mt-1 text-sm text-steel">
            Acompanhe cada pedido do primeiro contato à entrega. Marcar como
            pago dá baixa no estoque uma única vez.
          </p>
        </div>
        <HelpButton topic="pedidos" />
      </div>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-ink/40" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">
            Os pedidos serão ativados após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Aplique a atualização (migration 0003) para criar pedidos, registrar
            pagamentos e envios.
          </p>
        </div>
      ) : (
        <OrdersBoard
          orders={orders}
          products={catalog.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            price: p.price,
            variants: p.variants
              .filter((v) => v.active)
              .map((v) => ({ id: v.id, label: v.label, stock: v.stock })),
          }))}
        />
      )}
    </div>
  );
}
