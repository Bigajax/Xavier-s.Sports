/**
 * Configuração central da loja — edite aqui e o site inteiro acompanha.
 *
 * ⚠️ PENDÊNCIAS DO PROPRIETÁRIO antes de publicar:
 *  - `whatsapp`: número real com DDI + DDD, apenas dígitos (ex.: "5544999990000").
 *  - `email`, `url`: dados reais.
 *  - Textos de envio, pagamento e políticas (ver /admin > Configurações).
 */
export const site = {
  name: "Xavier's Sports",
  founder: "Fellype Xavier",
  tagline: "Sua paixão pelo futebol veste aqui.",
  description:
    "Camisas de clubes e seleções, modelos atuais e retrô, com envio para todo o Brasil.",

  // ⚠️ PLACEHOLDER — substituir pelo número oficial da loja (só dígitos, com 55 + DDD)
  whatsapp: "5500000000000",
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
