create extension if not exists pgcrypto;

create type public.admin_role as enum ('admin');
create type public.enquiry_status as enum ('unread', 'read');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  brand_name text not null,
  tagline text not null,
  owner_name text not null,
  business_type text not null,
  hero_eyebrow text not null,
  hero_heading text not null,
  hero_highlight text not null,
  hero_lead text not null,
  hero_subline text not null,
  about_intro text not null,
  about_detail text not null,
  mission text not null,
  vision text not null,
  email text not null,
  phone_primary text not null,
  phone_secondary text not null,
  whatsapp_number text not null,
  location text not null,
  pin text not null,
  maps_url text,
  gst_number text,
  udyam_number text,
  iec_number text,
  logo_url text not null default '/images/logo.png',
  hero_image_url text not null default '/images/whole-spices-hero.png',
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  updated_at timestamptz not null default now()
);

create table public.site_list_items (
  id uuid primary key default gen_random_uuid(),
  list_type text not null check (list_type in ('why_choose_us', 'quality_claim')),
  content text not null,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (list_type, position)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'website-media',
  storage_path text not null unique,
  public_url text not null,
  alt_text text not null default '',
  mime_type text not null,
  file_size bigint not null check (file_size >= 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  local_name text not null,
  description text not null,
  image_url text not null,
  rate numeric(12,2),
  unit text,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  enquiry_type text not null check (enquiry_type in ('contact', 'export')),
  name text not null,
  company_name text,
  email text not null,
  phone text not null,
  country text not null,
  product_name text not null,
  required_quantity text not null,
  packaging_requirement text,
  message text,
  status public.enquiry_status not null default 'unread',
  created_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger site_settings_updated_at before update on public.site_settings for each row execute procedure public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute procedure public.set_updated_at();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.admin_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_list_items enable row level security;
alter table public.media_assets enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;
alter table public.admin_audit_log enable row level security;

create policy "admins can view their own profile" on public.admin_profiles for select using (id = auth.uid());
create policy "public can view settings" on public.site_settings for select using (true);
create policy "admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "public can view lists" on public.site_list_items for select using (true);
create policy "admins manage lists" on public.site_list_items for all using (public.is_admin()) with check (public.is_admin());
create policy "public can view active products" on public.products for select using (is_active = true);
create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage media metadata" on public.media_assets for all using (public.is_admin()) with check (public.is_admin());
create policy "public can insert enquiries" on public.enquiries for insert with check (true);
create policy "admins manage enquiries" on public.enquiries for select using (public.is_admin());
create policy "admins update enquiries" on public.enquiries for update using (public.is_admin()) with check (public.is_admin());
create policy "admins delete enquiries" on public.enquiries for delete using (public.is_admin());
create policy "admins read audit log" on public.admin_audit_log for select using (public.is_admin());

insert into storage.buckets (id, name, public) values ('website-media', 'website-media', true) on conflict (id) do nothing;
create policy "public can view website media" on storage.objects for select using (bucket_id = 'website-media');
create policy "admins manage website media" on storage.objects for all using (bucket_id = 'website-media' and public.is_admin()) with check (bucket_id = 'website-media' and public.is_admin());

insert into public.site_settings (id, brand_name, tagline, owner_name, business_type, hero_eyebrow, hero_heading, hero_highlight, hero_lead, hero_subline, about_intro, about_detail, mission, vision, email, phone_primary, phone_secondary, whatsapp_number, location, pin)
values (true, 'SAMIRAQ GLOBAL', 'QUALITY SPICES • GLOBAL TRUST', 'ASHIM KHAN', 'Proprietorship', 'FROM INDIA TO THE WORLD', 'Premium Indian Spices', 'for Every Kitchen', 'Pure Taste. Premium Quality. Global Trust.', 'From India''s Finest Spices to the World''s Kitchens', 'SAMIRAQ GLOBAL is an Indian spice company dedicated to delivering premium-quality spices with purity, freshness and authentic Indian taste.', 'We carefully source products from trusted suppliers and focus on quality, hygiene, customer satisfaction and reliable service for domestic and international buyers.', 'To provide pure, hygienic and premium-quality Indian spices while building a trusted global brand.', 'To become a globally recognized Indian spice brand known for quality, trust and customer satisfaction.', 'samiraqglobal@gmail.com', '+91 98276 42435', '+91 74891 68059', '919827642435', 'Sagar, Madhya Pradesh, India', '470000') on conflict (id) do nothing;

insert into public.site_list_items (list_type, content, position) values
('why_choose_us', 'Premium Quality Spices', 1), ('why_choose_us', 'Hygienic Packaging', 2), ('why_choose_us', 'Fresh & Authentic Products', 3), ('why_choose_us', 'Competitive Prices', 4), ('why_choose_us', 'Domestic & Export Supply', 5), ('why_choose_us', 'Customer Satisfaction', 6),
('quality_claim', '100% Natural & Pure', 1), ('quality_claim', 'Zero additives', 2), ('quality_claim', 'Hygienic processing', 3), ('quality_claim', 'Maximum freshness', 4), ('quality_claim', 'Careful sourcing', 5), ('quality_claim', 'Professional packaging', 6), ('quality_claim', 'International shipping standards', 7);

insert into public.products (slug, name, local_name, description, image_url, position) values
('red-chilli-powder', 'Red Chilli Powder', 'Mirch', 'A vibrant, aromatic chilli powder selected to bring dependable colour and balanced heat to every recipe.', '/images/red-chilli-powder.png', 1),
('turmeric-powder', 'Turmeric Powder', 'Haldi', 'Golden turmeric powder with warm character and authentic Indian flavour for kitchens and food businesses.', '/images/turmeric-powder.png', 2),
('cumin', 'Cumin', 'Jeera', 'Fragrant whole cumin chosen for its distinctive aroma, versatile culinary use, and consistent quality.', '/images/cumin.png', 3),
('clove', 'Clove', 'Long', 'Aromatic whole cloves suited to savoury blends, baking, beverages, and premium spice requirements.', '/images/clove.png', 4),
('green-cardamom', 'Green Cardamom', 'Elaichi', 'Green cardamom with a bright, sweet-spiced aroma for discerning culinary and beverage applications.', '/images/green-cardamom.png', 5),
('black-pepper', 'Black Pepper', 'Kali Mirch', 'Bold, aromatic black pepper for everyday seasoning, professional kitchens, and bulk B2B supply.', '/images/black-pepper.png', 6)
on conflict (slug) do nothing;
