import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Como a Xavier's Sports trata os dados compartilhados no site.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <SectionHeading eyebrow="Privacidade" title="Política de privacidade" />
      <div className="prose-sm mt-8 space-y-5 leading-relaxed text-ink/80">
        <p className="rounded-xl bg-cloud p-4 text-xs text-steel">
          Documento demonstrativo. A redação jurídica final deve ser revisada
          por profissional habilitado antes da publicação.
        </p>
        <section>
          <h2 className="display-upright text-lg text-ink">Quais dados coletamos</h2>
          <p className="mt-2">
            O site não possui cadastro nem checkout. Os dados que você informa
            em formulários (nome, WhatsApp, e-mail, time de preferência e
            mensagens) são usados apenas para preparar o seu atendimento pelo
            WhatsApp e, quando autorizado, para envio de novidades.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Favoritos e navegação</h2>
          <p className="mt-2">
            A lista de favoritos e os produtos vistos recentemente ficam salvos
            apenas no seu navegador (localStorage) e não são enviados aos
            nossos servidores.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Com quem falamos</h2>
          <p className="mt-2">
            O atendimento acontece exclusivamente pelos canais oficiais
            divulgados neste site: WhatsApp, Instagram {site.instagram} e
            e-mail {site.email}. Nunca solicitamos senhas de cartão ou dados
            bancários sensíveis por formulário.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Seus direitos</h2>
          <p className="mt-2">
            Você pode solicitar a atualização ou exclusão dos seus dados de
            contato a qualquer momento pelos canais oficiais, conforme a Lei
            Geral de Proteção de Dados (LGPD).
          </p>
        </section>
      </div>
    </div>
  );
}
