-- XAVIER'S SPORTS: O PAINEL DO PACOTE, NUMA COLAGEM SÓ (14/10/2026)
-- Abrir este ARQUIVO no editor e copiar daqui. Rodar no SQL Editor do Supabase da Xavier's.
-- Parte 1: o esquema do molde (cria as tabelas do painel ao lado das da loja; não apaga nada).
-- Parte 2: a cópia das 266 camisas (0005). Reexecutável.
-- No fim, a conferência: camisas_antes e camisas_no_painel têm de dar 266.

-- O MOLDE: tudo o que o SQL Editor precisa, numa colagem só (0001, 0003, 0004, 0005, 0006, 0007, 0008, 0009, 0010, 0011, 0012).
-- Abrir este ARQUIVO e copiar daqui (nunca do terminal ou do chat: uma linha
-- quebrada no caminho já deu syntax error na Japa). Reexecutável.

-- ═══ 0001_schema ═══
-- JK IMPORTS — estrutura do catálogo
--
-- Cole isto INTEIRO no SQL Editor do projeto e rode. É o único passo
-- que não dá para fazer pela chave de serviço, porque cria tabela.
-- Reexecutável: tudo é "if not exists" ou "drop policy if exists".
--
-- NÃO rode o 0002_seed.sql: ele virou aviso. O catálogo entra depois,
-- por scripts/semear-supabase.mjs.

create extension if not exists "pgcrypto";

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  ordem int default 0,
  ativo boolean default true
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  slug text unique not null,
  descricao text,
  marca text,
  preco numeric(10, 2),
  preco_promocional numeric(10, 2),
  categoria_id uuid references categorias (id) on delete set null,
  tamanhos text[] default '{}',
  cores text[] default '{}',
  destaque boolean default false,
  ativo boolean default true,
  ordem int default 0,
  created_at timestamptz default now()
);

create table if not exists produto_imagens (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid references produtos (id) on delete cascade,
  url text not null,
  alt text,
  ordem int default 0
);

create table if not exists config (
  chave text primary key,
  valor text
);

create index if not exists produtos_categoria_idx on produtos (categoria_id);
create index if not exists produtos_ordem_idx on produtos (ordem);
create index if not exists imagens_produto_idx on produto_imagens (produto_id, ordem);

-- ─────────────────────────────────────────────────────────────
-- RLS: leitura pública só do que está ativo; escrita só com sessão.
-- ─────────────────────────────────────────────────────────────
alter table categorias enable row level security;
alter table produtos enable row level security;
alter table produto_imagens enable row level security;
alter table config enable row level security;

drop policy if exists "categorias visíveis" on categorias;
create policy "categorias visíveis" on categorias
  for select using (ativo = true);

drop policy if exists "categorias — escrita autenticada" on categorias;
create policy "categorias — escrita autenticada" on categorias
  for all to authenticated using (true) with check (true);

drop policy if exists "produtos visíveis" on produtos;
create policy "produtos visíveis" on produtos
  for select using (ativo = true);

drop policy if exists "produtos — escrita autenticada" on produtos;
create policy "produtos — escrita autenticada" on produtos
  for all to authenticated using (true) with check (true);

-- imagem aparece se a peça dela aparece
drop policy if exists "imagens visíveis" on produto_imagens;
create policy "imagens visíveis" on produto_imagens
  for select using (
    exists (
      select 1 from produtos p
      where p.id = produto_imagens.produto_id and p.ativo = true
    )
  );

drop policy if exists "imagens — escrita autenticada" on produto_imagens;
create policy "imagens — escrita autenticada" on produto_imagens
  for all to authenticated using (true) with check (true);

drop policy if exists "config visível" on config;
create policy "config visível" on config for select using (true);

drop policy if exists "config — escrita autenticada" on config;
create policy "config — escrita autenticada" on config
  for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- Storage: bucket público para leitura, escrita só com sessão.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos visíveis" on storage.objects;
create policy "fotos visíveis" on storage.objects
  for select using (bucket_id = 'produtos');

drop policy if exists "fotos — envio autenticado" on storage.objects;
create policy "fotos — envio autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'produtos');

drop policy if exists "fotos — troca autenticada" on storage.objects;
create policy "fotos — troca autenticada" on storage.objects
  for update to authenticated using (bucket_id = 'produtos');

drop policy if exists "fotos — remoção autenticada" on storage.objects;
create policy "fotos — remoção autenticada" on storage.objects
  for delete to authenticated using (bucket_id = 'produtos');

-- ═══ 0003_esgotado_e_ajuste ═══
-- Dois campos opcionais da peça, pedidos pelas referências de 24/09/2026
-- (Nike risca o número que acabou; Nike avisa a forma em cima da grade).
-- Colar no SQL Editor do Supabase, como a 0001: a chave de serviço não altera tabela.
-- Sem esta migração a vitrine funciona igual: os dois campos só ficam vazios.

alter table produtos add column if not exists tamanhos_esgotados text[] default '{}';
alter table produtos add column if not exists ajuste text;

-- ═══ 0004_medidas_das_fotos ═══
-- As medidas e o blur de cada foto (26/09/2026, ao ligar o Supabase da Japa).
--
-- No modo local o catalogo.json guarda largura, altura e o blur de cada foto,
-- e a vitrine usa os tres: o blur e o desfoque enquanto a foto carrega, e as
-- medidas escolhem o corte da galeria. O banco nao tinha essas colunas, entao
-- ao ligar o Supabase a loja perdia os tres em silencio, inclusive nas fotos
-- enviadas pelo painel (o ModalPeca ja calcula e mandava para o nada).

alter table produto_imagens add column if not exists largura int;
alter table produto_imagens add column if not exists altura int;
alter table produto_imagens add column if not exists blur text;

-- ═══ 0005_banners ═══
-- Os banners da campanha do topo, trocados pelo painel (da Japa Modas,
-- 26/09/2026; no molde desde 28/09).
--
-- Colar no SQL Editor, como as outras. Reexecutável: a tabela e as regras
-- usam "if not exists". Não semeia nada: os banners da loja entram pelo
-- painel (/painel/banners). Enquanto a tabela estiver vazia, o site usa os
-- de data/banners.json.

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  ordem int not null default 0,
  ativo boolean not null default true,
  foto text not null,
  blur text,
  alt text not null default '',
  lado text not null default 'direita' check (lado in ('esquerda', 'direita')),
  foco text not null default '50% 30%',
  titulo text not null,
  linha text not null default '',
  botao text not null,
  href text not null default '/catalogo',
  created_at timestamptz default now()
);

