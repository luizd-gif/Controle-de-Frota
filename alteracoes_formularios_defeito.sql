-- Tabela para a aba "Formulários de Defeito"
create table if not exists public.formularios_defeito (
  id bigint primary key,
  data date,
  mes text,
  placa text,
  motorista text,
  defeito text,
  localizacao text,
  gravidade text default 'Baixa',
  status text default 'aberto',
  responsavel text,
  observacao text,
  anexo text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.formularios_defeito enable row level security;

create policy if not exists "formularios_defeito_select_anon"
on public.formularios_defeito for select to anon using (true);

create policy if not exists "formularios_defeito_insert_anon"
on public.formularios_defeito for insert to anon with check (true);

create policy if not exists "formularios_defeito_update_anon"
on public.formularios_defeito for update to anon using (true) with check (true);

create policy if not exists "formularios_defeito_delete_anon"
on public.formularios_defeito for delete to anon using (true);

create index if not exists formularios_defeito_data_idx on public.formularios_defeito(data desc);
create index if not exists formularios_defeito_placa_idx on public.formularios_defeito(placa);
create index if not exists formularios_defeito_status_idx on public.formularios_defeito(status);
