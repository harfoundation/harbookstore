-- Group-buy pricing alongside the existing retail price_cents, plus the
-- minimum quantity a group-buy needs to hit before the group price applies.

alter table public.books
  add column group_buy_price_cents int check (group_buy_price_cents is null or group_buy_price_cents >= 0),
  add column group_buy_min_qty int check (group_buy_min_qty is null or group_buy_min_qty > 0);