create index if not exists banners_ordem_idx on banners (ordem);

alter table banners enable row level security;

drop policy if exists "banners visíveis" on banners;
create policy "banners visíveis" on banners
  for select using (ativo = true);

drop policy if exists "banners — escrita autenticada" on banners;
create policy "banners — escrita autenticada" on banners
  for all to authenticated using (true) with check (true);

-- ═══ 0006_conteudo ═══
-- OS TEXTOS E AS FOTOS DA VITRINE, trocados pelo painel (29/09/2026).
--
-- O registro do que é trocável mora no código (lib/conteudo.ts), com o
-- valor de sempre como padrão. Esta tabela guarda só o que o dono mudou:
-- uma linha por campo ("loja.titulo", "avisos.itens"), com o valor em
-- jsonb (uma frase, uma foto, uma lista ou o horário). Voltar ao original
-- apaga a linha. Sem esta tabela o site mostra o padrão.
--
-- Reexecutável.

create table if not exists conteudo (
  chave text primary key,
  valor jsonb not null,
  atualizado timestamptz default now()
);

alter table conteudo enable row level security;

drop policy if exists "conteúdo visível" on conteudo;
create policy "conteúdo visível" on conteudo for select using (true);

drop policy if exists "conteúdo — escrita autenticada" on conteudo;
create policy "conteúdo — escrita autenticada" on conteudo
  for all to authenticated using (true) with check (true);

-- ═══ 0007_banners_padrao ═══
-- Os campos do topo no padrão Alto Giro (08/10/2026, nascido na Be Bless).
-- Todos opcionais: um banner sem eles continua como antes.
--
--   celular, celular_blur  a arte EM PÉ do celular (4:5). Sem ela, o celular
--                          mostra a arte deitada inteira, com só o botão por cima
--   titulo_na_arte         a arte já traz o título desenhado: o do site vira
--                          só leitor de tela e Google
--   letra                  a cor da linha e do botão por cima da arte:
--                          'clara' (padrão) ou 'escura' (arte de fundo claro)
--   posicao                onde fica o bloco da linha e do botão, em % da arte:
--                          {"x":50,"y":70,"xm":50,"ym":80} (x/y no computador,
--                          xm/ym no celular). Sem posição, o texto vai no pé do
--                          lado escolhido, sobre um degradê
--
-- Reexecutável. O site só manda esses campos ao banco quando estão
-- preenchidos: a loja que não rodou isto continua salvando banner.

alter table banners add column if not exists celular text;
alter table banners add column if not exists celular_blur text;
alter table banners add column if not exists titulo_na_arte boolean not null default false;
alter table banners add column if not exists letra text not null default 'clara';
alter table banners add column if not exists posicao jsonb;

-- ═══ 0008_contatos ═══
-- OS CONTATOS: quem deixou o nome e o WhatsApp na vitrine (08/10/2026).
--
-- Nasceu do receio da Be Bless: "o cliente não achar o que quer e eu perder
-- esse contato". Três portas gravam aqui:
--   convite   o quadro da oferta da loja (lista de lançamentos, cupom)
--   esgotado  "me avisa quando voltar", no tamanho riscado da peça
--   busca     "me avisa quando chegar", na busca que não achou nada
--
-- O site só ESCREVE (anônimo, pela rota /api/contato, que confere tudo
-- antes). Ler, marcar "já avisei" e apagar é só do dono logado, na aba
-- Clientes do painel. O número nunca aparece no site.
--
-- O mesmo número pedindo a mesma coisa, enquanto não foi avisado, não
-- duplica: o índice único recusa, e a rota trata como sucesso.
--
-- Reexecutável.

create extension if not exists "pgcrypto";

create table if not exists contatos (
  id uuid primary key default gen_random_uuid(),
  criado timestamptz not null default now(),
  origem text not null check (origem in ('convite', 'esgotado', 'busca')),
  nome text not null check (char_length(nome) between 1 and 60),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  produto text check (produto is null or produto ~ '^[a-z0-9-]{1,80}$'),
  tamanho text check (tamanho is null or char_length(tamanho) <= 12),
  busca text check (busca is null or char_length(busca) <= 60),
  avisado timestamptz
);

create unique index if not exists contatos_um_pedido_por_vez
  on contatos (whatsapp, origem, coalesce(produto, ''), coalesce(tamanho, ''), lower(coalesce(busca, '')))
  where avisado is null;

create index if not exists contatos_criado on contatos (criado desc);

alter table contatos enable row level security;

drop policy if exists "contatos: o site só grava" on contatos;
create policy "contatos: o site só grava" on contatos
  for insert to anon, authenticated with check (avisado is null);

drop policy if exists "contatos: o dono lê" on contatos;
create policy "contatos: o dono lê" on contatos
  for select to authenticated using (true);

drop policy if exists "contatos: o dono marca" on contatos;
create policy "contatos: o dono marca" on contatos
  for update to authenticated using (true) with check (true);

drop policy if exists "contatos: o dono apaga" on contatos;
create policy "contatos: o dono apaga" on contatos
  for delete to authenticated using (true);

-- ═══ 0009_estoque ═══
-- O ESTOQUE POR TAMANHO (08/10/2026). O Rafael notou que o molde não tinha
-- estoque: o painel só sabia "no site / guardada", e o tamanho esgotado
-- (tamanhos_esgotados, 0003) nenhum painel editava.
--
-- produtos.estoque é um mapa tamanho -> quantidade: {"38": 2, "40": 0}.
-- NULL quer dizer "esta peça não conta estoque", que é o jeito de antes:
-- loja que não usa continua igual.
--
-- tamanhos_esgotados passa a nascer do estoque: quem grava o estoque grava
-- junto os tamanhos com 0. Assim o site, o "me avisa quando voltar", a
-- contagem do esgotado e o "Repor o 38" seguem lendo a mesma coluna.
--
-- A venda fecha no WhatsApp: a baixa é da dona, com um toque ("Vendi 1").
-- A função abaixo baixa e soma sem nunca deixar negativo, numa transação
-- só, para dois toques rápidos não se perderem.
--
-- O site mostra só "última" (tamanho com 1) e o riscado (0), nunca o número.
-- A coluna é legível pela chave pública como as outras de produtos; quem
-- souber consultar a API vê o número. Aceito: é o mesmo nível do preço.
--
-- Reexecutável. MAS: desde 09/10 a versão em vigor de ajustar_estoque está
-- na 0010_dono.sql (só o dono, e recusa tamanho que a peça não tem). Rodar
-- esta de novo numa loja que já tem a 0010 volta a função para trás: rodar
-- a 0010 em seguida.

