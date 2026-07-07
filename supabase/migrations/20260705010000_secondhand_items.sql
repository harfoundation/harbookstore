-- Second-hand goods (二手品選購): one-off donated/consigned physical items,
-- distinct from the new-book retail catalog (which tracks stock_qty, not
-- unique condition/provenance per copy). Sold through the existing
-- orders/order_items commerce backbone rather than a parallel checkout.

create table public.secondhand_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  category_id uuid references public.book_categories(id) on delete set null,
  condition text not null check (condition in ('like_new', 'good', 'fair', 'well_loved')),
  description text,
  price_cents int not null check (price_cents >= 0),
  cover_image_url text,
  branch_id uuid references public.branches(id) on delete set null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  submitted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index secondhand_items_status_idx on public.secondhand_items (status);

alter table public.secondhand_items enable row level security;

create trigger set_secondhand_items_updated_at
  before update on public.secondhand_items
  for each row execute function public.set_updated_at();

create policy "secondhand_items_public_read"
  on public.secondhand_items for select
  using (true);

create policy "secondhand_items_staff_write"
  on public.secondhand_items for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- Wire into the existing orders backbone --------------------------------

alter table public.orders
  drop constraint orders_order_type_check,
  add constraint orders_order_type_check
    check (order_type in ('retail', 'group_buy', 'gift', 'course_enrollment', 'secondhand'));

alter table public.order_items
  add column secondhand_item_id uuid references public.secondhand_items(id) on delete set null,
  drop constraint order_items_exactly_one_product,
  add constraint order_items_exactly_one_product check (
    (case when book_id is not null then 1 else 0 end)
    + (case when course_id is not null then 1 else 0 end)
    + (case when secondhand_item_id is not null then 1 else 0 end) = 1
  );

-- A second-hand item is one-off — reserve it atomically the moment an order
-- is placed (not just on payment confirmation), so two buyers can't both
-- order the same physical copy while the first payment is pending.
create or replace function public.reserve_secondhand_item_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.secondhand_item_id is not null then
    update public.secondhand_items
      set status = 'reserved', updated_at = now()
      where id = new.secondhand_item_id and status = 'available';
    if not found then
      raise exception 'This item is no longer available';
    end if;
  end if;
  return new;
end;
$$;

create trigger reserve_secondhand_item_on_order
  before insert on public.order_items
  for each row execute function public.reserve_secondhand_item_on_order();

create or replace function public.apply_secondhand_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_type = 'secondhand' and new.status is distinct from old.status then
    if new.status = 'confirmed' then
      update public.secondhand_items
        set status = 'sold', updated_at = now()
        where id = (
          select secondhand_item_id from public.order_items
          where order_id = new.id and secondhand_item_id is not null limit 1
        );
    elsif new.status = 'cancelled' then
      update public.secondhand_items
        set status = 'available', updated_at = now()
        where id = (
          select secondhand_item_id from public.order_items
          where order_id = new.id and secondhand_item_id is not null limit 1
        )
        and status = 'reserved';
    end if;
  end if;
  return new;
end;
$$;

create trigger apply_secondhand_order_status
  after update on public.orders
  for each row execute function public.apply_secondhand_order_status();
