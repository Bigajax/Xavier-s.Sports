/**
 * Perguntas frequentes — respostas demonstrativas e editáveis.
 * ⚠️ Prazos, custos e condições reais devem ser definidos pelo proprietário.
 */
export type Faq = { q: string; a: string };

export const faqGeral: Faq[] = [
  {
    q: "Como faço um pedido?",
    a: "Escolha a camisa no site, selecione o tamanho e toque em “Consultar disponibilidade”. O site monta uma mensagem completa e você envia pelo WhatsApp — a equipe confirma disponibilidade, pagamento e envio.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "Pix e cartão de crédito. Após confirmar o pedido no WhatsApp, a equipe envia a chave Pix ou o link de pagamento do cartão, com as condições de parcelamento.",
  },
  {
    q: "Vocês enviam para todo o Brasil?",
    a: "Sim. O valor e o prazo do frete são informados pelo atendimento no momento da confirmação do pedido.",
  },
  {
    q: "Como sei qual tamanho escolher?",
    a: "Consulte o guia de tamanhos e compare as medidas com uma camisa que você já usa. Em caso de dúvida, a equipe ajuda pelo WhatsApp.",
  },
  {
    q: "Posso personalizar com nome e número?",
    a: "Depende do modelo. Marque a opção de personalização na página do produto e a equipe confirma disponibilidade, valor e prazo.",
  },
  {
    q: "O pedido é confirmado na hora?",
    a: "O envio da mensagem pelo site é uma consulta, não uma compra automática. O pedido só é confirmado após a validação da equipe.",
  },
];

export const faqTrocas: Faq[] = [
  {
    q: "Posso trocar somente o tamanho?",
    a: "Sim. Informe o número do pedido e o novo tamanho desejado pelo WhatsApp. A troca depende da disponibilidade do tamanho solicitado e das condições da peça.",
  },
  {
    q: "O que acontece se o novo tamanho estiver indisponível?",
    a: "A equipe apresenta as alternativas previstas na política da loja, como outro modelo ou outra solução combinada no atendimento.",
  },
  {
    q: "Posso devolver uma camisa personalizada?",
    a: "Peças personalizadas podem ter condições específicas. Cada caso é analisado pela equipe conforme a política da loja e a legislação aplicável.",
  },
  {
    q: "Quem paga o frete da troca?",
    a: "Os custos de envio seguem a regra oficial definida pela loja, informada durante o atendimento.",
  },
  {
    q: "Quanto tempo demora a análise?",
    a: "O prazo de análise é informado pela equipe ao receber a solicitação e as fotos da peça.",
  },
  {
    q: "Preciso enviar a embalagem?",
    a: "Sempre que possível, preserve etiquetas e embalagem — elas fazem parte das condições de análise.",
  },
  {
    q: "Posso trocar uma peça usada?",
    a: "Não. A peça não pode apresentar sinais de uso, lavagem, odores ou manchas para ser analisada.",
  },
  {
    q: "Como funciona o reembolso?",
    a: "Forma e prazo de reembolso são informados pela equipe conforme a política da loja e o meio de pagamento utilizado.",
  },
  {
    q: "O que fazer se recebi o produto errado?",
    a: "Envie o número do pedido, o produto solicitado e o recebido pelo WhatsApp. A equipe orienta os próximos passos.",
  },
  {
    q: "Como enviar fotos do problema?",
    a: "Pelo próprio WhatsApp: fotos da peça, da etiqueta e da embalagem ajudam a acelerar a análise.",
  },
];
