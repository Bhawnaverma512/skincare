-- Customer reviews (product pages) and customer messages / problem reports (/contact).
-- Run once in the Supabase SQL Editor.

-- ─── Reviews ────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 60),
  rating smallint not null check (rating between 1 and 5),
  title text check (title is null or char_length(title) <= 100),
  body text not null check (char_length(body) between 10 and 2000),
  created_at timestamptz not null default now(),
  -- One review per customer per product; they can delete and rewrite it.
  unique (product_id, user_id)
);

create index if not exists reviews_product_id_idx on public.reviews (product_id, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Anyone can read reviews" on public.reviews;
create policy "Anyone can read reviews"
  on public.reviews for select
  to anon, authenticated
  using (true);

drop policy if exists "Customers can write their own review" on public.reviews;
create policy "Customers can write their own review"
  on public.reviews for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Customers can delete their own review" on public.reviews;
create policy "Customers can delete their own review"
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.reviews to anon, authenticated;
grant insert, delete on public.reviews to authenticated;

-- ─── Customer messages & problem reports ───────────────────────────────────
-- Read and manage these in Table Editor → customer_messages. Set status to
-- 'resolved' once you've replied.
create table if not exists public.customer_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) <= 254),
  topic text not null check (char_length(topic) <= 60),
  order_number text check (order_number is null or char_length(order_number) <= 20),
  message text not null check (char_length(message) between 10 and 4000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists customer_messages_created_at_idx
  on public.customer_messages (created_at desc);

alter table public.customer_messages enable row level security;

-- Anyone can send a message; nobody can read them from the website.
drop policy if exists "Anyone can send a message" on public.customer_messages;
create policy "Anyone can send a message"
  on public.customer_messages for insert
  to anon, authenticated
  with check (
    status = 'open'
    and (user_id is null or user_id = (select auth.uid()))
  );

grant insert on public.customer_messages to anon, authenticated;
