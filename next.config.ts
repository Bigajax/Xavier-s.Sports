import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * O PACOTE COMPARTILHADO (14/10/2026, a Xavier's troca o admin próprio
   * pelo painel do @vitrine/plataforma): o Next compila o pacote como código
   * da loja, e o pacote acha a loja pelo nome fixo @vitrine/loja (o alias
   * abaixo, o do turbopack e o paths do tsconfig).
   */
  transpilePackages: ["@vitrine/plataforma"],
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, "@vitrine/loja": path.resolve(process.cwd(), "loja.config.ts") };
    return config;
  },
  turbopack: {
    resolveAlias: { "@vitrine/loja": "./loja.config.ts" },
  },
  /* build de conferência com o dev de pé (14/10/2026): NEXT_DIST_DIR=.next-build; sem ela, o .next de sempre */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Necessário para os escudos-monograma SVG gerados em public/images/escudos.
    // CSP em sandbox impede execução de script — seguro para SVGs próprios.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Fotos de produto enviadas pelo painel (Supabase Storage).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Upload de foto de produto pelo painel.
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      // "Lançamentos" foi substituído por "Pronta entrega".
      { source: "/lancamentos", destination: "/pronta-entrega", permanent: true },
      // o admin próprio deu lugar ao painel do pacote (14/10/2026)
      { source: "/admin", destination: "/painel", permanent: false },
      { source: "/admin/:caminho*", destination: "/painel", permanent: false },
    ];
  },
};

export default nextConfig;
