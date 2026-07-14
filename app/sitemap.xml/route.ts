import { site } from "@/config/site";
import { products } from "@/data/products";
import { teams } from "@/data/teams";

// Route handler em vez da convenção app/sitemap.ts (ver app/robots.txt/route.ts).
export const dynamic = "force-static";

export function GET() {
  const staticPages = [
    "",
    "/catalogo",
    "/clubes",
    "/selecoes",
    "/retro",
    "/lancamentos",
    "/ofertas",
    "/favoritos",
    "/como-comprar",
    "/guia-de-tamanhos",
    "/personalizacao",
    "/envios",
    "/trocas",
    "/sobre",
    "/contato",
    "/privacidade",
    "/termos",
  ];

  const urls = [
    ...staticPages.map((p) => ({ loc: `${site.url}${p}`, priority: p === "" ? "1.0" : "0.7" })),
    ...teams.map((t) => ({
      loc: `${site.url}/${t.type === "clube" ? "clubes" : "selecoes"}/${t.slug}`,
      priority: "0.8",
    })),
    ...products.map((p) => ({
      loc: `${site.url}/produto/${p.slug}`,
      priority: "0.9",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
