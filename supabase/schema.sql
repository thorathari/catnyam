create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_key text not null unique,
  password_hash text not null,
  password_salt text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  best_score integer not null default 0 check (best_score >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index if not exists users_best_score_idx
  on public.users (best_score desc, username asc);

create index if not exists scores_user_created_idx
  on public.scores (user_id, created_at desc);

alter table public.users enable row level security;
alter table public.scores enable row level security;
