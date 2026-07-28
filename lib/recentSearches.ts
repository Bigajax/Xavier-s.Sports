"use client";

/** Histórico de buscas do próprio aparelho — nada sai do navegador. */

const KEY = "xaviers-sports:buscas";
const MAX = 6;

export function readRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list)
      ? list.filter((t): t is string => typeof t === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

/** Guarda o termo no topo, sem repetir (ignorando caixa). */
export function saveRecentSearch(term: string): string[] {
  const clean = term.trim();
  if (clean.length < 2) return readRecentSearches();
  try {
    const list = readRecentSearches().filter(
      (t) => t.toLowerCase() !== clean.toLowerCase()
    );
    const next = [clean, ...list].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export function clearRecentSearches(): string[] {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* armazenamento indisponível — ignora */
  }
  return [];
}
