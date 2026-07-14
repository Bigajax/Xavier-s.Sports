"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Informe seu nome"),
  whatsapp: z
    .string()
    .min(10, "Informe um WhatsApp válido com DDD")
    .regex(/^[\d\s()+-]+$/, "Use apenas números, espaços e parênteses"),
  time: z.string().min(2, "Conta pra gente qual é o seu time"),
  interesse: z.string().min(1, "Escolha um interesse"),
  consentimento: z.literal(true, {
    errorMap: () => ({ message: "É preciso autorizar o contato" }),
  }),
});

type FormData = z.infer<typeof schema>;

const interesses = [
  "Clubes brasileiros",
  "Clubes internacionais",
  "Seleções",
  "Retrô",
  "Infantil",
];

export default function NewsletterForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Cadastro simulado nesta versão — pronto para integrar com Supabase.
  const onSubmit = () => setSent(true);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-white/10 p-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-amarelo" aria-hidden="true" />
        <p className="display text-2xl text-white">Você entrou para a lista!</p>
        <p className="text-sm text-white/70">
          Em breve você recebe lançamentos, reposições e ofertas pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-4 sm:grid-cols-2"
      noValidate
    >
      <div>
        <label htmlFor="nl-nome" className="mb-1 block text-sm font-semibold text-white">
          Nome
        </label>
        <input
          id="nl-nome"
          {...register("nome")}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="Seu nome"
          aria-invalid={!!errors.nome}
        />
        {errors.nome && (
          <p role="alert" className="mt-1 text-xs text-amarelo">{errors.nome.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="nl-whats" className="mb-1 block text-sm font-semibold text-white">
          WhatsApp
        </label>
        <input
          id="nl-whats"
          {...register("whatsapp")}
          inputMode="tel"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="(00) 90000-0000"
          aria-invalid={!!errors.whatsapp}
        />
        {errors.whatsapp && (
          <p role="alert" className="mt-1 text-xs text-amarelo">{errors.whatsapp.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="nl-time" className="mb-1 block text-sm font-semibold text-white">
          Time do coração
        </label>
        <input
          id="nl-time"
          {...register("time")}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40"
          placeholder="Ex.: Corinthians"
          aria-invalid={!!errors.time}
        />
        {errors.time && (
          <p role="alert" className="mt-1 text-xs text-amarelo">{errors.time.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="nl-interesse" className="mb-1 block text-sm font-semibold text-white">
          Interesse principal
        </label>
        <select
          id="nl-interesse"
          {...register("interesse")}
          defaultValue=""
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white [&>option]:text-ink"
          aria-invalid={!!errors.interesse}
        >
          <option value="" disabled>
            Escolha uma opção
          </option>
          {interesses.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {errors.interesse && (
          <p role="alert" className="mt-1 text-xs text-amarelo">{errors.interesse.message}</p>
        )}
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            {...register("consentimento")}
            className="mt-1 h-4 w-4 accent-amarelo"
          />
          Autorizo o contato da Xavier&apos;s Sports pelo WhatsApp com novidades e
          ofertas.
        </label>
        {errors.consentimento && (
          <p role="alert" className="mt-1 text-xs text-amarelo">
            {errors.consentimento.message}
          </p>
        )}
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="xavier-tag w-full bg-amarelo px-6 py-3.5 text-base text-ink transition-transform hover:scale-[1.01] sm:w-auto"
        >
          <span>Entrar para a lista da torcida</span>
        </button>
      </div>
    </form>
  );
}
