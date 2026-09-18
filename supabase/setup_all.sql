-- Beauty Glow: complete database setup (orders, order tracking, reviews, customer messages).
-- Paste this whole file into Supabase → SQL Editor and click Run. Safe to run more than once.


-- ═══ 20260917000000_create_orders.sql ═══
-- Orders placed through the website checkout (/checkout).
-- Run once in the Supabase SQL Editor.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  delivery_method text not null check (delivery_method in ('standard', 'express')),
  payment_method text not null check (payment_method in ('cod')),
  -- [{ "id", "name", "price", "quantity" }] as shown to the customer at checkout
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping numeric(10, 2) not null check (shipping >= 0),
  total numeric(10, 2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Guests and logged-in customers can place orders. New orders always start as
-- "pending", and an order can only be linked to the account that placed it.
drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and (user_id is null or user_id = (select auth.uid()))
  );

-- Logged-in customers can see their own orders. Nobody can update or delete
-- orders from the website; manage them in the Supabase dashboard.
drop policy if exists "Customers can view their own orders" on public.orders;
create policy "Customers can view their own orders"
  on public.orders
  for select
  to authenticated
  using (user_id = (select auth.uid()));

grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;

-- ═══ 20260918000000_order_tracking.sql ═══
-- Order tracking for the /track page.
-- Run once in the Supabase SQL Editor, after 20260917000000_create_orders.sql.
--
-- To move an order along, edit its row in Table Editor → orders:
--   status: pending → confirmed → shipped → delivered (or cancelled)
--   courier / tracking_number: fill these in when you ship.
-- The matching *_at timestamp is filled in automatically.

alter table public.orders
  add column if not exists courier text,
  add column if not exists tracking_number text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists cancelled_at timestamptz;

create or replace function public.stamp_order_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    case new.status
      when 'confirmed' then new.confirmed_at := coalesce(new.confirmed_at, now());
      when 'shipped' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
        new.shipped_at := coalesce(new.shipped_at, now());
      when 'delivered' then
        new.confirmed_at := coalesce(new.confirmed_at, now());
        new.shipped_at := coalesce(new.shipped_at, now());
        new.delivered_at := coalesce(new.delivered_at, now());
      when 'cancelled' then new.cancelled_at := coalesce(new.cancelled_at, now());
      else null;
    end case;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_stamp_status on public.orders;
create trigger orders_stamp_status
  before update of status on public.orders
  for each row execute function public.stamp_order_status();

-- Lets anyone look up one order by its order number (BG-XXXX-XXXX, hard to
-- guess). Returns no name, email, address or phone details.
drop function if exists public.track_order(text, text);
create or replace function public.track_order(p_order_number text)
returns table (
  order_number text,
  status text,
  delivery_method text,
  items jsonb,
  subtotal numeric,
  shipping numeric,
  total numeric,
  city text,
  state text,
  courier text,
  tracking_number text,
  created_at timestamptz,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.order_number, o.status, o.delivery_method, o.items, o.subtotal, o.shipping,
         o.total, o.city, o.state, o.courier, o.tracking_number, o.created_at,
         o.confirmed_at, o.shipped_at, o.delivered_at, o.cancelled_at
  from public.orders o
  where o.order_number = upper(trim(p_order_number))
  limit 1;
$$;

revoke all on function public.track_order(text) from public;
grant execute on function public.track_order(text) to anon, authenticated;

-- ═══ 20260918010000_reviews_and_customer_messages.sql ═══
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
