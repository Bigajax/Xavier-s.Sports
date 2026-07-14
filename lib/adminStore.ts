"use client";

/**
 * Armazenamento local do painel demonstrativo (/admin).
 * Nesta versão os dados vivem em localStorage; a estrutura foi pensada para
 * migrar para Supabase (tabelas espelham as chaves abaixo).
 */

import { useCallback, useEffect, useState } from "react";

const PREFIX = "xaviers-admin:";

export type ExchangeStatus =
  | "Nova solicitação"
  | "Aguardando informações"
  | "Em análise"
  | "Aguardando postagem"
  | "Produto em trânsito"
  | "Produto recebido"
  | "Troca aprovada"
  | "Devolução aprovada"
  | "Nova peça enviada"
  | "Reembolso em andamento"
  | "Finalizada"
  | "Recusada";

export const exchangeStatuses: ExchangeStatus[] = [
  "Nova solicitação",
  "Aguardando informações",
  "Em análise",
  "Aguardando postagem",
  "Produto em trânsito",
  "Produto recebido",
  "Troca aprovada",
  "Devolução aprovada",
  "Nova peça enviada",
  "Reembolso em andamento",
  "Finalizada",
  "Recusada",
];

export type ExchangeRecord = {
  id: string;
  protocolo: string;
  cliente: string;
  pedido: string;
  motivo: string;
  produto: string;
  tamanhoAtual?: string;
  tamanhoSolicitado?: string;
  data: string;
  status: ExchangeStatus;
  custos?: string;
  solucao?: string;
  justificativaRecusa?: string;
};

export type ReviewRecord = {
  id: string;
  nome: string;
  cidade: string;
  avaliacao: number;
  comentario: string;
  produto: string;
  aprovado: boolean;
};

export function useAdminCollection<T extends { id: string }>(
  key: string,
  seed: T[] = []
) {
  const storageKey = PREFIX + key;
  const [items, setItems] = useState<T[]>(seed);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* mantém o seed */
    }
    setReady(true);
  }, [storageKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const add = useCallback(
    (item: T) => persist([item, ...items]),
    [items, persist]
  );
  const update = useCallback(
    (id: string, patch: Partial<T>) =>
      persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    [items, persist]
  );
  const remove = useCallback(
    (id: string) => persist(items.filter((i) => i.id !== id)),
    [items, persist]
  );

  return { items, ready, add, update, remove, replaceAll: persist };
}
