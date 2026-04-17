alter table public.claims
  add column if not exists support_hours numeric(6,2),
  add column if not exists service_code text,
  add column if not exists notes text;

update public.claims
set
  notes = coalesce(notes, reference),
  support_hours = coalesce(support_hours, null),
  service_code = coalesce(service_code, null)
where
  notes is null
  or support_hours is null
  or service_code is null;
