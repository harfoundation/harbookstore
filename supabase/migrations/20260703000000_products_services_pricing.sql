-- Generalize courses into paid/free "products & services" (courses, workshops,
-- diplomas, retreats, outreach, ministry services) with admin-settable price
-- and term. Diploma-style program_level fields are informational scheduling
-- metadata only — this system does NOT issue accredited qualifications; any
-- real TAFE-equivalent accreditation requires a registered training
-- organisation (RTO) partnership, tracked separately outside this app.

alter table public.courses
  add column price_cents int check (price_cents is null or price_cents >= 0),
  add column term_label text,
  add column service_category text not null default 'course'
    check (service_category in ('course', 'workshop', 'diploma', 'retreat', 'outreach', 'ministry_service')),
  add column program_level text
    check (program_level is null or program_level in (
      'certificate_i', 'certificate_ii', 'certificate_iii', 'certificate_iv',
      'diploma_1', 'diploma_2', 'diploma_3', 'diploma_4'
    )),
  add column accreditation_note text;

comment on column public.courses.program_level is
  'Informational scheduling label only — not an accredited qualification unless cross-referenced with a real RTO partnership.';

-- Course enrollment orders ---------------------------------------------------
-- Reuse the existing unified orders/order_items commerce backbone (already
-- handles retail/gift/group_buy pricing, admin payment confirmation, etc.)
-- rather than building a parallel checkout system for paid courses.

alter table public.orders
  drop constraint orders_order_type_check,
  add constraint orders_order_type_check
    check (order_type in ('retail', 'group_buy', 'gift', 'course_enrollment'));

alter table public.order_items
  add column course_id uuid references public.courses(id) on delete set null,
  add constraint order_items_exactly_one_product check (
    (book_id is not null and course_id is null) or (book_id is null and course_id is not null)
  );
