-- Adopt TAAZE讀冊生活's 5-tier secondhand book condition grading (the de
-- facto Taiwan industry standard; 誠品線上 itself has no distinct grading
-- system and consigns its used books through TAAZE) instead of our
-- original ad-hoc 4-tier scale. Also add original_price_cents so staff can
-- see a suggested price ceiling (TAAZE caps resale at 65% of list price).

alter table public.secondhand_items drop constraint secondhand_items_condition_check;
alter table public.secondhand_items add constraint secondhand_items_condition_check
  check (condition in ('brand_new', 'near_new', 'good', 'fair', 'poor'));

alter table public.secondhand_items
  add column original_price_cents int check (original_price_cents is null or original_price_cents >= 0);
