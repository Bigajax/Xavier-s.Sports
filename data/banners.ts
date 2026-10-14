/**
 * OS BANNERS (14/10/2026, no padrão do molde): os 3 do topo e os 3 do meio.
 *
 * A ARTE vem do gerador de imagem, SEM letra nenhuma: o título, a linha e o
 * botão entram por cima, em HTML, daqui. Os prompts estão em
 * `banners/prompts.md` (fora do git). Cada banner tem duas artes: a do
 * computador e a do celular (em pé no topo, quadrada no meio).
 *
 * Banner do TOPO sem arte em public/ não aparece: sem nenhum, a home cai no
 * hero de vídeos. Banner do MEIO sem arte aparece com o fundo da marca em CSS
 * (o roxo, as linhas de gramado e a faixa amarela), até a arte chegar. Cada
 * número aqui é da loja: os preços de config/catalogo.ts, a contagem de
 * retrô do catálogo ({retro}) e o prazo de encomenda ({prazo}).
 */
export type BannerTopo = {
  titulo: string;
  linha: string;
  botao: string;
  href: string;
  /** a arte deitada (2400 x 1029) e a em pé do celular (1080 x 1350) */
  arte: string;
  arteCelular: string;
  /** onde fica o TEXTO no computador: do lado oposto ao da camisa */
  lado: "esquerda" | "direita";
  alt: string;
};

/* 14/10/2026: os três do Rafael, cada um com três camisas na arte (o da
   retrô ficou de fora, a pedido dele). A copy é a de conversão que ele
   aprovou: o preço no título (o da versão torcedor, daí o "a partir de"), os
   times da arte na linha e o parcelamento (252 das 259 camisas em 3x). */
export const bannersTopo: BannerTopo[] = [
  {
    titulo: "A camisa do seu time a partir de R$ 189.",
    linha: "Flamengo, Corinthians, Palmeiras e mais, uniforme 26/27. Em até 3x de R$ 63.",
    botao: "Quero a do meu time",
    href: "/catalogo?categoria=clubes-brasileiros",
    arte: "/images/hero/campanha-brasileiros.webp",
    arteCelular: "/images/hero/campanha-brasileiros-celular.webp",
    lado: "direita",
    alt: "As camisas 26/27 do Flamengo, do Corinthians e do Palmeiras lado a lado, sobre o roxo da Xavier's com a faixa amarela em diagonal",
  },
  {
    titulo: "Real, Barça e Bayern a partir de R$ 189.",
    linha: "Os uniformes 26/27 dos gigantes da Europa, em até 3x de R$ 63. Envio para todo o Brasil.",
    botao: "Ver os europeus",
    href: "/catalogo?categoria=clubes-internacionais",
    arte: "/images/hero/campanha-estrangeiros.webp",
    arteCelular: "/images/hero/campanha-estrangeiros-celular.webp",
    lado: "esquerda",
    alt: "As camisas 26/27 do Real Madrid, do Barcelona e do Bayern de Munique lado a lado, sobre o roxo da Xavier's",
  },
  {
    titulo: "Camisa da Copa 2026 a partir de R$ 189.",
    linha: "Brasil, Argentina, França e mais seleções, em até 3x de R$ 63. Envio para todo o Brasil.",
    botao: "Escolher minha seleção",
    href: "/selecoes",
    arte: "/images/hero/campanha-selecoes.webp",
    arteCelular: "/images/hero/campanha-selecoes-celular.webp",
    lado: "direita",
    alt: "As camisas da Argentina, do Brasil e da França para a Copa 2026, sobre o roxo da Xavier's com a faixa amarela em diagonal",
  },
];

export type BannerMeio = {
  chave: "linha" | "cupom" | "entrega";
  titulo: string;
  linha: string;
  botao: string;
  /** link do site, ou "whatsapp:<mensagem>" para abrir a conversa */
  href: string;
  /** a arte larga (2400 x 800) e a quadrada do celular (1080 x 1080) */
  arte: string;
  arteCelular: string;
  /** false até a loja confirmar: o cupom espera o Fellype dizer se dá e quanto */
  ligado: boolean;
};

export const bannersMeio: BannerMeio[] = [
  {
    chave: "linha",
    titulo: "Vista a sua seleção na Copa 2026.",
    linha: "Brasil, Argentina, Alemanha e as outras seleções, na versão torcedor e na jogador.",
    botao: "Ver as seleções",
    href: "/selecoes",
    arte: "/images/banners/banner-linha.webp",
    arteCelular: "/images/banners/banner-linha-celular.webp",
    ligado: true,
  },
  {
    chave: "cupom",
    titulo: "Desconto na sua primeira compra.",
    linha: "Use o cupom PRIMEIRACOMPRA no WhatsApp.",
    botao: "Pegar o cupom",
    href: "whatsapp:Oi! Quero usar o cupom PRIMEIRACOMPRA na minha primeira compra.",
    arte: "/images/banners/banner-cupom.webp",
    arteCelular: "/images/banners/banner-cupom-celular.webp",
    /* ⚠️ desligado: nunca inventar cupom. Ligar quando o Fellype confirmar
       que dá desconto na primeira compra, e pôr o percentual no título. */
    ligado: false,
  },
  {
    chave: "entrega",
    titulo: "Enviamos para todo o Brasil.",
    linha: "Pronta entrega sai sem esperar. Sob encomenda, prazo de {prazo}.",
    botao: "Ver a pronta entrega",
    href: "/pronta-entrega",
    arte: "/images/banners/banner-entrega.webp",
    arteCelular: "/images/banners/banner-entrega-celular.webp",
    ligado: true,
  },
];
