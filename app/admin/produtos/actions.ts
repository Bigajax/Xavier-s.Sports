"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { PRODUCTS_TAG } from "@/lib/products/db";
import { norm } from "@/lib/catalog";

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
  images: z.array(z.string().trim().min(1)).max(8),
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
        images: data.images,
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

const createProductSchema = z.object({
  name: z.string().trim().min(3, "Nome muito curto"),
  team: z.string().trim().min(1, "Informe o time"),
  teamSlug: z.string().trim().min(1),
  teamType: z.enum(["clube", "selecao"]),
  country: z.string().trim().min(1),
  league: z.string().trim().optional(),
  season: z.string().trim().optional(),
  collection: z.enum(["atual", "retro"]),
  version: z.enum(["torcedor", "jogador", "treino", "pre-jogo", "goleiro", "retro"]),
  audience: z.enum(["masculino", "feminino", "infantil", "unissex"]),
  sleeve: z.enum(["curta", "longa"]),
  description: z.string().trim(),
  price: z.number().positive("Preço deve ser maior que zero"),
  oldPrice: z.number().positive().nullable(),
  installments: z.number().int().min(1).max(12).nullable(),
  images: z.array(z.string().trim().min(1)).max(8),
  colors: z.array(z.string().trim().min(1)).max(8),
  personalizationAvailable: z.boolean(),
  personalizationPrice: z.number().positive().nullable(),
  available: z.boolean(),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
  onSale: z.boolean(),
  variants: z.array(variantSchema.omit({ id: true })).min(1, "Adicione ao menos um tamanho"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

function slugify(text: string): string {
  return norm(text)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Cria um produto novo com variantes; slug e SKU são gerados do nome. */
export async function createProduct(
  input: CreateProductInput
): Promise<ActionResult & { slug?: string }> {
  try {
    const supabase = await requireUser();
    const data = createProductSchema.parse(input);

    const labels = data.variants.map((v) => v.label.toUpperCase());
    if (new Set(labels).size !== labels.length) {
      return { ok: false, error: "Há tamanhos repetidos — cada tamanho deve ser único." };
    }

    // Slug único a partir do nome (sufixo -2, -3... em caso de repetição).
    const base = slugify(data.name) || "produto";
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .like("slug", `${base}%`);
    const taken = new Set((existing ?? []).map((r) => r.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const sku = `XS-${data.teamSlug.slice(0, 3).toUpperCase()}-${String(
      Math.floor(Math.random() * 900) + 100
    )}`;

    const { data: row, error } = await supabase
      .from("products")
      .insert({
        slug,
        name: data.name,
        team: data.team,
        team_slug: data.teamSlug,
        team_type: data.teamType,
        country: data.country,
        league: data.league || null,
        season: data.season || null,
        collection: data.collection,
        version: data.version,
        audience: data.audience,
        sleeve: data.sleeve,
        description: data.description,
        price: data.price,
        old_price: data.oldPrice,
        installments: data.installments,
        images: data.images,
        colors: data.colors,
        personalization_available: data.personalizationAvailable,
        personalization_price: data.personalizationPrice,
        sku,
        featured: data.featured,
        new_arrival: data.newArrival,
        best_seller: data.bestSeller,
        on_sale: data.onSale,
        available: data.available,
        tags: [data.teamSlug, ...data.colors.map((c) => norm(c))],
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao criar o produto");

    const { error: variantsError } = await supabase.from("product_variants").insert(
      data.variants.map((v, index) => ({
        product_id: row.id,
        label: v.label,
        stock: v.stock,
        allow_pre_order: v.allowPreOrder,
        estimated_delivery: v.estimatedDelivery || null,
        active: v.active,
        position: index,
      }))
    );
    if (variantsError) throw new Error(variantsError.message);

    revalidateTag(PRODUCTS_TAG);
    return { ok: true, slug };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Sobe a foto do produto para o Supabase Storage (bucket público "produtos")
 * e devolve a URL. Usa a service role no servidor — a chave nunca vai ao
 * navegador; configure SUPABASE_SERVICE_ROLE_KEY também na Vercel.
 */
export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  try {
    await requireUser();

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!serviceKey || !url) {
      return {
        ok: false,
        error:
          "Upload indisponível: configure SUPABASE_SERVICE_ROLE_KEY no servidor. Enquanto isso, cole a URL de uma imagem.",
      };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Selecione um arquivo de imagem." };
    }
    if (file.size > 8 * 1024 * 1024) {
      return { ok: false, error: "Imagem muito grande (máx. 8 MB)." };
    }
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
      return { ok: false, error: "Formato não suportado — use JPG, PNG, WEBP ou AVIF." };
    }

    const storage = createClient(url, serviceKey, {
      auth: { persistSession: false },
    }).storage.from("produtos");

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${Date.now()}-${slugify(file.name.replace(/\.\w+$/, "")) || "produto"}.${ext}`;

    const { error } = await storage.upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
    if (error) throw new Error(error.message);

    return { ok: true, url: storage.getPublicUrl(path).data.publicUrl };
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
