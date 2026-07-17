"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowRight,
  ArrowUpCircle,
  Clock,
  HelpCircle,
  MoreVertical,
  PackageMinus,
  PackagePlus,
  Pencil,
  X,
} from "lucide-react";

/** Etiqueta de tamanho idêntica à da tabela — usada como exemplo visual. */
function Chip({
  tone,
  children,
}: {
  tone: "ok" | "low" | "out" | "pre" | "off";
  children: React.ReactNode;
}) {
  const tones = {
    ok: "bg-whats/15 text-green-800",
    low: "bg-amarelo/40 text-ink",
    out: "bg-promo/15 text-promo",
    pre: "bg-amarelo/20 text-ink",
    off: "bg-cloud text-steel/50 line-through",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Linha "exemplo → significado" usada nas legendas. */
function Legend({
  example,
  children,
}: {
  example: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex w-24 shrink-0 justify-end">{example}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-steel/50" aria-hidden="true" />
      <span className="text-sm text-ink/80">{children}</span>
    </li>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wide text-roxo">
      {children}
    </p>
  );
}

/** Conteúdo didático da tela de Produtos e estoque. */
function ProdutosHelp() {
  return (
    <div className="mt-4 space-y-5">
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>1 · As etiquetas de tamanho</SectionTitle>
        <ul className="mt-3 space-y-2.5">
          <Legend example={<Chip tone="ok">P: 10</Chip>}>
            Tem estoque — sai na hora
          </Legend>
          <Legend
            example={
              <Chip tone="low">
                GG: 2 <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              </Chip>
            }
          >
            Estoque baixo — hora de repor
          </Legend>
          <Legend
            example={
              <Chip tone="pre">
                M: 0 <Clock className="h-3 w-3" aria-hidden="true" />
              </Chip>
            }
          >
            Zerou, mas aceita encomenda
          </Legend>
          <Legend
            example={
              <Chip tone="out">
                XGG: 0 <span className="text-[9px] uppercase">esg.</span>
              </Chip>
            }
          >
            Esgotado — some da loja
          </Legend>
          <Legend example={<Chip tone="off">PP: 0</Chip>}>
            Tamanho desativado
          </Legend>
        </ul>
      </section>

      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>2 · O status se calcula sozinho</SectionTitle>
        <ul className="mt-3 space-y-2.5">
          <Legend example={<Chip tone="ok">P: 10</Chip>}>
            <span className="rounded-full bg-whats/15 px-2.5 py-1 text-xs font-bold text-green-800">
              Pronta entrega
            </span>
          </Legend>
          <Legend
            example={
              <Chip tone="pre">
                M: 0 <Clock className="h-3 w-3" aria-hidden="true" />
              </Chip>
            }
          >
            <span className="rounded-full bg-amarelo/30 px-2.5 py-1 text-xs font-bold text-ink">
              Somente encomenda
            </span>
          </Legend>
          <Legend
            example={
              <Chip tone="out">
                G: 0 <span className="text-[9px] uppercase">esg.</span>
              </Chip>
            }
          >
            <span className="rounded-full bg-promo/15 px-2.5 py-1 text-xs font-bold text-promo">
              Esgotado
            </span>
          </Legend>
        </ul>
        <p className="mt-3 text-xs text-steel">
          Cuide só das quantidades — a loja atualiza o status na hora.
        </p>
      </section>

      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>3 · Os botões de cada produto</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {(
            [
              [Pencil, "Editar"],
              [PackageMinus, "Saída"],
              [PackagePlus, "Entrada"],
              [MoreVertical, "Mais ações"],
            ] as const
          ).map(([Icon, label]) => (
            <div
              key={label}
              className="rounded-lg border border-ink/10 bg-white p-2.5"
            >
              <Icon className="mx-auto h-5 w-5 text-roxo" aria-hidden="true" />
              <p className="mt-1.5 text-[11px] font-bold leading-tight text-ink">
                {label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-steel">
          Em <strong>Mais ações</strong> ficam: histórico de estoque, duplicar,
          ver no site, ocultar, arquivar e excluir. Na dúvida, prefira{" "}
          <strong>arquivar</strong> — tira da loja sem apagar nada.
        </p>
      </section>

      <p className="rounded-lg bg-amarelo/15 p-3 text-xs leading-relaxed text-ink">
        Toda entrada e saída pede um <strong>motivo</strong> e vira um registro
        permanente na tela de <strong>Movimentações</strong> — você sempre sabe
        o que aconteceu com o estoque.
      </p>
    </div>
  );
}

/** Conteúdo didático da tela de Movimentações. */
function MovimentacoesHelp() {
  return (
    <div className="mt-4 space-y-5">
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>1 · Cada linha é um recibo</SectionTitle>
        <div className="mt-3 rounded-lg border border-ink/10 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-promo/10 px-2 py-0.5 font-bold text-promo">
              <ArrowDownCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Saída
            </span>
            <span className="font-bold">Tam. PP</span>
            <span className="font-bold tabular-nums">−1</span>
            <span className="tabular-nums text-steel">
              estoque 10 → <strong className="text-ink">9</strong>
            </span>
            <span className="text-steel">· Venda · WA-123</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-steel">
          Data, hora e quem fez também ficam gravados em cada registro.
        </p>
      </section>

      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>2 · Entrada soma, saída subtrai</SectionTitle>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-2.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-whats/10 px-2 py-0.5 font-bold text-whats">
              <ArrowUpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Entrada +5
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
            <span className="tabular-nums">
              estoque 10 → <strong>15</strong>
            </span>
            <span className="ml-auto hidden text-steel sm:block">
              reposição, devolução...
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white p-2.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-promo/10 px-2 py-0.5 font-bold text-promo">
              <ArrowDownCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Saída −1
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
            <span className="tabular-nums">
              estoque 10 → <strong>9</strong>
            </span>
            <span className="ml-auto hidden text-steel sm:block">
              venda, troca, avaria...
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs text-steel">
          O estoque nunca fica negativo — saídas maiores que o saldo são
          bloqueadas.
        </p>
      </section>

      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>3 · Errou? Registre o inverso</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg border border-promo/30 bg-promo/5 px-2.5 py-1.5 font-semibold text-ink">
            Saída de 1 un. registrada por engano
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
          <span className="rounded-lg border border-whats/30 bg-whats/5 px-2.5 py-1.5 font-semibold text-ink">
            Entrada de 1 un. — &quot;Ajuste de inventário&quot;
          </span>
        </div>
        <p className="mt-2 text-xs text-steel">
          Os registros não podem ser editados nem apagados — é isso que torna o
          histórico confiável.
        </p>
      </section>

      <p className="rounded-lg bg-amarelo/15 p-3 text-xs leading-relaxed text-ink">
        Dica: na tela de Produtos, a opção <strong>Histórico de estoque</strong>{" "}
        (menu ⋮) abre esta tela já filtrada para aquele produto.
      </p>
    </div>
  );
}

function Badge({ tone, children }: { tone: "roxo" | "ok" | "warn" | "off"; children: React.ReactNode }) {
  const tones = {
    roxo: "bg-roxo/10 text-roxo",
    ok: "bg-whats/15 text-green-800",
    warn: "bg-amarelo/30 text-ink",
    off: "bg-cloud text-steel",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Flow({ steps }: { steps: { label: string; tone: "roxo" | "ok" | "warn" | "off" }[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <span key={s.label} className="flex items-center gap-1.5">
          <Badge tone={s.tone}>{s.label}</Badge>
          {i < steps.length - 1 && (
            <ArrowRight className="h-3 w-3 text-steel/50" aria-hidden="true" />
          )}
        </span>
      ))}
    </div>
  );
}

function ConsultasHelp() {
  return (
    <div className="mt-4 space-y-5">
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>1 · De onde vêm as consultas</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-whats px-2.5 py-1.5 font-bold text-white">
            Cliente toca no WhatsApp do site
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
          <Badge tone="roxo">Nova consulta</Badge>
        </div>
        <p className="mt-2 text-xs text-steel">
          O card já chega com produto, tamanho e valor. O telefone NÃO vem
          junto — quando a pessoa te chamar, preencha em{" "}
          <strong>Dados e anotações</strong> (isso também cria o cliente).
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>2 · Acompanhe pelo status</SectionTitle>
        <Flow
          steps={[
            { label: "Nova consulta", tone: "roxo" },
            { label: "Em atendimento", tone: "ok" },
            { label: "Interessado", tone: "ok" },
            { label: "Convertido em pedido", tone: "ok" },
          ]}
        />
        <p className="mt-2 text-xs text-steel">
          “Aguardando resposta da loja” = a bola está com você. “Aguardando
          resposta do cliente” = a bola está com ele.
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>3 · Virar pedido</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-roxo px-2.5 py-1.5 font-bold text-white">
            Virar pedido
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
          <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 font-semibold">
            XS-0001 criado com o item da consulta
          </span>
        </div>
        <p className="mt-2 text-xs text-steel">
          Converta quando o cliente confirmar o interesse — o acompanhamento
          continua na tela de Pedidos.
        </p>
      </section>
    </div>
  );
}

function PedidosHelp() {
  return (
    <div className="mt-4 space-y-5">
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>1 · O caminho do pedido</SectionTitle>
        <Flow
          steps={[
            { label: "Aguardando confirmação", tone: "roxo" },
            { label: "Aguardando pagamento", tone: "warn" },
            { label: "Pago", tone: "ok" },
            { label: "Enviado", tone: "ok" },
            { label: "Concluído", tone: "ok" },
          ]}
        />
        <p className="mt-2 text-xs text-steel">
          Um pedido nasce de uma consulta (“Virar pedido”) ou do botão{" "}
          <strong>Criar pedido</strong> — inclusive para venda presencial.
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>2 · Pagar = baixar o estoque (uma vez só)</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg bg-whats px-2.5 py-1.5 font-bold text-white">
            Marcar como pago
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
          <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 font-semibold tabular-nums">
            −1 no estoque · movimentação “Venda · XS-0001”
          </span>
        </div>
        <p className="mt-2 text-xs text-steel">
          A baixa acontece UMA única vez — o selo{" "}
          <strong className="text-whats">✓ estoque baixado</strong> mostra que
          já foi feita; cliques repetidos não duplicam. Item sem saldo ou sem
          vínculo gera um aviso para você resolver manualmente.
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>3 · Cancelamento sem surpresa</SectionTitle>
        <p className="mt-2 text-xs text-steel">
          Ao cancelar um pedido pago, o painel pergunta se os produtos voltam
          ao estoque — cada devolução gera uma movimentação de entrada, nada
          acontece em silêncio.
        </p>
      </section>
    </div>
  );
}

function ClientesHelp() {
  return (
    <div className="mt-4 space-y-5">
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>1 · O telefone é a identidade</SectionTitle>
        <p className="mt-2 text-xs text-steel">
          Dois cadastros com o mesmo WhatsApp não existem: o painel reconhece o
          número (mesmo escrito diferente) e mantém um cliente só.
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>2 · Clientes se criam sozinhos</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 font-semibold">
            WhatsApp preenchido na consulta ou no pedido
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-steel/50" aria-hidden="true" />
          <Badge tone="ok">Cliente criado</Badge>
        </div>
        <p className="mt-2 text-xs text-steel">
          Você também pode cadastrar manualmente com endereço e observações.
        </p>
      </section>
      <section className="rounded-xl border border-ink/10 bg-cloud/40 p-4">
        <SectionTitle>3 · Histórico automático</SectionTitle>
        <p className="mt-2 text-xs text-steel">
          Cada cartão mostra quantos pedidos o cliente fez e o total gasto em
          compras pagas — cancelados ficam de fora da conta.
        </p>
      </section>
    </div>
  );
}

const topics = {
  produtos: {
    intro:
      "Cadastre camisas, controle o estoque de cada tamanho e decida o que aparece na loja.",
    body: <ProdutosHelp />,
  },
  movimentacoes: {
    intro: "O extrato do seu estoque — cada alteração vira um registro aqui.",
    body: <MovimentacoesHelp />,
  },
  consultas: {
    intro: "Quem tocou no WhatsApp do site aparece aqui — do primeiro clique ao pedido.",
    body: <ConsultasHelp />,
  },
  pedidos: {
    intro: "Do combinado no WhatsApp à entrega — com estoque sempre em dia.",
    body: <PedidosHelp />,
  },
  clientes: {
    intro: "Sua carteira de clientes, sem duplicados e com histórico.",
    body: <ClientesHelp />,
  },
};

/** Botão "Como funciona" + modal de ajuda visual — cabeçalhos do painel. */
export default function HelpButton({
  topic,
}: {
  topic: keyof typeof topics;
}) {
  const [open, setOpen] = useState(false);
  const content = topics[topic];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Como funciona esta tela"
        title="Como funciona esta tela"
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-semibold text-steel shadow-sm hover:text-roxo"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Como funciona
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-ink/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Como funciona esta tela"
          onClick={() => setOpen(false)}
        >
          <div
            className="my-4 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="display text-2xl text-ink">Como funciona</h3>
                <p className="mt-0.5 text-sm text-steel">{content.intro}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar ajuda"
                className="rounded-lg p-2 text-steel hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {content.body}

            <button
              onClick={() => setOpen(false)}
              className="tap mt-4 w-full rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white hover:bg-roxo-escuro"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
