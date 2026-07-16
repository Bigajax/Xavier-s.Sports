"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "xaviers-sports:sacola";
const EVENT = "xaviers-cart-changed";

/** Item da sacola: mesma camisa em tamanhos diferentes vira linhas separadas. */
export type CartItem = {
  slug: string;
  size?: string;
  qty: number;
};

function itemKey(item: Pick<CartItem, "slug" | "size">): string {
  return `${item.slug}::${item.size ?? ""}`;
}

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        i &&
        typeof i === "object" &&
        typeof i.slug === "string" &&
        typeof i.qty === "number" &&
        i.qty >= 1
    );
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Sacola de pedido em localStorage, sincronizada entre componentes (evento
 * custom) e entre abas (evento storage) — mesmo padrão de useFavorites.
 * `ready` evita divergência de hidratação.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /** Adiciona 1 unidade; se a linha (camisa + tamanho) já existe, incrementa. */
  const add = useCallback((slug: string, size?: string) => {
    const current = read();
    const key = itemKey({ slug, size });
    const exists = current.some((i) => itemKey(i) === key);
    write(
      exists
        ? current.map((i) =>
            itemKey(i) === key ? { ...i, qty: i.qty + 1 } : i
          )
        : [...current, { slug, size, qty: 1 }]
    );
  }, []);

  /** Define a quantidade de uma linha; 0 ou menos remove. */
  const setQty = useCallback((slug: string, size: string | undefined, qty: number) => {
    const key = itemKey({ slug, size });
    const next = read()
      .map((i) => (itemKey(i) === key ? { ...i, qty } : i))
      .filter((i) => i.qty >= 1);
    write(next);
  }, []);

  /** Troca o tamanho de uma linha; se já existe linha no novo tamanho, mescla. */
  const setSize = useCallback(
    (slug: string, from: string | undefined, to: string | undefined) => {
      const fromKey = itemKey({ slug, size: from });
      const toKey = itemKey({ slug, size: to });
      if (fromKey === toKey) return;
      const current = read();
      const moving = current.find((i) => itemKey(i) === fromKey);
      if (!moving) return;
      const target = current.find((i) => itemKey(i) === toKey);
      const next = current
        .filter((i) => itemKey(i) !== fromKey)
        .map((i) =>
          itemKey(i) === toKey ? { ...i, qty: i.qty + moving.qty } : i
        );
      write(target ? next : [...next, { ...moving, size: to }]);
    },
    []
  );

  const remove = useCallback((slug: string, size?: string) => {
    const key = itemKey({ slug, size });
    write(read().filter((i) => itemKey(i) !== key));
  }, []);

  const clear = useCallback(() => write([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, ready, add, setQty, setSize, remove, clear, count };
}
