"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  HelpCircle,
  Layers,
  Plus,
  Shirt,
  Sparkles,
  X,
} from "lucide-react";
import { teams } from "@/data/teams";
import type { Product } from "@/lib/products/types";
import {
  createProduct,
  saveProduct,
  type CreateProductInput,
  type SaveProductInput,
} from "@/app/admin/produtos/actions";
import ImagesEditor from "@/components/admin/ImagesEditor";
import MoneyInput from "@/components/admin/MoneyInput";
import VariantsEditor, {
  DEFAULT_DELIVERY,
  type VariantDraft,
} from "@/components/admin/VariantsEditor";
import { toast } from "@/components/Toaster";

const TABS = [
  { key: "produto", label: "Produto" },
  { key: "fotos", label: "Fotos" },
  { key: "estoque", label: "Estoque e encomenda" },
  { key: "exibicao", label: "Exibição" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

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

/** Modelos rápidos de grade de tamanhos. */
const sizeTemplates = [
  { label: "Adulto", sizes: ["P", "M", "G", "GG", "XGG"] },
  { label: "Feminino", sizes: ["PP", "P", "M", "G", "GG"] },
  { label: "Infantil", sizes: ["4", "6", "8", "10", "12", "14"] },
] as const;

const emptyVariant = (label = ""): VariantDraft => ({
  label,
  stock: "0",
  allowPreOrder: false,
  estimatedDelivery: "",
  active: true,
});

/** Guia rápido exibido no modal de ajuda — frases curtas por aba. */
const tabHelp = [
  {
    icon: Shirt,
    title: "Produto",
    bullets: [
      "Time, nome, temporada e versão da camisa",
      "Preço atual — e preço “de” maior, se houver promoção",
      "Código interno e personalização",
    ],
  },
  {
    icon: Camera,
    title: "Fotos",
    bullets: [
      "A 1ª foto vira a capa — comece pela frente",
      "Sem foto, a loja mostra uma arte genérica",
    ],
  },
  {
    icon: Layers,
    title: "Estoque e encomenda",
    bullets: [],
  },
  {
    icon: Sparkles,
    title: "Exibição",
    bullets: [
      "Visível, destaque, lançamentos, mais procuradas",
      "Oferta só liga com preço “de” maior — sem desconto de mentira",
    ],
  },
];

/** Legenda visual da regra de estoque — mesma etiqueta da tabela. */
function StockRuleLegend() {
  const rows = [
    {
      chip: "P: 10",
      chipCls: "bg-whats/15 text-green-800",
      label: "Pronta entrega",
      labelCls: "bg-whats/15 text-green-800",
    },
    {
      chip: "M: 0 ⏱",
      chipCls: "bg-amarelo/25 text-ink",
      label: "Sob encomenda (informe o prazo)",
      labelCls: "bg-amarelo/30 text-ink",
    },
    {
      chip: "G: 0",
      chipCls: "bg-promo/15 text-promo",
      label: "Indisponível",
      labelCls: "bg-promo/15 text-promo",
    },
  ];
  return (
    <div className="mt-2 space-y-1.5">
      {rows.map((r) => (
        <div key={r.chip} className="flex items-center gap-2 text-xs">
          <span
            className={`w-16 shrink-0 rounded px-1.5 py-0.5 text-center font-bold tabular-nums ${r.chipCls}`}
          >
            {r.chip}
          </span>
          <span aria-hidden="true" className="text-steel/50">→</span>
          <span className={`rounded-full px-2 py-0.5 font-bold ${r.labelCls}`}>
            {r.label}
          </span>
        </div>
      ))}
      <p className="pt-1 text-xs text-steel">
        O status na loja se calcula sozinho a partir das quantidades.
      </p>
    </div>
  );
}

/**
 * Cadastro e edição de produto num único formulário em 4 abas.
 * As abas ficam sempre montadas (alternadas com `hidden`) para preservar o
 * estado dos campos; erros mostram badge na aba correspondente.
 */
export default function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(product);
  const [tab, setTab] = useState<TabKey>("produto");

  // --- Aba Produto ---
  const [teamSlug, setTeamSlug] = useState(product?.teamSlug ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [season, setSeason] = useState(product?.season ?? "");
  const [collection, setCollection] = useState<"atual" | "retro">(
    product?.collection ?? "atual"
  );
  const [version, setVersion] = useState<Product["version"]>(
    product?.version ?? "torcedor"
  );
  const [audience, setAudience] = useState<Product["audience"]>(
    product?.audience ?? "masculino"
  );
  const [sleeve, setSleeve] = useState<"curta" | "longa">(
    product?.sleeve ?? "curta"
  );
  const [price, setPrice] = useState<number | null>(product?.price ?? null);
  const [oldPrice, setOldPrice] = useState<number | null>(
    product?.oldPrice ?? null
  );
  const [installments, setInstallments] = useState(
    product?.installments ? String(product.installments) : "3"
  );
  const [colors, setColors] = useState(product?.colors.join(", ") ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [personalization, setPersonalization] = useState(
    product?.personalizationAvailable ?? false
  );
  const [personalizationPrice, setPersonalizationPrice] = useState<number | null>(
    product?.personalizationPrice ?? 30
  );

  // --- Aba Fotos ---
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  // --- Aba Estoque ---
  const [variants, setVariants] = useState<VariantDraft[]>(
    product
      ? product.variants.map((v) => ({
          id: v.id,
          label: v.label,
          stock: String(v.stock),
          allowPreOrder: v.allowPreOrder,
          estimatedDelivery: v.estimatedDelivery ?? "",
          active: v.active,
        }))
      : ["P", "M", "G", "GG"].map((l) => emptyVariant(l))
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // --- Aba Exibição ---
  const [available, setAvailable] = useState(product?.available ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [newArrival, setNewArrival] = useState(product?.newArrival ?? !isEdit);
  const [bestSeller, setBestSeller] = useState(product?.bestSeller ?? false);
  const [onSale, setOnSale] = useState(product?.onSale ?? false);

  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<TabKey, string[]>>>({});

  const touch = () => setDirty(true);

  const selectedTeam = teams.find((t) => t.slug === teamSlug);
  /** Em edição, o time salvo pode não existir mais na lista — mantém uma opção sintética. */
  const syntheticTeam =
    isEdit && product && !selectedTeam && teamSlug === product.teamSlug
      ? { slug: product.teamSlug, name: product.team }
      : null;

  const errorCount = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, errors[t.key]?.length ?? 0])),
    [errors]
  ) as Record<TabKey, number>;

  const setVariant = (index: number, patch: Partial<VariantDraft>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
    touch();
  };

  const removeVariant = (index: number) => {
    const v = variants[index];
    if (v.id && !window.confirm(`Remover o tamanho ${v.label || "(sem nome)"} deste produto?`)) {
      return;
    }
    if (v.id) setDeletedIds((prev) => [...prev, v.id!]);
    setVariants((prev) => prev.filter((_, i) => i !== index));
    touch();
  };

  const applyTemplate = (sizes: readonly string[]) => {
    setVariants((prev) => {
      const existing = new Set(prev.map((v) => v.label.trim().toUpperCase()));
      const missing = sizes.filter((s) => !existing.has(s.toUpperCase()));
      return [...prev, ...missing.map((s) => emptyVariant(s))];
    });
    touch();
  };

  const close = () => {
    if (dirty && !window.confirm("Sair sem salvar as alterações?")) return;
    onClose();
  };

  /** Valida tudo e devolve os erros agrupados por aba. */
  const validate = (): Partial<Record<TabKey, string[]>> => {
    const result: Partial<Record<TabKey, string[]>> = {};
    const produto: string[] = [];
    const estoque: string[] = [];
    const exibicao: string[] = [];

    if (!selectedTeam && !syntheticTeam) produto.push("Selecione o time ou seleção.");
    if (name.trim().length < 3) produto.push("Dê um nome ao produto (ex.: Camisa Chelsea Home).");
    if (price === null || price <= 0) produto.push("Informe um preço válido.");
    if (oldPrice !== null && oldPrice <= 0) {
      produto.push('Preço "de" inválido — deixe em branco se não houver.');
    }
    if (isEdit && sku.trim().length < 3) produto.push("Informe o código interno (mín. 3 caracteres).");

    const labels = variants.map((v) => v.label.trim().toUpperCase());
    if (variants.length === 0) estoque.push("Adicione ao menos um tamanho.");
    if (labels.some((l) => !l)) estoque.push("Todo tamanho precisa de um nome (ex.: P, M, G).");
    if (new Set(labels.filter(Boolean)).size !== labels.filter(Boolean).length) {
      estoque.push("Há tamanhos repetidos — cada tamanho deve ser único.");
    }
    for (const v of variants) {
      const stock = Math.floor(Number(v.stock) || 0);
      if (stock < 0) estoque.push(`O tamanho ${v.label || "?"} não pode ter estoque negativo.`);
      if (v.allowPreOrder && stock === 0 && !v.estimatedDelivery.trim()) {
        estoque.push(
          `Informe o prazo estimado do tamanho ${v.label || "?"} (encomenda com estoque zerado).`
        );
      }
    }

    if (onSale && (price === null || oldPrice === null || oldPrice <= price)) {
      exibicao.push('Para marcar como oferta, o preço "de" precisa ser maior que o preço atual.');
    }

    if (produto.length) result.produto = produto;
    if (estoque.length) result.estoque = estoque;
    if (exibicao.length) result.exibicao = exibicao;
    return result;
  };

  const submit = async () => {
    const found = validate();
    setErrors(found);
    const firstTabWithError = TABS.find((t) => found[t.key]?.length);
    if (firstTabWithError) {
      setTab(firstTabWithError.key);
      toast("Revise os campos destacados antes de salvar.");
      return;
    }

    const team = selectedTeam ?? null;
    const variantPayload = variants.map((v) => ({
      id: v.id,
      label: v.label.trim(),
      stock: Math.max(0, Math.floor(Number(v.stock) || 0)),
      allowPreOrder: v.allowPreOrder,
      estimatedDelivery: v.estimatedDelivery.trim() || undefined,
      active: v.active,
    }));
    const colorsPayload = colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const installmentsPayload = installments.trim()
      ? parseInt(installments, 10) || null
      : null;
    const persPrice = personalization ? personalizationPrice : null;

    setBusy(true);
    if (isEdit && product) {
      const payload: SaveProductInput = {
        id: product.id,
        name: name.trim(),
        team: team?.name ?? product.team,
        teamSlug: team?.slug ?? product.teamSlug,
        teamType: team?.type ?? product.teamType,
        country: team?.country ?? product.country,
        league: (team ? team.league : product.league) || undefined,
        season: season.trim() || undefined,
        collection,
        version,
        audience,
        sleeve,
        description,
        price: price!,
        oldPrice,
        installments: installmentsPayload,
        colors: colorsPayload,
        personalizationAvailable: personalization,
        personalizationPrice: persPrice,
        sku: sku.trim(),
        images,
        available,
        featured,
        newArrival,
        bestSeller,
        onSale,
        variants: variantPayload,
        deletedVariantIds: deletedIds,
      };
      const result = await saveProduct(payload);
      setBusy(false);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      toast("Alterações salvas — a vitrine já foi atualizada ✓");
    } else {
      const payload: CreateProductInput = {
        name: name.trim(),
        team: team!.name,
        teamSlug: team!.slug,
        teamType: team!.type,
        country: team!.country,
        league: team!.league,
        season: season.trim() || undefined,
        collection,
        version,
        audience,
        sleeve,
        description,
        price: price!,
        oldPrice,
        installments: installmentsPayload,
        images,
        colors: colorsPayload,
        personalizationAvailable: personalization,
        personalizationPrice: persPrice,
        available,
        featured,
        newArrival,
        bestSeller,
        onSale,
        variants: variantPayload.map(({ id: _id, ...rest }) => rest),
      };
      const result = await createProduct(payload);
      setBusy(false);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      toast("Produto cadastrado ✓");
    }
    setDirty(false);
    onSaved();
    onClose();
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm";
  const labelCls = "mb-1 block text-xs font-bold text-ink";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch justify-center overflow-y-auto bg-ink/60 sm:items-start sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? `Editar ${product?.name}` : "Cadastrar produto"}
    >
      {/* Tela cheia no celular; modal centralizado no desktop. */}
      <div className="flex h-full w-full flex-col bg-white shadow-xl sm:my-4 sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-2xl sm:rounded-2xl">
        {/* Cabeçalho + abas */}
        <div className="border-b border-ink/10 p-4 pb-0 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="display text-2xl text-ink">
                {isEdit ? "Editar produto" : "Cadastrar produto"}
              </h2>
              <p className="mt-0.5 text-sm text-steel">
                {isEdit
                  ? `${product?.team} · ${product?.sku}`
                  : "Preencha as abas, salve e o produto entra na vitrine."}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setHelpOpen(true)}
                aria-label="Como funciona cada aba"
                title="Como funciona cada aba"
                className="flex items-center gap-1.5 rounded-lg p-2 text-sm font-semibold text-steel hover:bg-cloud hover:text-roxo"
              >
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Como funciona</span>
              </button>
              <button
                onClick={close}
                aria-label="Fechar"
                className="rounded-lg p-2 text-steel hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`relative whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-sm font-bold transition-colors ${
                  tab === t.key
                    ? "border-b-2 border-roxo text-roxo"
                    : "text-steel hover:text-ink"
                }`}
              >
                {t.label}
                {errorCount[t.key] > 0 && (
                  <span className="absolute -right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-promo px-1 text-[10px] font-bold text-white">
                    {errorCount[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ===== Aba Produto ===== */}
          <div hidden={tab !== "produto"} className="space-y-4">
            {errors.produto && (
              <ul className="rounded-lg bg-promo/10 p-3 text-xs font-semibold text-promo">
                {errors.produto.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pf-time" className={labelCls}>Time ou seleção</label>
                <select
                  id="pf-time"
                  value={teamSlug}
                  onChange={(e) => { setTeamSlug(e.target.value); touch(); }}
                  className={`${input} bg-white`}
                >
                  <option value="">Selecione...</option>
                  {syntheticTeam && (
                    <option value={syntheticTeam.slug}>{syntheticTeam.name}</option>
                  )}
                  {teams.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} {t.type === "selecao" ? "(seleção)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pf-temporada" className={labelCls}>Temporada (opcional)</label>
                <input
                  id="pf-temporada"
                  value={season}
                  onChange={(e) => { setSeason(e.target.value); touch(); }}
                  placeholder="Ex.: 2026"
                  className={input}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pf-nome" className={labelCls}>Nome do produto</label>
              <input
                id="pf-nome"
                value={name}
                onChange={(e) => { setName(e.target.value); touch(); }}
                placeholder="Ex.: Camisa Chelsea Home"
                className={input}
              />
            </div>
            <div>
              <label htmlFor="pf-desc" className={labelCls}>Descrição</label>
              <textarea
                id="pf-desc"
                rows={3}
                value={description}
                onChange={(e) => { setDescription(e.target.value); touch(); }}
                placeholder="Detalhes do modelo, tecido, acabamento..."
                className={input}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="pf-colecao" className={labelCls}>Coleção</label>
                <select
                  id="pf-colecao"
                  value={collection}
                  onChange={(e) => { setCollection(e.target.value as "atual" | "retro"); touch(); }}
                  className={`${input} bg-white`}
                >
                  <option value="atual">Atual</option>
                  <option value="retro">Retrô</option>
                </select>
              </div>
              <div>
                <label htmlFor="pf-versao" className={labelCls}>Versão</label>
                <select
                  id="pf-versao"
                  value={version}
                  onChange={(e) => { setVersion(e.target.value as Product["version"]); touch(); }}
                  className={`${input} bg-white`}
                >
                  {versionOptions.map(([value, text]) => (
                    <option key={value} value={value}>{text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pf-publico" className={labelCls}>Público</label>
                <select
                  id="pf-publico"
                  value={audience}
                  onChange={(e) => { setAudience(e.target.value as Product["audience"]); touch(); }}
                  className={`${input} bg-white`}
                >
                  {audienceOptions.map(([value, text]) => (
                    <option key={value} value={value}>{text}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pf-manga" className={labelCls}>Manga</label>
                <select
                  id="pf-manga"
                  value={sleeve}
                  onChange={(e) => { setSleeve(e.target.value as "curta" | "longa"); touch(); }}
                  className={`${input} bg-white`}
                >
                  <option value="curta">Curta</option>
                  <option value="longa">Longa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label htmlFor="pf-preco" className={labelCls}>Preço atual</label>
                <MoneyInput
                  id="pf-preco"
                  value={price}
                  onChange={(v) => { setPrice(v); touch(); }}
                  placeholder="249,90"
                />
              </div>
              <div>
                <label htmlFor="pf-preco-de" className={labelCls}>Preço &quot;de&quot; (opcional)</label>
                <MoneyInput
                  id="pf-preco-de"
                  value={oldPrice}
                  onChange={(v) => { setOldPrice(v); touch(); }}
                  placeholder="—"
                />
              </div>
              <div>
                <label htmlFor="pf-parcelas" className={labelCls}>Parcelas (máx.)</label>
                <input
                  id="pf-parcelas"
                  inputMode="numeric"
                  value={installments}
                  onChange={(e) => { setInstallments(e.target.value); touch(); }}
                  className={input}
                />
              </div>
              <div>
                <label htmlFor="pf-cores" className={labelCls}>Cores</label>
                <input
                  id="pf-cores"
                  value={colors}
                  onChange={(e) => { setColors(e.target.value); touch(); }}
                  placeholder="Azul, Branco"
                  className={input}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="pf-sku" className={labelCls}>Código interno</label>
                {isEdit ? (
                  <input
                    id="pf-sku"
                    value={sku}
                    onChange={(e) => { setSku(e.target.value.toUpperCase()); touch(); }}
                    className={`${input} uppercase`}
                  />
                ) : (
                  <p className="rounded-lg bg-cloud/60 px-3 py-2.5 text-sm text-steel">
                    Gerado automaticamente ao salvar (ex.: XS-COR-001).
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-3 rounded-lg bg-cloud/60 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={personalization}
                    onChange={(e) => { setPersonalization(e.target.checked); touch(); }}
                    className="h-4 w-4 accent-roxo"
                  />
                  Aceita personalização
                </label>
                {personalization && (
                  <div className="w-32">
                    <label htmlFor="pf-pers-preco" className="mb-0.5 block text-[10px] font-bold uppercase text-steel">
                      Valor de referência
                    </label>
                    <MoneyInput
                      id="pf-pers-preco"
                      value={personalizationPrice}
                      onChange={(v) => { setPersonalizationPrice(v); touch(); }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== Aba Fotos ===== */}
          <div hidden={tab !== "fotos"}>
            <ImagesEditor
              images={images}
              onChange={(next) => { setImages(next); touch(); }}
            />
            {images.length === 0 && (
              <p className="mt-3 rounded-lg bg-amarelo/15 p-3 text-xs font-semibold text-ink">
                Produto sem foto aparece com uma arte genérica na vitrine —
                envie ao menos a foto de frente.
              </p>
            )}
          </div>

          {/* ===== Aba Estoque e encomenda ===== */}
          <div hidden={tab !== "estoque"} className="space-y-3">
            {errors.estoque && (
              <ul className="rounded-lg bg-promo/10 p-3 text-xs font-semibold text-promo">
                {errors.estoque.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-ink">Modelos rápidos:</span>
              {sizeTemplates.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t.sizes)}
                  className="rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold text-ink hover:border-roxo hover:text-roxo"
                >
                  {t.label} ({t.sizes[0]}–{t.sizes[t.sizes.length - 1]})
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setVariants((prev) => [...prev, emptyVariant()]); touch(); }}
                className="flex items-center gap-1.5 rounded-full border border-roxo px-3 py-1 text-xs font-bold text-roxo hover:bg-roxo hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Tamanho manual
              </button>
            </div>
            <p className="text-xs text-steel">
              Estoque maior que zero = pronta entrega. Estoque zero com
              &quot;aceita encomenda&quot; = sob encomenda (o prazo é
              obrigatório, ex.: {DEFAULT_DELIVERY}). Estoque zero sem encomenda
              = indisponível.
            </p>
            <VariantsEditor
              variants={variants}
              onPatch={setVariant}
              onRemove={removeVariant}
            />
          </div>

          {/* ===== Aba Exibição ===== */}
          <div hidden={tab !== "exibicao"} className="space-y-4">
            {errors.exibicao && (
              <ul className="rounded-lg bg-promo/10 p-3 text-xs font-semibold text-promo">
                {errors.exibicao.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            <div className="space-y-2.5">
              {(
                [
                  ["Visível na loja", available, setAvailable, "O produto aparece na vitrine e nas buscas."],
                  ["Destaque", featured, setFeatured, "Recebe posição de destaque nas seções."],
                  ["Novo (Lançamentos)", newArrival, setNewArrival, "Entra na seção de lançamentos da home."],
                  ["Mais procurada", bestSeller, setBestSeller, "Entra na seção de favoritas da torcida."],
                  ["Em oferta", onSale, setOnSale, 'Exige preço "de" maior que o preço atual.'],
                ] as const
              ).map(([text, value, setter, hint]) => (
                <label
                  key={text}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink/10 p-3 hover:bg-cloud/40"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => { setter(e.target.checked); touch(); }}
                    className="mt-0.5 h-4 w-4 accent-roxo"
                  />
                  <span>
                    <span className="block text-sm font-bold text-ink">{text}</span>
                    <span className="block text-xs text-steel">{hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-steel">
              Coleção retrô entra automaticamente na seção Retrô; a página do
              time lista o produto sozinha.
            </p>
          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="flex flex-wrap gap-2 border-t border-ink/10 bg-white p-4 sm:px-6">
          <button
            onClick={submit}
            disabled={busy}
            className="tap rounded-lg bg-roxo px-5 py-3 text-sm font-bold text-white hover:bg-roxo-escuro disabled:opacity-60"
          >
            {busy
              ? "Salvando..."
              : isEdit
                ? "Salvar alterações"
                : "Cadastrar produto"}
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

      {/* Modal de ajuda: o que fazer em cada aba */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[85] flex items-center justify-center overflow-y-auto bg-ink/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Como funciona o cadastro de produto"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="my-4 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="display text-2xl text-ink">Como funciona</h3>
                <p className="mt-0.5 text-sm text-steel">
                  O cadastro é dividido em 4 abas — preencha na ordem e salve
                  uma vez só, no botão fixo do rodapé.
                </p>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                aria-label="Fechar ajuda"
                className="rounded-lg p-2 text-steel hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <ol className="mt-4 space-y-3">
              {tabHelp.map((item, i) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-ink/10 bg-cloud/40 p-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-roxo/10 text-roxo">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-ink">
                      {i + 1}. {item.title}
                    </span>
                    {item.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {item.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-1.5 text-sm leading-snug text-steel"
                          >
                            <span aria-hidden="true" className="mt-0.5 text-whats">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                    {item.title === "Estoque e encomenda" && <StockRuleLegend />}
                  </span>
                </li>
              ))}
            </ol>

            <p className="mt-4 rounded-lg bg-amarelo/15 p-3 text-xs leading-relaxed text-ink">
              Se faltar alguma informação ao salvar, a aba com pendência ganha
              um aviso vermelho com o número de itens para revisar — o
              formulário te leva direto até ela.
            </p>

            <button
              onClick={() => setHelpOpen(false)}
              className="tap mt-4 w-full rounded-lg bg-roxo px-4 py-3 text-sm font-bold text-white hover:bg-roxo-escuro"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
