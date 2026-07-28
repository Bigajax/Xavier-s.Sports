/**
 * Motor de busca do catálogo — usado pela folha de pesquisa e pelo filtro `q`
 * do catálogo. Roda em memória (o catálogo já vem do servidor pelo
 * CatalogProvider), então não há requisição de rede: o custo é montar o
 * "haystack" de cada produto, que fica em cache por objeto.
 */

import {
  availabilitySummary,
  type Product,
} from "@/lib/products/types";

/** Normaliza para busca sem acento e caixa. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export const versionLabels: Record<Product["version"], string> = {
  torcedor: "Torcedor",
  jogador: "Jogador",
  treino: "Treino",
  "pre-jogo": "Pré-jogo",
  goleiro: "Goleiro",
  retro: "Retrô",
};

/**
 * Sinônimos por campo: o cliente busca "player", "feminina", "seleção",
 * "manga longa" ou "pronta entrega" — palavras que não estão no nome do
 * produto, mas descrevem o que ele é.
 */
const versionWords: Record<Product["version"], string> = {
  torcedor: "torcedor torcedora fan",
  jogador: "jogador player atleta",
  treino: "treino training",
  "pre-jogo": "pre-jogo prejogo aquecimento",
  goleiro: "goleiro goalkeeper",
  retro: "retro classica antiga",
};

const audienceWords: Record<Product["audience"], string> = {
  masculino: "masculina masculino",
  feminino: "feminina feminino",
  infantil: "infantil kids crianca",
  unissex: "unissex",
};

const readyCache = new WeakMap<Product, boolean>();

/** Tem ao menos um tamanho a pronta entrega. */
export function isReadyToShip(p: Product): boolean {
  const hit = readyCache.get(p);
  if (hit !== undefined) return hit;
  const ready = availabilitySummary(p).kind === "pronta-entrega";
  readyCache.set(p, ready);
  return ready;
}

const hayCache = new WeakMap<Product, string>();

/** Todo o texto pesquisável de um produto, normalizado. */
function haystack(p: Product): string {
  const hit = hayCache.get(p);
  if (hit !== undefined) return hit;
  const parts = [
    p.name,
    p.team,
    p.season ?? "",
    p.version,
    versionLabels[p.version],
    versionWords[p.version],
    p.audience,
    audienceWords[p.audience],
    p.collection === "retro" ? "retro retro classica antiga" : "atual atuais",
    p.teamType === "selecao" ? "selecao selecoes pais" : "clube clubes time",
    p.sleeve === "longa" ? "manga longa" : "manga curta",
    p.league ?? "",
    p.country,
    p.sku,
    isReadyToShip(p) ? "pronta entrega disponivel imediata" : "",
    ...p.colors,
    ...p.tags,
  ];
  const hay = norm(parts.join(" "));
  hayCache.set(p, hay);
  return hay;
}

/** Todos os termos precisam aparecer em algum campo (AND). */
export function matchesSearch(p: Product, q: string): boolean {
  const hay = haystack(p);
  return norm(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

// ---------- Escopos da folha de pesquisa ----------

export type SearchScope = "todos" | "pronta" | "retro" | "atuais";

export const searchScopes: { key: SearchScope; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pronta", label: "Pronta entrega" },
  { key: "retro", label: "Retrô" },
  { key: "atuais", label: "Atuais" },
];

function inScope(p: Product, scope: SearchScope): boolean {
  switch (scope) {
    case "pronta":
      return isReadyToShip(p);
    case "retro":
      return p.collection === "retro";
    case "atuais":
      return p.collection === "atual";
    default:
      return true;
  }
}

/**
 * Resultados ordenados por relevância: time bate mais forte que nome, nome
 * mais forte que os demais campos, e o que sai hoje aparece antes do que é
 * encomenda. Empate resolve por nome, para a ordem nunca oscilar.
 */
export function searchProducts(
  list: Product[],
  q: string,
  scope: SearchScope = "todos"
): Product[] {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { p: Product; score: number }[] = [];
  for (const p of list) {
    if (!inScope(p, scope)) continue;
    const hay = haystack(p);
    if (!terms.every((t) => hay.includes(t))) continue;

    const team = norm(p.team);
    const name = norm(p.name);
    const season = p.season ? norm(p.season) : "";
    let score = 0;
    for (const t of terms) {
      if (team === t) score += 8;
      else if (team.startsWith(t)) score += 6;
      else if (team.includes(t)) score += 4;
      if (name.startsWith(t)) score += 3;
      else if (name.includes(t)) score += 2;
      if (season.includes(t)) score += 2;
    }
    if (isReadyToShip(p)) score += 1.5;
    if (p.bestSeller) score += 0.75;
    if (p.featured) score += 0.25;
    scored.push({ p, score });
  }

  return scored
    .sort(
      (a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name, "pt-BR")
    )
    .map((s) => s.p);
}
