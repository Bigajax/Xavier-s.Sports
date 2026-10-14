import "server-only";

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import type { Product, Variant } from "@/lib/products/types";
import { PRE_ORDER_DELIVERY_RANGE } from "@/config/catalogo";
import { getTeam } from "@/data/teams";

/**
 * A LEITURA DO CATÁLOGO (14/10/2026: o painel do pacote).
 *
 * Desde a troca para o painel do @vitrine/plataforma, as camisas moram nas
 * tabelas dele (produtos, produto_imagens, categorias), editadas em /painel.
 * Esta é a PONTE: lê as tabelas do pacote e devolve o mesmo Product de
 * sempre, e o site inteiro (filtros, fileiras, página da peça, sacola) segue
 * sem mudar. As tabelas antigas (products, product_variants) ficaram no banco,
 * intactas, até o Rafael mandar apagar.
 *
 * O que vem de onde:
 * - o time, a temporada, a versão, o público, a manga e o "aceita nome e
 *   número" vêm de produtos.camisa (a opção camisa do pacote); o tipo, o país
 *   e a liga saem do time em data/teams.ts;
 * - o estoque é por tamanho (produtos.estoque). Tamanho com estoque é pronta
 *   entrega; sem estoque é encomenda, com o prazo único da loja; o tamanho
 *   riscado no painel (tamanhos_esgotados) não sai nem por encomenda;
 * - o preço: no pacote, `preco` é o cheio e `preco_promocional` o de oferta.
 *
 * Usa o cliente anon puro (sem cookies): um cliente com cookies tornaria as
 * rotas dinâmicas e quebraria o unstable_cache. A etiqueta "catalogo" é a que
 * o painel do pacote apaga ao salvar (lib/vitrine-cache), então o site mostra
 * na hora.
 */

export const PRODUCTS_TAG = "catalogo";
const PARCELAS_PADRAO = 3;
const PERSONALIZACAO_REFERENCIA = 40;

function anonClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. Copie .env.example para .env.local e preencha com os dados do projeto Supabase."
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

type Camisa = {
  time?: string;
  temporada?: string;
  versao?: string;
  publico?: string;
  manga?: string;
  personalizavel?: boolean;
  parcelas?: number;
  material?: string;
  cuidados?: string[];
  novo?: boolean;
  tags?: string[];
  video?: string;
  estoque_baixo?: number;
};

export type LinhaProduto = {
  id: string;
  codigo: string;
  nome: string;
  slug: string;
  descricao: string | null;
  marca: string | null;
  preco: number | string | null;
  preco_promocional: number | string | null;
  tamanhos: string[] | null;
  tamanhos_esgotados: string[] | null;
  estoque: Record<string, number> | null;
  cores: string[] | null;
  destaque: boolean;
  ativo: boolean;
  camisa: Camisa | null;
  categorias: { slug: string } | null;
  produto_imagens: { url: string; ordem: number }[] | null;
};

const SELECT = "id, codigo, nome, slug, descricao, marca, preco, preco_promocional, tamanhos, tamanhos_esgotados, estoque, cores, destaque, ativo, camisa, ordem, created_at, categorias(slug), produto_imagens(url, ordem)";

const VERSOES: Product["version"][] = ["torcedor", "jogador", "treino", "pre-jogo", "goleiro", "retro"];
const PUBLICOS: Product["audience"][] = ["masculino", "feminino", "infantil", "unissex"];

/** os tamanhos da peça no formato do site */
export function variantesDa(linha: Pick<LinhaProduto, "id" | "tamanhos" | "tamanhos_esgotados" | "estoque">): Variant[] {
  const riscados = new Set(linha.tamanhos_esgotados ?? []);
  return (linha.tamanhos ?? []).map((label) => {
    const encomenda = !riscados.has(label);
    return {
      id: `${linha.id}:${label}`,
      label,
      stock: Math.max(0, Number(linha.estoque?.[label] ?? 0)),
      allowPreOrder: encomenda,
      estimatedDelivery: encomenda ? PRE_ORDER_DELIVERY_RANGE : undefined,
      active: true,
    };
  });
}

/** a linha do painel no Product do site. `numeric` chega como string */
export function daLinha(linha: LinhaProduto): Product {
  const c = linha.camisa ?? {};
  const time = getTeam(c.time ?? "");
  const cheio = linha.preco != null ? Number(linha.preco) : 0;
  const oferta = linha.preco_promocional != null ? Number(linha.preco_promocional) : null;
  const versao = VERSOES.includes(c.versao as Product["version"]) ? (c.versao as Product["version"]) : "torcedor";
  const retro = versao === "retro" || linha.categorias?.slug === "retro";
  return {
    id: linha.id,
    slug: linha.slug,
    name: linha.nome,
    team: linha.marca || time?.name || "",
    teamSlug: c.time ?? "",
    teamType: time?.type ?? (linha.categorias?.slug === "selecoes" ? "selecao" : "clube"),
    country: time?.country ?? "",
    /* as seleções têm a liga "selecoes" no filtro do catálogo, e o teams.ts não a escreve */
    league: time?.league ?? (time?.type === "selecao" ? "selecoes" : undefined),
    season: c.temporada || undefined,
    collection: retro ? "retro" : "atual",
    version: versao,
    audience: PUBLICOS.includes(c.publico as Product["audience"]) ? (c.publico as Product["audience"]) : "masculino",
    sleeve: c.manga === "longa" ? "longa" : "curta",
    description: linha.descricao ?? "",
    price: oferta != null && oferta < cheio ? oferta : cheio,
    oldPrice: oferta != null && oferta < cheio ? cheio : undefined,
    installments: c.parcelas ?? PARCELAS_PADRAO,
    images: [...(linha.produto_imagens ?? [])].sort((a, b) => a.ordem - b.ordem).map((i) => i.url),
    video: c.video,
    colors: linha.cores ?? [],
    variants: variantesDa(linha),
    personalizationAvailable: c.personalizavel ?? true,
    personalizationPrice: PERSONALIZACAO_REFERENCIA,
    sku: linha.codigo,
    material: c.material,
    careInstructions: c.cuidados,
    featured: linha.destaque,
    newArrival: Boolean(c.novo),
    bestSeller: linha.destaque,
    onSale: oferta != null && oferta < cheio,
    available: linha.ativo,
    tags: c.tags ?? [],
    archivedAt: null,
    lowStockThreshold: c.estoque_baixo ?? null,
  };
}

async function fetchCatalog(): Promise<Product[]> {
  const { data, error } = await anonClient()
    .from("produtos")
    .select(SELECT)
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  if (error) throw new Error(`Erro ao carregar o catálogo: ${error.message}`);
  return (data as unknown as LinhaProduto[]).map(daLinha);
}

/** Catálogo completo visível na vitrine (ativo = true). */
export const getCatalog = unstable_cache(fetchCatalog, ["catalogo-pacote"], {
  tags: [PRODUCTS_TAG, "products"],
  revalidate: 300,
});

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getCatalog();
  return all.find((p) => p.slug === slug);
}
