"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { teams } from "@/data/teams";
import { createProduct, type CreateProductInput } from "@/app/admin/produtos/actions";
import ImagesEditor from "@/components/admin/ImagesEditor";
import { toast } from "@/components/Toaster";

type VariantDraft = {
  label: string;
  stock: string;
  allowPreOrder: boolean;
  estimatedDelivery: string;
  active: boolean;
};

const DEFAULT_DELIVERY = "7 a 12 dias úteis";

const defaultVariants: VariantDraft[] = ["P", "M", "G", "GG"].map((label) => ({
  label,
  stock: "0",
  allowPreOrder: false,
  estimatedDelivery: "",
  active: true,
}));

const versionOptions = [
  ["torcedor", "Torcedor"],
  ["jogador", "Jogador"],
  ["treino", "Treino"],
  ["pre-jogo", "Pré-jogo"],
  ["goleiro", "Goleiro"],
  ["retro", "Retrô"],
] as const;

const audienceOptions = [
  ["masculino", "Masculino"],
  ["feminino", "Feminino"],
  ["infantil", "Infantil"],
  ["unissex", "Unissex"],
] as const;

/**
 * Cadastro de produto novo: dados, fotos, estoque por tamanho e em quais
 * seções da vitrine ele aparece. Time vem da lista de times do site.
 */
