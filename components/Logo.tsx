import Link from "next/link";

/**
 * Logo tipográfica fiel à marca: "XAVIER'S" roxo itálico sobre "SPORTS"
 * amarelo com swoosh — funciona sobre fundo claro e escuro.
 */
export default function Logo({
  variant = "dark-bg",
  className = "",
}: {
  variant?: "dark-bg" | "light-bg";
  className?: string;
}) {
  const xavier = variant === "dark-bg" ? "text-white" : "text-roxo";
  return (
    <Link
      href="/"
      aria-label="Xavier's Sports — página inicial"
      className={`inline-flex flex-col leading-none ${className}`}
    >
      <span
        className={`display text-[1.35rem] tracking-tight ${xavier}`}
      >
        Xavier&apos;s
      </span>
      <span className="relative -mt-0.5 ml-2">
        <span className="display text-[1.05rem] tracking-[0.08em] text-amarelo">
          Sports
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-[3px] w-full -skew-x-[30deg] rounded-full bg-amarelo"
        />
      </span>
    </Link>
  );
}
