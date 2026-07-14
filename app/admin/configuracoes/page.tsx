import { site } from "@/config/site";

const pending = [
  ["WhatsApp oficial", site.whatsapp === "5500000000000" ? "⚠️ PENDENTE — placeholder ativo" : site.whatsapp],
  ["E-mail", site.email],
  ["Domínio (SEO)", site.url],
  ["Horário de atendimento", site.businessHours],
  ["Endereço", site.address || "— (sem loja física informada)"],
] as const;

export default function AdminConfiguracoes() {
  return (
    <div>
      <h1 className="display text-3xl text-ink">Configurações</h1>
      <p className="mt-1 text-sm text-steel">
        Os dados da loja ficam centralizados em <code>config/site.ts</code> —
        uma edição vale para o site inteiro (WhatsApp, SEO, rodapé, mensagens).
      </p>

      <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-ink/5">
        <table className="w-full text-left text-sm">
          <tbody>
            {pending.map(([k, v], i) => (
              <tr key={k} className={i % 2 ? "bg-cloud/40" : "bg-white"}>
                <th scope="row" className="w-56 px-4 py-3 font-bold text-ink">
                  {k}
                </th>
                <td className={`px-4 py-3 ${String(v).startsWith("⚠️") ? "font-bold text-promo" : "text-ink/80"}`}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-roxo/30 bg-roxo/5 p-5 text-sm leading-relaxed text-ink/80">
        <h2 className="display-upright text-lg text-ink">
          Migração para Supabase (preparada)
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>Criar projeto no Supabase e tabelas espelhando <code>data/*.ts</code> (products, teams, leagues, categories) e as coleções do admin (trocas, avaliações, pedidos).</li>
          <li>Substituir os imports de <code>data/*.ts</code> por consultas ao Supabase nos Server Components.</li>
          <li>Trocar <code>lib/adminStore.ts</code> (localStorage) por chamadas autenticadas.</li>
          <li>Proteger a rota <code>/admin</code> com autenticação (middleware) antes de publicar.</li>
          <li>Guardar chaves em variáveis de ambiente — nunca no código.</li>
        </ol>
      </div>

      <p className="mt-6 rounded-xl border border-amarelo/60 bg-amarelo/10 p-4 text-sm font-semibold text-ink">
        Conteúdo provisório. Validar a política de trocas, devoluções e
        reembolsos antes de colocar o site no ar.
      </p>
    </div>
  );
}
