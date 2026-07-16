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
  /**
   * Caminho do escudo quando não há PNG em public/images/escudos/<slug>.png.
   * Times novos usam o monograma SVG gerado por `npm run escudos`; para trocar
   * pelo escudo real, salve o PNG na pasta e apague este campo.
   */
  crest?: string;
};

/** Monograma SVG gerado por `npm run escudos` — troque por PNG real quando tiver. */
const svg = (slug: string) => `/images/escudos/${slug}.svg`;

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
  { slug: "botafogo", name: "Botafogo", short: "BOT", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#090909", "#ffffff"], crest: svg("botafogo") },
  { slug: "cruzeiro", name: "Cruzeiro", short: "CRU", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#0d47a1", "#ffffff"], crest: svg("cruzeiro") },
  { slug: "atletico-mineiro", name: "Atlético Mineiro", short: "CAM", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#090909", "#ffffff"], crest: svg("atletico-mineiro") },
  { slug: "bahia", name: "Bahia", short: "BAH", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#1565c0", "#e53935"], crest: svg("bahia") },
  { slug: "fortaleza", name: "Fortaleza", short: "FOR", type: "clube", country: "Brasil", league: "brasileirao", colors: ["#0d47a1", "#e53935"], crest: svg("fortaleza") },

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
  { slug: "inter-miami", name: "Inter Miami", short: "MIA", type: "clube", country: "Estados Unidos", league: "mls", colors: ["#f2b7cb", "#090909"], textOnPrimary: "dark" },
  // Champions League 2025/26 — Espanha
  { slug: "atletico-madrid", name: "Atlético de Madrid", short: "ATM", type: "clube", country: "Espanha", league: "la-liga", colors: ["#c62828", "#12233d"], crest: svg("atletico-madrid") },
  { slug: "athletic-bilbao", name: "Athletic Bilbao", short: "ATH", type: "clube", country: "Espanha", league: "la-liga", colors: ["#c62828", "#090909"], crest: svg("athletic-bilbao") },
  { slug: "villarreal", name: "Villarreal", short: "VIL", type: "clube", country: "Espanha", league: "la-liga", colors: ["#ffd600", "#12233d"], textOnPrimary: "dark", crest: svg("villarreal") },
  // Champions League 2025/26 — Inglaterra
  { slug: "chelsea", name: "Chelsea", short: "CHE", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#1565c0", "#ffffff"], crest: svg("chelsea") },
  { slug: "tottenham", name: "Tottenham", short: "TOT", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#f5f5f5", "#12233d"], textOnPrimary: "dark", crest: svg("tottenham") },
  { slug: "newcastle", name: "Newcastle", short: "NEW", type: "clube", country: "Inglaterra", league: "premier-league", colors: ["#090909", "#ffffff"], crest: svg("newcastle") },
  // Champions League 2025/26 — Alemanha
  { slug: "bayer-leverkusen", name: "Bayer Leverkusen", short: "LEV", type: "clube", country: "Alemanha", league: "bundesliga", colors: ["#090909", "#e53935"], crest: svg("bayer-leverkusen") },
  { slug: "borussia-dortmund", name: "Borussia Dortmund", short: "BVB", type: "clube", country: "Alemanha", league: "bundesliga", colors: ["#ffd600", "#090909"], textOnPrimary: "dark", crest: svg("borussia-dortmund") },
  { slug: "eintracht-frankfurt", name: "Eintracht Frankfurt", short: "EIN", type: "clube", country: "Alemanha", league: "bundesliga", colors: ["#090909", "#e53935"], crest: svg("eintracht-frankfurt") },
  // Champions League 2025/26 — França
  { slug: "marseille", name: "Olympique de Marseille", short: "OM", type: "clube", country: "França", league: "ligue-1", colors: ["#f5f5f5", "#29a8dd"], textOnPrimary: "dark", crest: svg("marseille") },
  { slug: "monaco", name: "Monaco", short: "MON", type: "clube", country: "França", league: "ligue-1", colors: ["#e53935", "#ffffff"], crest: svg("monaco") },
  // Champions League 2025/26 — Itália
  { slug: "inter", name: "Inter de Milão", short: "INT", type: "clube", country: "Itália", league: "serie-a", colors: ["#0d47a1", "#090909"], crest: svg("inter") },
  { slug: "atalanta", name: "Atalanta", short: "ATA", type: "clube", country: "Itália", league: "serie-a", colors: ["#1565c0", "#090909"], crest: svg("atalanta") },
  { slug: "napoli", name: "Napoli", short: "NAP", type: "clube", country: "Itália", league: "serie-a", colors: ["#1e88e5", "#12233d"], crest: svg("napoli") },
  // Champions League 2025/26 — Portugal
  { slug: "benfica", name: "Benfica", short: "BEN", type: "clube", country: "Portugal", league: "primeira-liga", colors: ["#c62828", "#ffffff"], crest: svg("benfica") },
  { slug: "sporting", name: "Sporting", short: "SCP", type: "clube", country: "Portugal", league: "primeira-liga", colors: ["#1b5e4a", "#ffffff"], crest: svg("sporting") },
  { slug: "porto", name: "Porto", short: "FCP", type: "clube", country: "Portugal", league: "primeira-liga", colors: ["#0d47a1", "#ffffff"], crest: svg("porto") },
  // Champions League 2025/26 — Holanda
  { slug: "ajax", name: "Ajax", short: "AJA", type: "clube", country: "Holanda", league: "eredivisie", colors: ["#f5f5f5", "#e53935"], textOnPrimary: "dark", crest: svg("ajax") },
  { slug: "psv", name: "PSV", short: "PSV", type: "clube", country: "Holanda", league: "eredivisie", colors: ["#e53935", "#ffffff"], crest: svg("psv") },
  // Champions League 2025/26 — demais clubes
  { slug: "club-brugge", name: "Club Brugge", short: "BRU", type: "clube", country: "Bélgica", league: "champions-league", colors: ["#0d47a1", "#090909"], crest: svg("club-brugge") },
  { slug: "union-saint-gilloise", name: "Union Saint-Gilloise", short: "USG", type: "clube", country: "Bélgica", league: "champions-league", colors: ["#ffd600", "#0d47a1"], textOnPrimary: "dark", crest: svg("union-saint-gilloise") },
  { slug: "galatasaray", name: "Galatasaray", short: "GAL", type: "clube", country: "Turquia", league: "champions-league", colors: ["#a4161a", "#f4a900"], crest: svg("galatasaray") },
  { slug: "olympiacos", name: "Olympiacos", short: "OLY", type: "clube", country: "Grécia", league: "champions-league", colors: ["#e53935", "#ffffff"], crest: svg("olympiacos") },
  { slug: "slavia-praga", name: "Slavia Praga", short: "SLA", type: "clube", country: "Tchéquia", league: "champions-league", colors: ["#c62828", "#f5f5f5"], crest: svg("slavia-praga") },
  { slug: "bodo-glimt", name: "Bodø/Glimt", short: "BOD", type: "clube", country: "Noruega", league: "champions-league", colors: ["#ffd600", "#090909"], textOnPrimary: "dark", crest: svg("bodo-glimt") },
  { slug: "copenhague", name: "Copenhague", short: "COP", type: "clube", country: "Dinamarca", league: "champions-league", colors: ["#f5f5f5", "#0d47a1"], textOnPrimary: "dark", crest: svg("copenhague") },
  { slug: "kairat", name: "Kairat Almaty", short: "KAI", type: "clube", country: "Cazaquistão", league: "champions-league", colors: ["#ffd600", "#090909"], textOnPrimary: "dark", crest: svg("kairat") },
  { slug: "pafos", name: "Pafos", short: "PAF", type: "clube", country: "Chipre", league: "champions-league", colors: ["#29a8dd", "#12233d"], crest: svg("pafos") },
  { slug: "qarabag", name: "Qarabağ", short: "QAR", type: "clube", country: "Azerbaijão", league: "champions-league", colors: ["#090909", "#ffffff"], crest: svg("qarabag") },
  // Clássicos da América do Sul e do mundo árabe
  { slug: "boca-juniors", name: "Boca Juniors", short: "BOC", type: "clube", country: "Argentina", league: "libertadores", colors: ["#12233d", "#ffd600"], crest: svg("boca-juniors") },
  { slug: "river-plate", name: "River Plate", short: "RIV", type: "clube", country: "Argentina", league: "libertadores", colors: ["#f5f5f5", "#e53935"], textOnPrimary: "dark", crest: svg("river-plate") },
  { slug: "al-nassr", name: "Al-Nassr", short: "ALN", type: "clube", country: "Arábia Saudita", league: "saudi-pro-league", colors: ["#ffd600", "#0d47a1"], textOnPrimary: "dark", crest: svg("al-nassr") },
  { slug: "al-hilal", name: "Al-Hilal", short: "ALH", type: "clube", country: "Arábia Saudita", league: "saudi-pro-league", colors: ["#1565c0", "#ffffff"], crest: svg("al-hilal") },

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
  // América do Sul
  { slug: "uruguai", name: "Uruguai", short: "URU", type: "selecao", country: "Uruguai", colors: ["#7fb2d9", "#12233d"], textOnPrimary: "dark", crest: svg("uruguai") },
  { slug: "colombia", name: "Colômbia", short: "COL", type: "selecao", country: "Colômbia", colors: ["#ffd600", "#0d47a1"], textOnPrimary: "dark", crest: svg("colombia") },
  { slug: "equador", name: "Equador", short: "EQU", type: "selecao", country: "Equador", colors: ["#ffd600", "#12233d"], textOnPrimary: "dark", crest: svg("equador") },
  { slug: "paraguai", name: "Paraguai", short: "PAR", type: "selecao", country: "Paraguai", colors: ["#e53935", "#0d47a1"], crest: svg("paraguai") },
  { slug: "chile", name: "Chile", short: "CHI", type: "selecao", country: "Chile", colors: ["#c62828", "#0d47a1"], crest: svg("chile") },
  // América do Norte
  { slug: "mexico", name: "México", short: "MEX", type: "selecao", country: "México", colors: ["#1b5e20", "#c62828"], crest: svg("mexico") },
  { slug: "estados-unidos", name: "Estados Unidos", short: "EUA", type: "selecao", country: "Estados Unidos", colors: ["#f5f5f5", "#0d47a1"], textOnPrimary: "dark", crest: svg("estados-unidos") },
  { slug: "canada", name: "Canadá", short: "CAN", type: "selecao", country: "Canadá", colors: ["#c62828", "#f5f5f5"], crest: svg("canada") },
  // Europa
  { slug: "holanda", name: "Holanda", short: "HOL", type: "selecao", country: "Holanda", colors: ["#f57c00", "#12233d"], crest: svg("holanda") },
  { slug: "belgica", name: "Bélgica", short: "BEL", type: "selecao", country: "Bélgica", colors: ["#c62828", "#090909"], crest: svg("belgica") },
  { slug: "croacia", name: "Croácia", short: "CRO", type: "selecao", country: "Croácia", colors: ["#e53935", "#ffffff"], crest: svg("croacia") },
  { slug: "suica", name: "Suíça", short: "SUI", type: "selecao", country: "Suíça", colors: ["#c62828", "#f5f5f5"], crest: svg("suica") },
  { slug: "polonia", name: "Polônia", short: "POL", type: "selecao", country: "Polônia", colors: ["#f5f5f5", "#c62828"], textOnPrimary: "dark", crest: svg("polonia") },
  { slug: "dinamarca", name: "Dinamarca", short: "DIN", type: "selecao", country: "Dinamarca", colors: ["#c62828", "#ffffff"], crest: svg("dinamarca") },
  // África
  { slug: "marrocos", name: "Marrocos", short: "MAR", type: "selecao", country: "Marrocos", colors: ["#c62828", "#1b5e20"], crest: svg("marrocos") },
  { slug: "senegal", name: "Senegal", short: "SEN", type: "selecao", country: "Senegal", colors: ["#1b5e20", "#ffd600"], crest: svg("senegal") },
  { slug: "nigeria", name: "Nigéria", short: "NIG", type: "selecao", country: "Nigéria", colors: ["#1b5e20", "#f5f5f5"], crest: svg("nigeria") },
  { slug: "camaroes", name: "Camarões", short: "CAM", type: "selecao", country: "Camarões", colors: ["#1b5e20", "#e53935"], crest: svg("camaroes") },
  { slug: "gana", name: "Gana", short: "GAN", type: "selecao", country: "Gana", colors: ["#f5f5f5", "#c62828"], textOnPrimary: "dark", crest: svg("gana") },
  // Ásia e Oceania
  { slug: "coreia-do-sul", name: "Coreia do Sul", short: "KOR", type: "selecao", country: "Coreia do Sul", colors: ["#c62828", "#12233d"], crest: svg("coreia-do-sul") },
  { slug: "arabia-saudita", name: "Arábia Saudita", short: "KSA", type: "selecao", country: "Arábia Saudita", colors: ["#1b5e20", "#f5f5f5"], crest: svg("arabia-saudita") },
  { slug: "australia", name: "Austrália", short: "AUS", type: "selecao", country: "Austrália", colors: ["#ffd600", "#1b5e20"], textOnPrimary: "dark", crest: svg("australia") },
];

export function getTeam(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug);
}

/**
 * Escudo do time: basta salvar o PNG em public/images/escudos/<slug>.png.
 * Sem PNG, o time usa o campo `crest` (monograma SVG nas cores do time).
 * Marcas e escudos pertencem aos seus respectivos titulares (aviso no rodapé).
 */
export function teamCrest(slug: string): string {
  return getTeam(slug)?.crest ?? `/images/escudos/${slug}.png`;
}

export const clubesBrasileiros = teams.filter(
  (t) => t.type === "clube" && t.country === "Brasil"
);
export const clubesInternacionais = teams.filter(
  (t) => t.type === "clube" && t.country !== "Brasil"
);
export const selecoes = teams.filter((t) => t.type === "selecao");
