"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Users, X } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import type { CustomerRow } from "@/lib/crm";
import { saveCustomer } from "@/app/admin/crm/actions";
import { brl } from "@/lib/format";
import { norm } from "@/lib/catalog";
import { toast } from "@/components/Toaster";

/** Lista e cadastro de clientes — cards, iguais no desktop e no celular. */
export default function CustomersBoard({
  customers,
  stats,
}: {
  customers: CustomerRow[];
  stats: Record<string, { count: number; spent: number }>;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(
    () =>
      customers.filter((c) =>
        q.trim()
          ? norm(`${c.name} ${c.whatsapp ?? ""} ${c.city ?? ""}`).includes(norm(q))
          : true
      ),
    [customers, q]
  );

  return (
    <div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone ou cidade..."
          aria-label="Buscar cliente"
          className="w-full min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-sm sm:max-w-72"
        />
        <button
          onClick={() => setCreating(true)}
          className="tap flex w-full items-center justify-center gap-2 rounded-lg bg-roxo px-4 py-2.5 text-sm font-bold text-white sm:w-auto"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Cadastrar cliente
        </button>
        <p className="ml-auto hidden text-sm text-steel sm:block">
          {rows.length} {rows.length === 1 ? "cliente" : "clientes"}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-ink/5">
          <Users className="mx-auto h-8 w-8 text-ink/20" aria-hidden="true" />
          <p className="mt-3 font-bold text-ink">Nenhum cliente encontrado.</p>
          <p className="mt-1 text-sm text-steel">
            Clientes são criados automaticamente quando você preenche o
            WhatsApp numa consulta ou pedido — ou cadastre manualmente.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => {
            const s = stats[c.id];
            return (
              <li key={c.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink">{c.name || "Sem nome"}</p>
                  <button
                    onClick={() => setEditing(c)}
                    aria-label={`Editar ${c.name || "cliente"}`}
                    className="rounded-lg p-1.5 text-steel hover:bg-cloud hover:text-roxo"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-sm text-steel">
                  {[c.whatsapp, [c.city, c.state].filter(Boolean).join(" - ")]
                    .filter(Boolean)
                    .join(" · ") || "Sem contato"}
                </p>
                <p className="mt-2 text-xs text-steel">
                  {s
                    ? `${s.count} ${s.count === 1 ? "pedido" : "pedidos"}${s.spent > 0 ? ` · ${brl(s.spent)} em compras pagas` : ""}`
                    : "Sem pedidos ainda"}
                </p>
                {c.notes && (
                  <p className="mt-1 text-xs italic text-steel">“{c.notes}”</p>
                )}
                {c.whatsapp && (
                  <a
                    href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-whats/10 px-3 py-2 text-xs font-bold text-whats"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Abrir WhatsApp
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(editing || creating) && (
        <CustomerModal
          customer={editing ?? undefined}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function CustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer?: CustomerRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(customer?.name ?? "");
  const [whatsapp, setWhatsapp] = useState(customer?.whatsapp ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [city, setCity] = useState(customer?.city ?? "");
  const [state, setState] = useState(customer?.state ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast("Informe o nome do cliente.");
      return;
    }
    setBusy(true);
    const result = await saveCustomer({
      id: customer?.id,
      name: name.trim(),
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast(customer ? "Cliente atualizado ✓" : "Cliente cadastrado ✓");
    onSaved();
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={customer ? "Editar cliente" : "Cadastrar cliente"}
    >
      <div className="my-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h2 className="display text-2xl text-ink">
            {customer ? "Editar cliente" : "Cadastrar cliente"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-2 text-steel hover:bg-cloud"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" aria-label="Nome" className={`${input} sm:col-span-2`} />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp" aria-label="WhatsApp" className={input} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" aria-label="E-mail" className={input} />
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" aria-label="Cidade" className={input} />
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="Estado" aria-label="Estado" className={input} />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Endereço" aria-label="Endereço" className={`${input} sm:col-span-2`} />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações" aria-label="Observações" rows={2} className={`${input} sm:col-span-2`} />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={submit}
            disabled={busy}
            className="tap flex-1 rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "Salvando..." : "Salvar cliente"}
          </button>
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-4 py-3 text-sm font-bold text-ink"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
