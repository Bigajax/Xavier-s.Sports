"use server";

import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { RETURN_STATUSES, REVIEW_STATUSES } from "@/lib/atendimento";

/** Escritas de trocas/devoluções e avaliações — padrão do painel. */

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada — entre novamente no painel.");
  return supabase;
}

function fail(e: unknown): ActionResult {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Não foi possível salvar agora.",
  };
}

function pendingDb(message: string): string | null {
  return /schema cache|does not exist|returns|reviews|next_return_protocol/i.test(message)
    ? "Atualização do banco pendente — rode a migration 0004 no Supabase."
    : null;
}

// ---------- Trocas ----------

const returnSchema = z.object({
  id: z.string().uuid().optional(),
  orderNumber: z.string().trim().max(20).optional(),
  customerName: z.string().trim().min(1, "Informe o cliente").max(120),
  whatsapp: z.string().trim().max(30).optional(),
  productName: z.string().trim().min(1, "Informe o produto").max(160),
  sizeBought: z.string().trim().max(20).optional(),
  sizeWanted: z.string().trim().max(20).optional(),
  qty: z.number().int().min(1),
  reason: z.string().trim().max(300),
});

export async function saveReturn(
  input: z.infer<typeof returnSchema>
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = returnSchema.parse(input);
    const row = {
      order_number: data.orderNumber || null,
      customer_name: data.customerName,
      whatsapp: data.whatsapp || null,
      product_name: data.productName,
      size_bought: data.sizeBought || null,
      size_wanted: data.sizeWanted || null,
      qty: data.qty,
      reason: data.reason,
      updated_at: new Date().toISOString(),
    };
    if (data.id) {
      const { error } = await supabase.from("returns").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { data: protocol, error: pError } = await supabase.rpc("next_return_protocol");
      if (pError) {
        const p = pendingDb(pError.message);
        if (p) return { ok: false, error: p };
        throw new Error(pError.message);
      }
      const { error } = await supabase
        .from("returns")
        .insert({ ...row, protocol: protocol as string });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const returnStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(RETURN_STATUSES).optional(),
  internalNotes: z.string().trim().max(500).optional(),
  refusalReason: z.string().trim().max(300).optional(),
  archived: z.boolean().optional(),
});

export async function updateReturn(
  input: z.infer<typeof returnStatusSchema>
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = returnStatusSchema.parse(input);
    if (data.status === "Recusada" && !data.refusalReason?.trim()) {
      return { ok: false, error: "Recusar exige a justificativa interna." };
    }
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) row.status = data.status;
    if (data.internalNotes !== undefined) row.internal_notes = data.internalNotes || null;
    if (data.refusalReason !== undefined) row.refusal_reason = data.refusalReason || null;
    if (data.archived !== undefined) {
      row.archived_at = data.archived ? new Date().toISOString() : null;
    }
    const { error } = await supabase.from("returns").update(row).eq("id", data.id);
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

// ---------- Avaliações ----------

const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  customerName: z.string().trim().min(1, "Informe o nome").max(120),
  city: z.string().trim().max(80).optional(),
  productName: z.string().trim().max(160).optional(),
  orderNumber: z.string().trim().max(20).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(600),
  verified: z.boolean().optional(),
  authorized: z.boolean().optional(),
});

export async function saveReview(
  input: z.infer<typeof reviewSchema>
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = reviewSchema.parse(input);
    const row = {
      customer_name: data.customerName,
      city: data.city || null,
      product_name: data.productName || null,
      order_number: data.orderNumber || null,
      rating: data.rating,
      comment: data.comment,
      verified: data.verified ?? false,
      authorized: data.authorized ?? true,
      updated_at: new Date().toISOString(),
    };
    const { error } = data.id
      ? await supabase.from("reviews").update(row).eq("id", data.id)
      : await supabase.from("reviews").insert(row);
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

const reviewStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(REVIEW_STATUSES).optional(),
  highlight: z.boolean().optional(),
});

export async function updateReviewStatus(
  input: z.infer<typeof reviewStatusSchema>
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = reviewStatusSchema.parse(input);
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status !== undefined) row.status = data.status;
    if (data.highlight !== undefined) row.highlight = data.highlight;
    const { error } = await supabase.from("reviews").update(row).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
