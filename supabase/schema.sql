create extension if not exists "pgcrypto";

create table if not exists public.income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null,
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric not null,
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric not null,
  saved_amount numeric not null default 0,
  deadline date,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric not null,
  item_type text not null check (item_type in ('want', 'need')),
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_name text not null,
  asset_type text not null check (asset_type in ('stock', 'crypto', 'gold', 'fund', 'real_estate', 'other')),
  quantity numeric not null,
  buy_price numeric not null,
  current_price numeric,
  platform text,
  purchase_date date not null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.income enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.investments enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;

drop policy if exists "income_select_own" on public.income;
drop policy if exists "income_insert_own" on public.income;
drop policy if exists "income_update_own" on public.income;
drop policy if exists "income_delete_own" on public.income;
create policy "income_select_own" on public.income for select using (auth.uid() = user_id);
create policy "income_insert_own" on public.income for insert with check (auth.uid() = user_id);
create policy "income_update_own" on public.income for update using (auth.uid() = user_id);
create policy "income_delete_own" on public.income for delete using (auth.uid() = user_id);

drop policy if exists "expenses_select_own" on public.expenses;
drop policy if exists "expenses_insert_own" on public.expenses;
drop policy if exists "expenses_update_own" on public.expenses;
drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);

drop policy if exists "goals_select_own" on public.goals;
drop policy if exists "goals_insert_own" on public.goals;
drop policy if exists "goals_update_own" on public.goals;
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

drop policy if exists "wishlist_select_own" on public.wishlist_items;
drop policy if exists "wishlist_insert_own" on public.wishlist_items;
drop policy if exists "wishlist_update_own" on public.wishlist_items;
drop policy if exists "wishlist_delete_own" on public.wishlist_items;
create policy "wishlist_select_own" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "wishlist_insert_own" on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "wishlist_update_own" on public.wishlist_items for update using (auth.uid() = user_id);
create policy "wishlist_delete_own" on public.wishlist_items for delete using (auth.uid() = user_id);

drop policy if exists "investments_select_own" on public.investments;
drop policy if exists "investments_insert_own" on public.investments;
drop policy if exists "investments_update_own" on public.investments;
drop policy if exists "investments_delete_own" on public.investments;
create policy "investments_select_own" on public.investments for select using (auth.uid() = user_id);
create policy "investments_insert_own" on public.investments for insert with check (auth.uid() = user_id);
create policy "investments_update_own" on public.investments for update using (auth.uid() = user_id);
create policy "investments_delete_own" on public.investments for delete using (auth.uid() = user_id);

drop policy if exists "sessions_select_own" on public.ai_chat_sessions;
drop policy if exists "sessions_insert_own" on public.ai_chat_sessions;
drop policy if exists "sessions_update_own" on public.ai_chat_sessions;
drop policy if exists "sessions_delete_own" on public.ai_chat_sessions;
create policy "sessions_select_own" on public.ai_chat_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.ai_chat_sessions for insert with check (auth.uid() = user_id);
create policy "sessions_update_own" on public.ai_chat_sessions for update using (auth.uid() = user_id);
create policy "sessions_delete_own" on public.ai_chat_sessions for delete using (auth.uid() = user_id);

drop policy if exists "messages_select_own" on public.ai_chat_messages;
drop policy if exists "messages_insert_own" on public.ai_chat_messages;
drop policy if exists "messages_delete_own" on public.ai_chat_messages;
create policy "messages_select_own" on public.ai_chat_messages
for select using (
  exists (
    select 1 from public.ai_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);
create policy "messages_insert_own" on public.ai_chat_messages
for insert with check (
  exists (
    select 1 from public.ai_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);
create policy "messages_delete_own" on public.ai_chat_messages
for delete using (
  exists (
    select 1 from public.ai_chat_sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);
