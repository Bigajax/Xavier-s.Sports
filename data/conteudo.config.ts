import type { Faixa } from "@vitrine/plataforma/lib/conteudo";
import type { EscolhaDaLoja } from "@vitrine/plataforma/lib/catalogo-secoes";

/**
 * O CONTEÚDO PARA O PAINEL DO PACOTE (14/10/2026). Os textos da vitrine da
 * Xavier's moram no código (data/banners.ts, app/page.tsx); aqui só o mínimo
 * que o pacote lê: o mapa da página (o "onde fica" da Ajuda), as palavras
 * que viram número e o 404.
 */
export const MAPA: Faixa[] = [
  { id: "avisos", nome: "Recados do topo", altura: 1, escura: true },
  { id: "menu", nome: "Menu e busca", altura: 1 },
  { id: "abertura", nome: "Banners", altura: 4 },
  { id: "prateleiras", nome: "Fileiras de camisas", altura: 3 },
  { id: "rodape", nome: "Rodapé", altura: 2, escura: true },
];

export const VARIAVEIS: Record<string, string> = {
  pecas: "o número de camisas no site",
};

export const PARTES: EscolhaDaLoja = {
  /* o pacote exige estas partes; o site da Xavier's não as lê (os textos
     moram no código), então ficam as frases dela, sem inventar */
  avisos: { frases: ["Enviamos para todo o Brasil"] },
  topo: { frase: "Sua paixão pelo futebol veste aqui." },
  prateleiras: { fileiras: [] },
  catalogo: { titulo: "Todas as camisas", linha: "{pecas} camisas no site." },
  rodape: { email: "", cnpj: "", facebook: "" },
  nao_achou: {
    titulo: "Página não encontrada",
    linha: "O endereço mudou ou a camisa saiu do site. Comece pelo catálogo.",
    busca: "Procure pelo time ou pela seleção",
    print: "Não achou a sua?",
    botao: "Chame no WhatsApp",
    vitrine: "No site agora",
  },
};
