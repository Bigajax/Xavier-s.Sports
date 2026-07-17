-- Xavier's Sports — Migration 0002: histórico de movimentações de estoque,
-- arquivamento de produtos, limite de estoque baixo e SKU único.
--
-- COMO RODAR: copie este arquivo inteiro e cole no SQL Editor do projeto
-- Supabase (Dashboard → SQL Editor → New query → Run). Rodar UMA única vez.

-- ============================================================
-- 1) Movimentações de estoque (histórico imutável)
-- ============================================================
-- product_id/variant_id podem ficar nulos se o produto/variante for excluído;
-- os campos denormalizados preservam a leitura do histórico para sempre.
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_sku text not null,
  variant_label text not null,
  type text not null check (type in ('entrada','saida','correcao')),
  quantity int not null check (quantity > 0),
  stock_before int not null,
  stock_after int not null,
  reason text not null,
  related_order text,
  notes text,
  created_by uuid,
  created_by_email text,
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx
  on public.stock_movements (product_id, created_at desc);
create index stock_movements_created_idx
  on public.stock_movements (created_at desc);

alter table public.stock_movements enable row level security;

-- Leitura e inserção apenas para o admin autenticado.
-- Sem policy de update/delete: o histórico é imutável por padrão.
create policy "movimentos_leitura_autenticada" on public.stock_movements
  for select to authenticated using (true);
create policy "movimentos_insercao_autenticada" on public.stock_movements
  for insert to authenticated with check (true);

-- ============================================================
-- 2) Ajuste de estoque COM registro do movimento (atômico)
-- ============================================================
-- Substitui o uso de adjust_variant_stock no painel (a função antiga
-- permanece no banco por compatibilidade). Delta negativo = saída,
-- positivo = entrada. O CHECK (stock >= 0) aborta a transação inteira
-- (update + insert) se a saída for maior que o saldo.
create or replace function public.register_stock_movement(
  p_variant_id uuid,
  p_delta int,
  p_reason text,
  p_related_order text default null,
  p_notes text default null
) returns int
language plpgsql
security invoker
as $$
declare
  v_new int;
  v_before int;
  v_label text;
  v_product_id uuid;
  v_name text;
  v_sku text;
begin
  if p_delta = 0 then
    raise exception 'Quantidade inválida';
  end if;

  update public.product_variants
     set stock = stock + p_delta
   where id = p_variant_id
   returning stock, stock - p_delta, label, product_id
        into v_new, v_before, v_label, v_product_id;

  if not found then
    raise exception 'Variante não encontrada';
  end if;

  select name, sku into v_name, v_sku
    from public.products where id = v_product_id;

  insert into public.stock_movements
    (product_id, variant_id, product_name, product_sku, variant_label,
     type, quantity, stock_before, stock_after, reason, related_order,
     notes, created_by, created_by_email)
  values
    (v_product_id, p_variant_id, coalesce(v_name, ''), coalesce(v_sku, ''),
     v_label, case when p_delta > 0 then 'entrada' else 'saida' end,
     abs(p_delta), v_before, v_new, p_reason, p_related_order, p_notes,
     auth.uid(), auth.jwt() ->> 'email');

  return v_new;
end;
$$;

-- ============================================================
-- 3) Novas colunas em products
-- ============================================================
-- archived_at: arquivar em vez de excluir (histórico preservado).
-- low_stock_threshold: limite de "estoque baixo" por produto (opcional;
-- sem valor, o painel usa o limite global).
alter table public.products
  add column archived_at timestamptz,
  add column low_stock_threshold int check (low_stock_threshold >= 0);

-- ============================================================
-- 4) SKU único
-- ============================================================
-- Deduplica SKUs existentes antes de criar a constraint (o gerador antigo
-- podia repetir códigos). Duplicados ganham sufixo -2, -3...
with dups as (
  select id, row_number() over (partition by sku order by created_at) as rn
  from public.products
)
update public.products p
   set sku = p.sku || '-' || d.rn
  from dups d
 where d.id = p.id and d.rn > 1;

alter table public.products
  add constraint products_sku_unique unique (sku);
