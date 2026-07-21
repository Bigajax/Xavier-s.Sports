"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waLink } from "@/lib/whatsapp";

const assuntos = [
  "Consultar produto",
  "Tamanho",
  "Personalização",
  "Pedido",
  "Envio",
  "Troca",
  "Outro",
] as const;

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  telefone: z.string().min(10, "Informe um telefone válido com DDD"),
  assunto: z.enum(assuntos, { errorMap: () => ({ message: "Escolha o assunto" }) }),
  time: z.string().optional(),
  mensagem: z.string().min(10, "Escreva sua mensagem (mínimo 10 caracteres)"),
});

type FormData = z.infer<typeof schema>;

export default function ContactForm() {
  const [readyLink, setReadyLink] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const lines = [
      "Olá! Vim pelo site da Xavier's Sports.",
      `Nome: ${data.nome}.`,
      `Assunto: ${data.assunto}.`,
    ];
    if (data.time) lines.push(`Time ou seleção: ${data.time}.`);
    lines.push(`Mensagem: ${data.mensagem}`);
    setReadyLink(waLink(lines.join("\n")));
  };

  const field = "w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-sm";
  const label = "mb-1 block text-sm font-bold text-ink";
  const err = "mt-1 text-xs text-promo";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="ct-nome" className={label}>Nome</label>
        <input id="ct-nome" {...register("nome")} className={field} aria-invalid={!!errors.nome} />
        {errors.nome && <p role="alert" className={err}>{errors.nome.message}</p>}
      </div>
      <div>
        <label htmlFor="ct-tel" className={label}>Telefone / WhatsApp</label>
        <input id="ct-tel" {...register("telefone")} inputMode="tel" className={field} placeholder="(00) 90000-0000" aria-invalid={!!errors.telefone} />
        {errors.telefone && <p role="alert" className={err}>{errors.telefone.message}</p>}
      </div>
      <div>
        <label htmlFor="ct-assunto" className={label}>Assunto</label>
        <select id="ct-assunto" {...register("assunto")} defaultValue="" className={field} aria-invalid={!!errors.assunto}>
          <option value="" disabled>Escolha o assunto</option>
          {assuntos.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {errors.assunto && <p role="alert" className={err}>{errors.assunto.message}</p>}
      </div>
      <div>
        <label htmlFor="ct-time" className={label}>Time ou seleção (opcional)</label>
        <input id="ct-time" {...register("time")} className={field} placeholder="Ex.: Corinthians" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="ct-msg" className={label}>Mensagem</label>
        <textarea id="ct-msg" {...register("mensagem")} rows={4} className={field} aria-invalid={!!errors.mensagem} />
        {errors.mensagem && <p role="alert" className={err}>{errors.mensagem.message}</p>}
      </div>
      <div className="sm:col-span-2">
        {readyLink ? (
          <div className="rounded-xl border border-whats/40 bg-whats/10 p-5">
            <p className="font-bold text-ink">
              Mensagem pronta! Envie pelo WhatsApp para falar com a equipe.
            </p>
            <a
              href={readyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-whats px-6 py-3.5 font-bold text-white"
            >
              <WhatsAppIcon className="h-5 w-5" aria-hidden="true" />
              Abrir WhatsApp
            </a>
          </div>
        ) : (
          <button
            type="submit"
            className="xavier-tag bg-roxo px-8 py-4 text-base text-white transition-transform hover:scale-[1.01]"
          >
            <span>Preparar mensagem</span>
          </button>
        )}
      </div>
    </form>
  );
}
