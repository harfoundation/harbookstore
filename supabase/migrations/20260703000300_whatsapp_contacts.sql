-- WhatsApp contact directory (CRM-style import only — no live WhatsApp
-- Business API integration yet). Fields beyond the basics are reserved so a
-- future broadcast-messaging integration doesn't need a schema migration:
-- opt_in tracks consent to be messaged, tags supports audience segmentation,
-- last_broadcast_sent_at/last_broadcast_status are written by that future
-- integration and are no-ops today.

create table public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  display_name text,
  profile_id uuid references public.profiles(id) on delete set null,
  tags text[] not null default '{}',
  opt_in boolean not null default false,
  source text not null default 'manual' check (source in ('manual', 'csv_import', 'platform_signup')),
  imported_by uuid references public.profiles(id) on delete set null,
  last_broadcast_sent_at timestamptz,
  last_broadcast_status text,
  notes text,
  created_at timestamptz not null default now()
);

create index whatsapp_contacts_profile_id_idx on public.whatsapp_contacts (profile_id);

alter table public.whatsapp_contacts enable row level security;

create policy "whatsapp_contacts_staff_only"
  on public.whatsapp_contacts for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));
