import type { Metadata } from "next";
import { teams } from "@/data/teams";
import TeamPage from "@/components/TeamPage";

export function generateStaticParams() {
  return teams
    .filter((t) => t.type === "clube")
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = teams.find((t) => t.slug === slug);
  if (!team) return {};
  return {
    title: `Camisas ${team.name}`,
    description: `Camisas do ${team.name}: modelos atuais, retrô, femininos e infantis. Consulte tamanhos e disponibilidade pelo WhatsApp.`,
  };
}

export default async function ClubePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <TeamPage slug={slug} />;
}
