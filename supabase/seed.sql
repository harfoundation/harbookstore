-- Dev-only seed data. Applied automatically by `supabase db reset`.
-- The 50-book catalog itself is loaded separately via `pnpm db:seed:books`
-- (scripts/seed/import-books.ts), since it needs to look up category ids by
-- slug and is more maintainable as an idempotent upsert than raw SQL.

insert into public.book_categories (slug, name_zh, subtitle_zh, sort_order) values
  ('qibu',    '起步', '回到耶穌，建立根基',                 1),
  ('renwu',   '人物', '跟著生命榜樣同行',                   2),
  ('jiaohui', '教會', '群體被更新，使命更清晰',             3),
  ('tianguo', '天國', '把信仰放回上帝國度的坐標',           4),
  ('gengxin', '更新', '重新整理信仰骨架',                   5),
  ('menxun',  '門訓', '門徒訓練：讓福音「點燃」生命',       6),
  ('zhichang','職場', '把召命帶進日常工作',                 7),
  ('zhenghe', '整合', '福音、文化、婚姻與工作',             8),
  ('buquan',  '補全', '把生命收束成「可持續」的節奏',       9)
on conflict (slug) do nothing;

insert into public.preference_tags (slug, label_zh, sort_order) values
  ('discipleship', '門徒生活', 1),
  ('bible-study',  '聖經與神學', 2),
  ('church-life',  '教會生活', 3),
  ('workplace',    '職場信仰', 4),
  ('marriage-family', '婚姻家庭', 5),
  ('spiritual-formation', '靈性塑造', 6),
  ('leadership',   '領導與服事', 7)
on conflict (slug) do nothing;
