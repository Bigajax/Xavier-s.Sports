"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import {
  LEAD_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  normalizePhone,
} from "@/lib/crm";

/**
 * Escritas do CRM (consultas, pedidos, clientes). Mesmo padrão do painel:
 * sessão obrigatória → validação → escrita com RLS como segunda camada.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — entre novamente no painel.");
  return { supabase, user };
}

function fail(e: unknown): ActionResult {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Não foi possível salvar agora.",
  };
}

function pendingDb(message: string): string | null {
  return /schema cache|does not exist|whatsapp_leads|customers|orders|order_items|next_order_number/i.test(
    message
  )
    ? "Atualização do banco pendente — rode a migration 0003 no Supabase."
    : null;
}

// ---------- Clientes ----------

/** Cria ou atualiza o cliente pelo telefone normalizado (evita duplicados). */
async function upsertCustomerByPhone(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  name: string,
  whatsapp: string
): Promise<string | null> {
  const normalized = normalizePhone(whatsapp);
  if (!normalized) return null;
  const { data: existing } = await supabase
    .from("customers")
    .select("id, name")
    .eq("whatsapp_normalized", normalized)
    .limit(1);
  if (existing && existing.length > 0) {
    if (name && !existing[0].name) {
      await supabase
        .from("customers")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", existing[0].id);
    }
    return existing[0].id as string;
  }
  const { data: created } = await supabase
    .from("customers")
    .insert({ name, whatsapp, whatsapp_normalized: normalized })
    .select("id")
    .single();
  return (created?.id as string) ?? null;
}

const customerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Informe o nome"),
  whatsapp: z.string().trim().max(30).optional(),
  email: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(40).optional(),
  address: z.string().trim().max(240).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function saveCustomer(
  input: z.infer<typeof customerSchema>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const data = customerSchema.parse(input);
    const normalized = data.whatsapp ? normalizePhone(data.whatsapp) : null;
    const row = {
      name: data.name,
      whatsapp: data.whatsapp || null,
      whatsapp_normalized: normalized || null,
      email: data.email || null,
      city: data.city || null,
      state: data.state || null,
      address: data.address || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = data.id
      ? await supabase.from("customers").update(row).eq("id", data.id)
      : await supabase.from("customers").insert(row);
    if (error) {
      if (/whatsapp_normalized/i.test(error.message)) {
        return { ok: false, error: "Já existe um cliente com este WhatsApp." };
      }
      const p = pendingDb(error.message);
      if (p) return { ok: false, error: p };
      throw new Error(error.message);
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ---------- Consultas ----------

const leadUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(LEAD_STATUSES).optional(),
  notes: z.string().trim().max(500).optional(),
  customerName: z.string().trim().max(120).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  archived: z.boolean().optional(),
});

export async function updateLead(
  input: z.infer<typeof leadUpdateSchema>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const data = leadUpdateSchema.parse(input);
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.status !== undefined) row.status = data.status;
    if (data.notes !== undefined) row.notes = data.notes || null;
    if (data.customerName !== undefined) row.customer_name = data.customerName || null;
    if (data.whatsapp !== undefined) row.whatsapp = data.whatsapp || null;
    if (data.archived !== undefined) {
      row.archived_at = data.archived ? new Date().toISOString() : null;
    }
    const { error } = await supabase
      .from("whatsapp_leads")
      .update(row)
      .eq("id", data.id);
    if (error) {
      const p = pendingDb(error.message);
      if (p) return { ok: false, error: p };
      throw new Error(error.message);
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Transforma uma consulta em pedido (rascunho com o item da consulta). */
export async function convertLeadToOrder(
  leadId: string
): Promise<ActionResult & { orderId?: string }> {
  try {
    const { supabase } = await requireUser();
    const { data: lead, error: leadError } = await supabase
      .from("whatsapp_leads")
      .select("*")
      .eq("id", leadId)
      .single();
    if (leadError || !lead) {
      const p = leadError ? pendingDb(leadError.message) : null;
      if (p) return { ok: false, error: p };
      throw new Error(leadError?.message ?? "Consulta não encontrada");
    }
    if (lead.order_id) {
      return { ok: false, error: "Esta consulta já virou pedido." };
    }

    const { data: number, error: numberError } = await supabase.rpc(
      "next_order_number"
    );
    if (numberError) throw new Error(numberError.message);

    const customerId =
      lead.whatsapp && lead.customer_name !== null
        ? await upsertCustomerByPhone(
            supabase,
            lead.customer_name ?? "",
            lead.whatsapp
          )
        : lead.whatsapp
          ? await upsertCustomerByPhone(supabase, "", lead.whatsapp)
          : null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        number: number as string,
        customer_id: customerId,
        customer_name: lead.customer_name ?? "",
        whatsapp: lead.whatsapp,
        status: "Aguardando confirmação",
        lead_id: lead.id,
      })
      .select("id")
      .single();
    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Falha ao criar o pedido");
    }

    // Item do pedido a partir da consulta (variante resolvida pelo tamanho).
    if (lead.product_name) {
      let variantId: string | null = null;
      if (lead.product_id && lead.size) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("id")
          .eq("product_id", lead.product_id)
          .eq("label", lead.size)
          .limit(1);
        variantId = (variant?.[0]?.id as string) ?? null;
      }
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: lead.product_id,
        variant_id: variantId,
        product_name: lead.product_name,
        product_sku: lead.product_sku ?? "",
        size: lead.size,
        qty: 1,
        unit_price: Number(lead.shown_price) || 0,
        personalization: lead.personalization,
      });
      if (itemError) throw new Error(itemError.message);
    }

    await supabase
      .from("whatsapp_leads")
      .update({
        status: "Convertido em pedido",
        order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lead.id);

    return { ok: true, orderId: order.id as string };
  } catch (e) {
    return fail(e);
  }
}

