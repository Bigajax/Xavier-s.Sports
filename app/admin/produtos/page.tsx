"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { products as seed, type Product } from "@/data/products";
import { brl } from "@/lib/format";
import { useAdminCollection } from "@/lib/adminStore";
import { toast } from "@/components/Toaster";

type AdminProduct = Pick<
  Product,
  "id" | "name" | "team" | "price" | "collection" | "available" | "newArrival" | "personalizationAvailable"
>;

const seedRows: AdminProduct[] = seed.map((p) => ({
  id: p.id,
  name: p.name,
  team: p.team,
  price: p.price,
  collection: p.collection,
  available: p.available,
  newArrival: p.newArrival,
  personalizationAvailable: p.personalizationAvailable,
}));

export default function AdminProdutos() {
  const { items, ready, add, update, remove } = useAdminCollection<AdminProduct>(
    "produtos",
    seedRows
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [price, setPrice] = useState("");

  if (!ready) return <p className="text-steel">Carregando…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl text-ink">Produtos</h1>
          <p className="mt-1 text-sm text-steel">
            Gestão demonstrativa — alterações valem só neste navegador. Para
            valer no site, edite <code>data/products.ts</code>.
          </p>
        </div>
        <button
          onClick={() => {
            add({
              id: `novo-${items.length + 1}`,
              name: "Nova camisa (edite o nome)",
              team: "Time",
              price: 199.9,
              collection: "atual",
              available: true,
              newArrival: true,
              personalizationAvailable: false,
            });
            toast("Produto demonstrativo criado");
          }}
          className="flex items-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Cadastrar
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-ink/5">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Coleção</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, i) => (
              <tr key={p.id} className={i % 2 ? "bg-cloud/40" : "bg-white"}>
                <td className="px-4 py-2.5 font-semibold">{p.name}</td>
                <td className="px-4 py-2.5">{p.team}</td>
                <td className="tabular-nums px-4 py-2.5">
                  {editing === p.id ? (
                    <span className="flex items-center gap-2">
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        inputMode="decimal"
                        className="w-24 rounded border border-ink/20 px-2 py-1"
                        aria-label={`Novo preço de ${p.name}`}
                      />
                      <button
                        onClick={() => {
                          const v = parseFloat(price.replace(",", "."));
                          if (!Number.isNaN(v) && v > 0) {
                            update(p.id, { price: v } as Partial<AdminProduct>);
                            toast("Preço atualizado (demo)");
                          }
                          setEditing(null);
                        }}
                        className="rounded bg-roxo px-2 py-1 text-xs font-bold text-white"
                      >
                        OK
                      </button>
                    </span>
                  ) : (
                    brl(p.price)
                  )}
                </td>
                <td className="px-4 py-2.5 capitalize">{p.collection}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.available
                        ? "bg-whats/15 text-green-800"
                        : "bg-promo/15 text-promo"
                    }`}
                  >
                    {p.available ? "Publicado" : "Oculto"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(p.id);
                        setPrice(String(p.price));
                      }}
                      title="Editar preço"
                      aria-label={`Editar preço de ${p.name}`}
                      className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => {
                        add({ ...p, id: `${p.id}-copia-${items.length}`, name: `${p.name} (cópia)` });
                        toast("Produto duplicado (demo)");
                      }}
                      title="Duplicar"
                      aria-label={`Duplicar ${p.name}`}
                      className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => {
                        update(p.id, { available: !p.available } as Partial<AdminProduct>);
                        toast(p.available ? "Produto oculto (demo)" : "Produto publicado (demo)");
                      }}
                      title={p.available ? "Ocultar" : "Publicar"}
                      aria-label={`${p.available ? "Ocultar" : "Publicar"} ${p.name}`}
                      className="rounded p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                    >
                      {p.available ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        remove(p.id);
                        toast("Produto removido (demo)");
                      }}
                      title="Remover"
                      aria-label={`Remover ${p.name}`}
                      className="rounded p-1.5 text-steel hover:bg-cloud hover:text-promo"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
