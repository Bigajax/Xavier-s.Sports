"use server";

import { revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseUrl } from "@/lib/supabase/env";
import { PRODUCTS_TAG } from "@/lib/products/db";
import { norm } from "@/lib/catalog";
import { ENTRY_REASONS, EXIT_REASONS } from "@/lib/stock";

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

/** Oferta honesta: só com preço "de" maior que o preço atual. */
function offerRule(
  data: { onSale: boolean; oldPrice: number | null; price: number },
  ctx: z.RefinementCtx
) {
  if (data.onSale && (data.oldPrice === null || data.oldPrice <= data.price)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["onSale"],
      message:
        'Para marcar como oferta, o preço "de" precisa ser maior que o preço atual.',
    });
  }
}

const saveProductSchema = z
  .object({
    id: z.string().uuid(),
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
    colors: z.array(z.string().trim().min(1)).max(8),
    personalizationAvailable: z.boolean(),
    personalizationPrice: z.number().positive().nullable(),
    sku: z.string().trim().min(3, "Código muito curto").max(40),
    images: z.array(z.string().trim().min(1)).max(8),
    available: z.boolean(),
    featured: z.boolean(),
    newArrival: z.boolean(),
    bestSeller: z.boolean(),
    onSale: z.boolean(),
    variants: z.array(variantSchema).min(1, "Mantenha ao menos um tamanho"),
    deletedVariantIds: z.array(z.string().uuid()),
  })
  .superRefine(offerRule);

export type SaveProductInput = z.infer<typeof saveProductSchema>;

export async function saveProduct(input: SaveProductInput): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const data = saveProductSchema.parse(input);

    const labels = data.variants.map((v) => v.label.toUpperCase());
    if (new Set(labels).size !== labels.length) {
      return { ok: false, error: "Há tamanhos repetidos — cada tamanho deve ser único." };
    }

    // Código interno único entre os demais produtos.
    const { data: skuClash } = await supabase
      .from("products")
      .select("id")
      .eq("sku", data.sku)
      .neq("id", data.id)
      .limit(1);
    if (skuClash && skuClash.length > 0) {
      return { ok: false, error: "Este código interno já está em uso por outro produto." };
    }

    const { error: productError } = await supabase
      .from("products")
      .update({
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
        colors: data.colors,
        personalization_available: data.personalizationAvailable,
        personalization_price: data.personalizationPrice,
        sku: data.sku,
        images: data.images,
        available: data.available,
        featured: data.featured,
        new_arrival: data.newArrival,
        best_seller: data.bestSeller,
        on_sale: data.onSale,
        tags: [data.teamSlug, ...data.colors.map((c) => norm(c))],
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (productError) {
      if (/products_sku_unique/i.test(productError.message)) {
        return { ok: false, error: "Este código interno já está em uso por outro produto." };
      }
      throw new Error(productError.message);
    }

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
}).superRefine(offerRule);

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

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const url = supabaseUrl();
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

const exitSchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1, "Quantidade mínima: 1"),
  reason: z.enum(EXIT_REASONS),
  relatedOrder: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(200).optional(),
});

const entrySchema = z.object({
  variantId: z.string().uuid(),
  qty: z.number().int().min(1, "Quantidade mínima: 1"),
  reason: z.enum(ENTRY_REASONS),
  notes: z.string().trim().max(200).optional(),
});

function stockRpcError(message: string): string | null {
  if (/check/i.test(message)) return "Estoque insuficiente para esta saída.";
  if (/register_stock_movement|schema cache|does not exist/i.test(message)) {
    return "Atualização do banco pendente — rode a migration 0002 no Supabase para ativar as movimentações.";
  }
  return null;
}

