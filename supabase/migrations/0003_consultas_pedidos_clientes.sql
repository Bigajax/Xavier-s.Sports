-- Xavier's Sports — Migration 0003: consultas do WhatsApp, clientes,
-- pedidos e itens de pedido.
--
-- COMO RODAR: copie este arquivo inteiro e cole no SQL Editor do projeto
-- Supabase (Dashboard → SQL Editor → New query → Run). Rodar UMA única vez.

-- ============================================================
-- 1) Consultas do WhatsApp (mini-CRM)
-- ============================================================
-- Registradas automaticamente quando alguém toca num botão de WhatsApp no
-- site (não comprova envio da mensagem — por isso "Consulta iniciada").
create table public.whatsapp_leads (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  whatsapp text,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  product_sku text,
  version text,
  size text,
  personalization text,
  shown_price numeric(10,2),
  origin text not null default 'site',
  page text,
  status text not null default 'Nova consulta' check (status in (
    'Nova consulta','Aguardando resposta da loja','Em atendimento',
    'Aguardando resposta do cliente','Interessado','Não respondeu',
    'Convertido em pedido','Perdido','Cancelado'
  )),
  notes text,
  order_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index whatsapp_leads_created_idx on public.whatsapp_leads (created_at desc);
create index whatsapp_leads_status_idx on public.whatsapp_leads (status);

alter table public.whatsapp_leads enable row level security;
-- O site (anon) só INSERE; ler e atualizar é só do admin autenticado.
create policy "leads_insercao_publica" on public.whatsapp_leads
  for insert to anon, authenticated with check (true);
create policy "leads_leitura_autenticada" on public.whatsapp_leads
  for select to authenticated using (true);
create policy "leads_update_autenticado" on public.whatsapp_leads
  for update to authenticated using (true) with check (true);

-- ============================================================
-- 2) Clientes
-- ============================================================
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  whatsapp text,
  whatsapp_normalized text,
  email text,
  city text,
  state text,
  address text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Telefone normalizado único (vários nulos são permitidos).
create unique index customers_whatsapp_normalized_key
  on public.customers (whatsapp_normalized)
  where whatsapp_normalized is not null;

alter table public.customers enable row level security;
create policy "clientes_admin" on public.customers
  for all to authenticated using (true) with check (true);

-- ============================================================
-- 3) Pedidos e itens
-- ============================================================
create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null default '',
  whatsapp text,
  status text not null default 'Aguardando confirmação' check (status in (
    'Rascunho','Aguardando confirmação','Aguardando pagamento','Pago',
    'Separando produtos','Aguardando envio','Enviado','Entregue',
    'Concluído','Cancelado'
  )),
  payment_status text not null default 'Não informado' check (payment_status in (
    'Não informado','Aguardando pagamento','Pago','Parcial',
    'Reembolsado','Cancelado'
  )),
  payment_method text,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  address text,
  tracking_code text,
  notes text,
  lead_id uuid references public.whatsapp_leads(id) on delete set null,
  -- Proteção contra baixa duplicada de estoque:
  stock_deducted_at timestamptz,
  stock_deducted_by text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx on public.orders (status);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_sku text not null default '',
  size text,
  qty int not null check (qty > 0),
  unit_price numeric(10,2) not null,
  personalization text
);
create index order_items_order_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "pedidos_admin" on public.orders
  for all to authenticated using (true) with check (true);
create policy "itens_admin" on public.order_items
  for all to authenticated using (true) with check (true);

grant usage, select on sequence public.order_number_seq to authenticated;

-- Número sequencial do pedido (XS-0001, XS-0002...).
create or replace function public.next_order_number()
returns text
language sql
security invoker
as $$
  select 'XS-' || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;
