/** Registro demonstrativo de consultas recebidas pelo WhatsApp. */
const demoOrders = [
  {
    data: "2026-07-12",
    cliente: "Consulta demonstrativa",
    produto: "Camisa Portugal Home",
    tamanho: "M",
    origem: "Página de produto",
    status: "Respondido",
  },
  {
    data: "2026-07-11",
    cliente: "Consulta demonstrativa",
    produto: "Lista de favoritos (3 itens)",
    tamanho: "—",
    origem: "Favoritos",
    status: "Convertido em pedido",
  },
  {
    data: "2026-07-10",
    cliente: "Consulta demonstrativa",
    produto: "Camisa Corinthians Away — Listrada",
    tamanho: "G",
    origem: "Card do catálogo",
    status: "Aguardando resposta",
  },
];

export default function AdminPedidos() {
  return (
    <div>
      <h1 className="display text-3xl text-ink">Consultas do WhatsApp</h1>
      <p className="mt-1 text-sm text-steel">
        Exemplos ilustrativos de como as consultas serão organizadas. O
        registro automático de consultas e o acompanhamento de pedidos serão
        ativados em uma próxima atualização do painel.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-ink/5">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Tamanho</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {demoOrders.map((o, i) => (
              <tr key={i} className={i % 2 ? "bg-cloud/40" : "bg-white"}>
                <td className="px-4 py-2.5">{o.data}</td>
                <td className="px-4 py-2.5">{o.cliente}</td>
                <td className="px-4 py-2.5 font-semibold">{o.produto}</td>
                <td className="px-4 py-2.5">{o.tamanho}</td>
                <td className="px-4 py-2.5">{o.origem}</td>
                <td className="px-4 py-2.5">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
