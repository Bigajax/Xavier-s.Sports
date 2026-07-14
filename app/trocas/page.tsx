import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import ExchangeForm from "@/components/ExchangeForm";
import { faqTrocas } from "@/data/faq";
import {
  waDefeito,
  waDevolucao,
  waProdutoIncorreto,
  waTrocaTamanho,
} from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Trocas e devoluções",
  description:
    "Entenda como solicitar troca de tamanho, devolução ou atendimento para produtos com problema.",
};

const condicoes = [
  "Sem sinais de uso",
  "Sem lavagem",
  "Sem odores",
  "Sem manchas",
  "Sem danos causados pelo cliente",
  "Com etiquetas",
  "Com embalagem, quando aplicável",
  "Acompanhada dos dados do pedido",
];

const trocaSteps = [
  "Informe o número do pedido.",
  "Envie fotos da camisa e da etiqueta.",
  "Informe o tamanho recebido.",
  "Escolha o novo tamanho desejado.",
  "Aguarde a confirmação de disponibilidade.",
  "Siga as orientações de envio.",
  "Após a conferência, a nova peça será enviada conforme a política da loja.",
];

const devolucaoSteps = [
  "Entre em contato pelo canal oficial.",
  "Informe o número do pedido.",
  "Explique o motivo da devolução.",
  "Envie as informações solicitadas.",
  "Aguarde as instruções de envio.",
  "A peça será conferida após o recebimento.",
  "O reembolso ou solução será realizado conforme a política aprovada.",
];

