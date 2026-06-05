-- Alterações opcionais para pontos automáticos ao adicionar multa
-- Rode no Supabase caso a tabela public.pontos ainda não exista ou esteja incompleta.

create table if not exists public.pontos (
  id bigint primary key,
  motorista text,
  data date,
  placa text,
  auto text,
  gravidade text,
  pontos integer default 0,
  aceitou text default 'Pendente'
);

alter table public.pontos enable row level security;

create policy if not exists "Permitir leitura publica pontos"
on public.pontos
for select
to anon
using (true);

create policy if not exists "Permitir inserir pontos"
on public.pontos
for insert
to anon
with check (true);

create policy if not exists "Permitir atualizar pontos"
on public.pontos
for update
to anon
using (true)
with check (true);

create policy if not exists "Permitir deletar pontos"
on public.pontos
for delete
to anon
using (true);
