create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  abn text,
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  role text not null default 'support_worker',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint workers_organisation_email_key unique (organisation_id, email)
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  date_of_birth date,
  ndis_number text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint participants_organisation_ndis_number_key unique (organisation_id, ndis_number)
);

create table if not exists public.progress_notes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  worker_id uuid references public.workers(id) on delete set null,
  title text,
  body text not null,
  note_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  worker_id uuid references public.workers(id) on delete set null,
  reference text,
  claim_date date not null default current_date,
  amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.participant_reports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  worker_id uuid references public.workers(id) on delete set null,
  title text not null,
  report_type text not null,
  status text not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists workers_organisation_id_idx
  on public.workers (organisation_id);

create index if not exists participants_organisation_id_idx
  on public.participants (organisation_id);

create index if not exists progress_notes_organisation_id_idx
  on public.progress_notes (organisation_id);

create index if not exists progress_notes_participant_id_idx
  on public.progress_notes (participant_id);

create index if not exists progress_notes_worker_id_idx
  on public.progress_notes (worker_id);

create index if not exists claims_organisation_id_idx
  on public.claims (organisation_id);

create index if not exists claims_participant_id_idx
  on public.claims (participant_id);

create index if not exists claims_worker_id_idx
  on public.claims (worker_id);

create index if not exists participant_reports_organisation_id_idx
  on public.participant_reports (organisation_id);

create index if not exists participant_reports_participant_id_idx
  on public.participant_reports (participant_id);

create index if not exists participant_reports_worker_id_idx
  on public.participant_reports (worker_id);

create or replace function public.phase3_table_check(expected_tables text[])
returns jsonb
language sql
security definer
set search_path = public
as $$
  with matched as (
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name = any(expected_tables)
  )
  select jsonb_build_object(
    'existing_tables', coalesce(jsonb_agg(matched.table_name order by matched.table_name), '[]'::jsonb),
    'missing_tables', (
      select coalesce(jsonb_agg(expected_name order by expected_name), '[]'::jsonb)
      from (
        select unnest(expected_tables) as expected_name
        except
        select table_name from matched
      ) missing
    )
  )
  from matched;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'organisations',
    'workers',
    'participants',
    'progress_notes',
    'claims',
    'participant_reports'
  ]
  loop
    execute format('alter table public.%I enable row level security', target_table);

    execute format('drop policy if exists "%s_authenticated_manage" on public.%I', target_table, target_table);
    execute format(
      'create policy "%s_authenticated_manage" on public.%I for all to authenticated using (true) with check (true)',
      target_table,
      target_table
    );

    execute format('drop trigger if exists set_%s_updated_at on public.%I', target_table, target_table);
    execute format(
      'create trigger set_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      target_table,
      target_table
    );
  end loop;
end
$$;
