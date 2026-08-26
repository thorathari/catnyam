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

alter table public.users
  add column if not exists coins integer not null default 0;

alter table public.users
  add column if not exists gacha_tickets integer not null default 0;

alter table public.users
  add column if not exists attendance_streak integer not null default 0;

alter table public.users
  add column if not exists attendance_last_date date;

alter table public.users
  add column if not exists owned_characters jsonb not null default '["calico"]'::jsonb;

alter table public.users
  add column if not exists owned_companions jsonb not null default '[]'::jsonb;

alter table public.users
  add column if not exists owned_backgrounds jsonb not null default '["village"]'::jsonb;

alter table public.users
  add column if not exists equipped_character text not null default 'calico';

alter table public.users
  add column if not exists equipped_companion_left text;

alter table public.users
  add column if not exists equipped_companion_right text;

alter table public.users
  add column if not exists equipped_background text not null default 'village';

update public.users
set
  coins = greatest(coalesce(coins, 0), 0),
  gacha_tickets = greatest(coalesce(gacha_tickets, 0), 0),
  attendance_streak = case
    when attendance_streak between 1 and 7 then attendance_streak
    else 0
  end,
  owned_characters = case
    when owned_characters is null or jsonb_typeof(owned_characters) <> 'array' then '["calico"]'::jsonb
    when not (owned_characters ? 'calico') then owned_characters || '["calico"]'::jsonb
    else owned_characters
  end,
  owned_companions = case
    when owned_companions is null or jsonb_typeof(owned_companions) <> 'array' then '[]'::jsonb
    else owned_companions
  end,
  owned_backgrounds = case
    when owned_backgrounds is null or jsonb_typeof(owned_backgrounds) <> 'array' then '["village"]'::jsonb
    when not (owned_backgrounds ? 'village') then owned_backgrounds || '["village"]'::jsonb
    else owned_backgrounds
  end,
  equipped_character = coalesce(nullif(equipped_character, ''), 'calico'),
  equipped_background = coalesce(nullif(equipped_background, ''), 'village');

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  score integer not null check (score >= 0),
  game_mode text not null default 'churu' check (game_mode in ('churu', 'bomb')),
  play_seconds integer check (play_seconds is null or play_seconds >= 0),
  created_at timestamptz not null default now()
);

alter table public.scores
  add column if not exists game_mode text;

alter table public.scores
  add column if not exists play_seconds integer;

update public.scores
set game_mode = 'churu'
where game_mode is null or game_mode not in ('churu', 'bomb');

alter table public.scores
  alter column game_mode set default 'churu',
  alter column game_mode set not null;

do $$
begin
  alter table public.scores
    add constraint scores_game_mode_check check (game_mode in ('churu', 'bomb'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.scores
    add constraint scores_play_seconds_check check (play_seconds is null or play_seconds >= 0);
exception
  when duplicate_object then null;
end $$;

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null,
  seed text not null,
  game_mode text not null default 'churu' check (game_mode in ('churu', 'bomb')),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  submitted_score integer,
  created_at timestamptz not null default now()
);

alter table public.game_sessions
  add column if not exists seed text;

alter table public.game_sessions
  add column if not exists game_mode text;

alter table public.game_sessions
  add column if not exists loadout jsonb;

update public.game_sessions
set game_mode = 'churu'
where game_mode is null or game_mode not in ('churu', 'bomb');

alter table public.game_sessions
  alter column game_mode set default 'churu',
  alter column game_mode set not null;

do $$
begin
  alter table public.game_sessions
    add constraint game_sessions_game_mode_check check (game_mode in ('churu', 'bomb'));
exception
  when duplicate_object then null;
end $$;

create index if not exists users_best_score_idx
  on public.users (best_score desc, username asc);

create index if not exists scores_user_created_idx
  on public.scores (user_id, created_at desc);

create index if not exists scores_game_mode_score_idx
  on public.scores (game_mode, score desc, created_at asc);

create index if not exists scores_game_mode_created_idx
  on public.scores (game_mode, created_at desc);

create index if not exists game_sessions_user_started_idx
  on public.game_sessions (user_id, started_at desc);

alter table public.users enable row level security;
alter table public.scores enable row level security;
alter table public.game_sessions enable row level security;
