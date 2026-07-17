import { site } from "@/config/site";

const pending = [
  ["WhatsApp oficial", (site.whatsapp as string) === "5500000000000" ? "⚠️ PENDENTE — placeholder ativo" : site.whatsapp],
  ["E-mail", site.email],
  ["Domínio (SEO)", site.url],
  ["Horário de atendimento", site.businessHours],
  ["Endereço", site.address || "— (sem loja física informada)"],
] as const;

export default function AdminConfiguracoes() {
  return (
    <div>
      <h1 className="display text-3xl text-ink">Dados da loja</h1>
      <p className="mt-1 text-sm text-steel">
        Informações usadas no site inteiro (WhatsApp, rodapé, contato). A
        edição direta por aqui será ativada em uma próxima atualização — por
        enquanto, solicite alterações ao responsável técnico.
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

      <p className="mt-6 rounded-xl border border-amarelo/60 bg-amarelo/10 p-4 text-sm font-semibold text-ink">
        Revise a política de trocas, devoluções e reembolsos com a equipe antes
        de divulgar amplamente o site.
      </p>
    </div>
  );
}
