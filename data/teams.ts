/**
 * Times e seleções — totalmente editável.
 * `colors`: [principal, secundária] usadas em cards e monogramas.
 * Não usamos escudos oficiais: os cards exibem monograma com as cores do time.
 */
export type Team = {
  slug: string;
  name: string;
  short: string; // monograma exibido no card (2–3 letras)
  type: "clube" | "selecao";
  country: string;
  league?: string;
  colors: [string, string];
  textOnPrimary?: "light" | "dark";
};

export const teams: Team[] = [
  // ----- Clubes brasileiros -----
  { slug: "corinthians", name: "Corinthians", short: "COR", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#090909", "#ffffff"] },
  { slug: "sao-paulo", name: "São Paulo", short: "SPO", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#e53935", "#090909"] },
  { slug: "palmeiras", name: "Palmeiras", short: "PAL", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#1b5e20", "#ffffff"] },
  { slug: "flamengo", name: "Flamengo", short: "FLA", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#c62828", "#090909"] },
  { slug: "santos", name: "Santos", short: "SAN", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#ffffff", "#090909"], textOnPrimary: "dark" },
  { slug: "gremio", name: "Grêmio", short: "GRE", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#0d47a1", "#090909"] },
  { slug: "internacional", name: "Internacional", short: "INT", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#b71c1c", "#ffffff"] },
  { slug: "vasco", name: "Vasco da Gama", short: "VAS", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#090909", "#ffffff"] },
  { slug: "fluminense", name: "Fluminense", short: "FLU", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#7b1e3b", "#1b5e4a"] },

  // ----- Clubes internacionais -----
  { slug: "barcelona", name: "Barcelona", short: "BAR", type: "clube", country: "Espanha", league: "la-liga", colors: ["#1e3a8a", "#a4123f"] },
  { slug: "real-madrid", name: "Real Madrid", short: "RMA", type: "clube", country: "Espanha", league: "la-liga", colors: ["#f5f5f5", "#c9a24b"], textOnPrimary: "dark" },
  { slug: "manchester-united", name: "Manchester United", short: "MUN", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#b71c1c", "#ffd600"] },
  { slug: "manchester-city", name: "Manchester City", short: "MCI", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#7fb2d9", "#12233d"], textOnPrimary: "dark" },
  { slug: "liverpool", name: "Liverpool", short: "LIV", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#a4161a", "#ffffff"] },
  { slug: "arsenal", name: "Arsenal", short: "ARS", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#c62828", "#f5f5f5"] },
  { slug: "milan", name: "Milan", short: "MIL", type: "clube", country: "Itália", league: "serie-a", colors: ["#b71c1c", "#090909"] },
  { slug: "juventus", name: "Juventus", short: "JUV", type: "clube", country: "Itália", league: "serie-a", colors: ["#090909", "#ffffff"] },
  { slug: "bayern", name: "Bayern de Munique", short: "BAY", type: "clube", country: "Alemanha", league: "bundesliga", colors: ["#c62828", "#12233d"] },
  { slug: "psg", name: "Paris Saint-Germain", short: "PSG", type: "clube", country: "França", league: "ligue-1", colors: ["#12233d", "#c62828"] },
  { slug: "inter-miami", name: "Inter Miami", short: "MIA", type: "clube", country: "Estados Unidos", colors: ["#f2b7cb", "#090909"], textOnPrimary: "dark" },

  // ----- Seleções -----
  { slug: "brasil", name: "Brasil", short: "BRA", type: "selecao", country: "Brasil", colors: ["#ffd600", "#1b5e20"], textOnPrimary: "dark" },
  { slug: "portugal", name: "Portugal", short: "POR", type: "selecao", country: "Portugal", colors: ["#a4161a", "#1b5e4a"] },
  { slug: "argentina", name: "Argentina", short: "ARG", type: "selecao", country: "Argentina", colors: ["#9ec9e8", "#12233d"], textOnPrimary: "dark" },
  { slug: "japao", name: "Japão", short: "JAP", type: "selecao", country: "Japão", colors: ["#12233d", "#e53935"] },
  { slug: "alemanha", name: "Alemanha", short: "ALE", type: "selecao", country: "Alemanha", colors: ["#f5f5f5", "#090909"], textOnPrimary: "dark" },
  { slug: "franca", name: "França", short: "FRA", type: "selecao", country: "França", colors: ["#12233d", "#c62828"] },
  { slug: "espanha", name: "Espanha", short: "ESP", type: "selecao", country: "Espanha", colors: ["#c62828", "#ffd600"] },
  { slug: "italia", name: "Itália", short: "ITA", type: "selecao", country: "Itália", colors: ["#1565c0", "#ffffff"] },
  { slug: "inglaterra", name: "Inglaterra", short: "ING", type: "selecao", country: "Inglaterra", colors: ["#f5f5f5", "#12233d"], textOnPrimary: "dark" },
];

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug);
}

/**
 * Escudo do time: basta salvar o PNG em public/images/escudos/<slug>.png.
 * Marcas e escudos pertencem aos seus respectivos titulares (aviso no rodapé).
 */
export function teamCrest(slug: string): string {
  return `/images/escudos/${slug}.png`;
}

export const clubesBrasileiros = teams.filter(
  (t) => t.type === "clube" && t.country === "Brasil"
);
export const clubesInternacionais = teams.filter(
  (t) => t.type === "clube" && t.country !== "Brasil"
);
export const selecoes = teams.filter((t) => t.type === "selecao");