// ---------- Pedidos ----------

const orderItemSchema = z.object({
  productId: z.string().uuid().nullable(),
  variantId: z.string().uuid().nullable(),
  productName: z.string().trim().min(1),
  productSku: z.string().trim().default(""),
  size: z.string().trim().max(20).nullable(),
  qty: z.number().int().min(1),
  unitPrice: z.number().min(0),
  personalization: z.string().trim().max(200).nullable(),
});

const createOrderSchema = z.object({
  customerName: z.string().trim().max(120).default(""),
  whatsapp: z.string().trim().max(30).optional(),
  items: z.array(orderItemSchema).min(1, "Adicione ao menos um item"),
  notes: z.string().trim().max(500).optional(),
});

export async function createOrder(
  input: z.infer<typeof createOrderSchema>
): Promise<ActionResult & { orderId?: string }> {
  try {
    const { supabase } = await requireUser();
    const data = createOrderSchema.parse(input);

    const { data: number, error: numberError } = await supabase.rpc(
      "next_order_number"
    );
    if (numberError) {
      const p = pendingDb(numberError.message);
      if (p) return { ok: false, error: p };
      throw new Error(numberError.message);
    }

    const customerId = data.whatsapp
      ? await upsertCustomerByPhone(supabase, data.customerName, data.whatsapp)
      : null;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        number: number as string,
        customer_id: customerId,
        customer_name: data.customerName,
        whatsapp: data.whatsapp || null,
        notes: data.notes || null,
      })
      .select("id")
      .single();
    if (error || !order) throw new Error(error?.message ?? "Falha ao criar");

    const { error: itemsError } = await supabase.from("order_items").insert(
      data.items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        variant_id: i.variantId,
        product_name: i.productName,
        product_sku: i.productSku,
        size: i.size,
        qty: i.qty,
        unit_price: i.unitPrice,
        personalization: i.personalization,
      }))
    );
    if (itemsError) throw new Error(itemsError.message);

    return { ok: true, orderId: order.id as string };
  } catch (e) {
    return fail(e);
  }
}

const orderUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  paymentMethod: z.string().trim().max(60).optional(),
  customerName: z.string().trim().max(120).optional(),
  whatsapp: z.string().trim().max(30).optional(),
  discount: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  address: z.string().trim().max(240).optional(),
  trackingCode: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function updateOrder(
  input: z.infer<typeof orderUpdateSchema>
): Promise<ActionResult> {
  try {
    const { supabase } = await requireUser();
    const data = orderUpdateSchema.parse(input);
    const row: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.status !== undefined) row.status = data.status;
    if (data.paymentStatus !== undefined) row.payment_status = data.paymentStatus;
    if (data.paymentMethod !== undefined) row.payment_method = data.paymentMethod || null;
    if (data.customerName !== undefined) row.customer_name = data.customerName;
    if (data.whatsapp !== undefined) row.whatsapp = data.whatsapp || null;
    if (data.discount !== undefined) row.discount = data.discount;
    if (data.shipping !== undefined) row.shipping = data.shipping;
    if (data.address !== undefined) row.address = data.address || null;
    if (data.trackingCode !== undefined) row.tracking_code = data.trackingCode || null;
    if (data.notes !== undefined) row.notes = data.notes || null;
    const { error } = await supabase.from("orders").update(row).eq("id", data.id);
    if (error) {
      const p = pendingDb(error.message);
      if (p) return { ok: false, error: p };
      throw new Error(error.message);
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Marca o pedido como pago e dá baixa no estoque UMA ÚNICA VEZ.
 * A "trava" é a coluna stock_deducted_at: só quem conseguir preenchê-la
 * (de null → agora) executa as baixas; cliques repetidos não duplicam.
 */
export async function markOrderPaid(
  orderId: string
): Promise<ActionResult & { warnings?: string[] }> {
  try {
    const { supabase, user } = await requireUser();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (orderError || !order) {
      const p = orderError ? pendingDb(orderError.message) : null;
      if (p) return { ok: false, error: p };
      throw new Error(orderError?.message ?? "Pedido não encontrado");
    }

    // Sempre marca o pagamento.
    const paid = {
      payment_status: "Pago",
      status: order.status === "Aguardando pagamento" || order.status === "Aguardando confirmação" || order.status === "Rascunho"
        ? "Pago"
        : order.status,
      updated_at: new Date().toISOString(),
    };

    // Trava contra baixa dupla: preenche stock_deducted_at só se ainda nulo.
    const { data: claimed, error: claimError } = await supabase
      .from("orders")
      .update({
        ...paid,
        stock_deducted_at: new Date().toISOString(),
        stock_deducted_by: user.email ?? user.id,
      })
      .eq("id", orderId)
      .is("stock_deducted_at", null)
      .select("id");
    if (claimError) throw new Error(claimError.message);

    if (!claimed || claimed.length === 0) {
      // Baixa já havia sido feita — só garante o status de pagamento.
      await supabase.from("orders").update(paid).eq("id", orderId);
      return {
        ok: true,
        warnings: ["A baixa de estoque deste pedido já havia sido realizada."],
      };
    }

    // Baixa item a item, com a movimentação vinculada ao número do pedido.
    const warnings: string[] = [];
    const items = (order.order_items ?? []) as {
      variant_id: string | null;
      product_name: string;
      size: string | null;
      qty: number;
    }[];
    for (const item of items) {
      if (!item.variant_id) {
        warnings.push(
          `${item.product_name}${item.size ? ` (${item.size})` : ""}: item sem vínculo de estoque — baixe manualmente se necessário.`
        );
        continue;
      }
      const { error } = await supabase.rpc("register_stock_movement", {
        p_variant_id: item.variant_id,
        p_delta: -item.qty,
        p_reason: "Venda",
        p_related_order: order.number,
        p_notes: null,
      });
      if (error) {
        warnings.push(
          /check/i.test(error.message)
            ? `${item.product_name}${item.size ? ` (${item.size})` : ""}: estoque insuficiente — baixa NÃO realizada para este item.`
            : `${item.product_name}: ${error.message}`
        );
      }
    }

    return { ok: true, warnings: warnings.length ? warnings : undefined };
  } catch (e) {
    return fail(e);
  }
}

/** Cancela o pedido; se o estoque já foi baixado, pode devolvê-lo. */
export async function cancelOrder(
  orderId: string,
  returnStock: boolean
): Promise<ActionResult & { warnings?: string[] }> {
  try {
    const { supabase } = await requireUser();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (orderError || !order) {
      throw new Error(orderError?.message ?? "Pedido não encontrado");
    }

    const { error } = await supabase
      .from("orders")
      .update({
        status: "Cancelado",
        payment_status:
          order.payment_status === "Pago" ? order.payment_status : "Cancelado",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    if (error) throw new Error(error.message);

    const warnings: string[] = [];
    if (returnStock && order.stock_deducted_at) {
      const items = (order.order_items ?? []) as {
        variant_id: string | null;
        product_name: string;
        qty: number;
      }[];
      for (const item of items) {
        if (!item.variant_id) continue;
        const { error: rpcError } = await supabase.rpc(
          "register_stock_movement",
          {
            p_variant_id: item.variant_id,
            p_delta: item.qty,
            p_reason: "Devolução ao estoque",
            p_related_order: order.number,
            p_notes: "Cancelamento de pedido",
          }
        );
        if (rpcError) warnings.push(`${item.product_name}: ${rpcError.message}`);
      }
    }
    return { ok: true, warnings: warnings.length ? warnings : undefined };
  } catch (e) {
    return fail(e);
  }
}
