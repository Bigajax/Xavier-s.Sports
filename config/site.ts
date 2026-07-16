/**
 * Configuração central da loja — edite aqui e o site inteiro acompanha.
 *
 * ⚠️ PENDÊNCIAS DO PROPRIETÁRIO antes de publicar:
 *  - `email`, `url`: dados reais.
 *  - Textos de envio, pagamento e políticas (ver /admin > Configurações).
 */
export const site = {
  name: "Xavier's Sports",
  founder: "Fellype Xavier",
  tagline: "Sua paixão pelo futebol veste aqui.",
  description:
    "Camisas de clubes e seleções, modelos atuais e retrô, com envio para todo o Brasil.",

  // Número oficial da loja: (44) 99821-0470
  whatsapp: "5544998210470",
  whatsappDefaultMessage:
    "Olá! Vim pelo site da Xavier's Sports e gostaria de atendimento.",

  instagram: "@xaavier_sports",
  instagramUrl: "https://www.instagram.com/xaavier_sports/",

  // ⚠️ PLACEHOLDERS editáveis
  email: "contato@xavierssports.com.br",
  address: "",
  businessHours: "Segunda a sábado, das 9h às 18h",
  url: "https://xavierssports.com.br",

  shippingText:
    "Enviamos para todo o Brasil. O valor e o prazo do frete são informados pelo atendimento no momento da confirmação do pedido.",
  paymentText:
    "As formas de pagamento disponíveis são informadas pela equipe durante o atendimento no WhatsApp.",
} as const;

export type Site = typeof site;
