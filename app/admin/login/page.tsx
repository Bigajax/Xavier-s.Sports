"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Login do painel — usuário criado manualmente no dashboard do Supabase. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = supabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setLoading(false);
      setError(
        signInError.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : signInError.message === "Email not confirmed"
            ? "E-mail ainda não confirmado — confirme o usuário no painel do Supabase."
            : `Não foi possível entrar agora (${signInError.message}). Verifique a conexão e tente de novo.`
      );
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <section className="field-lines flex min-h-screen items-center justify-center bg-ink px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="flex flex-col items-center">
          <Image
            src="/images/logo/xs-glow.png"
            alt="Xavier's Sports"
            width={96}
            height={96}
            priority
            className="h-24 w-24 object-contain"
          />
          <h1 className="display mt-4 text-center text-3xl text-white">
            Painel da loja
          </h1>
          <p className="xavier-tag mt-2 bg-amarelo px-3 py-1 text-xs text-ink">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 skew-x-[8deg]" aria-hidden="true" />
              Acesso restrito
            </span>
          </p>
        </div>

        {/* Card de login */}
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        >
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink"
            >
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-2 border-ink/10 px-3.5 py-3 text-sm transition-colors focus:border-roxo focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="login-senha"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink"
            >
              Senha
            </label>
            <input
              id="login-senha"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-2 border-ink/10 px-3.5 py-3 text-sm transition-colors focus:border-roxo focus:outline-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-promo/10 px-3 py-2.5 text-sm font-semibold text-promo"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="tap xavier-tag w-full bg-roxo px-4 py-3.5 text-center text-sm text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            <span>{loading ? "Entrando..." : "Entrar no painel"}</span>
          </button>

          <p className="text-center text-xs leading-relaxed text-steel">
            Esqueceu a senha? Redefina no painel do Supabase
            <br />
            (Authentication → Users).
          </p>
        </form>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-amarelo"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar ao site
        </Link>
      </div>
    </section>
  );
}
