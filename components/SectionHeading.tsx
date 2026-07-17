export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "light",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p
          className={`xavier-eyebrow ${
            tone === "dark" ? "text-amarelo" : "text-roxo"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`display mt-2 text-3xl sm:text-4xl md:text-5xl ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        <span className="swoosh">{title}</span>
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base ${
            tone === "dark" ? "text-white/70" : "text-steel"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
