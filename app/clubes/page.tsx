import type { Metadata } from "next";
import TeamCard from "@/components/TeamCard";
import SectionHeading from "@/components/SectionHeading";
import { clubesBrasileiros, clubesInternacionais } from "@/data/teams";

export const metadata: Metadata = {
  title: "Clubes",
  description:
    "Camisas de clubes brasileiros e internacionais — modelos atuais e retrô.",
};

export default function ClubesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Clubes"
        title="Escolha o seu manto"
        subtitle="Clubes brasileiros e gigantes internacionais, em modelos atuais e retrô."
      />
      {(
        [
          ["Clubes brasileiros", clubesBrasileiros],
          ["Clubes internacionais", clubesInternacionais],
        ] as const
      ).map(([label, list]) => (
        <section key={label} className="mt-10">
          <h2 className="display-upright text-lg text-steel">{label}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {list.map((t) => (
              <TeamCard key={t.slug} team={t} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
