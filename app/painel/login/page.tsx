import Image from "next/image";
import { redirect } from "next/navigation";
import { FormularioLogin } from "@vitrine/plataforma/painel/FormularioLogin";
import { sessao } from "@vitrine/plataforma/lib/auth";
import { MODO } from "@vitrine/plataforma/lib/dados";
import { site } from "@/config/site";
import "./entrada.css";

export const dynamic = "force-dynamic";

/**
 * A ENTRADA DO PAINEL COM A CARA DA XAVIER'S (14/10/2026, a loja entra no
 * pacote). O painel vem do @vitrine/plataforma, e a entrada é dela. A CAPA É
 * A LOGO DA LOJA, inteira e grande, no roxo da marca (regra do Rafael para
 * toda loja, nascida na Japa); o "XAVIER'S" entra em branco (public/marca/
 * logo-branca.png), porque o roxo dele sumiria no fundo roxo. No computador,
 * a logo à esquerda e o formulário à direita; no celular, a logo numa faixa
 * em cima e o formulário logo abaixo.
 */
export default async function PaginaLogin() {
  const { autenticado } = await sessao();
  if (autenticado) redirect("/painel");

  return (
    <div className="xs-entrada">
      <div className="xs-entrada__capa">
        <Image src="/marca/logo-branca.png" alt={site.name} width={645} height={411} priority className="xs-entrada__logo" />
        <p className="xs-entrada__frase">{site.tagline}</p>
      </div>

      <div className="xs-entrada__lado">
        <div className="xs-entrada__caixa">
          <p className="xs-entrada__rotulo">Painel da loja</p>
          <h1 className="xs-entrada__titulo">Entrar</h1>

          <FormularioLogin pedeEmail={MODO === "supabase"} />

          <p className="xs-entrada__ajuda">
            Esqueceu a senha?{" "}
            <a href="https://wa.me/5544991246187?text=Oi%20Rafael%2C%20esqueci%20a%20senha%20do%20painel%20da%20Xavier%27s%20Sports." target="_blank" rel="noreferrer">
              Chame o Rafael no WhatsApp
            </a>
          </p>
        </div>
        <p className="xs-entrada__assina">Painel feito por Rafael Razeira Estúdio</p>
      </div>
    </div>
  );
}
