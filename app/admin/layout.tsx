import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Painel administrativo (demonstração)",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-cloud lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink lg:min-h-screen">
        <AdminNav />
      </aside>
      <div>
        <div className="border-b border-amarelo bg-amarelo/20 px-6 py-2 text-xs font-semibold text-ink">
          Painel demonstrativo — dados salvos apenas neste navegador. Conteúdo
          provisório: validar políticas, preços e textos antes de colocar o
          site no ar. Em produção, proteger este painel com autenticação.
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
