"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "xaviers-sports:favoritos";
const SIZE_KEY = "xaviers-sports:favoritos-tamanhos";
const EVENT = "xaviers-favorites-changed";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSizes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SIZE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function write(slugs: string[], sizes?: Record<string, string>) {
  window.localStorage.setItem(KEY, JSON.stringify(slugs));
  if (sizes) window.localStorage.setItem(SIZE_KEY, JSON.stringify(sizes));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Favoritos em localStorage, sincronizados entre componentes (evento custom)
 * e entre abas (evento storage). `ready` evita divergência de hidratação.
 */
export function useFavorites() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setSlugs(read());
      setSizes(readSizes());
    };
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((slug: string) => {
    const current = read();
    const removing = current.includes(slug);
    const next = removing
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    const nextSizes = { ...readSizes() };
    if (removing) delete nextSizes[slug];
    write(next, nextSizes);
  }, []);

  /** tamanho desejado por favorito ("" remove a escolha) */
  const setSize = useCallback((slug: string, size: string) => {
    const nextSizes = { ...readSizes() };
    if (size) nextSizes[slug] = size;
    else delete nextSizes[slug];
    write(read(), nextSizes);
  }, []);

  const clear = useCallback(() => write([], {}), []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, sizes, setSize, ready, toggle, clear, has, count: slugs.length };
}
