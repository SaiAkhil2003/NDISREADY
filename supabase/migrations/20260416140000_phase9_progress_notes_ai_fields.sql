alter table public.progress_notes
  add column if not exists raw_input text,
  add column if not exists ai_draft text,
  add column if not exists final_note text,
  add column if not exists goals_addressed jsonb not null default '[]'::jsonb,
  add column if not exists approved_at timestamptz;

update public.progress_notes
set
  raw_input = coalesce(raw_input, body),
  ai_draft = coalesce(ai_draft, body),
  final_note = coalesce(final_note, body),
  goals_addressed = coalesce(goals_addressed, '[]'::jsonb)
where
  raw_input is null
  or ai_draft is null
  or final_note is null
  or goals_addressed is null;
