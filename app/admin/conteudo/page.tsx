import { teams } from "@/data/teams";
import { categories } from "@/data/categories";
import { leagues } from "@/data/leagues";

export default function AdminConteudo() {
  return (
    <div>
      <h1 className="display text-3xl text-ink">Times e categorias</h1>
      <p className="mt-1 text-sm text-steel">
        Estrutura atual do catálogo. A edição de times, categorias, banners e
        textos do site será ativada em uma próxima atualização do painel — por
        enquanto, solicite alterações ao responsável técnico.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="display-upright text-lg text-ink">
            Times e seleções ({teams.length})
          </h2>
          <p className="mt-1 text-xs text-steel">
            Clubes e seleções disponíveis para vincular aos produtos.
          </p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
            {teams.map((t) => (
              <li key={t.slug} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full border border-ink/10"
                  style={{ backgroundColor: t.colors[0] }}
                  aria-hidden="true"
                />
                {t.name}
                <span className="text-xs text-steel">
                  ({t.type === "clube" ? "clube" : "seleção"})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="display-upright text-lg text-ink">
            Categorias ({categories.length})
          </h2>
          <p className="mt-1 text-xs text-steel">
            Categorias exibidas na loja e usadas como filtros do catálogo.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>{c.name}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <h2 className="display-upright text-lg text-ink">
              Campeonatos ({leagues.length})
            </h2>
            <p className="mt-1 text-xs text-steel">
              Usados para organizar e filtrar o catálogo.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              {leagues.map((l) => (
                <li key={l.slug}>{l.name}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
            <h2 className="display-upright text-lg text-ink">Hero e banners</h2>
            <p className="mt-1 text-xs text-steel">
              A edição do banner principal, dos avisos do topo e das imagens da
              página inicial será ativada em breve nesta área.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
