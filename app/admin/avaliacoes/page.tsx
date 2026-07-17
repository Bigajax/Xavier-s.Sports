import { Star } from "lucide-react";
import { supabaseServer } from "@/lib/supabase/server";
import type { ReviewRow } from "@/lib/atendimento";
import ReviewsBoard from "@/components/admin/ReviewsBoard";

export const dynamic = "force-dynamic";

export default async function AdminAvaliacoes() {
  let rows: ReviewRow[] = [];
  let tablePending = false;
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    rows = (data ?? []) as ReviewRow[];
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    if (/reviews|does not exist|schema cache/i.test(message)) tablePending = true;
  }

  return (
    <div>
      <h1 className="display text-3xl text-ink">Avaliações</h1>
      <p className="mt-1 text-sm text-steel">
        Nada é publicado sem a sua aprovação. Compartilhe o link{" "}
        <span className="font-bold text-roxo">/avaliar</span> com clientes para
        receberem novas avaliações.
      </p>

      {tablePending ? (
        <div className="mt-6 rounded-xl border border-amarelo/50 bg-amarelo/10 p-6 text-center">
          <Star className="mx-auto h-8 w-8 text-ink/40" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">
            As avaliações serão ativadas após a atualização do banco de dados.
          </p>
          <p className="mt-1 text-sm text-steel">
            Aplique a migration 0004 no Supabase para aprovar avaliações e
            publicá-las na página inicial.
          </p>
        </div>
      ) : (
        <ReviewsBoard rows={rows} />
      )}
    </div>
  );
}
