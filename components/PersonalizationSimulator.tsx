"use client";

import { useState } from "react";

const shirtColors = [
  { name: "Roxa", bg: "#6f16a8", text: "#ffd600" },
  { name: "Preta", bg: "#090909", text: "#ffffff" },
  { name: "Branca", bg: "#f4f4f4", text: "#090909" },
  { name: "Amarela", bg: "#ffd600", text: "#1b5e20" },
  { name: "Vermelha", bg: "#c62828", text: "#ffffff" },
];

/** Prévia ilustrativa da parte traseira da camisa — claramente demonstrativa. */
export default function PersonalizationSimulator() {
  const [name, setName] = useState("XAVIER");
  const [number, setNumber] = useState("10");
  const [color, setColor] = useState(shirtColors[0]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label htmlFor="sim-nome" className="mb-1 block text-sm font-bold text-ink">
            Nome (até 14 caracteres)
          </label>
          <input
            id="sim-nome"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase().slice(0, 14))}
            className="w-full rounded-lg border border-ink/15 px-4 py-3 uppercase"
            placeholder="SEU NOME"
          />
        </div>
        <div>
          <label htmlFor="sim-numero" className="mb-1 block text-sm font-bold text-ink">
            Número (0–99)
          </label>
          <input
            id="sim-numero"
            value={number}
            onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            className="w-32 rounded-lg border border-ink/15 px-4 py-3"
            placeholder="10"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink">Cor da camisa (prévia)</p>
          <div className="flex gap-2" role="group" aria-label="Cor da prévia">
            {shirtColors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c)}
                aria-pressed={color.name === c.name}
                aria-label={`Prévia na cor ${c.name}`}
                className={`h-10 w-10 rounded-full border-4 ${
                  color.name === c.name ? "border-roxo" : "border-ink/10"
                }`}
                style={{ backgroundColor: c.bg }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-steel">
          A prévia é apenas ilustrativa: fonte, tamanho e posição reais variam
          conforme o modelo e o fornecedor. A personalização só é confirmada
          pela equipe no atendimento.
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-xs">
        <svg viewBox="0 0 240 260" className="h-auto w-full" aria-hidden="true">
          <path
            d="M78 46 L102 34 Q120 46 138 34 L162 46 L196 72 L178 100 L166 92 L166 226 L74 226 L74 92 L62 100 L44 72 Z"
            fill={color.bg}
            stroke="rgba(9,9,9,0.25)"
            strokeWidth="3"
          />
          <text
            x="120"
            y="98"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontWeight="800"
            fontSize="20"
            letterSpacing="2"
            fill={color.text}
          >
            {name || "NOME"}
          </text>
          <text
            x="120"
            y="185"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontStyle="italic"
            fontWeight="800"
            fontSize="86"
            fill={color.text}
          >
            {number || "?"}
          </text>
        </svg>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Prévia demonstrativa
        </span>
      </div>
    </div>
  );
}
