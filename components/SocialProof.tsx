import { Star } from "lucide-react";

/**
 * PLACEHOLDER de prova social — nenhum depoimento abaixo é real.
 * Os cards demonstrativos ficam ocultos até o proprietário cadastrar
 * avaliações reais no /admin (Avaliações).
 */
const PLACEHOLDER_MODE = true;

const demoReviews = [
  // Estrutura pronta: { nome, cidade, avaliacao, comentario, produto }
];

export default function SocialProof() {
  return (
    <section className="bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <p className="xavier-eyebrow text-roxo">Prova social</p>
        <h2 className="display mt-2 text-4xl text-ink">
          <span className="swoosh">Quem veste, recomenda</span>
        </h2>

        {PLACEHOLDER_MODE || demoReviews.length === 0 ? (
          <div className="mt-8 rounded-xl border-2 border-dashed border-steel/40 bg-white p-10 text-center">
            <div className="mx-auto flex w-fit gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 text-steel/40" />
              ))}
            </div>
            <p className="mt-4 font-semibold text-ink">
              Avaliações de clientes serão adicionadas em breve.
            </p>
            <p className="mt-2 text-sm text-steel">
              Comprou com a gente? Mande sua foto com a camisa pelo WhatsApp e
              apareça aqui (com sua autorização).
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
