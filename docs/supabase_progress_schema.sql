-- Progress tracking schema for Beatful (Supabase)
-- Create tables, indexes, triggers, and RLS policies.

create extension if not exists pgcrypto;

create table if not exists public.progress_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  mode_id text,
  protocol_id text,
  name text,
  beat_frequency numeric(7,3),
  carrier_left numeric(7,3),
  carrier_right numeric(7,3),
  duration_seconds integer not null check (duration_seconds >= 0),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  completed boolean not null default false,
  rating integer check (rating between 1 and 5),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint at_least_one_owner check (user_id is not null or device_id is not null)
);

create index if not exists progress_sessions_user_id_idx on public.progress_sessions(user_id);
create index if not exists progress_sessions_device_id_idx on public.progress_sessions(device_id);
create index if not exists progress_sessions_started_at_idx on public.progress_sessions(started_at desc);

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.progress_sessions;
create trigger set_updated_at
before update on public.progress_sessions
for each row
execute function public.tg_set_updated_at();

alter table public.progress_sessions enable row level security;

drop policy if exists "Users manage own sessions" on public.progress_sessions;
create policy "Users manage own sessions"
on public.progress_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Device manages own sessions" on public.progress_sessions;
create policy "Device manages own sessions"
on public.progress_sessions
for all
to anon
using (
  (current_setting('request.headers', true)::json ->> 'x-device-id') is not null
  and device_id = (current_setting('request.headers', true)::json ->> 'x-device-id')
)
with check (
  device_id = (current_setting('request.headers', true)::json ->> 'x-device-id')
);

create or replace view public.progress_daily_totals
as
select
  coalesce(user_id::text, device_id) as owner_key,
  date_trunc('day', started_at)::date as day,
  count(*) as sessions,
  sum(duration_seconds) filter (where completed) as total_completed_seconds,
  sum(duration_seconds) as total_logged_seconds
from public.progress_sessions
group by 1, 2;

