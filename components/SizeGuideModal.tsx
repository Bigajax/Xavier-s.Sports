"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Ruler, X } from "lucide-react";
import { sizeTables, type SizeTable } from "@/data/sizes";
import type { Product } from "@/lib/products/types";

/** Tabela de medidas mais adequada ao produto. */
function tableFor(product: Pick<Product, "audience" | "version" | "collection">): SizeTable {
  const pick = (slug: string) => sizeTables.find((t) => t.slug === slug);
  if (product.audience === "feminino") return pick("feminino") ?? sizeTables[0];
  if (product.audience === "infantil") return pick("infantil") ?? sizeTables[0];
  if (product.collection === "retro") return pick("retro") ?? sizeTables[0];
  if (product.version === "jogador")
    return pick("masculino-jogador") ?? sizeTables[0];
  return pick("masculino-torcedor") ?? sizeTables[0];
}

/**
 * Guia de medidas em modal — o cliente confere a tabela sem sair da página
 * de compra. Destaca a linha do tamanho selecionado.
 */
export default function SizeGuideModal({
  product,
  selectedSize,
  open,
  onClose,
}: {
  product: Pick<Product, "audience" | "version" | "collection">;
  selectedSize?: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const table = tableFor(product);
  const hasBody = table.rows.some((r) => r.height || r.weight);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-ink/70"
            onClick={onClose}
            aria-label="Fechar guia de medidas"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 z-[66] mx-auto max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-auto sm:top-1/2 sm:max-w-xl sm:-translate-y-1/2 sm:rounded-2xl sm:p-6 sm:pb-6"
            role="dialog"
            aria-modal="true"
            aria-label="Guia de medidas"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="display flex items-center gap-2 text-2xl text-ink">
                  <Ruler className="h-5 w-5 text-roxo" aria-hidden="true" />
                  Guia de medidas
                </h2>
                <p className="mt-0.5 text-sm text-steel">{table.name}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="rounded-lg p-2 text-steel hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-ink/10">
              <table className="w-full text-left text-[13px] sm:text-sm">
                <thead className="bg-ink text-[10px] uppercase tracking-wide text-white sm:text-[11px]">
                  <tr>
                    <th className="px-2 py-2.5 sm:px-3">Tam.</th>
                    <th className="px-2 py-2.5 sm:px-3">
                      Comprimento
                      <span className="block text-[9px] font-normal normal-case opacity-70">cm</span>
                    </th>
                    <th className="px-2 py-2.5 sm:px-3">
                      Largura
                      <span className="block text-[9px] font-normal normal-case opacity-70">cm</span>
                    </th>
                    {hasBody && (
                      <th className="px-2 py-2.5 sm:px-3">
                        Altura
                        <span className="block text-[9px] font-normal normal-case opacity-70">cm</span>
                      </th>
                    )}
                    {hasBody && (
                      <th className="px-2 py-2.5 sm:px-3">
                        Peso
                        <span className="block text-[9px] font-normal normal-case opacity-70">kg</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, i) => {
                    const active = selectedSize === row.label;
                    return (
                      <tr
                        key={row.label}
                        className={
                          active
                            ? "bg-roxo/10 font-bold text-roxo"
                            : i % 2
                              ? "bg-cloud/40"
                              : "bg-white"
                        }
                      >
                        <td className="whitespace-nowrap px-2 py-2 sm:px-3">
                          {row.label}
                          {active && (
                            <span className="block text-[9px] font-bold uppercase leading-tight">
                              selecionado
                            </span>
                          )}
                        </td>
                        <td className="tabular-nums whitespace-nowrap px-2 py-2 sm:px-3">{row.length}</td>
                        <td className="tabular-nums whitespace-nowrap px-2 py-2 sm:px-3">{row.width}</td>
                        {hasBody && (
                          <td className="tabular-nums whitespace-nowrap px-2 py-2 sm:px-3">
                            {row.height ?? "—"}
                          </td>
                        )}
                        {hasBody && (
                          <td className="tabular-nums whitespace-nowrap px-2 py-2 sm:px-3">
                            {row.weight ?? "—"}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-steel">{table.note}</p>

            <Link
              href="/guia-de-tamanhos"
              className="mt-3 inline-block text-sm font-bold text-roxo hover:underline"
            >
              Ver o guia completo de medidas →
            </Link>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
