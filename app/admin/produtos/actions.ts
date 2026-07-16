"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { PRODUCTS_TAG } from "@/lib/products/db";

/**
 * Escritas do painel de produtos. Toda action: sessão obrigatória → validação
 * zod → escrita (RLS como segunda camada) → revalidateTag para a vitrine
 * refletir na hora.
 */

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

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, "Informe o tamanho").max(20),
  stock: z.number().int().min(0, "Estoque não pode ser negativo"),
  allowPreOrder: z.boolean(),
  estimatedDelivery: z.string().trim().max(60).optional(),
  active: z.boolean(),
});

const saveProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(3, "Nome muito curto"),
  description: z.string().trim(),
  price: z.number().positive("Preço deve ser maior que zero"),
  oldPrice: z.number().positive().nullable(),
  available: z.boolean(),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
  onSale: z.boolean(),
  variants: z.array(variantSchema).min(1, "Mantenha ao menos um tamanho"),
  deletedVariantIds: z.array(z.string().uuid()),
});

export type SaveProductInput = z.infer<typeof saveProductSchema>;

export async function saveProduct(input: SaveProductInput): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = saveProductSchema.parse(input);

    const labels = data.variants.map((v) => v.label.toUpperCase());
    if (new Set(labels).size !== labels.length) {
      return { ok: false, error: "Há tamanhos repetidos — cada tamanho deve ser único." };
    }

    const { error: productError } = await supabase
      .from("products")
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        old_price: data.oldPrice,
        available: data.available,
        featured: data.featured,
        new_arrival: data.newArrival,
        best_seller: data.bestSeller,
        on_sale: data.onSale,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (productError) throw new Error(productError.message);

    if (data.deletedVariantIds.length > 0) {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .in("id", data.deletedVariantIds)
        .eq("product_id", data.id);
      if (error) throw new Error(error.message);
    }

    for (const [index, v] of data.variants.entries()) {
      const row = {
        product_id: data.id,
        label: v.label,
        stock: v.stock,
        allow_pre_order: v.allowPreOrder,
        estimated_delivery: v.estimatedDelivery || null,
        active: v.active,
        position: index,
      };
      const { error } = v.id
        ? await supabase.from("product_variants").update(row).eq("id", v.id)
        : await supabase.from("product_variants").insert(row);
      if (error) throw new Error(error.message);
    }

    revalidateTag(PRODUCTS_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function toggleAvailable(
  id: string,
  available: boolean
): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const { error } = await supabase
      .from("products")
      .update({ available, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateTag(PRODUCTS_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateTag(PRODUCTS_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

const stockSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1, "Quantidade mínima: 1"),
});

/** Registrar venda: baixa `qty` unidades (nunca deixa o estoque negativo). */
export async function registerSale(
  variantId: string,
  qty: number
): Promise<ActionResult & { newStock?: number }> {
  try {
    const supabase = await requireUser();
    const data = stockSchema.parse({ variantId, qty });
    const { data: newStock, error } = await supabase.rpc("adjust_variant_stock", {
      variant_id: data.variantId,
      delta: -data.qty,
    });
    if (error) {
      if (/check/i.test(error.message)) {
        return { ok: false, error: "Estoque insuficiente para esta venda." };
      }
      throw new Error(error.message);
    }
    revalidateTag(PRODUCTS_TAG);
    return { ok: true, newStock: newStock as number };
  } catch (e) {
    return fail(e);
  }
}

/** Adicionar estoque: soma `qty` unidades ao saldo atual (entrada de mercadoria). */
export async function addStock(
  variantId: string,
  qty: number
): Promise<ActionResult & { newStock?: number }> {
  try {
    const supabase = await requireUser();
    const data = stockSchema.parse({ variantId, qty });
    const { data: newStock, error } = await supabase.rpc("adjust_variant_stock", {
      variant_id: data.variantId,
      delta: data.qty,
    });
    if (error) throw new Error(error.message);
    revalidateTag(PRODUCTS_TAG);
    return { ok: true, newStock: newStock as number };
  } catch (e) {
    return fail(e);
  }
}
