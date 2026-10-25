-- Tapfolio schema. Only the Next.js server talks to these tables, using the
-- service role key, so RLS is on with no policies (clients get no direct access).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  -- SHA-256 of the owner's secret token (held by their phone); never the token itself.
  owner_token_hash text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists profiles_owner_token_hash_idx on public.profiles (owner_token_hash);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  profile_slug text not null,
  data jsonb not null,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists conversations_profile_slug_idx on public.conversations (profile_slug, started_at desc);

create table if not exists public.view_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  slug text not null,
  conversation_id uuid,
  type text not null check (type in ('open', 'dwell', 'click')),
  target text not null,
  label text not null default '',
  ms integer,
  event_name text,
  user_agent text,
  at timestamptz not null default now()
);
create index if not exists view_events_slug_at_idx on public.view_events (slug, at desc);
create index if not exists view_events_conversation_idx on public.view_events (conversation_id);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.view_events enable row level security;

-- Photos, resumes, and demo videos. Public read (recruiters open them); writes
-- only through server-issued signed upload URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  true,
  209715200,
  array['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'video/quicktime']
)
on conflict (id) do nothing;
