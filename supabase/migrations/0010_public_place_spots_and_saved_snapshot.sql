-- PeakPlant — public place pins + saved-date place snapshots.
--
-- Public place pins contain venue facts only. They intentionally do not store
-- user ids, space ids, partner data, private notes, photos, or diary content.
-- Saved-date snapshots keep the venue attached to the private Save→Plan→Do→
-- Memory→Feedback loop so an opt-in anonymous rating can publish the right pin.

create table if not exists public.public_place_spots (
  id         text primary key,
  name       text not null,
  address    text not null default '',
  lat        double precision not null,
  lng        double precision not null,
  category   text,
  maps_url   text,
  source_id  text,
  created_at timestamptz not null default now()
);

create index if not exists public_place_spots_created_idx
  on public.public_place_spots (created_at desc);

alter table public.public_place_spots enable row level security;

drop policy if exists "public can read anonymized place spots"
  on public.public_place_spots;
create policy "public can read anonymized place spots"
  on public.public_place_spots
  for select
  using (true);

drop policy if exists "clients can add anonymized place spots"
  on public.public_place_spots;
create policy "clients can add anonymized place spots"
  on public.public_place_spots
  for insert
  with check (true);

drop policy if exists "clients can refresh anonymized place spots"
  on public.public_place_spots;
create policy "clients can refresh anonymized place spots"
  on public.public_place_spots
  for update
  using (true)
  with check (true);

grant select, insert, update on public.public_place_spots to anon, authenticated;

alter table public.saved_dates
  add column if not exists place_id text,
  add column if not exists place_name text,
  add column if not exists place_address text,
  add column if not exists place_lat double precision,
  add column if not exists place_lng double precision,
  add column if not exists place_category text,
  add column if not exists place_maps_url text;
