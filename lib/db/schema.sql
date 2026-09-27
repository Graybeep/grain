-- Run once in the Supabase SQL editor.
create table if not exists public.runs (
  id          text primary key,
  spec        jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Only the service-role key (server-side) touches this table.
alter table public.runs enable row level security;
