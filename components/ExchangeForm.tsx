"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

const motivos = [
  "Troca de tamanho",
  "Devolução",
  "Defeito",
  "Produto incorreto",
  "Problema na personalização",
  "Outro",
] as const;

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido com DDD"),
  email: z.string().email("Informe um e-mail válido").or(z.literal("")),
  pedido: z.string().min(1, "Informe o número do pedido"),
  motivo: z.enum(motivos, { errorMap: () => ({ message: "Escolha o motivo" }) }),
  produto: z.string().min(2, "Informe o produto"),
  tamanhoRecebido: z.string().optional(),
  tamanhoDesejado: z.string().optional(),
  descricao: z.string().min(10, "Descreva a situação (mínimo 10 caracteres)"),
  aceite: z.literal(true, {
    errorMap: () => ({ message: "É preciso aceitar a política de trocas" }),
  }),
});

type FormData = z.infer<typeof schema>;

export default function ExchangeForm() {
  const [readyLink, setReadyLink] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const motivo = watch("motivo");
  const showSizes = motivo === "Troca de tamanho";

  const onSubmit = (data: FormData) => {
    const lines = [
      "Olá! Estou enviando uma solicitação pelo site da Xavier's Sports.",
      `Motivo: ${data.motivo}.`,
      `Nome: ${data.nome}.`,
      `Número do pedido: ${data.pedido}.`,
      `Produto: ${data.produto}.`,
    ];
    if (data.tamanhoRecebido) lines.push(`Tamanho recebido: ${data.tamanhoRecebido}.`);
    if (data.tamanhoDesejado) lines.push(`Tamanho desejado: ${data.tamanhoDesejado}.`);
    if (data.email) lines.push(`E-mail: ${data.email}.`);
    lines.push(`Descrição: ${data.descricao}`);
    lines.push("Posso enviar fotos da peça, da etiqueta e da embalagem por aqui.");
    setReadyLink(waLink(lines.join("\n")));
  };

  const field =
    "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm";
  const label = "mb-1 block text-sm font-bold text-ink";
  const err = "mt-1 text-xs text-promo";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="ex-nome" className={label}>Nome</label>
        <input id="ex-nome" {...register("nome")} className={field} aria-invalid={!!errors.nome} />
        {errors.nome && <p role="alert" className={err}>{errors.nome.message}</p>}
      </div>
      <div>
        <label htmlFor="ex-whats" className={label}>WhatsApp</label>
        <input id="ex-whats" {...register("whatsapp")} inputMode="tel" className={field} placeholder="(00) 90000-0000" aria-invalid={!!errors.whatsapp} />
        {errors.whatsapp && <p role="alert" className={err}>{errors.whatsapp.message}</p>}
      </div>
      <div>
        <label htmlFor="ex-email" className={label}>E-mail (opcional)</label>
        <input id="ex-email" type="email" {...register("email")} className={field} aria-invalid={!!errors.email} />
        {errors.email && <p role="alert" className={err}>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="ex-pedido" className={label}>Número do pedido</label>
        <input id="ex-pedido" {...register("pedido")} className={field} aria-invalid={!!errors.pedido} />
        {errors.pedido && <p role="alert" className={err}>{errors.pedido.message}</p>}
      </div>
      <div>
        <label htmlFor="ex-motivo" className={label}>Motivo</label>
        <select id="ex-motivo" {...register("motivo")} defaultValue="" className={field} aria-invalid={!!errors.motivo}>
          <option value="" disabled>Escolha o motivo</option>
          {motivos.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {errors.motivo && <p role="alert" className={err}>{errors.motivo.message}</p>}
      </div>
      <div>
        <label htmlFor="ex-produto" className={label}>Produto</label>
        <input id="ex-produto" {...register("produto")} className={field} placeholder="Ex.: Camisa Corinthians Home" aria-invalid={!!errors.produto} />
        {errors.produto && <p role="alert" className={err}>{errors.produto.message}</p>}
      </div>

      {showSizes && (
        <>
          <div>
            <label htmlFor="ex-tam-rec" className={label}>Tamanho recebido</label>
            <input id="ex-tam-rec" {...register("tamanhoRecebido")} className={field} placeholder="Ex.: M" />
          </div>
          <div>
            <label htmlFor="ex-tam-des" className={label}>Tamanho desejado</label>
            <input id="ex-tam-des" {...register("tamanhoDesejado")} className={field} placeholder="Ex.: G" />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="ex-desc" className={label}>Descrição</label>
        <textarea
          id="ex-desc"
          {...register("descricao")}
          rows={4}
          className={field}
          placeholder="Conte o que aconteceu. Fotos podem ser enviadas depois, pelo próprio WhatsApp."
          aria-invalid={!!errors.descricao}
        />
        {errors.descricao && <p role="alert" className={err}>{errors.descricao.message}</p>}
        <p className="mt-1 text-xs text-steel">
          Upload de imagens: envie as fotos diretamente na conversa do WhatsApp
          após abrir a solicitação.
        </p>
      </div>

      <div className="sm:col-span-2">
        <label className="flex items-start gap-2 text-sm text-ink/80">
          <input type="checkbox" {...register("aceite")} className="mt-0.5 h-4 w-4 accent-roxo" />
          Li e aceito as condições da política de trocas e devoluções.
        </label>
        {errors.aceite && <p role="alert" className={err}>{errors.aceite.message}</p>}
      </div>

      <div className="sm:col-span-2">
        {readyLink ? (
          <div className="rounded-xl border border-whats/40 bg-whats/10 p-5">
            <p className="font-bold text-ink">
              Solicitação preparada. Envie a mensagem pelo WhatsApp para
              continuar o atendimento.
            </p>
            <a
              href={readyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-whats px-6 py-3.5 font-bold text-white"
            >
              <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              Abrir WhatsApp com a solicitação
            </a>
            <p className="mt-3 text-xs text-steel">
              O envio não representa aprovação automática — a equipe analisa
              cada caso conforme a política da loja.
            </p>
          </div>
        ) : (
          <button
            type="submit"
            className="xavier-tag bg-roxo px-8 py-4 text-base text-white transition-transform hover:scale-[1.01]"
          >
            <span>Preparar solicitação</span>
          </button>
        )}
      </div>
    </form>
  );
}
