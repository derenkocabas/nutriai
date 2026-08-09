-- Supabase SQL Editor'de çalıştır (Project > SQL Editor > New query)

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age int,
  sex text,
  height_cm numeric,
  weight_kg numeric,
  activity_level text,
  goal text,
  restrictions text,
  bmi numeric,
  body_fat_percent numeric,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);