const defeitoSteps = [
  "Envie as evidências pelo WhatsApp (fotos da peça, etiqueta, embalagem e data de recebimento).",
  "Aguarde a análise da equipe.",
  "Receba as orientações para envio ou solução.",
  "Após a conferência, a loja informa a alternativa disponível.",
];

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="mt-4 space-y-2">
      {items.map((s, i) => (
        <li key={s} className="flex items-start gap-3 text-sm text-ink/80">
          <span className="display w-6 shrink-0 text-center text-xl text-roxo/40">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
}

function FlowCard({
  id,
  title,
  intro,
  children,
  cta,
  href,
}: {
  id: string;
  title: string;
  intro: string;
  children?: React.ReactNode;
  cta: string;
  href: string;
}) {
  return (
    <section id={id} className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8">
      <h2 className="display text-3xl text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-steel">{intro}</p>
      {children}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-whats px-5 py-3.5 text-sm font-bold text-white"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        {cta}
      </a>
    </section>
  );
}

export default function TrocasPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Trocas e devoluções"
        title="Trocas e devoluções sem complicação"
        subtitle="Entenda como solicitar troca de tamanho, devolução ou atendimento para produtos com problema."
      />

      <p className="mt-6 rounded-xl border border-amarelo/60 bg-amarelo/10 p-4 text-sm text-ink/80">
        <AlertTriangle className="mr-2 inline h-4 w-4 text-roxo" aria-hidden="true" />
        Conteúdo provisório e editável. Prazos, custos e condições definitivas
        serão validados com a política oficial da loja antes da publicação.
      </p>

      <div className="mt-10 space-y-6">
        {/* 18.1 Troca de tamanho */}
        <FlowCard
          id="troca-de-tamanho"
          title="O tamanho não serviu?"
          intro="Entre em contato com a equipe pelo WhatsApp informando o número do pedido, o produto recebido e o novo tamanho desejado. A troca depende da disponibilidade do tamanho solicitado."
          cta="Solicitar troca de tamanho"
          href={waTrocaTamanho({
            pedido: "(informe aqui)",
            produto: "(nome da camisa)",
            tamanhoAtual: "(tamanho recebido)",
            novoTamanho: "(novo tamanho)",
          })}
        >
          <Steps items={trocaSteps} />
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-steel">
            <li>A peça não pode apresentar sinais de uso, odores, manchas, lavagens ou alterações.</li>
            <li>Etiquetas e embalagem devem ser preservadas.</li>
            <li>Se o tamanho não estiver disponível, a equipe apresenta as alternativas permitidas pela política.</li>
            <li>Custos de envio seguem a regra oficial definida pela loja.</li>
            <li>A troca é confirmada somente após a conferência da peça.</li>
          </ul>
        </FlowCard>

        {/* 18.2 Devolução */}
        <FlowCard
          id="devolucao"
          title="Deseja devolver o pedido?"
          intro="Solicite a devolução dentro do prazo aplicável, seguindo as condições informadas pela loja. Prazo de solicitação, postagem, forma de reembolso e custos são definidos na política oficial."
          cta="Solicitar devolução"
          href={waDevolucao({
            pedido: "(informe aqui)",
            produto: "(nome da camisa)",
            motivo: "(conte o motivo)",
          })}
        >
          <Steps items={devolucaoSteps} />
        </FlowCard>

        {/* 18.3 Defeito */}
        <FlowCard
          id="defeito"
          title="Recebeu uma peça com problema?"
          intro="Envie o número do pedido, a descrição do problema e fotos da peça, da etiqueta e da embalagem, junto com a data de recebimento."
          cta="Informar problema com o produto"
          href={waDefeito({
            pedido: "(informe aqui)",
            produto: "(nome da camisa)",
            problema: "(descreva o problema)",
          })}
        >
          <Steps items={defeitoSteps} />
        </FlowCard>

        {/* 18.4 Produto incorreto */}
        <FlowCard
          id="produto-incorreto"
          title="Recebeu um produto diferente do pedido?"
          intro="Vale para time, modelo, tamanho, personalização ou quantidade diferente do solicitado. Informe o que pediu e o que chegou — a equipe resolve com prioridade."
          cta="Informar produto incorreto"
          href={waProdutoIncorreto({
            pedido: "(informe aqui)",
            produtoSolicitado: "(o que você pediu)",
            produtoRecebido: "(o que chegou)",
          })}
        />
      </div>

      {/* 18.5 Personalizados */}
      <section className="mt-10 rounded-2xl border-2 border-roxo/30 bg-roxo/5 p-6 md:p-8">
        <h2 className="display text-3xl text-ink">Atenção às peças personalizadas</h2>
        <p className="mt-2 text-sm text-steel">
          Produtos com nome, número ou outra personalização podem possuir
          regras específicas de troca e devolução.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-ink/80">
          <li>A personalização deve ser confirmada pelo cliente antes da produção — confira escrita, acentuação e número.</li>
          <li>Uma prévia visual não representa necessariamente o resultado exato.</li>
          <li>Erros informados pelo cliente podem limitar a possibilidade de troca.</li>
          <li>Defeitos de produção ou divergências do pedido são analisados pela equipe.</li>
          <li>A regra final segue a legislação aplicável e a política validada pela loja.</li>
        </ul>
      </section>

      {/* 18.6 Condições da peça */}
      <section className="mt-10">
        <h2 className="display text-3xl text-ink">
          <span className="swoosh">Condições para análise</span>
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {condicoes.map((c) => (
            <li
              key={c}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4 text-sm font-medium text-ink"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-whats" aria-hidden="true" />
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* 18.7 Formulário */}
      <section className="mt-12 rounded-2xl bg-cloud p-6 md:p-8">
        <h2 className="display text-3xl text-ink">Formulário de solicitação</h2>
        <p className="mb-6 mt-1 text-sm text-steel">
          Preencha os dados e o site prepara a mensagem completa para o
          WhatsApp — nada é aprovado automaticamente.
        </p>
        <ExchangeForm />
      </section>

      {/* 18.10 FAQ */}
      <section className="mt-12">
        <h2 className="display text-3xl text-ink">
          <span className="swoosh">Dúvidas frequentes</span>
        </h2>
        <div className="mt-6 space-y-3">
          {faqTrocas.map((f) => (
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
