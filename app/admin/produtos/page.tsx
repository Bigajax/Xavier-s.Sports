import { getAdminCatalog } from "@/lib/products/db";
import ProductsTable from "@/components/admin/ProductsTable";
import HelpButton from "@/components/admin/HelpButton";

// Admin sempre vê o dado fresco do banco (sem cache da vitrine).
export const dynamic = "force-dynamic";

export default async function AdminProdutos({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const { filtro } = await searchParams;
  let products: Awaited<ReturnType<typeof getAdminCatalog>> | null = null;
  let error: string | null = null;
  try {
    products = await getAdminCatalog();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar o catálogo.";
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Produtos e estoque</h1>
          <p className="mt-1 text-sm text-steel">
            Altere estoque por tamanho, prazos de encomenda, preços e
            visibilidade. Tudo que você salvar aqui atualiza a vitrine na hora.
          </p>
        </div>
        <HelpButton topic="produtos" />
      </div>

      {error || !products ? (
        <div className="mt-6 rounded-xl border border-promo/30 bg-promo/5 p-6 text-sm text-ink/80">
          <p className="font-bold text-promo">Não foi possível carregar os produtos.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-steel">
            Verifique a conexão e as variáveis de ambiente do Supabase, e
            recarregue a página.
          </p>
        </div>
      ) : (
        <ProductsTable products={products} initialFilter={filtro} />
      )}
    </div>
  );
}