alter table produtos add column if not exists estoque jsonb;

create or replace function ajustar_estoque(p_id uuid, p_tamanho text, p_delta int)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_estoque jsonb;
  v_atual int;
  v_novo int;
begin
  if auth.uid() is null then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  if p_tamanho is null or length(trim(p_tamanho)) = 0 or length(p_tamanho) > 12 then
    raise exception 'Tamanho inválido.';
  end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 999 then
    raise exception 'Quantidade inválida.';
  end if;

  select coalesce(estoque, '{}'::jsonb) into v_estoque
    from produtos where id = p_id
    for update;
  if not found then
    raise exception 'Essa peça já não está no catálogo.';
  end if;

  v_atual := coalesce((v_estoque ->> p_tamanho)::int, 0);
  v_novo := greatest(0, v_atual + p_delta);
  v_estoque := jsonb_set(v_estoque, array[p_tamanho], to_jsonb(v_novo), true);

  update produtos
     set estoque = v_estoque,
         tamanhos_esgotados = coalesce(
           (select array_agg(k order by k) from jsonb_each_text(v_estoque) as e(k, v) where v::int <= 0),
           '{}'::text[]
         )
   where id = p_id;

  return v_estoque;
end;
$$;

revoke all on function ajustar_estoque(uuid, text, int) from public, anon;
grant execute on function ajustar_estoque(uuid, text, int) to authenticated;

-- rodada de novo numa loja que já tem a 0012: a versão de 4 argumentos é a
-- que vale, e esta de 3 deixaria a chamada ambígua. Sai.
do $$
begin
  if exists (select 1 from pg_proc where proname = 'ajustar_estoque' and pronargs = 4) then
    drop function ajustar_estoque(uuid, text, int);
  end if;
end $$;

-- ═══ 0010_dono ═══
-- O DONO É UMA LISTA, NÃO "QUALQUER LOGADO" (09/10/2026).
--
-- Até aqui toda escrita era "to authenticated using (true)": qualquer conta
-- logada podia tudo. E o cadastro de contas do Supabase vem ABERTO: quem
-- criasse uma conta pela chave pública (que está no site) editava o
-- catálogo e lia os WhatsApps das clientes na tabela contatos. Achado na
-- auditoria do molde em 09/10, com o cadastro aberto na SneakerSpot, na
-- Arena, na Japa e na Full Time.
--
-- Agora só quem está na tabela donos escreve e lê o que é do dono. O site
-- (anônimo) continua lendo o que está ativo e gravando contatos, como antes.
--
-- ORDEM NUMA LOJA NO AR (as quatro, sempre):
--   1. listar as contas (Authentication > Users): conta que não é do dono nem
--      do estúdio é invasão; apagar e avisar o Rafael;
--   2. desligar o cadastro (Authentication > Sign In / Providers > "Allow new
--      users to sign up");
--   3. rodar este arquivo: as contas que existem viram donos;
--   4. entrar no painel com a conta do dono e salvar uma peça.
-- Conta nova de dono, depois disto: criar em Authentication > Users e rodar
--   insert into donos (user_id) select id from auth.users where email = '...';
--
-- Funciona com o código de qualquer loja (não muda coluna nenhuma).
-- Reexecutável: rodar de novo não tira ninguém e não põe conta nova.

create table if not exists donos (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado timestamptz not null default now()
);

alter table donos enable row level security;
-- ninguém lê nem escreve donos pela API: só o SQL Editor (postgres)
revoke all on donos from anon, authenticated;

-- as contas de hoje viram donos só na PRIMEIRA vez (lista vazia), depois
-- de conferidas no passo 1; rodar de novo não promove conta criada depois
insert into donos (user_id)
select id from auth.users
where not exists (select 1 from donos);

create or replace function eh_dono()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from donos where user_id = auth.uid());
$$;

revoke all on function eh_dono() from public;
grant execute on function eh_dono() to anon, authenticated;

-- ── toda policy "qualquer logado pode" vira "só o dono" ───────
-- Achadas pelo que fazem, não pelo nome: cada loja nomeou do seu jeito
-- ("banners escrita" na Japa, "banners — escrita autenticada" no molde) e
-- tem tabelas próprias (visitas_* na Japa). Entram:
--   no public, as que são só de "authenticated" e liberam tudo (true);
--   no storage, as das fotos do bucket produtos.
-- Ficam como estão as que já usam eh_dono (rodar de novo não muda nada) e
-- as do site, que valem para anon também (ler o que está ativo, gravar
-- contato com as regras da tabela).
do $$
declare
  r record;
  base text;
begin
  for r in
    select schemaname, tablename, policyname, cmd, qual, with_check
      from pg_policies
     where roles = array['authenticated']::name[]
       and schemaname in ('public', 'storage')
       and tablename <> 'donos'
       and coalesce(qual, '') not like '%eh_dono%'
       and coalesce(with_check, '') not like '%eh_dono%'
       and (
         (schemaname = 'public' and coalesce(qual, 'true') = 'true' and coalesce(with_check, 'true') = 'true')
         or (schemaname = 'storage' and tablename = 'objects'
             and coalesce(qual, with_check) = '(bucket_id = ''produtos''::text)')
       )
  loop
    base := case when r.schemaname = 'storage'
                 then '(bucket_id = ''produtos'' and public.eh_dono())'
                 else '(public.eh_dono())' end;
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute format(
      'create policy %I on %I.%I for %s to authenticated %s %s',
      left(r.policyname, 55) || ' (dono)', r.schemaname, r.tablename, r.cmd,
      case when r.cmd = 'INSERT' then '' else 'using ' || base end,
      case when r.cmd in ('ALL', 'INSERT', 'UPDATE') then 'with check ' || base else '' end
    );
    raise notice 'só o dono: %.% (%)', r.schemaname, r.tablename, r.policyname;
  end loop;
end $$;

