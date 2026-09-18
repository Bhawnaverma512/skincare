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