export default function NewProductForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [teamSlug, setTeamSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [season, setSeason] = useState("");
  const [collection, setCollection] = useState<"atual" | "retro">("atual");
  const [version, setVersion] = useState<CreateProductInput["version"]>("torcedor");
  const [audience, setAudience] = useState<CreateProductInput["audience"]>("masculino");
  const [sleeve, setSleeve] = useState<"curta" | "longa">("curta");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [installments, setInstallments] = useState("3");
  const [colors, setColors] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [personalization, setPersonalization] = useState(false);
  const [personalizationPrice, setPersonalizationPrice] = useState("30");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(true);
  const [bestSeller, setBestSeller] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [variants, setVariants] = useState<VariantDraft[]>(defaultVariants);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const team = teams.find((t) => t.slug === teamSlug);

  const setVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
    setDirty(true);
  };

  const close = () => {
    if (dirty && !window.confirm("Sair sem salvar o produto?")) return;
    onClose();
  };

  const submit = async () => {
    if (!team) {
      toast("Selecione o time ou seleção do produto.");
      return;
    }
    const priceValue = parseFloat(price.replace(",", "."));
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      toast("Informe um preço válido.");
      return;
    }
    const oldPriceValue = oldPrice.trim() ? parseFloat(oldPrice.replace(",", ".")) : null;
    if (oldPriceValue !== null && (Number.isNaN(oldPriceValue) || oldPriceValue <= 0)) {
      toast("Preço \"de\" inválido — deixe em branco se não houver.");
      return;
    }
    const persPrice = personalization && personalizationPrice.trim()
      ? parseFloat(personalizationPrice.replace(",", "."))
      : null;

    const payload: CreateProductInput = {
      name,
      team: team.name,
      teamSlug: team.slug,
      teamType: team.type,
      country: team.country,
      league: team.league,
      season: season.trim() || undefined,
      collection,
      version,
      audience,
      sleeve,
      description,
      price: priceValue,
      oldPrice: oldPriceValue,
      installments: installments.trim() ? parseInt(installments, 10) || null : null,
      images,
      colors: colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      personalizationAvailable: personalization,
      personalizationPrice: persPrice && !Number.isNaN(persPrice) ? persPrice : null,
      available,
      featured,
      newArrival,
      bestSeller,
      onSale,
      variants: variants.map((v) => ({
        label: v.label.trim(),
        stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
        allowPreOrder: v.allowPreOrder,
        estimatedDelivery: v.estimatedDelivery.trim() || undefined,
        active: v.active,
      })),
    };

    if (payload.name.trim().length < 3) {
      toast("Dê um nome ao produto (ex.: Camisa Chelsea Home).");
      return;
    }
    if (payload.variants.some((v) => !v.label)) {
      toast("Todo tamanho precisa de um nome (ex.: P, M, G).");
      return;
    }

    setBusy(true);
    const result = await createProduct(payload);
    setBusy(false);
    if (!result.ok) {
      toast(result.error);
      return;
    }
    toast("Produto cadastrado — já está na vitrine ✓");
    setDirty(false);
    onSaved();
    onClose();
  };

  const input =
    "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";
  const label = "mb-1 block text-xs font-bold text-ink";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cadastrar produto"
    >
      <div className="my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="display text-2xl text-ink">Cadastrar produto</h2>
            <p className="mt-0.5 text-sm text-steel">
              Preencha, salve e o produto entra na vitrine na hora.
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Fechar"
            className="rounded-lg p-2 text-steel hover:bg-cloud"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Time e nome */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="np-time" className={label}>Time ou seleção</label>
              <select
                id="np-time"
                value={teamSlug}
                onChange={(e) => {
                  setTeamSlug(e.target.value);
                  setDirty(true);
                }}
                className={`${input} bg-white`}
              >
                <option value="">Selecione...</option>
                {teams.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} {t.type === "selecao" ? "(seleção)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="np-temporada" className={label}>Temporada (opcional)</label>
              <input
                id="np-temporada"
                value={season}
                onChange={(e) => { setSeason(e.target.value); setDirty(true); }}
                placeholder="Ex.: 2026"
                className={input}
              />
            </div>
          </div>
          <div>
            <label htmlFor="np-nome" className={label}>Nome do produto</label>
            <input
              id="np-nome"
              value={name}
              onChange={(e) => { setName(e.target.value); setDirty(true); }}
              placeholder="Ex.: Camisa Chelsea Home"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="np-desc" className={label}>Descrição</label>
            <textarea
              id="np-desc"
              rows={2}
              value={description}
              onChange={(e) => { setDescription(e.target.value); setDirty(true); }}
              placeholder="Detalhes do modelo, tecido, acabamento..."
              className={input}
            />
          </div>

          {/* Classificação */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor="np-colecao" className={label}>Coleção</label>
              <select
                id="np-colecao"
                value={collection}
                onChange={(e) => { setCollection(e.target.value as "atual" | "retro"); setDirty(true); }}
                className={`${input} bg-white`}
              >
                <option value="atual">Atual</option>
                <option value="retro">Retrô</option>
              </select>
            </div>
            <div>
              <label htmlFor="np-versao" className={label}>Versão</label>
              <select
                id="np-versao"
                value={version}
                onChange={(e) => { setVersion(e.target.value as CreateProductInput["version"]); setDirty(true); }}
                className={`${input} bg-white`}
              >
                {versionOptions.map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="np-publico" className={label}>Público</label>
              <select
                id="np-publico"
                value={audience}
                onChange={(e) => { setAudience(e.target.value as CreateProductInput["audience"]); setDirty(true); }}
                className={`${input} bg-white`}
              >
                {audienceOptions.map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="np-manga" className={label}>Manga</label>
              <select
                id="np-manga"
                value={sleeve}
                onChange={(e) => { setSleeve(e.target.value as "curta" | "longa"); setDirty(true); }}
                className={`${input} bg-white`}
              >
                <option value="curta">Curta</option>
                <option value="longa">Longa</option>
              </select>
            </div>
          </div>

          {/* Preços e cores */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label htmlFor="np-preco" className={label}>Preço (R$)</label>
              <input
                id="np-preco"
                inputMode="decimal"
                value={price}
                onChange={(e) => { setPrice(e.target.value); setDirty(true); }}
                placeholder="249,90"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="np-preco-de" className={label}>Preço &quot;de&quot; (opcional)</label>
              <input
                id="np-preco-de"
                inputMode="decimal"
                value={oldPrice}
                onChange={(e) => { setOldPrice(e.target.value); setDirty(true); }}
                placeholder="—"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="np-parcelas" className={label}>Parcelas (máx.)</label>
              <input
                id="np-parcelas"
                inputMode="numeric"
                value={installments}
                onChange={(e) => { setInstallments(e.target.value); setDirty(true); }}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="np-cores" className={label}>Cores</label>
              <input
                id="np-cores"
                value={colors}
                onChange={(e) => { setColors(e.target.value); setDirty(true); }}
                placeholder="Azul, Branco"
                className={input}
              />
            </div>
          </div>

          {/* Fotos */}
          <ImagesEditor
            images={images}
            onChange={(next) => { setImages(next); setDirty(true); }}
          />

          {/* Personalização */}
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-cloud/60 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={personalization}
                onChange={(e) => { setPersonalization(e.target.checked); setDirty(true); }}
                className="h-4 w-4 accent-roxo"
              />
              Aceita personalização (nome e número)
            </label>
            {personalization && (
              <div className="flex items-center gap-2 text-sm">
                <label htmlFor="np-pers-preco" className="text-xs font-bold text-ink">
                  Valor de referência (R$)
                </label>
                <input
                  id="np-pers-preco"
                  inputMode="decimal"
                  value={personalizationPrice}
                  onChange={(e) => { setPersonalizationPrice(e.target.value); setDirty(true); }}
                  className="w-20 rounded-lg border border-ink/15 px-2 py-1.5 text-sm"
                />
              </div>
            )}
          </div>

          {/* Onde aparece na vitrine */}
          <div>
            <p className={label}>Onde aparece na vitrine</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {(
                [
                  ["Visível na loja", available, setAvailable],
                  ["Lançamentos", newArrival, setNewArrival],
                  ["Mais procuradas", bestSeller, setBestSeller],
                  ["Ofertas", onSale, setOnSale],
                  ["Destaque", featured, setFeatured],
                ] as const
              ).map(([text, value, setter]) => (
                <label key={text} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => { setter(e.target.checked); setDirty(true); }}
                    className="h-4 w-4 accent-roxo"
                  />
                  {text}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-steel">
              Coleção retrô entra automaticamente na seção Retrô; a página do
              time lista o produto sozinha.
            </p>
          </div>

          {/* Estoque por tamanho */}
          <div>
            <div className="flex items-center justify-between">
              <p className={label}>Estoque por tamanho</p>
              <button
                type="button"
                onClick={() => {
                  setVariants((prev) => [
                    ...prev,
                    { label: "", stock: "0", allowPreOrder: false, estimatedDelivery: "", active: true },
                  ]);
                  setDirty(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-roxo px-3 py-1.5 text-xs font-bold text-roxo hover:bg-roxo hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Adicionar tamanho
              </button>
            </div>
            <div className="mt-2 overflow-x-auto rounded-xl ring-1 ring-ink/10">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-cloud text-xs uppercase tracking-wide text-steel">
                  <tr>
                    <th className="px-3 py-2">Tamanho</th>
                    <th className="px-3 py-2">Quantidade</th>
                    <th className="px-3 py-2">Aceita encomenda</th>
                    <th className="px-3 py-2">Prazo estimado</th>
                    <th className="px-3 py-2"><span className="sr-only">Remover</span></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={i} className="border-t border-ink/5">
                      <td className="px-3 py-2">
                        <input
                          value={v.label}
                          onChange={(e) => setVariant(i, { label: e.target.value })}
                          placeholder="P, M, G..."
                          aria-label={`Nome do tamanho ${i + 1}`}
                          className="w-20 rounded border border-ink/15 px-2 py-1.5 text-sm uppercase"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => setVariant(i, { stock: e.target.value })}
                          aria-label={`Estoque do tamanho ${v.label || i + 1}`}
                          className="w-20 rounded border border-ink/15 px-2 py-1.5 text-sm tabular-nums"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={v.allowPreOrder}
                          onChange={(e) =>
                            setVariant(i, {
                              allowPreOrder: e.target.checked,
                              estimatedDelivery:
                                e.target.checked && !v.estimatedDelivery
                                  ? DEFAULT_DELIVERY
                                  : v.estimatedDelivery,
                            })
                          }
                          aria-label={`Aceita encomenda no tamanho ${v.label || i + 1}`}
                          className="h-4 w-4 accent-roxo"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={v.estimatedDelivery}
                          onChange={(e) => setVariant(i, { estimatedDelivery: e.target.value })}
                          placeholder={v.allowPreOrder ? DEFAULT_DELIVERY : "—"}
                          disabled={!v.allowPreOrder}
                          aria-label={`Prazo de encomenda do tamanho ${v.label || i + 1}`}
                          className="w-36 rounded border border-ink/15 px-2 py-1.5 text-sm disabled:bg-cloud/60 disabled:text-steel"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVariants((prev) => prev.filter((_, j) => j !== i));
                            setDirty(true);
                          }}
                          aria-label={`Remover tamanho ${v.label || i + 1}`}
                          className="rounded p-1.5 text-steel hover:bg-cloud hover:text-promo"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={submit}
            disabled={busy}
            className="tap rounded-lg bg-roxo px-5 py-3 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-60"
          >
            {busy ? "Cadastrando..." : "Cadastrar produto"}
          </button>
          <button
            onClick={close}
            disabled={busy}
            className="rounded-lg border border-ink/15 px-5 py-3 text-sm font-bold text-ink hover:bg-cloud"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