-- ── o estoque (0009), se a loja tiver ──────────────────────────
-- A versão em vigor de ajustar_estoque é ESTA (rodar a 0009 de novo depois
-- desta volta a função para trás: ver a armadilha sql-antigo-rodado-de-novo).
-- Além do dono, recusa peça que não conta estoque e tamanho que ela não tem
-- (antes criava a chave, e a RPC e o painel riscavam diferente).
do $$
begin
  -- com a 0012 já rodada, a função de 4 argumentos é a que vale: não volta
  -- a de 3 (a chamada ficaria ambígua)
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'produtos' and column_name = 'estoque')
     and not exists (select 1 from pg_proc where proname = 'ajustar_estoque' and pronargs = 4) then
    execute $f$
create or replace function ajustar_estoque(p_id uuid, p_tamanho text, p_delta int)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $body$
declare
  v_estoque jsonb;
  v_atual int;
  v_novo int;
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  if p_tamanho is null or length(trim(p_tamanho)) = 0 or length(p_tamanho) > 12 then
    raise exception 'Tamanho inválido.';
  end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 999 then
    raise exception 'Quantidade inválida.';
  end if;

  select estoque into v_estoque
    from produtos where id = p_id
    for update;
  if not found then
    raise exception 'Essa peça já não está no catálogo.';
  end if;
  if v_estoque is null then
    raise exception 'Essa peça não está contando o estoque. Abra a peça e ligue a contagem.';
  end if;
  if not (v_estoque ? p_tamanho) then
    raise exception 'Esse tamanho não está na peça. Abra a peça e confira os tamanhos.';
  end if;

  v_atual := coalesce((v_estoque ->> p_tamanho)::int, 0);
  v_novo := greatest(0, v_atual + p_delta);
  v_estoque := jsonb_set(v_estoque, array[p_tamanho], to_jsonb(v_novo), true);

  update produtos
     set estoque = v_estoque,
         tamanhos_esgotados = coalesce(
           (select array_agg(k order by k) from jsonb_each_text(v_estoque) as e(k, v) where v::int <= 0),
           '{}'::text[]
         )
   where id = p_id;

  return v_estoque;
end;
$body$;
$f$;
    execute 'revoke all on function ajustar_estoque(uuid, text, int) from public, anon';
    execute 'grant execute on function ajustar_estoque(uuid, text, int) to authenticated';
  end if;
end $$;

-- ═══ 0011_reordenar ═══
-- MUDAR A ORDEM NUMA CHAMADA SÓ (09/10/2026, a auditoria de velocidade).
--
-- O painel gravava a ordem nova com um UPDATE por peça: numa loja de 150
-- peças, mover uma era 150 idas ao banco, uma atrás da outra. Agora é uma
-- chamada, numa transação. Sem esta função, o painel volta ao jeito antigo
-- sozinho (lib/acoes.ts), então a loja que não rodou segue funcionando.
--
-- Só o dono (0010). Reexecutável.

create or replace function reordenar(p_tabela text, p_ids uuid[], p_base int default 0)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_mudou int;
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  if p_tabela not in ('produtos', 'banners') then
    raise exception 'Tabela inválida.';
  end if;
  execute format(
    'update %I t set ordem = x.i - 1 + $2 from unnest($1) with ordinality as x(id, i) where t.id = x.id',
    p_tabela
  ) using p_ids, p_base;
  get diagnostics v_mudou = row_count;
  return v_mudou;
end;
$$;

revoke all on function reordenar(text, uuid[], int) from public, anon;
grant execute on function reordenar(text, uuid[], int) to authenticated;

-- ═══ 0012_historico_e_separar ═══
-- O HISTÓRICO DO ESTOQUE E O "SEPARAR" (09/10/2026, decisão do Rafael na
-- auditoria do molde: o que a Nuvemshop e o Bling têm e a dona usa).
--
-- estoque_movimentos: cada mudança com o motivo, o saldo depois e quando.
--   vendi / chegou   o "Vendi 1" e o "Chegou +1" da lista
--   ajuste           a dona mudou o número no cadastro da peça
--   separada         separou para alguém (baixa 1)
--   liberada         a separação venceu ou a pessoa não levou (volta 1)
-- O "Desfazer" marca a mudança como desfeita e devolve o número.
--
-- reservas: "Separada para Fulana até sexta". A venda fecha no WhatsApp e o
-- Pix às vezes demora: separar tira do site para ninguém comprar o mesmo
-- tamanho duas vezes. Vencida, volta sozinha (liberar_reservas_vencidas,
-- que o site e o painel chamam ao ler o catálogo).
--
-- Só o dono lê e escreve (0010). Precisa da 0009 (estoque) e da 0010 (dono).
-- Reexecutável.

create table if not exists estoque_movimentos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos (id) on delete cascade,
  tamanho text not null check (char_length(tamanho) between 1 and 12),
  delta int not null,
  motivo text not null check (motivo in ('vendi', 'chegou', 'ajuste', 'separada', 'liberada')),
  saldo int not null,
  desfeito boolean not null default false,
  criado timestamptz not null default now()
);
create index if not exists estoque_movimentos_peca on estoque_movimentos (produto_id, criado desc);
create index if not exists estoque_movimentos_quando on estoque_movimentos (criado desc);

create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos (id) on delete cascade,
  tamanho text not null check (char_length(tamanho) between 1 and 12),
  nome text not null check (char_length(nome) between 1 and 60),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  ate timestamptz not null,
  situacao text not null default 'separada' check (situacao in ('separada', 'vendeu', 'nao_levou', 'venceu')),
  criado timestamptz not null default now(),
  fechada timestamptz
);
create index if not exists reservas_abertas on reservas (ate) where situacao = 'separada';

alter table estoque_movimentos enable row level security;
alter table reservas enable row level security;

drop policy if exists "movimentos: o dono" on estoque_movimentos;
create policy "movimentos: o dono" on estoque_movimentos
  for all to authenticated using (eh_dono()) with check (eh_dono());

drop policy if exists "reservas: o dono" on reservas;
create policy "reservas: o dono" on reservas
  for all to authenticated using (eh_dono()) with check (eh_dono());

