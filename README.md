# Xavier's Sports — Vitrine Digital

Vitrine digital de camisas de futebol (clubes e seleções, atuais e retrô) com
conversão pelo WhatsApp — **sem checkout online**. Construída em Next.js 15
(App Router) + TypeScript + Tailwind CSS 4.

> **Sua paixão pelo futebol veste aqui.**

## Rodando o projeto

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de produção
```

## ⚠️ Antes de publicar (pendências do proprietário)

1. **WhatsApp oficial** — em `config/site.ts`, troque `whatsapp: "5500000000000"`
   pelo número real (só dígitos: 55 + DDD + número). Todos os botões do site
   usam esse valor.
2. **E-mail, domínio e horário** — no mesmo `config/site.ts`.
3. **Política de trocas/devoluções** — os textos de `/trocas` são provisórios;
   validar prazos, custos e condições (aviso visível no `/admin`).
4. **Guia de tamanhos** — medidas em `data/sizes.ts` são demonstrativas.
5. **Classificação legal dos produtos** — descrever os produtos conforme
   orientação jurídica (o site evita termos como "original/licenciado").
6. **Proteger o `/admin`** com autenticação antes de ir ao ar.

## Onde editar cada coisa

| O que | Onde |
|---|---|
| WhatsApp, e-mail, Instagram, horário, domínio | `config/site.ts` |
| Produtos (nome, preço, tamanhos, fotos, selos) | `data/products.ts` |
| Fotos dos produtos | `public/images/produtos/` (padrão `slug-a.jpg`) |
| Times, seleções e cores | `data/teams.ts` |
| Escudos dos times | `public/images/escudos/<slug>.png` (PNG quadrado; o slug deve ser o mesmo de `data/teams.ts`) |
| Campeonatos | `data/leagues.ts` |
| Categorias da home/catálogo | `data/categories.ts` |
| Tabelas de medidas | `data/sizes.ts` |
| Perguntas frequentes | `data/faq.ts` |
| Textos do hero | `components/Hero.tsx` |
| Mensagens da barra superior | `components/TopBar.tsx` |
| Mensagens de WhatsApp geradas | `lib/whatsapp.ts` |
| Políticas (envios, trocas, privacidade, termos) | `app/envios`, `app/trocas`, `app/privacidade`, `app/termos` |

### Adicionando um produto

1. Coloque a foto em `public/images/produtos/` (quadrada, ex. `flamengo-home-a.jpg`).
2. Duplique um objeto em `data/products.ts` e ajuste os campos
   (`slug` único, `teamSlug` existente em `data/teams.ts`).
3. Produto sem foto? Deixe `images: []` — o site mostra uma prévia ilustrativa
   nas cores do time, rotulada como demonstrativa.

### Trocando o preço ou tamanhos

Edite `price`, `oldPrice`, `installments` e o array `sizes` do produto
(status por tamanho: `disponivel`, `poucas-unidades`, `indisponivel`, `consulta`).

## Estrutura

- `app/` — rotas (home, catálogo, clubes/[slug], selecoes/[slug], retro,
  produto/[slug], favoritos, institucionais, admin demonstrativo)
- `components/` — UI reutilizável (Header com mega menu, ProductCard,
  ProductActions com CTA travado sem tamanho, formulários RHF+Zod etc.)
- `lib/` — WhatsApp (mensagens dinâmicas), catálogo (filtros/busca/ordenação),
  favoritos (localStorage), formatação BRL, adminStore (localStorage)
- `data/` — todo o conteúdo editável e demonstrativo

## Funcionalidades

- Catálogo com filtros (time, coleção, campeonato, versão, público, tamanho,
  cor, preço, ofertas), busca sem acento, 6 ordenações, paginação e skeleton
- Página de produto com galeria + zoom, seleção de tamanho obrigatória,
  personalização com confirmação e mensagem de WhatsApp montada automaticamente
- Favoritos com envio da lista completa pelo WhatsApp
- Trocas e devoluções com 4 fluxos + formulário que gera a solicitação
- Painel `/admin` demonstrativo (localStorage), preparado para Supabase
- SEO: metadata por página, Open Graph, sitemap, robots, JSON-LD de produto
- Acessibilidade: foco visível, navegação por teclado, `prefers-reduced-motion`

## Notas de conformidade

- Nenhum botão realiza compra/pagamento — tudo é consulta via WhatsApp.
- Não há afirmações de licenciamento/originalidade; escudos oficiais não são
  usados (cards usam monogramas nas cores do time).
- Depoimentos exibem placeholder até haver avaliações reais autorizadas.
- Rodapé: "Marcas, nomes e escudos pertencem aos seus respectivos titulares."
