import { getTeam } from "@/data/teams";

/**
 * Prévia ilustrativa para produtos ainda sem foto: silhueta de camisa
 * nas cores do time, claramente demonstrativa (rótulo "prévia ilustrativa").
 */
export default function JerseyPlaceholder({
  teamSlug,
  teamName,
  label = "Prévia ilustrativa",
  className = "",
}: {
  teamSlug: string;
  teamName: string;
  label?: string;
  className?: string;
}) {
  const team = getTeam(teamSlug);
  const primary = team?.colors[0] ?? "#6f16a8";
  const secondary = team?.colors[1] ?? "#ffd600";
  const initials = team?.short ?? teamName.slice(0, 3).toUpperCase();
  const textColor = team?.textOnPrimary === "dark" ? "#090909" : "#ffffff";

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-cloud ${className}`}
      role="img"
      aria-label={`${label} — camisa ${teamName}`}
    >
      <svg viewBox="0 0 240 240" className="h-4/5 w-4/5" aria-hidden="true">
        {/* corpo */}
        <path
          d="M78 46 L102 34 Q120 46 138 34 L162 46 L196 72 L178 100 L166 92 L166 206 L74 206 L74 92 L62 100 L44 72 Z"
          fill={primary}
          stroke="rgba(9,9,9,0.18)"
          strokeWidth="3"
        />
        {/* mangas em cor secundária */}
        <path d="M78 46 L44 72 L62 100 L74 92 L74 62 Z" fill={secondary} opacity="0.9" />
        <path d="M162 46 L196 72 L178 100 L166 92 L166 62 Z" fill={secondary} opacity="0.9" />
        {/* gola */}
        <path
          d="M102 34 Q120 46 138 34 L132 52 Q120 60 108 52 Z"
          fill={secondary}
        />
        <text
          x="120"
          y="140"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontStyle="italic"
          fontWeight="800"
          fontSize="40"
          fill={textColor}
        >
          {initials}
        </text>
      </svg>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
        {label}
      </span>
    </div>
  );
}