-- o miolo: muda um tamanho, recalcula o riscado e anota. Interna (sem
-- conferir quem chama): só as funções abaixo a usam.
create or replace function mexer_no_estoque(p_id uuid, p_tamanho text, p_delta int, p_motivo text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estoque jsonb;
  v_novo int;
begin
  select estoque into v_estoque from produtos where id = p_id for update;
  if not found then
    raise exception 'Essa peça já não está no catálogo.';
  end if;
  if v_estoque is null then
    raise exception 'Essa peça não está contando o estoque. Abra a peça e ligue a contagem.';
  end if;
  if not (v_estoque ? p_tamanho) then
    raise exception 'Esse tamanho não está na peça. Abra a peça e confira os tamanhos.';
  end if;

  v_novo := greatest(0, coalesce((v_estoque ->> p_tamanho)::int, 0) + p_delta);
  v_estoque := jsonb_set(v_estoque, array[p_tamanho], to_jsonb(v_novo), true);

  update produtos
     set estoque = v_estoque,
         tamanhos_esgotados = coalesce(
           (select array_agg(k order by k) from jsonb_each_text(v_estoque) as e(k, v) where v::int <= 0),
           '{}'::text[]
         )
   where id = p_id;

  if p_motivo is not null then
    insert into estoque_movimentos (produto_id, tamanho, delta, motivo, saldo)
    values (p_id, p_tamanho, p_delta, p_motivo, v_novo);
  end if;
  return v_estoque;
end;
$$;
revoke all on function mexer_no_estoque(uuid, text, int, text) from public, anon, authenticated;

-- "Vendi 1" / "Chegou +1": a versão de 3 argumentos sai (a da 0010), para a
-- chamada com nomes não ficar ambígua; o código antigo segue funcionando,
-- porque p_motivo tem padrão.
drop function if exists ajustar_estoque(uuid, text, int);
create or replace function ajustar_estoque(p_id uuid, p_tamanho text, p_delta int, p_motivo text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  if p_tamanho is null or length(trim(p_tamanho)) = 0 or length(p_tamanho) > 12 then
    raise exception 'Tamanho inválido.';
  end if;
  if p_delta is null or p_delta = 0 or abs(p_delta) > 999 then
    raise exception 'Quantidade inválida.';
  end if;
  return mexer_no_estoque(p_id, p_tamanho, p_delta,
    coalesce(p_motivo, case when p_delta < 0 then 'vendi' else 'chegou' end));
end;
$$;
revoke all on function ajustar_estoque(uuid, text, int, text) from public, anon;
grant execute on function ajustar_estoque(uuid, text, int, text) to authenticated;

-- "Desfazer": só a última mudança da peça, e só Vendi ou Chegou
create or replace function desfazer_movimento(p_mov uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m estoque_movimentos;
  v_estoque jsonb;
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  select * into m from estoque_movimentos where id = p_mov for update;
  if not found or m.desfeito then
    raise exception 'Essa mudança já foi desfeita.';
  end if;
  if m.motivo not in ('vendi', 'chegou') then
    raise exception 'Só dá para desfazer um Vendi ou um Chegou.';
  end if;
  if exists (select 1 from estoque_movimentos
              where produto_id = m.produto_id and not desfeito and criado > m.criado) then
    raise exception 'Só dá para desfazer a última mudança desta peça.';
  end if;
  v_estoque := mexer_no_estoque(m.produto_id, m.tamanho, -m.delta, null);
  update estoque_movimentos set desfeito = true where id = p_mov;
  return v_estoque;
end;
$$;
revoke all on function desfazer_movimento(uuid) from public, anon;
grant execute on function desfazer_movimento(uuid) to authenticated;

-- "Separar": baixa 1 e anota para quem e até quando
create or replace function separar_peca(p_id uuid, p_tamanho text, p_nome text, p_whatsapp text, p_ate timestamptz)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tem int;
  v_reserva uuid;
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  if p_nome is null or length(trim(p_nome)) = 0 then
    raise exception 'Escreva para quem é.';
  end if;
  if p_ate is null or p_ate < now() then
    raise exception 'Escolha até quando fica separada.';
  end if;
  select coalesce((estoque ->> p_tamanho)::int, 0) into v_tem from produtos where id = p_id;
  if coalesce(v_tem, 0) <= 0 then
    raise exception 'Esse tamanho já acabou: não tem o que separar.';
  end if;
  perform mexer_no_estoque(p_id, p_tamanho, -1, 'separada');
  insert into reservas (produto_id, tamanho, nome, whatsapp, ate)
  values (p_id, p_tamanho, left(trim(p_nome), 60), nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), ''), p_ate)
  returning id into v_reserva;
  return v_reserva;
end;
$$;
revoke all on function separar_peca(uuid, text, text, text, timestamptz) from public, anon;
grant execute on function separar_peca(uuid, text, text, text, timestamptz) to authenticated;

-- "Vendeu" (fica baixado) ou "Não levou" (volta 1)
create or replace function fechar_reserva(p_reserva uuid, p_vendeu boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r reservas;
begin
  if not eh_dono() then
    raise exception 'Sessão expirada. Entre de novo.';
  end if;
  select * into r from reservas where id = p_reserva for update;
  if not found or r.situacao <> 'separada' then
    raise exception 'Essa separação já foi fechada.';
  end if;
  if not p_vendeu then
    perform mexer_no_estoque(r.produto_id, r.tamanho, 1, 'liberada');
  end if;
  update reservas
     set situacao = case when p_vendeu then 'vendeu' else 'nao_levou' end, fechada = now()
   where id = p_reserva;
end;
$$;
revoke all on function fechar_reserva(uuid, boolean) from public, anon;
grant execute on function fechar_reserva(uuid, boolean) to authenticated;

-- a separação vencida volta sozinha. Qualquer um pode chamar (o site chama
-- ao refazer o catálogo): só mexe no que já venceu, e repetir não faz nada.
create or replace function liberar_reservas_vencidas()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  r reservas;
  n int := 0;
begin
  for r in select * from reservas where situacao = 'separada' and ate < now() for update skip locked loop
    begin
      perform mexer_no_estoque(r.produto_id, r.tamanho, 1, 'liberada');
    exception when others then
      null; -- a peça parou de contar ou perdeu o tamanho: só fecha
    end;
    update reservas set situacao = 'venceu', fechada = now() where id = r.id;
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke all on function liberar_reservas_vencidas() from public;
grant execute on function liberar_reservas_vencidas() to anon, authenticated;


-- 0013: acompanhamento privado das melhorias do painel
-- Preferências, ações e alterações privadas do painel. Requer a 0010.
-- Compatível com a instalação existente; não muda o catálogo ou o checkout.
create table if not exists public.painel_crescimento (
  chave text primary key check (char_length(chave) between 1 and 180),
  tipo text not null check (tipo in ('tarefa', 'mudanca', 'evento')),
  dados jsonb not null check (jsonb_typeof(dados) = 'object' and octet_length(dados::text) <= 4096),
  criado timestamptz not null default now()
);
create index if not exists painel_crescimento_criado on public.painel_crescimento (criado desc);
alter table public.painel_crescimento enable row level security;
revoke all on public.painel_crescimento from public, anon;
grant select, insert, update, delete on public.painel_crescimento to authenticated;
drop policy if exists "crescimento do dono" on public.painel_crescimento;
create policy "crescimento do dono" on public.painel_crescimento for all to authenticated
  using (public.eh_dono()) with check (public.eh_dono());


-- 0014: frequência das ofertas por conta
-- Frequência das ofertas por conta, inclusive entre aparelhos. Requer a 0013.
create or replace function public.painel_frequencia_oferta(operacao text, sessao text, elegivel boolean default false)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare
  atual jsonb;
  visitas integer;
  ultima text;
  proxima timestamptz;
  mostrar boolean := false;
begin
  if not coalesce(public.eh_dono(), false) then raise exception 'Acesso negado' using errcode = '42501'; end if;
  if operacao is null or operacao not in ('visita','mostrar','dispensar') or sessao is null or sessao !~ '^[a-zA-Z0-9_-]{8,80}$' then
    raise exception 'Operação inválida' using errcode = '22023';
  end if;
  insert into public.painel_crescimento(chave,tipo,dados) values ('oferta:controle','tarefa','{}') on conflict (chave) do nothing;
  select dados into atual from public.painel_crescimento where chave = 'oferta:controle' for update;
  visitas := least(20,greatest(0,coalesce((atual->>'visitas')::integer,0)));
  ultima := coalesce(atual->>'ultimaSessao','');
  proxima := (atual->>'proxima')::timestamptz;
  if operacao = 'visita' and ultima <> sessao then visitas := least(20,visitas + 1); ultima := sessao; end if;
  mostrar := operacao = 'visita' and coalesce(elegivel,false) and visitas >= 2 and (proxima is null or proxima <= now());
  if mostrar or operacao <> 'visita' then proxima := now() + interval '30 days'; end if;
  atual := jsonb_build_object('visitas',visitas,'ultimaSessao',ultima,'proxima',proxima);
  update public.painel_crescimento set dados = atual, criado = now() where chave = 'oferta:controle';
  return jsonb_build_object('mostrar',mostrar,'controle',atual);
end $$;
revoke all on function public.painel_frequencia_oferta(text,text,boolean) from public,anon;
grant execute on function public.painel_frequencia_oferta(text,text,boolean) to authenticated;


-- 0015: estoque e pedidos da vitrine WhatsApp
-- Gestão de uma loja por projeto Supabase. Donos da 0010 são a fronteira de acesso.
-- Documento privado, versão otimista e bloqueio transacional: todas as variações
-- de um pedido são confirmadas juntas. Quantidades públicas continuam projetadas
-- em produtos.estoque. Aplicar depois da 0012; reexecutável.
begin;
create table if not exists gestao_loja (
  id boolean primary key default true check(id),
  documento jsonb,
  atualizado timestamptz not null default now()
);
insert into gestao_loja(id) values(true) on conflict do nothing;
alter table gestao_loja enable row level security;
revoke all on gestao_loja from anon,authenticated;
alter table reservas add column if not exists gestao_pedido_id text;
alter table produtos add column if not exists variacoes_publicas jsonb;

create table if not exists gestao_solicitacoes (
  codigo text primary key check(codigo ~ '^VT-[A-F0-9]{12}$'),
  chave uuid unique not null,
  itens jsonb not null check(jsonb_typeof(itens)='array' and jsonb_array_length(itens) between 1 and 20),
  criado timestamptz not null default now(),
  ate timestamptz not null default now()+interval '7 days'
);
create index if not exists gestao_solicitacoes_criado on gestao_solicitacoes(criado);
alter table gestao_solicitacoes enable row level security;
revoke all on gestao_solicitacoes from anon,authenticated;
grant select on gestao_solicitacoes to authenticated;
drop policy if exists "solicitações: dono" on gestao_solicitacoes;
create policy "solicitações: dono" on gestao_solicitacoes for select to authenticated using(eh_dono());

create or replace function gestao_disponivel(d jsonb,v jsonb) returns int
language sql immutable set search_path=public as $$
select case when v->>'fisico' is null then null else
 (v->>'fisico')::int-(v->>'bloqueado')::int-coalesce((
  select sum((i->>'quantidade')::int) from jsonb_array_elements(d->'pedidos') p
  cross join lateral jsonb_array_elements(p->'itens') i
  where p->>'etapa' in ('reservado','pago') and i->>'variacao'=v->>'id'
 ),0)::int end
$$;
revoke all on function gestao_disponivel(jsonb,jsonb) from public,anon,authenticated;

create or replace function gestao_projetar(d jsonb) returns void
language plpgsql security definer set search_path=public as $$
declare p record; est jsonb;
begin
  perform set_config('vitrine.gestao_sync','sim',true);
  for p in select distinct v->>'produto' id from jsonb_array_elements(d->'variacoes') v where (v->>'ativa')::boolean loop
    select jsonb_object_agg(t, n) into est from (
      select v->>'tamanho' t,sum(gestao_disponivel(d,v))::int n
      from jsonb_array_elements(d->'variacoes') v
      where v->>'produto'=p.id and (v->>'ativa')::boolean and v->>'fisico' is not null group by v->>'tamanho'
    ) s;
    update produtos set estoque=est,
      tamanhos=(select array_agg(distinct v->>'tamanho') from jsonb_array_elements(d->'variacoes') v where v->>'produto'=p.id and (v->>'ativa')::boolean),
      cores=(select array_agg(distinct cor) from (select unnest(produtos.cores) cor union select v->>'cor' from jsonb_array_elements(d->'variacoes') v where v->>'produto'=p.id and (v->>'ativa')::boolean and v->>'cor'<>'') c),
      variacoes_publicas=(select jsonb_agg(jsonb_build_object('tamanho',v->>'tamanho','cor',v->>'cor','estado',case when gestao_disponivel(d,v) is null then 'confirmar' when gestao_disponivel(d,v)=0 then 'esgotado' when gestao_disponivel(d,v)=1 then 'ultima' else 'disponivel' end)) from jsonb_array_elements(d->'variacoes') v where v->>'produto'=p.id and (v->>'ativa')::boolean),
      tamanhos_esgotados=case when est is null then tamanhos_esgotados else
        coalesce((select array_agg(k order by k) from jsonb_each_text(est) e(k,n) where n::int=0),'{}'::text[]) end
    where id=p.id::uuid;
  end loop;
  perform set_config('vitrine.gestao_sync','nao',true);
end $$;
revoke all on function gestao_projetar(jsonb) from public,anon,authenticated;

-- Expiração pode ser provocada por uma leitura pública; sem dados privados na resposta.
-- Pagamento/CAS e expiração serializam na mesma linha. Paga nunca expira.
create or replace function gestao_expirar() returns int
language plpgsql security definer set search_path=public as $$
declare d jsonb; novos jsonb='[]'; p jsonb; n int=0;
begin
  select documento into d from gestao_loja where id=true for update;
  if d is null then return 0; end if;
  for p in select value from jsonb_array_elements(d->'pedidos') loop
    if p->>'etapa'='reservado' and (p->>'reservaAte')::timestamptz<=now() then
      p=p||jsonb_build_object('etapa','atendimento','reservaAte',null,
       'eventos',(p->'eventos')||jsonb_build_array(jsonb_build_object('em',now(),'texto','Prazo vencido. Peças liberadas; atendimento permanece aberto.')));
      n=n+1;
    end if;
    novos=novos||jsonb_build_array(p);
  end loop;
  if n>0 then
    d=d||jsonb_build_object('pedidos',novos,'versao',(d->>'versao')::int+1);
    update gestao_loja set documento=d,atualizado=now() where id=true;
    perform gestao_projetar(d);
  end if;
  return n;
end $$;
revoke all on function gestao_expirar() from public;
grant execute on function gestao_expirar() to anon,authenticated;

create or replace function gestao_snapshot() returns jsonb
language plpgsql security definer set search_path=public as $$
declare d jsonb;
begin
 if not eh_dono() then raise exception 'Sessão expirada. Entre de novo.'; end if;
 perform gestao_expirar();
 select documento into d from gestao_loja where id=true;
 return jsonb_build_object('documento',d,
  'produtos',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('categoria_slug',c.slug) order by p.id) from produtos p left join categorias c on c.id=p.categoria_id),'[]'::jsonb),
  'reservas',case when d is null then coalesce((select jsonb_agg(to_jsonb(r)) from reservas r where situacao='separada' and gestao_pedido_id is null),'[]'::jsonb) else '[]'::jsonb end,
  'movimentos',case when d is null then coalesce((select jsonb_agg(to_jsonb(m) order by m.criado) from estoque_movimentos m),'[]'::jsonb) else '[]'::jsonb end);
