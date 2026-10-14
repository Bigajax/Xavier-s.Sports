/* a barreira do painel mora no pacote (14/10/2026: a Xavier's troca o admin
   próprio pelo painel do @vitrine/plataforma); o matcher fica aqui, literal,
   porque o Next só o lê no próprio arquivo */
export { middleware } from "@vitrine/plataforma/middleware";

export const config = {
  matcher: ["/painel/:path*"],
};
