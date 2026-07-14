import { site } from "@/config/site";

// Route handler em vez da convenção app/robots.ts: o loader de metadata do
// Next quebra quando o caminho do projeto contém apóstrofo ("Xavier's Sports").
export const dynamic = "force-static";

export function GET() {
  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /admin",
    `Sitemap: ${site.url}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
