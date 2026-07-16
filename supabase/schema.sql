-- Xavier's Sports — schema do catálogo com estoque por tamanho.
-- Rodar uma única vez no SQL Editor do projeto Supabase.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  team text not null,
  team_slug text not null,
  team_type text not null check (team_type in ('clube','selecao')),
  country text not null,
  league text,
  season text,
  collection text not null check (collection in ('atual','retro')),
  version text not null check (version in ('torcedor','jogador','treino','pre-jogo','goleiro','retro')),
  audience text not null check (audience in ('masculino','feminino','infantil','unissex')),
  sleeve text not null check (sleeve in ('curta','longa')),
  description text not null default '',
  price numeric(10,2) not null check (price > 0),
  old_price numeric(10,2),
  installments int,
  images text[] not null default '{}',
  video text,
  colors text[] not null default '{}',
  personalization_available boolean not null default false,
  personalization_price numeric(10,2),
  sku text not null,
  material text,
  care_instructions text[],
  featured boolean not null default false,
  new_arrival boolean not null default false,
  best_seller boolean not null default false,
  on_sale boolean not null default false,
  available boolean not null default true,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  stock int not null default 0 check (stock >= 0),
  allow_pre_order boolean not null default false,
  estimated_delivery text,
  active boolean not null default true,
  position int not null default 0,
  unique (product_id, label)
);

create index product_variants_product_id_idx on public.product_variants (product_id);

alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Catálogo é público para leitura; escrita só para o admin autenticado.
create policy "catalogo_leitura_publica" on public.products
  for select using (true);
create policy "variantes_leitura_publica" on public.product_variants
  for select using (true);
create policy "produtos_escrita_autenticada" on public.products
  for all to authenticated using (true) with check (true);
create policy "variantes_escrita_autenticada" on public.product_variants
  for all to authenticated using (true) with check (true);

-- Ajuste atômico de estoque: venda = delta negativo, entrada = positivo.
-- O CHECK (stock >= 0) derruba a transação se o saldo ficar negativo.
create or replace function public.adjust_variant_stock(variant_id uuid, delta int)
returns int
language plpgsql
security invoker
as $$
declare
  new_stock int;
begin
  update public.product_variants
     set stock = stock + delta
   where id = variant_id
   returning stock into new_stock;
  if new_stock is null then
    raise exception 'Variante não encontrada';
  end if;
  return new_stock;
end;
$$;
