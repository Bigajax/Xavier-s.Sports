import type { Metadata } from "next";
import TeamCard from "@/components/TeamCard";
import SectionHeading from "@/components/SectionHeading";
import { selecoes } from "@/data/teams";

export const metadata: Metadata = {
  title: "Seleções",
  description:
    "Camisas de seleções: Brasil, Portugal, Argentina, Japão e muito mais.",
};

export default function SelecoesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Seleções"
        title="Vista as cores do seu país"
        subtitle="Modelos atuais e retrô das principais seleções do mundo."
      />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {selecoes.map((t) => (
          <TeamCard key={t.slug} team={t} />
        ))}
      </div>
    </div>
  );
}
