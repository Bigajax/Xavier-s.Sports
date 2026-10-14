import { site as config } from "@/config/site";
import { teams } from "@/data/teams";
import { MAPA, PARTES, VARIAVEIS } from "@/data/conteudo.config";
import type { LojaConfig } from "@vitrine/plataforma/tipos-loja";

/**
 * A XAVIER'S NO PACOTE (14/10/2026, o Rafael: "trocar pelo painel do
 * pacote"). O painel inteiro vem do @vitrine/plataforma: Início, Peças,
 * Estoque, Pedidos, Desempenho, Ajuda, o contato e a entrada. O admin antigo
 * (/admin) saiu; as camisas foram copiadas para as tabelas do pacote
 * (supabase/rodar-painel-pacote.sql) e o site lê de lá (lib/products/db.ts).
 *
 * Ficam DELA, como abas próprias: Avaliações e Trocas, que leem as tabelas
 * reviews e returns de sempre.
 *
 * A camisa de futebol (time, temporada, versão, público, manga, nome e
 * número) é a opção `camisa`, que nasceu aqui; a lista de times sai de
 * data/teams.ts. O estoque é por tamanho: com estoque é pronta entrega, sem
 * estoque é encomenda; o tamanho riscado não sai nem por encomenda.
 */
const grupo = (t: (typeof teams)[number]) =>
  t.type === "selecao" ? "Seleções" : t.country === "Brasil" ? "Clubes brasileiros" : "Clubes de fora";

export const loja: LojaConfig = {
  site: {
    nome: config.name,
    marca: "Xavier's",
    logo: "/marca/logo.png",
    /* 645 x 411 */
    proporcaoLogo: 1.569,
    url: config.url,
    whatsapp: config.whatsapp,
    instagram: config.instagram.replace(/^@/, ""),
    /* a loja é online, sem endereço publicado */
    cidade: "",
    endereco: config.address,
    horario: config.businessHours,
    marcas: [],
  },
  previa: null,
  configPadrao: { whatsapp: config.whatsapp, instagram: config.instagram.replace(/^@/, "") },
  grade: {
    calcados: [],
    passoRoupa: 1,
    numeracaoPergunta: null,
    /* as grades da tabela de medidas oficial (data/sizes.ts) */
    extras: [
      { id: "camisa", nome: "Camisa adulto (P a 4XL)", itens: ["P", "M", "G", "GG", "2XL", "3XL", "4XL"] },
      { id: "feminina", nome: "Camisa feminina (P a GG)", itens: ["P", "M", "G", "GG"] },
      { id: "infantil", nome: "Infantil (16 a 28)", itens: ["16", "18", "20", "22", "24", "26", "28"] },
    ],
  },
  /* o Barlow Condensed é a fonte dos títulos do site (app/layout.tsx) */
  marca: { logo: "/marca/logo.png", proporcao: 1.569, fonte: "Barlow Condensed" },
  cookie: "xs_painel",
  codigo: "XS",
  conteudo: { partes: PARTES, mapa: MAPA, variaveis: VARIAVEIS },
  opcoes: {
    estoque: true,
    gestao: true,
    /* o tamanho riscado é o "acabou de vez" (sem encomenda) */
    riscadoManual: true,
    /* o site não risca o tamanho zerado: ele vira encomenda */
    estoqueNoSite: false,
    /* banners, textos e sacola são do código do site, não do pacote */
    banners: false,
    textosDoSite: false,
    captura: false,
    sacola: false,
    paginaMaisVendidos: false,
    camisa: true,
  },
  prefixoMedir: "xs",
  /* o domínio próprio ainda não aponta para a Vercel (14/10/2026): enquanto isso, conta no .vercel.app */
  hostsMedir: ["xavierssports.com.br", "www.xavierssports.com.br", "xavier-s-sports.vercel.app"],
  abasExtras: [
    { href: "/painel/avaliacoes", nome: "Avaliações", curto: "Avaliações", icone: "texto" },
    { href: "/painel/trocas", nome: "Trocas e devoluções", curto: "Trocas", icone: "loja" },
  ],
  nomeConfig: "Loja",
  camisa: {
    times: [...teams]
      .sort((a, b) => grupo(a).localeCompare(grupo(b)) || a.name.localeCompare(b.name))
      .map((t) => ({ slug: t.slug, nome: t.name, grupo: grupo(t) })),
  },
};
