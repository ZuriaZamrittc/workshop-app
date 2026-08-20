-- ════════════════════════════════════════════════════════════════
-- Car marketplace schema
-- Run this ONCE in your Supabase project's SQL editor.
-- Safe to re-run by accident: every statement is guarded.
-- Contains NO destructive statements (no drop / truncate / delete).
--
-- READ THIS FIRST — this table's read rule is the OPPOSITE of `items`.
-- `items` is private: you can only read your own rows.
-- `cars` is a shop window: ANYONE may read every listing, signed in
-- or not. That is what makes it a marketplace. Writing stays
-- owner-only. Never store anything private in this table.
-- ════════════════════════════════════════════════════════════════

-- 1) The cars table — one row per listing, owned by exactly one seller.
--    seller_id is the owner column: it links each listing to a user.
create table if not exists public.cars (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references auth.users (id) on delete cascade,
  make        text not null check (char_length(make) between 1 and 60),
  model       text not null check (char_length(model) between 1 and 60),
  year        int  not null check (year between 1900 and 2100),
  price       numeric(12,2) not null check (price >= 0),
  mileage     int  check (mileage is null or mileage >= 0),
  condition   text not null default 'used' check (condition in ('new', 'used')),
  description text check (description is null or char_length(description) <= 2000),
  status      text not null default 'available' check (status in ('available', 'sold')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2) Indexes — one per query the app actually runs.
--    Browse page: available listings, newest first.
create index if not exists cars_status_created_idx
  on public.cars (status, created_at desc);

--    Seller dashboard: "my listings", newest first.
create index if not exists cars_seller_created_idx
  on public.cars (seller_id, created_at desc);

--    Make filter: lower() so a case-insensitive search can use it.
create index if not exists cars_make_lower_idx
  on public.cars (lower(make));

--    Price-range filter.
create index if not exists cars_price_idx
  on public.cars (price);

-- 3) Row Level Security. The DATABASE decides who may do what —
--    not the app, and not the browser.
alter table public.cars enable row level security;

-- 4) Four policies. READ is public; every WRITE is owner-only.
--    auth.uid() is the id of whoever is signed in right now.
--    It is null for a signed-out visitor, so the write policies below
--    reject anonymous writes automatically.
do $$
begin
  -- SELECT: deliberately open to everyone, including signed-out visitors.
  -- This is the one policy that differs from the `items` table.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'cars'
                   and policyname = 'cars_select_public') then
    create policy cars_select_public on public.cars
      for select using (true);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'cars'
                   and policyname = 'cars_insert_own') then
    create policy cars_insert_own on public.cars
      for insert with check (auth.uid() = seller_id);
  end if;

  -- update checks BOTH the old row (using) and the new row (with check),
  -- so nobody can re-assign a listing to another seller.
  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'cars'
                   and policyname = 'cars_update_own') then
    create policy cars_update_own on public.cars
      for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
  end if;

  if not exists (select 1 from pg_policies
                 where schemaname = 'public' and tablename = 'cars'
                   and policyname = 'cars_delete_own') then
    create policy cars_delete_own on public.cars
      for delete using (auth.uid() = seller_id);
  end if;
end $$;

-- 5) Keep updated_at fresh whenever a listing is edited.
--    This function already exists if you ran workshop-schema.sql;
--    re-declaring it is harmless and makes this file standalone.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();
