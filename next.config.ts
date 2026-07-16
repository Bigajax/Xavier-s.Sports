import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Necessário para os escudos-monograma SVG gerados em public/images/escudos.
    // CSP em sandbox impede execução de script — seguro para SVGs próprios.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
