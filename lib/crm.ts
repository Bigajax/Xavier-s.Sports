/** Status e tipos do CRM (consultas, pedidos, clientes) — compartilhados. */

export const LEAD_STATUSES = [
  "Nova consulta",
  "Aguardando resposta da loja",
  "Em atendimento",
  "Aguardando resposta do cliente",
  "Interessado",
  "Não respondeu",
  "Convertido em pedido",
  "Perdido",
  "Cancelado",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const ORDER_STATUSES = [
  "Rascunho",
  "Aguardando confirmação",
  "Aguardando pagamento",
  "Pago",
  "Separando produtos",
  "Aguardando envio",
  "Enviado",
  "Entregue",
  "Concluído",
  "Cancelado",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "Não informado",
  "Aguardando pagamento",
  "Pago",
  "Parcial",
  "Reembolsado",
  "Cancelado",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Normaliza telefone para comparação/dedupe: só dígitos, com DDI 55. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length <= 11 ? `55${digits}` : digits;
}

export type LeadRow = {
  id: string;
  customer_name: string | null;
  whatsapp: string | null;
  product_id: string | null;
  product_name: string | null;
  product_sku: string | null;
  version: string | null;
  size: string | null;
  personalization: string | null;
  shown_price: number | string | null;
  origin: string;
  page: string | null;
  status: LeadStatus;
  notes: string | null;
  order_id: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_sku: string;
  size: string | null;
  qty: number;
  unit_price: number | string;
  personalization: string | null;
};

export type OrderRow = {
  id: string;
  number: string;
  customer_id: string | null;
  customer_name: string;
  whatsapp: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  discount: number | string;
  shipping: number | string;
  address: string | null;
  tracking_code: string | null;
  notes: string | null;
  lead_id: string | null;
  stock_deducted_at: string | null;
  stock_deducted_by: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemRow[];
};

export type CustomerRow = {
  id: string;
  name: string;
  whatsapp: string | null;
  whatsapp_normalized: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Total de um pedido: itens − desconto + frete. */
export function orderTotal(order: OrderRow): number {
  const items = (order.order_items ?? []).reduce(
    (sum, i) => sum + Number(i.unit_price) * i.qty,
    0
  );
  return Math.max(0, items - Number(order.discount) + Number(order.shipping));
}
