import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { teamCrest, type Team } from "@/data/teams";
import { getCatalog } from "@/lib/products/db";

/**
 * Card de time: escudo limpo sobre branco (sem molduras nem sombras) e a
 * identidade do clube na dupla faixa diagonal — o corte da marca (-8°).
 */
export default async function TeamCard({ team }: { team: Team }) {
  let count = 0;
  try {
    const products = await getCatalog();
    count = products.filter((p) => p.teamSlug === team.slug).length;
  } catch {
    // Sem catálogo o card mostra "Sob consulta".
  }
  const href =
    team.type === "clube" ? `/clubes/${team.slug}` : `/selecoes/${team.slug}`;

  return (
    <Link
      href={href}
      className="group flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-lg"
    >
      <div className="relative flex h-28 items-center overflow-hidden border-b border-ink/5 bg-gradient-to-br from-white to-cloud/70 pl-6">
        {/* dupla faixa diagonal nas cores do time */}
        <span
          aria-hidden="true"
          className="absolute -right-3 inset-y-0 w-10 -skew-x-[8deg]"
          style={{ backgroundColor: team.colors[0] }}
        />
        <span
          aria-hidden="true"
          className="absolute right-9 inset-y-0 w-2.5 -skew-x-[8deg]"
          style={{ backgroundColor: team.colors[1] }}
        />
        <Image
          src={teamCrest(team.slug)}
          alt={`Escudo — ${team.name}`}
          width={68}
          height={68}
          className="h-[4.25rem] w-[4.25rem] object-contain transition-transform group-hover:scale-110"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold leading-tight text-ink">{team.name}</h3>
        <p className="mt-0.5 text-xs text-steel">
          {count > 0 ? `${count} ${count === 1 ? "produto" : "produtos"}` : "Sob consulta"}
        </p>
        <span className="mt-2 flex items-center gap-1 text-xs font-bold text-roxo">
          Ver camisas
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
