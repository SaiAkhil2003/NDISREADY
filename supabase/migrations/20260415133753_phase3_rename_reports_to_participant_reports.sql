do $$
begin
  if to_regclass('public.reports') is not null
     and to_regclass('public.participant_reports') is null then
    alter table public.reports rename to participant_reports;
  end if;
end
$$;

alter index if exists public.reports_organisation_id_idx
  rename to participant_reports_organisation_id_idx;

alter index if exists public.reports_participant_id_idx
  rename to participant_reports_participant_id_idx;

alter index if exists public.reports_worker_id_idx
  rename to participant_reports_worker_id_idx;

drop policy if exists "reports_authenticated_manage" on public.participant_reports;
drop policy if exists "participant_reports_authenticated_manage" on public.participant_reports;

create policy "participant_reports_authenticated_manage"
on public.participant_reports
for all
to authenticated
using (true)
with check (true);

drop trigger if exists set_reports_updated_at on public.participant_reports;
drop trigger if exists set_participant_reports_updated_at on public.participant_reports;

create trigger set_participant_reports_updated_at
before update on public.participant_reports
for each row
execute function public.set_updated_at();
