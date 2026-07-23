import Image from "next/image";
import { Instagram } from "lucide-react";
import { site } from "@/config/site";

/**
 * Grade visual do Instagram usando fotos reais do catálogo.
 * Preparada para futura integração com feed externo.
 */
const gridImages = [
  { src: "/images/produtos/brasil-home-feminina-a.webp", alt: "Camisa amarela de seleção em corte feminino" },
  { src: "/images/produtos/sao-paulo-away-a.webp", alt: "Camisa listrada tricolor pendurada" },
  { src: "/images/produtos/japao-home-a.webp", alt: "Camisa branca com listras coloridas" },
  { src: "/images/produtos/barcelona-retro-96-a.webp", alt: "Camisa retrô blaugrana em cabide" },
  { src: "/images/produtos/portugal-away-a.webp", alt: "Camisa branca e verde-água de seleção" },
  { src: "/images/produtos/corinthians-away-a.webp", alt: "Camisa listrada preta e branca em manequim" },
];

export default function InstagramGrid() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="xavier-eyebrow text-roxo">Instagram</p>
            <h2 className="display mt-2 text-4xl text-ink">
              <span className="swoosh">Acompanhe os lançamentos</span>
            </h2>
            <p className="mt-3 max-w-md text-steel">
              Novas camisas, prévias, reposições e conteúdos para quem vive
              futebol.
            </p>
          </div>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-roxo px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-roxo-escuro"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
            Seguir Xavier&apos;s Sports
          </a>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {gridImages.map((img) => (
            <a
              key={img.src}
              href={site.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg bg-cloud"
              aria-label={`Ver no Instagram: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-roxo/0 transition-colors group-hover:bg-roxo/50">
                <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