end $$;
revoke all on function gestao_snapshot() from public,anon;
grant execute on function gestao_snapshot() to authenticated;

create or replace function gestao_gravar(p_versao int,p_documento jsonb,p_estoques jsonb) returns boolean
language plpgsql security definer set search_path=public as $$
declare atual jsonb; v jsonb; p record; i jsonb; o jsonb; reserva record;
begin
 if not eh_dono() then raise exception 'Sessão expirada. Entre de novo.'; end if;
 select documento into atual from gestao_loja where id=true for update;
 if coalesce((atual->>'versao')::int,-1)<>p_versao then raise exception 'GESTAO_CONFLITO'; end if;
 if (p_documento->>'versao')::int<>p_versao+1 or jsonb_typeof(p_documento->'variacoes')<>'array' or jsonb_typeof(p_documento->'pedidos')<>'array' then raise exception 'Documento inválido.'; end if;
 if exists(select 1 from jsonb_array_elements(p_documento->'variacoes') x group by x->>'id' having count(*)>1)
   or exists(select 1 from jsonb_array_elements(p_documento->'pedidos') x group by x->>'id' having count(*)>1) then raise exception 'Identidade repetida.'; end if;
 for v in select value from jsonb_array_elements(p_documento->'variacoes') loop
   if v->>'id' is null or v->>'produto' is null or coalesce((v->>'bloqueado')::int,-1)<0 or coalesce((v->>'minimo')::int,-1)<0
      or (v->>'fisico' is not null and ((v->>'fisico')::numeric<>(v->>'fisico')::int or (v->>'fisico')::int not between 0 and 99999 or gestao_disponivel(p_documento,v)<0))
      then raise exception 'Saldo inválido ou insuficiente.'; end if;
 end loop;
 for o in select value from jsonb_array_elements(p_documento->'pedidos') loop
   if o->>'etapa' not in ('atendimento','reservado','pago','enviado','concluido','cancelado')
    or o->>'pagamento' not in ('pendente','confirmado','reembolsar','reembolsado') then raise exception 'Etapa inválida.'; end if;
   for i in select value from jsonb_array_elements(o->'itens') loop
     if (i->>'quantidade')::int not between 1 and 999 or (i->>'devolvidas')::int not between 0 and (i->>'quantidade')::int
      or not exists(select 1 from jsonb_array_elements(p_documento->'variacoes') iv where iv->>'id'=i->>'variacao' and iv->>'produto'=i->>'produto')
      or (i->>'valor' is not null and (i->>'valor')::numeric<0) then raise exception 'Item inválido.'; end if;
   end loop;
 end loop;
 -- Ordenação comum para evitar deadlocks; falha de qualquer saldo desfaz o pedido inteiro.
 for p in select id,estoque from produtos order by id for update loop
   if not(p_estoques ? p.id::text) or p.estoque is distinct from nullif(p_estoques->p.id::text,'null'::jsonb) then raise exception 'GESTAO_CONFLITO'; end if;
 end loop;
 if atual is null then
   for reserva in select * from reservas where situacao='separada' and gestao_pedido_id is null for update loop
     select value into o from jsonb_array_elements(p_documento->'pedidos') where value->>'legado'=reserva.id::text;
     if o is null or o->>'reservaAte' is distinct from to_char(reserva.ate at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') then
       -- Data vem do PostgREST com offset: comparar instante, sem depender de formatação.
       if o is null or (o->>'reservaAte')::timestamptz is distinct from reserva.ate then raise exception 'GESTAO_CONFLITO'; end if;
     end if;
     update reservas set gestao_pedido_id=o->>'id' where id=reserva.id;
   end loop;
   if (select count(*) from reservas where gestao_pedido_id is not null)<>(select count(*) from jsonb_array_elements(p_documento->'pedidos') po where po->>'legado' is not null) then raise exception 'GESTAO_CONFLITO'; end if;
 end if;
 update gestao_loja set documento=p_documento,atualizado=now() where id=true;
 perform gestao_projetar(p_documento);
 return true;
end $$;
revoke all on function gestao_gravar(int,jsonb,jsonb) from public,anon;
grant execute on function gestao_gravar(int,jsonb,jsonb) to authenticated;

-- Cadastro segue editando apresentação. Os saldos e exclusões passam pela gestão.
create or replace function gestao_proteger_produto() returns trigger
language plpgsql security definer set search_path=public as $$
declare d jsonb;
begin
 if coalesce(current_setting('vitrine.gestao_sync',true),'')='sim' then return new; end if;
 select documento into d from gestao_loja where id=true;
 if d is not null and exists(select 1 from jsonb_array_elements(d->'variacoes') v where v->>'produto'=old.id::text) then
   if tg_op='DELETE' then raise exception 'Esta peça tem histórico. Retire do site em vez de apagar.'; end if;
   if new.estoque is distinct from old.estoque or new.tamanhos is distinct from old.tamanhos or new.cores is distinct from old.cores then raise exception 'Ajuste a contagem e a grade na área Estoque.'; end if;
 end if;
 return case when tg_op='DELETE' then old else new end;
end $$;
drop trigger if exists gestao_proteger_produto on produtos;
create trigger gestao_proteger_produto before update or delete on produtos for each row execute function gestao_proteger_produto();
revoke all on function gestao_proteger_produto() from public,anon,authenticated;

-- Reservas importadas não podem ser liberadas novamente pelo fluxo antigo.
create or replace function liberar_reservas_vencidas() returns int
language plpgsql security definer set search_path=public as $$
declare r reservas; n int:=0;
begin
 n=gestao_expirar();
 for r in select * from reservas where situacao='separada' and gestao_pedido_id is null and ate<now() for update skip locked loop
   begin perform mexer_no_estoque(r.produto_id,r.tamanho,1,'liberada'); exception when others then null; end;
   update reservas set situacao='venceu',fechada=now() where id=r.id;n=n+1;
 end loop;
 return n;
end $$;
revoke all on function liberar_reservas_vencidas() from public;
grant execute on function liberar_reservas_vencidas() to anon,authenticated;
create or replace function gestao_proteger_reserva() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if old.gestao_pedido_id is not null then raise exception 'Esta separação está na área Pedidos.'; end if;
 return new;
end $$;
drop trigger if exists gestao_proteger_reserva on reservas;
create trigger gestao_proteger_reserva before update on reservas for each row when(old.gestao_pedido_id is not null) execute function gestao_proteger_reserva();
revoke all on function gestao_proteger_reserva() from public,anon,authenticated;

create or replace function gestao_solicitar(p_codigo text,p_chave uuid,p_itens jsonb) returns text
language plpgsql security definer set search_path=public as $$
declare anterior text; i jsonb; p produtos; canonicos jsonb='[]';
begin
 select codigo into anterior from gestao_solicitacoes where chave=p_chave and ate>now();
 if anterior is not null then return anterior; end if;
 if p_codigo !~ '^VT-[A-F0-9]{12}$' or jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens) not between 1 and 20 or length(p_itens::text)>20000 then raise exception 'Solicitação inválida.'; end if;
 for i in select value from jsonb_array_elements(p_itens) loop
  select * into p from produtos where id=(i->>'produto')::uuid and ativo;
  if p.id is null or (i->>'quantidade')::int not between 1 and 20 or length(i->>'tamanho')>12 or length(i->>'cor')>60
    or (i->>'cor'<>'' and not(i->>'cor'=any(p.cores))) then raise exception 'Peça indisponível.'; end if;
  canonicos=canonicos||jsonb_build_array(jsonb_build_object('produto',p.id,'variacao','','nome',p.nome,'tamanho',i->>'tamanho','cor',i->>'cor','quantidade',(i->>'quantidade')::int,'valor',round(coalesce(p.preco_promocional,p.preco)*100),'devolvidas',0));
 end loop;
 if (select count(*) from gestao_solicitacoes where criado>now()-interval '1 hour')>=500 then raise exception 'Tente novamente mais tarde.'; end if;
 delete from gestao_solicitacoes where ate<now();
 insert into gestao_solicitacoes(codigo,chave,itens) values(p_codigo,p_chave,canonicos) on conflict(chave) do nothing;
 select codigo into anterior from gestao_solicitacoes where chave=p_chave;return anterior;
