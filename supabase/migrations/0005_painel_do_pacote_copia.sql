-- ═══ 0005: as peças da Xavier's no painel do pacote (14/10/2026) ═══
--
-- Roda DEPOIS do esquema do molde (a parte de cima de rodar-painel-pacote.sql).
-- Copia as 266 camisas de products/product_variants para produtos/produto_imagens,
-- com o MESMO id (pedidos, avaliações e trocas que apontam para a camisa seguem
-- valendo). As tabelas antigas ficam intactas: nada é apagado aqui.
-- Reexecutável: a peça que já foi copiada não é copiada de novo.
--
-- A regra do estoque (decidida com o Rafael): tamanho com estoque é pronta
-- entrega, sem estoque é encomenda, com o prazo único da loja. Hoje os 1.586
-- tamanhos aceitam encomenda, então nenhum entra riscado.

-- a coluna da camisa de futebol (opcoes.camisa do pacote v1.6.0)
alter table produtos add column if not exists camisa jsonb;

-- as quatro categorias que o site usa
insert into categorias (nome, slug, ordem) values
  ('Clubes brasileiros', 'clubes-brasileiros', 1),
  ('Clubes internacionais', 'clubes-internacionais', 2),
  ('Seleções', 'selecoes', 3),
  ('Retrô', 'retro', 4)
on conflict (slug) do nothing;

-- as peças
insert into produtos (
  id, codigo, nome, slug, descricao, marca, preco, preco_promocional,
  categoria_id, tamanhos, cores, destaque, ativo, ordem, created_at,
  estoque, tamanhos_esgotados, camisa
)
select
  p.id,
  p.sku,
  p.name,
  p.slug,
  p.description,
  p.team,
  coalesce(p.old_price, p.price),
  case when p.old_price is not null and p.old_price > p.price then p.price end,
  (select c.id from categorias c where c.slug = case
     when p.collection = 'retro' then 'retro'
     when p.team_type = 'selecao' then 'selecoes'
     when p.country = 'Brasil' then 'clubes-brasileiros'
     else 'clubes-internacionais' end),
  coalesce((select array_agg(v.label order by v.position) from product_variants v where v.product_id = p.id and v.active), '{}'),
  coalesce(p.colors, '{}'),
  p.featured or p.best_seller,
  p.available and p.archived_at is null,
  row_number() over (order by p.created_at) - 1,
  p.created_at,
  (select jsonb_object_agg(v.label, v.stock) from product_variants v where v.product_id = p.id and v.active),
  coalesce((select array_agg(v.label order by v.position) from product_variants v
             where v.product_id = p.id and v.active and v.stock <= 0 and not v.allow_pre_order), '{}'),
  jsonb_strip_nulls(jsonb_build_object(
    'time', p.team_slug,
    'temporada', coalesce(p.season, ''),
    'versao', case when p.version in ('torcedor', 'jogador', 'retro') then p.version else 'treino' end,
    'publico', p.audience,
    'manga', p.sleeve,
    'personalizavel', p.personalization_available,
    'parcelas', p.installments,
    'material', p.material,
    'cuidados', to_jsonb(p.care_instructions),
    'novo', p.new_arrival,
    'tags', to_jsonb(p.tags),
    'video', p.video,
    'estoque_baixo', p.low_stock_threshold
  ))
from products p
where not exists (select 1 from produtos x where x.id = p.id or x.slug = p.slug or x.codigo = p.sku);

-- as fotos, na ordem de products.images
insert into produto_imagens (produto_id, url, alt, ordem)
select p.id, img.url, p.name, img.ordem - 1
from products p
cross join lateral unnest(p.images) with ordinality as img(url, ordem)
where exists (select 1 from produtos x where x.id = p.id)
  and not exists (select 1 from produto_imagens i where i.produto_id = p.id);

-- a conferência: as três contagens têm de bater com as de products
select
  (select count(*) from products) as camisas_antes,
  (select count(*) from produtos) as camisas_no_painel,
  (select count(*) from produtos where ativo) as no_site,
  (select count(*) from produto_imagens) as fotos,
  (select count(*) from donos) as donos;
