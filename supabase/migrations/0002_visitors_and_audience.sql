-- People who left their info on a card, and which audience (recruiter/student)
-- a view came from. Same access model as 0001: server only, RLS on, no policies.

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists visitors_profile_slug_idx on public.visitors (profile_slug, created_at desc);
alter table public.visitors enable row level security;

alter table public.view_events add column if not exists audience text check (audience in ('recruiter', 'student'));
