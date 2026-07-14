"use client";

import { useEffect, useState } from "react";

const KEY = "xaviers-sports:vistos";
const MAX = 8;

export function registerView(slug: string) {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [slug, ...list.filter((s) => s !== slug)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* armazenamento indisponível — ignora */
  }
}

export function useRecentlyViewed(excludeSlug?: string) {
  const [slugs, setSlugs] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSlugs(list.filter((s) => s !== excludeSlug));
    } catch {
      setSlugs([]);
    }
  }, [excludeSlug]);
  return slugs;
}
