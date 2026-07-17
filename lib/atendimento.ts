/** Tipos e status de trocas/devoluções e avaliações. */

export const RETURN_STATUSES = [
  "Solicitação recebida",
  "Em análise",
  "Aprovada",
  "Aguardando envio do cliente",
  "Produto em transporte",
  "Produto recebido",
  "Novo produto separado",
  "Novo produto enviado",
  "Reembolso realizado",
  "Recusada",
  "Concluída",
] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];

export const REVIEW_STATUSES = [
  "Aguardando aprovação",
  "Publicada",
  "Oculta",
  "Recusada",
] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export type ReturnRow = {
  id: string;
  protocol: string;
  order_number: string | null;
  customer_name: string;
  whatsapp: string | null;
  product_name: string;
  size_bought: string | null;
  size_wanted: string | null;
  qty: number;
  reason: string;
  status: ReturnStatus;
  internal_notes: string | null;
  refusal_reason: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewRow = {
  id: string;
  customer_name: string;
  city: string | null;
  product_name: string | null;
  order_number: string | null;
  rating: number;
  comment: string;
  verified: boolean;
  authorized: boolean;
  highlight: boolean;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
};
