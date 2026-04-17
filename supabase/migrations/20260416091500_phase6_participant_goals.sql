alter table public.participants
add column if not exists goals jsonb not null default '[]'::jsonb;
