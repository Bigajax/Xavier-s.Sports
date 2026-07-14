import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTeam, teamCrest } from "@/data/teams";
import { productsByTeam } from "@/data/products";
import CatalogClient from "@/components/CatalogClient";
import CatalogSkeleton from "@/components/CatalogSkeleton";

/** Página de time/seleção: banner nas cores oficiais + catálogo filtrado. */
export default function TeamPage({ slug }: { slug: string }) {
  const team = getTeam(slug);
  if (!team) notFound();

  const count = productsByTeam(team.slug).length;
  const textColor = team.textOnPrimary === "dark" ? "text-ink" : "text-white";

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: team.colors[0] }}
      >
        {/* placa branca diagonal que abriga o escudo (corte da marca) */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-10 w-44 -skew-x-[8deg] bg-white md:w-72"
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-[9rem] w-2.5 -skew-x-[8deg] md:left-[15.5rem] md:w-3"
          style={{ backgroundColor: team.colors[1] }}
        />
        <div className="mx-auto flex max-w-7xl items-center px-0 py-10 md:px-6 md:py-16">
          <span className="relative flex h-24 w-32 shrink-0 items-center justify-center md:h-32 md:w-60">
            <Image
              src={teamCrest(team.slug)}
              alt={`Escudo — ${team.name}`}
              width={112}
              height={112}
              className="h-full w-auto object-contain"
              priority
            />
          </span>
          <div className={`min-w-0 pl-10 pr-4 sm:pl-12 md:pl-14 ${textColor}`}>
            <p className="xavier-eyebrow opacity-80">
              {team.type === "clube" ? "Clube" : "Seleção"} · {team.country}
            </p>
            <h1 className="display mt-1 text-4xl sm:text-5xl md:text-6xl">
              {team.name}
            </h1>
            <p className="mt-2 text-sm opacity-80">
              {count > 0
                ? `${count} ${count === 1 ? "modelo disponível" : "modelos disponíveis"} no catálogo`
                : "Modelos sob consulta — fale com a equipe pelo WhatsApp"}
            </p>
          </div>
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogClient
          title={`Camisas ${team.name}`}
          subtitle="Coleção atual, retrô, femininas e infantis — filtre do seu jeito."
          baseFilters={{ teamSlug: team.slug }}
          hideTeamFilter
        />
      </Suspense>
    </>
  );
}
