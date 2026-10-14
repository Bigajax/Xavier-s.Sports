import Link from "next/link";
import type { BannerMeio as Banner } from "@/data/banners";
import { waLink } from "@/lib/whatsapp";

/**
 * UM BANNER DO MEIO (14/10/2026, no padrão do molde): a linha, o cupom ou a
 * entrega, entre as fileiras. A arte larga (3:1) no computador e a quadrada
 * no celular; o texto entra por cima, no lado escuro. Sem a arte, o fundo é
 * o da marca em CSS (o roxo, as linhas de gramado e a faixa amarela), e o
 * banner já vende enquanto a arte não chega.
 */
export default function BannerMeio({ banner, comArte }: { banner: Banner; comArte: boolean }) {
  const externo = banner.href.startsWith("whatsapp:");
  const href = externo ? waLink(banner.href.slice("whatsapp:".length)) : banner.href;
  const botao = (
    <>
      <span>{banner.botao}</span>
    </>
  );
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8" aria-label={banner.titulo}>
      <div className={`xs-meio ${comArte ? "" : "xs-meio--sem-arte"}`}>
        {comArte ? (
          <picture>
            <source media="(max-width: 767px)" srcSet={banner.arteCelular} />
            <img src={banner.arte} alt="" className="xs-meio__arte" loading="lazy" />
          </picture>
        ) : (
          <span className="xs-meio__faixa" aria-hidden="true" />
        )}
        <div className="xs-meio__texto">
          <h2 className="display text-3xl leading-none text-white sm:text-4xl lg:text-5xl">{banner.titulo}</h2>
          <p className="mt-2 max-w-md text-sm text-white/80 sm:text-base">{banner.linha}</p>
          {externo ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="xavier-tag mt-5 inline-block bg-amarelo px-6 py-3 text-sm text-ink">
              {botao}
            </a>
          ) : (
            <Link href={href} className="xavier-tag mt-5 inline-block bg-amarelo px-6 py-3 text-sm text-ink">
              {botao}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
