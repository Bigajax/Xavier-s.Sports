-- Xavier's Sports — Migration 0004: trocas/devoluções e avaliações.
-- COMO RODAR: colar no SQL Editor do Supabase e executar UMA vez.

-- ============================================================
-- 1) Trocas e devoluções
-- ============================================================
create sequence public.return_number_seq;

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  order_number text,
  customer_name text not null default '',
  whatsapp text,
  product_name text not null default '',
  size_bought text,
  size_wanted text,
  qty int not null default 1 check (qty > 0),
  reason text not null default '',
  status text not null default 'Solicitação recebida' check (status in (
    'Solicitação recebida','Em análise','Aprovada',
    'Aguardando envio do cliente','Produto em transporte','Produto recebido',
    'Novo produto separado','Novo produto enviado','Reembolso realizado',
    'Recusada','Concluída'
  )),
  internal_notes text,
  refusal_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index returns_created_idx on public.returns (created_at desc);

alter table public.returns enable row level security;
create policy "trocas_admin" on public.returns
  for all to authenticated using (true) with check (true);
grant usage, select on sequence public.return_number_seq to authenticated;

create or replace function public.next_return_protocol()
returns text language sql security invoker as $$
  select 'TR-' || lpad(nextval('public.return_number_seq')::text, 4, '0');
$$;

-- ============================================================
-- 2) Avaliações de clientes
-- ============================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  city text,
  product_name text,
  order_number text,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  verified boolean not null default false,
  authorized boolean not null default false,
  highlight boolean not null default false,
  status text not null default 'Aguardando aprovação' check (status in (
    'Aguardando aprovação','Publicada','Oculta','Recusada'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reviews_created_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;
-- O site (anon) envia avaliações (entram aguardando aprovação) e lê apenas
-- as publicadas e autorizadas; o admin lê e gerencia tudo.
create policy "avaliacoes_insercao_publica" on public.reviews
  for insert to anon, authenticated with check (true);
create policy "avaliacoes_leitura_publica" on public.reviews
  for select to anon using (status = 'Publicada' and authorized = true);
create policy "avaliacoes_leitura_admin" on public.reviews
  for select to authenticated using (true);
create policy "avaliacoes_gestao_admin" on public.reviews
  for update to authenticated using (true) with check (true);
create policy "avaliacoes_exclusao_admin" on public.reviews
  for delete to authenticated using (true);
