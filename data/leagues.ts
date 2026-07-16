export type League = {
  slug: string;
  name: string;
  region: string;
};

export const leagues: League[] = [
  { slug: "brasileirao", name: "Brasileirão", region: "Brasil" },
  { slug: "premier-league", name: "Premier League", region: "Inglaterra" },
  { slug: "la-liga", name: "La Liga", region: "Espanha" },
  { slug: "champions-league", name: "Champions League", region: "Europa" },
  { slug: "serie-a", name: "Serie A", region: "Itália" },
  { slug: "bundesliga", name: "Bundesliga", region: "Alemanha" },
  { slug: "ligue-1", name: "Ligue 1", region: "França" },
  { slug: "primeira-liga", name: "Primeira Liga", region: "Portugal" },
  { slug: "eredivisie", name: "Eredivisie", region: "Holanda" },
  { slug: "mls", name: "MLS", region: "Estados Unidos" },
  { slug: "saudi-pro-league", name: "Saudi Pro League", region: "Arábia Saudita" },
  { slug: "selecoes", name: "Seleções", region: "Mundo" },
  { slug: "libertadores", name: "Libertadores", region: "América do Sul" },
];

export function getLeague(slug: string): League | undefined {
  return leagues.find((l) => l.slug === slug);
}
