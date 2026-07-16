import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
