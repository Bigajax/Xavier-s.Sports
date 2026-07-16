import type { Metadata } from "next";
import AdminNav from "@/components/admin/AdminNav";
import { supabaseServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Defesa dupla com o middleware: sem sessão, renderiza só o conteúdo
  // (a página de login), sem o chrome do painel.
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="min-h-screen bg-cloud">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cloud lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 z-40 bg-ink lg:static lg:min-h-screen">
        <AdminNav userEmail={user.email ?? ""} />
      </aside>
      <main className="p-4 pb-16 sm:p-6">{children}</main>
    </div>
  );
}
