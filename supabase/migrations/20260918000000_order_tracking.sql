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
