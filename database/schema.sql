-- =========================================================
-- Sistema de Gestão de Frota - Schema consolidado Supabase
-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Ele substitui os antigos arquivos de alteração/correção SQL.
-- =========================================================

-- -------------------------
-- Tabela: multas
-- -------------------------
create table if not exists public.multas (
  id bigint primary key,
  created_at timestamptz default now()
);

alter table public.multas
  add column if not exists linha text,
  add column if not exists carro text,
  add column if not exists placa text,
  add column if not exists data text,
  add column if not exists hora text,
  add column if not exists local text,
  add column if not exists municipio text,
  add column if not exists infracao text,
  add column if not exists auto text,
  add column if not exists motorista text,
  add column if not exists valor numeric(10,2),
  add column if not exists assinado text,
  add column if not exists pago text,
  add column if not exists envio_rca text,
  add column if not exists prazo_aceite text,
  add column if not exists dp text,
  add column if not exists status text,
  add column if not exists obs text,
  add column if not exists descricao text,
  add column if not exists data_suspeita boolean default false;

-- Padroniza tipos que podem receber texto importado de planilhas/PDFs.
alter table public.multas alter column linha type text using linha::text;
alter table public.multas alter column data type text using data::text;
alter table public.multas alter column hora type text using hora::text;
alter table public.multas alter column local type text using local::text;
alter table public.multas alter column municipio type text using municipio::text;
alter table public.multas alter column envio_rca type text using envio_rca::text;
alter table public.multas alter column prazo_aceite type text using prazo_aceite::text;
alter table public.multas alter column dp type text using dp::text;

create index if not exists multas_placa_idx on public.multas(placa);
create index if not exists multas_motorista_idx on public.multas(motorista);
create index if not exists multas_status_idx on public.multas(status);
create index if not exists multas_auto_idx on public.multas(auto);

alter table public.multas enable row level security;
drop policy if exists "multas_select_anon" on public.multas;
create policy "multas_select_anon" on public.multas for select to anon using (true);
drop policy if exists "multas_insert_anon" on public.multas;
create policy "multas_insert_anon" on public.multas for insert to anon with check (true);
drop policy if exists "multas_update_anon" on public.multas;
create policy "multas_update_anon" on public.multas for update to anon using (true) with check (true);
drop policy if exists "multas_delete_anon" on public.multas;
create policy "multas_delete_anon" on public.multas for delete to anon using (true);

-- -------------------------
-- Tabela: pontos
-- -------------------------
create table if not exists public.pontos (
  id bigint primary key,
  motorista text,
  data date,
  placa text,
  auto text,
  gravidade text,
  pontos integer default 0,
  aceitou text default 'Pendente',
  multa_id bigint,
  origem text
);

alter table public.pontos
  add column if not exists multa_id bigint,
  add column if not exists origem text;

create index if not exists pontos_motorista_idx on public.pontos(motorista);
create index if not exists pontos_placa_idx on public.pontos(placa);
create index if not exists pontos_multa_id_idx on public.pontos(multa_id);

alter table public.pontos enable row level security;
drop policy if exists "pontos_select_anon" on public.pontos;
create policy "pontos_select_anon" on public.pontos for select to anon using (true);
drop policy if exists "pontos_insert_anon" on public.pontos;
create policy "pontos_insert_anon" on public.pontos for insert to anon with check (true);
drop policy if exists "pontos_update_anon" on public.pontos;
create policy "pontos_update_anon" on public.pontos for update to anon using (true) with check (true);
drop policy if exists "pontos_delete_anon" on public.pontos;
create policy "pontos_delete_anon" on public.pontos for delete to anon using (true);

-- -------------------------
-- Tabela: formularios_defeito
-- -------------------------
create table if not exists public.formularios_defeito (
  id bigint primary key,
  mes text,
  data date,
  placa text,
  motorista text,
  defeito text,
  localizacao text,
  gravidade text default 'Baixa',
  status text default 'aberto',
  responsavel text,
  obs text,
  observacao text,
  anexo text,
  pagina integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.formularios_defeito
  add column if not exists mes text,
  add column if not exists data date,
  add column if not exists placa text,
  add column if not exists motorista text,
  add column if not exists defeito text,
  add column if not exists localizacao text,
  add column if not exists gravidade text default 'Baixa',
  add column if not exists status text default 'aberto',
  add column if not exists responsavel text,
  add column if not exists obs text,
  add column if not exists observacao text,
  add column if not exists anexo text,
  add column if not exists pagina integer,
  add column if not exists updated_at timestamptz default now();

create index if not exists formularios_defeito_data_idx on public.formularios_defeito(data desc);
create index if not exists formularios_defeito_placa_idx on public.formularios_defeito(placa);
create index if not exists formularios_defeito_status_idx on public.formularios_defeito(status);

alter table public.formularios_defeito enable row level security;
drop policy if exists "formularios_defeito_select_anon" on public.formularios_defeito;
create policy "formularios_defeito_select_anon" on public.formularios_defeito for select to anon using (true);
drop policy if exists "formularios_defeito_insert_anon" on public.formularios_defeito;
create policy "formularios_defeito_insert_anon" on public.formularios_defeito for insert to anon with check (true);
drop policy if exists "formularios_defeito_update_anon" on public.formularios_defeito;
create policy "formularios_defeito_update_anon" on public.formularios_defeito for update to anon using (true) with check (true);
drop policy if exists "formularios_defeito_delete_anon" on public.formularios_defeito;
create policy "formularios_defeito_delete_anon" on public.formularios_defeito for delete to anon using (true);

-- -------------------------
-- Tabela: anexos_frota
-- -------------------------
create table if not exists public.anexos_frota (
  id bigint generated by default as identity primary key,
  modulo text not null,
  registro_id bigint,
  placa text,
  titulo text,
  arquivo_url text not null,
  criado_em timestamptz not null default now()
);

alter table public.anexos_frota enable row level security;
drop policy if exists "anexos_frota_select_anon" on public.anexos_frota;
create policy "anexos_frota_select_anon" on public.anexos_frota for select to anon using (true);
drop policy if exists "anexos_frota_insert_anon" on public.anexos_frota;
create policy "anexos_frota_insert_anon" on public.anexos_frota for insert to anon with check (true);
drop policy if exists "anexos_frota_update_anon" on public.anexos_frota;
create policy "anexos_frota_update_anon" on public.anexos_frota for update to anon using (true) with check (true);
drop policy if exists "anexos_frota_delete_anon" on public.anexos_frota;
create policy "anexos_frota_delete_anon" on public.anexos_frota for delete to anon using (true);

-- -------------------------
-- Ajustes opcionais em tabelas já existentes no sistema
-- Não criam essas tabelas; apenas adicionam colunas se elas já existirem.
-- -------------------------
alter table if exists public.manutencoes add column if not exists anexo text;
alter table if exists public.producao_dia add column if not exists anexo text;
alter table if exists public.veiculos add column if not exists renavam text;
