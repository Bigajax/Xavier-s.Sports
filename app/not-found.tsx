import Link from "next/link";

export default function NotFound() {
  return (
    <div className="field-lines bg-ink">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-28 text-center text-white">
        <p className="display text-8xl text-amarelo">404</p>
        <h1 className="display mt-4 text-4xl">
          Essa jogada saiu de campo.
        </h1>
        <p className="mt-3 max-w-md text-white/70">
          A página que você procura não existe ou mudou de endereço. Volte ao
          catálogo e continue a partida.
        </p>
        <Link
          href="/catalogo"
          className="xavier-tag mt-8 bg-amarelo px-7 py-3.5 text-base text-ink"
        >
          <span>Explorar camisas</span>
        </Link>
      </div>
    </div>
  );
}