end $$;
revoke all on function gestao_solicitar(text,uuid,jsonb) from public;
grant execute on function gestao_solicitar(text,uuid,jsonb) to anon,authenticated;
create or replace function gestao_revisar(p_itens jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare d jsonb; i jsonb; v jsonb; n int; q int; erros jsonb='{}'; chave text;
begin
 if jsonb_typeof(p_itens)<>'array' or jsonb_array_length(p_itens)>20 or length(p_itens::text)>8000 then raise exception 'Itens inválidos.'; end if;
 perform gestao_expirar();select documento into d from gestao_loja where id=true;if d is null then return erros;end if;
 for i in select value from jsonb_array_elements(p_itens) loop
  chave='['||to_json(i->>'id')::text||','||to_json(i->>'tamanho')::text||','||to_json(i->>'cor')::text||']';
  select x into v from jsonb_array_elements(d->'variacoes') x where (x->>'ativa')::boolean and x->>'produto'=i->>'id' and x->>'tamanho'=coalesce(nullif(i->>'tamanho',''),'Único') and (x->>'cor'=i->>'cor' or x->>'cor'='') limit 1;
  if v is null then erros=erros||jsonb_build_object(chave,'Confira o tamanho e a cor escolhidos.');continue;end if;
  n=gestao_disponivel(d,v);
  select sum((x->>'quantidade')::int) into q from jsonb_array_elements(p_itens) x where x->>'id'=i->>'id' and x->>'tamanho'=i->>'tamanho' and (v->>'cor'='' or x->>'cor'=i->>'cor');
  if n is not null and q>n then erros=erros||jsonb_build_object(chave,'Esta quantidade precisa ser revista. Reduza ou consulte a loja.');end if;
 end loop;
 return erros;
end $$;
revoke all on function gestao_revisar(jsonb) from public;
grant execute on function gestao_revisar(jsonb) to anon,authenticated;
commit;


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
