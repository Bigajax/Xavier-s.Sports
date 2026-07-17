/** Motivos padronizados das movimentações de estoque do painel. */

export const EXIT_REASONS = [
  "Venda",
  "Troca",
  "Avaria",
  "Uso interno",
  "Ajuste de inventário",
  "Outro",
] as const;

export const ENTRY_REASONS = [
  "Reposição de fornecedor",
  "Devolução ao estoque",
  "Ajuste de inventário",
  "Transferência",
  "Outro",
] as const;

export type ExitReason = (typeof EXIT_REASONS)[number];
export type EntryReason = (typeof ENTRY_REASONS)[number];
