import { RefreshCcw } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { ReturnRow } from "@/lib/atendimento";
import ReturnsBoard from "@/components/admin/ReturnsBoard";

export const dynamic = "force-dynamic";

export default async function AdminTrocas() {
  let rows: ReturnRow[] = [];
  let tablePending = false;
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("returns")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    rows = (data ?? []) as ReturnRow[];
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    if (/returns|does not exist|schema cache/i.test(message)) tablePending = true;
  }

  return (
    <div>
      <h1 className="display text-3xl text-ink">Trocas e devoluções</h1>
      <p className="mt-1 text-sm text-steel">
        Cada solicitação tem protocolo, status e justificativa. Recusas exigem
        o motivo interno.
      </p>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <RefreshCcw className="mx-auto h-8 w-8 text-ink/40" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">
            As trocas serão ativadas após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Aplique a migration 0004 no Supabase para registrar solicitações
            com protocolo e acompanhamento.
          </p>
        </div>
      ) : (
        <ReturnsBoard rows={rows} />
      )}
    </div>
  );
}
