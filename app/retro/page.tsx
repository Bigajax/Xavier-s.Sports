import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import CatalogClient from "@/components/CatalogClient";
import CatalogSkeleton from "@/components/CatalogSkeleton";

export const metadata: Metadata = {
  title: "Coleção Retrô",
  description:
    "Camisas retrô de clubes e seleções: modelos inspirados em temporadas históricas dos anos 1980, 1990, 2000 e 2010.",
};

const decades = [
  { value: "1980", label: "Anos 1980" },
  { value: "1990", label: "Anos 1990" },
  { value: "2000", label: "Anos 2000" },
  { value: "2010", label: "Anos 2010" },
];

export default function RetroPage() {
  return (
    <>
      {/* abertura editorial de arquivo esportivo */}
      <section className="retro-paper border-b border-ink/10">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
            Arquivo Xavier&apos;s Sports
          </p>
          <h1 className="display mt-3 text-5xl text-ink sm:text-6xl">
            <span className="swoosh">Histórias que nunca saem de campo</span>
          </h1>
          <p className="mt-4 max-w-xl text-steel">
            Reviva temporadas, títulos e jogadores que marcaram gerações.
            Modelos inspirados em designs clássicos — sem afirmação de
            autenticidade histórica ou licenciamento.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {decades.map((d) => (
              <Link
                key={d.value}
                href={`/retro?decada=${d.value}`}
                className="rounded-sm border border-ink/25 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink hover:border-roxo hover:text-roxo"
              >
                {d.label}
              </Link>
            ))}
            <Link
              href="/retro"
              className="rounded-sm border border-ink/25 bg-ink px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-amarelo"
            >
              Todas
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogClient
          title="Coleção retrô"
          subtitle="Filtre por década, clube, seleção, cor ou tamanho."
          baseFilters={{ collection: "retro" }}
        />
      </Suspense>
    </>
  );
}
