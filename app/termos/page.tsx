import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Condições de uso do site da Xavier's Sports.",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <SectionHeading eyebrow="Termos" title="Termos de uso" />
      <div className="mt-8 space-y-5 leading-relaxed text-ink/80">
        <p className="rounded-xl bg-cloud p-4 text-xs text-steel">
          Documento demonstrativo. A redação jurídica final deve ser revisada
          por profissional habilitado antes da publicação.
        </p>
        <section>
          <h2 className="display-upright text-lg text-ink">Natureza do site</h2>
          <p className="mt-2">
            Este site é uma vitrine digital: ele apresenta o catálogo e prepara
            mensagens de consulta pelo WhatsApp. Nenhum botão do site realiza
            compra, reserva ou pagamento automático — pedidos são confirmados
            exclusivamente pela equipe no atendimento.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Preços e disponibilidade</h2>
          <p className="mt-2">
            Preços, tamanhos e disponibilidade exibidos são informativos e
            podem ser atualizados sem aviso. O valor final é sempre confirmado
            no atendimento antes do pagamento.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Propriedade intelectual</h2>
          <p className="mt-2">
            Marcas, nomes e escudos citados pertencem aos seus respectivos
            titulares e são usados apenas para identificar os produtos do
            catálogo. A identidade visual da Xavier&apos;s Sports pertence à
            loja.
          </p>
        </section>
        <section>
          <h2 className="display-upright text-lg text-ink">Segurança</h2>
          <p className="mt-2">
            Utilize apenas os canais oficiais divulgados neste site. A loja
            nunca solicita senha de cartão. Desconfie de perfis ou números que
            se passem pela Xavier&apos;s Sports.
          </p>
        </section>
      </div>
    </div>
  );
}
