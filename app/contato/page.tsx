import type { Metadata } from "next";
import { Clock, Instagram, Mail } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { site } from "@/config/site";
import { waDefault } from "@/lib/whatsapp";
import { faqGeral } from "@/data/faq";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com a Xavier's Sports pelo WhatsApp, Instagram ou formulário. Atendimento próximo em cada etapa.",
};

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Contato"
        title="Fala com a gente"
        subtitle="O WhatsApp é o canal mais rápido — mas você também encontra a loja no Instagram e por e-mail."
      />

      <div className="mt-10 grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="space-y-3">
          <a
            href={waDefault()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl bg-whats p-4 font-bold text-white"
          >
            <WhatsAppIcon className="h-6 w-6" aria-hidden="true" />
            WhatsApp da loja
          </a>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4 font-semibold text-ink hover:border-roxo"
          >
            <Instagram className="h-6 w-6 text-roxo" aria-hidden="true" />
            {site.instagram}
          </a>
          <a
            href={`mailto:${site.email}`}
            className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4 font-semibold text-ink hover:border-roxo"
          >
            <Mail className="h-6 w-6 text-roxo" aria-hidden="true" />
            {site.email}
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-cloud/60 p-4 text-sm text-steel">
            <Clock className="h-6 w-6 shrink-0 text-roxo" aria-hidden="true" />
            {site.businessHours}
          </div>
          {site.address && (
            <p className="rounded-xl border border-ink/10 bg-white p-4 text-sm text-steel">
              {site.address}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-cloud p-6 md:p-8">
          <h2 className="display text-2xl text-ink">Formulário de contato</h2>
          <p className="mb-6 mt-1 text-sm text-steel">
            Preencha e o site prepara a mensagem para o WhatsApp — sem enviar
            nada automaticamente.
          </p>
          <ContactForm />
        </div>
      </div>

      <section className="mt-14">
        <h2 className="display text-3xl text-ink">
          <span className="swoosh">Perguntas frequentes</span>
        </h2>
        <div className="mt-6 space-y-3">
          {faqGeral.map((f) => (
            <details key={f.q} className="group rounded-xl border border-ink/10 bg-white p-5">
              <summary className="cursor-pointer list-none font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-steel">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
