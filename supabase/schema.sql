create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_key text not null unique,
  nickname text not null default '',
  password_hash text not null,
  password_salt text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  best_score integer not null default 0 check (best_score >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.users
  add column if not exists nickname text;

alter table public.users
  add column if not exists last_login_at timestamptz;

update public.users
set nickname = username
where nickname is null or btrim(nickname) = '';

alter table public.users
  alter column nickname set default '',
  alter column nickname set not null;

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  seed text not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  submitted_score integer,
  created_at timestamptz not null default now()
);

alter table public.game_sessions
  add column if not exists seed text;

create index if not exists users_best_score_idx
  on public.users (best_score desc, username asc);

create index if not exists scores_user_created_idx
  on public.scores (user_id, created_at desc);

create index if not exists game_sessions_user_started_idx
  on public.game_sessions (user_id, started_at desc);

alter table public.users enable row level security;
alter table public.scores enable row level security;
alter table public.game_sessions enable row level security;
