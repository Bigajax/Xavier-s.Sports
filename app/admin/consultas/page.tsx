import { MessageSquareText } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { LeadRow } from "@/lib/crm";
import LeadsBoard from "@/components/admin/LeadsBoard";
import HelpButton from "@/components/admin/HelpButton";

export const dynamic = "force-dynamic";

export default async function AdminConsultas() {
  let leads: LeadRow[] = [];
  let tablePending = false;

  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("whatsapp_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    leads = (data ?? []) as LeadRow[];
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    if (/whatsapp_leads|does not exist|schema cache/i.test(message)) {
      tablePending = true;
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Consultas do WhatsApp</h1>
          <p className="mt-1 text-sm text-steel">
            Cada toque num botão de WhatsApp do site vira uma consulta aqui —
            acompanhe, anote e transforme em pedido.
          </p>
        </div>
        <HelpButton topic="consultas" />
      </div>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <MessageSquareText
            className="mx-auto h-8 w-8 text-ink/40"
            aria-hidden="true"
          />
          <p className="mt-3 font-bold text-ink">
            As consultas serão ativadas após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Aplique a atualização (migration 0003) e os cliques de WhatsApp do
            site passam a aparecer aqui automaticamente.
          </p>
        </div>
      ) : (
        <LeadsBoard leads={leads} />
      )}
    </div>
  );
}
