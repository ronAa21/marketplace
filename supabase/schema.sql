-- ============================================================
-- Marketplace schema
-- Run this in the Supabase dashboard → SQL Editor → New query.
-- Safe to run more than once.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text,
  price decimal(10, 2) not null,
  category varchar(100) not null,
  seller_email varchar(255) not null,
  image_url text,
  location varchar(255) default 'Palo Alto, CA',
  status text not null default 'available',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Existing projects: add the column if the table was created before it existed.
alter table public.listings
  add column if not exists status text not null default 'available';

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete cascade,
  buyer_email varchar(255) not null,
  seller_email varchar(255) not null,
  message text not null,
  created_at timestamptz default now()
);

-- Sellers are identified by email. Stripe Connect fills in stripe_account_id
-- when the seller finishes onboarding.
create table if not exists public.sellers (
  email text primary key,
  stripe_account_id text,
  display_name text,
  bio text,
  location text,
  created_at timestamptz default now()
);

-- Existing projects: profile fields added after the table was created.
alter table public.sellers
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists location text;

-- Backfill sellers from listings that were posted before this table existed.
insert into public.sellers (email)
select distinct seller_email from public.listings
on conflict (email) do nothing;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_email text not null,
  amount numeric(10, 2) not null,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- Storage bucket for listing photos
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload listing images" on storage.objects;
create policy "Anyone can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images');

drop policy if exists "Anyone can view listing images" on storage.objects;
create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------
create index if not exists idx_listings_category on public.listings (category);
create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_listings_created_at on public.listings (created_at desc);
create index if not exists idx_messages_listing_id on public.messages (listing_id);
create index if not exists idx_orders_listing_id on public.orders (listing_id);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.listings enable row level security;
alter table public.messages enable row level security;
alter table public.sellers enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Anyone can view listings" on public.listings;
create policy "Anyone can view listings"
  on public.listings for select
  using (true);

drop policy if exists "Anyone can create listings" on public.listings;
create policy "Anyone can create listings"
  on public.listings for insert
  with check (true);

drop policy if exists "Users can update their own listings" on public.listings;
create policy "Users can update their own listings"
  on public.listings for update
  using (seller_email = (current_setting('request.jwt.claims', true)::json ->> 'email'));

drop policy if exists "Anyone can view messages" on public.messages;
create policy "Anyone can view messages"
  on public.messages for select
  using (true);

drop policy if exists "Anyone can create messages" on public.messages;
create policy "Anyone can create messages"
  on public.messages for insert
  with check (true);

-- No auth in this app yet, so these stay open like the tables above.
-- Tighten them (especially the update policy) once sellers sign in: whoever
-- can update a seller row can change where their payouts go.
drop policy if exists "Anyone can view sellers" on public.sellers;
create policy "Anyone can view sellers"
  on public.sellers for select
  using (true);

drop policy if exists "Anyone can create sellers" on public.sellers;
create policy "Anyone can create sellers"
  on public.sellers for insert
  with check (true);

drop policy if exists "Anyone can update sellers" on public.sellers;
create policy "Anyone can update sellers"
  on public.sellers for update
  using (true);

drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  with check (true);

-- Orders are intentionally not publicly readable: they hold buyer emails.
-- Read them from a server-side client with the service-role key.

-- ------------------------------------------------------------
-- Keep updated_at fresh
-- ------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_listings_updated_at on public.listings;
create trigger update_listings_updated_at
  before update on public.listings
  for each row
  execute function public.update_updated_at_column();
