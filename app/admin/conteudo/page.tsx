import { teams } from "@/data/teams";
import { categories } from "@/data/categories";
import { leagues } from "@/data/leagues";

export default function AdminConteudo() {
  return (
    <div>
      <h1 className="display text-3xl text-ink">Times, categorias e banners</h1>
      <p className="mt-1 text-sm text-steel">
        Nesta versão, o conteúdo estrutural vive em arquivos editáveis — cada
        bloco abaixo indica onde alterar. Na migração para Supabase, estas
        listas viram tabelas editáveis pelo painel.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-ink/5">
          <h2 className="display-upright text-lg text-ink">
            Times e seleções ({teams.length})
          </h2>
          <p className="mt-1 text-xs text-steel">
            Editar em <code>data/teams.ts</code> — nome, cores, país e liga.
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
            Editar em <code>data/categories.ts</code> — nome, descrição e filtros.
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
              Editar em <code>data/leagues.ts</code>.
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
              Textos do hero em <code>components/Hero.tsx</code>; imagens em{" "}
              <code>public/images/produtos</code>. Frases da barra superior em{" "}
              <code>components/TopBar.tsx</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
