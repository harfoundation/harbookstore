-- group_buys ------------------------------------------------------------

create table public.group_buys (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  target_qty int not null check (target_qty > 0),
  current_qty int not null default 0 check (current_qty >= 0),
  status text not null default 'open' check (status in ('open', 'reached', 'closed', 'cancelled')),
  closes_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.group_buys enable row level security;

create policy "group_buys_public_read"
  on public.group_buys for select
  using (true);

create policy "group_buys_admin_write"
  on public.group_buys for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- orders ------------------------------------------------------------------
-- Unified retail / group-buy / gift order. No live payment processing in MVP:
-- buyer sees bank-transfer instructions, admin manually confirms payment.

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('HB-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0')),
  buyer_id uuid references public.profiles(id) on delete set null,
  order_type text not null default 'retail' check (order_type in ('retail', 'group_buy', 'gift')),
  group_buy_id uuid references public.group_buys(id) on delete set null,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'fulfilled', 'cancelled')),
  payment_method text not null default 'to_be_arranged'
    check (payment_method in ('bank_transfer', 'in_person', 'to_be_arranged')),
  payment_received_at timestamptz,
  subtotal_cents int not null default 0 check (subtotal_cents >= 0),
  currency text not null default 'AUD',
  -- gift-only fields
  recipient_name text,
  recipient_email text,
  recipient_address text,
  dedication_card_message text,
  gift_delivery_method text check (gift_delivery_method in ('self_pickup', 'mail', 'digital_card_only')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gift_fields_only_for_gift_orders check (
    order_type = 'gift' or (
      recipient_name is null and recipient_email is null and recipient_address is null
      and dedication_card_message is null and gift_delivery_method is null
    )
  )
);

create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_status_idx on public.orders (status);

alter table public.orders enable row level security;

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create policy "orders_owner_or_staff_read"
  on public.orders for select
  using (auth.uid() = buyer_id or public.is_staff(auth.uid()));

create policy "orders_owner_insert"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "orders_owner_or_admin_update"
  on public.orders for update
  using (auth.uid() = buyer_id or public.is_admin(auth.uid()))
  with check (auth.uid() = buyer_id or public.is_admin(auth.uid()));

-- Column-level guard: only admins may change status / payment fields.
-- (RLS is row-level only, so this is enforced via a trigger.)
create or replace function public.enforce_order_update_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    if new.status is distinct from old.status
      or new.payment_received_at is distinct from old.payment_received_at
      or new.payment_method is distinct from old.payment_method
    then
      raise exception 'Only staff may change order status or payment fields';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_orders_update_permissions
  before update on public.orders
  for each row execute function public.enforce_order_update_permissions();

-- order_items ---------------------------------------------------------------

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  unit_price_cents int not null check (unit_price_cents >= 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items_owner_or_staff_read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.buyer_id = auth.uid() or public.is_staff(auth.uid()))
    )
  );

create policy "order_items_owner_insert"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

-- Group-buy quantity is only ever moved by this trigger (never directly by
-- the client), to avoid tampering/race conditions on the progress count.

create or replace function public.apply_group_buy_order_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ordered_qty int;
begin
  if new.order_type = 'group_buy' and new.group_buy_id is not null
     and new.status = 'confirmed' and old.status is distinct from 'confirmed'
  then
    select coalesce(sum(quantity), 0) into ordered_qty
    from public.order_items where order_id = new.id;

    update public.group_buys
      set current_qty = current_qty + ordered_qty,
          status = case
            when current_qty + ordered_qty >= target_qty then 'reached'
            else status
          end
      where id = new.group_buy_id;
  end if;
  return new;
end;
$$;

create trigger apply_group_buy_order_confirmation
  after update on public.orders
  for each row execute function public.apply_group_buy_order_confirmation();