/** Registrar saída: baixa unidades e grava a movimentação (nunca negativa). */
export async function registerExit(
  input: z.infer<typeof exitSchema>
): Promise<ActionResult & { newStock?: number }> {
  try {
    const supabase = await requireUser();
    const data = exitSchema.parse(input);
    const { data: newStock, error } = await supabase.rpc("register_stock_movement", {
      p_variant_id: data.variantId,
      p_delta: -data.qty,
      p_reason: data.reason,
      p_related_order: data.relatedOrder || null,
      p_notes: data.notes || null,
    });
    if (error) {
      const friendly = stockRpcError(error.message);
      if (friendly) return { ok: false, error: friendly };
      throw new Error(error.message);
    }
    revalidateTag(PRODUCTS_TAG);
    return { ok: true, newStock: newStock as number };
  } catch (e) {
    return fail(e);
  }
}

/** Registrar entrada: soma unidades ao saldo e grava a movimentação. */
export async function registerEntry(
  input: z.infer<typeof entrySchema>
): Promise<ActionResult & { newStock?: number }> {
  try {
    const supabase = await requireUser();
    const data = entrySchema.parse(input);
    const { data: newStock, error } = await supabase.rpc("register_stock_movement", {
      p_variant_id: data.variantId,
      p_delta: data.qty,
      p_reason: data.reason,
      p_related_order: null,
      p_notes: data.notes || null,
    });
    if (error) {
      const friendly = stockRpcError(error.message);
      if (friendly) return { ok: false, error: friendly };
      throw new Error(error.message);
    }
    revalidateTag(PRODUCTS_TAG);
    return { ok: true, newStock: newStock as number };
  } catch (e) {
    return fail(e);
  }
}

/** Arquiva o produto: sai da vitrine e da listagem padrão, sem apagar nada. */
export async function archiveProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const { error } = await supabase
      .from("products")
      .update({
        archived_at: new Date().toISOString(),
        available: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      if (/archived_at|schema cache/i.test(error.message)) {
        return {
          ok: false,
          error:
            "Atualização do banco pendente — rode a migration 0002 no Supabase para ativar o arquivamento.",
        };
      }
      throw new Error(error.message);
    }
    revalidateTag(PRODUCTS_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Restaura um produto arquivado (volta oculto — publique manualmente). */
export async function unarchiveProduct(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireUser();
    const { error } = await supabase
      .from("products")
      .update({ archived_at: null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateTag(PRODUCTS_TAG);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Duplica um produto: cópia nasce oculta, com estoques zerados, slug e SKU
 * novos — o dono edita e publica quando quiser.
 */
export async function duplicateProduct(
  id: string
): Promise<ActionResult & { slug?: string }> {
  try {
    const supabase = await requireUser();

    const { data: original, error: readError } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();
    if (readError || !original) {
      throw new Error(readError?.message ?? "Produto não encontrado");
    }

    const base = `${slugify(original.name)}-copia` || "produto-copia";
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .like("slug", `${base}%`);
    const taken = new Set((existing ?? []).map((r) => r.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

    const sku = `XS-${String(original.team_slug ?? "").slice(0, 3).toUpperCase()}-${String(
      Math.floor(Math.random() * 900) + 100
    )}-${Date.now().toString(36).slice(-3).toUpperCase()}`;

    const {
      id: _id,
      created_at: _c,
      updated_at: _u,
      product_variants: variants,
      archived_at: _a,
      ...rest
    } = original;

    const { data: row, error } = await supabase
      .from("products")
      .insert({
        ...rest,
        slug,
        sku,
        name: `${original.name} (cópia)`,
        available: false,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Falha ao duplicar");

    const variantRows = (variants ?? []) as {
      label: string;
      allow_pre_order: boolean;
      estimated_delivery: string | null;
      active: boolean;
      position: number;
    }[];
    if (variantRows.length > 0) {
      const { error: variantsError } = await supabase.from("product_variants").insert(
        variantRows.map((v) => ({
          product_id: row.id,
          label: v.label,
          stock: 0,
          allow_pre_order: v.allow_pre_order,
          estimated_delivery: v.estimated_delivery,
          active: v.active,
          position: v.position,
        }))
      );
      if (variantsError) throw new Error(variantsError.message);
    }

    revalidateTag(PRODUCTS_TAG);
    return { ok: true, slug };
  } catch (e) {
    return fail(e);
  }
}
