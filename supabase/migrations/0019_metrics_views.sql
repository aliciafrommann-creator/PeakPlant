-- 0019 — Minimale Mess-Schicht für den MVP (P0, Freigabe 14.08.2026).
-- Nach 0015 anwenden. Reine Views, keine neue Tabelle, kein Tracking-SDK —
-- bewusst datensparsam: gezählt wird nur, was ohnehin in der DB liegt.
-- Abfragen laufen über den SQL-Editor (postgres/service_role).
--
-- security_invoker = true: die Views erben die RLS der Basistabellen. Für
-- anon/authenticated geben sie nichts her (zusätzlich revoked); nur
-- postgres/service_role sehen die Aggregatzahlen. So kann keine der Views
-- je zum Datenleck werden, egal was PostgREST exponiert.
--
-- Ehrlichkeits-Grenze (MANIFESTO §1, im Repo dokumentiert statt behauptet):
-- Bestellungen (Gast-Checkout, nur E-Mail) sind NICHT mit Spaces verknüpft.
-- „% verkaufter Decks mit Scan binnen 30 Tagen" ist darum pro Deck nicht
-- messbar; der ehrliche Proxy ist der Trendvergleich der beiden Monats-Views
-- (Verkäufe vs. Erst-Aktivierungen). Keine Scheinpräzision erfinden.

-- ── 1. Aktivierung + W4-Retention pro Space ─────────────────────────────
create or replace view public.pp_metrics_space_funnel
with (security_invoker = true) as
select
  s.id                                       as space_id,
  s.type,
  s.created_at,
  (select count(*) from public.space_members m
    where m.space_id = s.id)                 as member_count,
  (select min(mem.created_at) from public.memories mem
    where mem.space_id = s.id)               as first_moment_at,
  -- Aktivierung: binnen 7 Tagen zwei Mitglieder UND mindestens ein Moment.
  (
    (select count(*) from public.space_members m2
      where m2.space_id = s.id
        and m2.joined_at <= s.created_at + interval '7 days') >= 2
    and exists (select 1 from public.memories mm
      where mm.space_id = s.id
        and mm.created_at <= s.created_at + interval '7 days')
  )                                          as activated_7d,
  -- W4-Retention: mindestens ein Moment in Tag 21–28 nach Space-Anlage.
  exists (select 1 from public.memories mw
    where mw.space_id = s.id
      and mw.created_at >= s.created_at + interval '21 days'
      and mw.created_at <  s.created_at + interval '28 days'
  )                                          as retained_w4,
  -- Nur Spaces, deren W4-Fenster schon vorbei ist, zählen in W4-Quoten.
  (s.created_at <= now() - interval '28 days') as w4_window_closed
from public.spaces s;

comment on view public.pp_metrics_space_funnel is
  'Pro Space: Aktivierung (2 Mitglieder + 1 Moment binnen 7 Tagen) und W4-Retention (1 Moment in Tag 21–28). Beta-Beweismetrik aus PEAKPLANT_PRODUCT_ROADMAP Phase 1.';

-- ── 2. Wochen-Kohorten (die Beta-Auswertung) ────────────────────────────
create or replace view public.pp_metrics_weekly_cohorts
with (security_invoker = true) as
select
  date_trunc('week', created_at)::date               as cohort_week,
  count(*)                                           as spaces,
  count(*) filter (where member_count >= 2)          as paired,
  count(*) filter (where activated_7d)               as activated_7d,
  count(*) filter (where w4_window_closed)           as w4_measurable,
  count(*) filter (where retained_w4 and w4_window_closed) as retained_w4
from public.pp_metrics_space_funnel
group by 1
order by 1;

comment on view public.pp_metrics_weekly_cohorts is
  'Wochen-Kohorten: Aktivierungs- und W4-Quote je Anlage-Woche. retained_w4 nur gegen w4_measurable rechnen, nie gegen spaces.';

-- ── 3. North Star: aktive Spaces (rollierend 28 Tage) ───────────────────
create or replace view public.pp_metrics_north_star
with (security_invoker = true) as
select
  count(*) as active_spaces,
  now()    as measured_at
from public.spaces s
where (select count(*) from public.space_members m where m.space_id = s.id) >= 2
  and exists (
    select 1 from public.memories mm
    where mm.space_id = s.id
      and mm.created_at >= now() - interval '28 days'
  );

comment on view public.pp_metrics_north_star is
  'North Star: Spaces mit ≥2 Mitgliedern und ≥1 bewahrtem Moment in den letzten 28 Tagen (PEAKPLANT_PRODUCT_STRATEGY, North Star Metric).';

-- ── 4. Momente pro Monat (Loop-Tiefe, Karte vs. frei) ───────────────────
create or replace view public.pp_metrics_moments_monthly
with (security_invoker = true) as
select
  date_trunc('month', created_at)::date as month,
  count(*)                              as moments,
  count(*) filter (where card_id is not null and card_id <> 'free-moment') as card_moments,
  count(*) filter (where card_id is null or card_id = 'free-moment')       as free_moments,
  count(distinct space_id)              as spaces_with_moments
from public.memories
group by 1
order by 1;

comment on view public.pp_metrics_moments_monthly is
  'Momente pro Monat, aufgeteilt in Karten-Momente und freie Momente (Sentinel free-moment, s. mobile/lib/repositories/supabase.ts). Misst, ob das physische Produkt trägt.';

-- ── 5. Karten-Aktivierungen pro Monat (digitale Seite der Brücke) ───────
create or replace view public.pp_metrics_activations_monthly
with (security_invoker = true) as
select
  date_trunc('month', activated_at)::date as month,
  count(*)                                as activations,
  count(distinct space_id)                as spaces_activating,
  count(distinct card_id)                 as distinct_cards
from public.card_activations
group by 1
order by 1;

comment on view public.pp_metrics_activations_monthly is
  'Karten-Aktivierungen pro Monat. Physisch→Digital-Brücke nur als Trendvergleich mit pp_metrics_sales_monthly lesen — Orders sind nicht mit Spaces verknüpft (Gast-Checkout), pro-Deck-Zuordnung wäre Scheinpräzision.';

-- ── 6. Verkäufe pro Monat (physische Seite der Brücke) ──────────────────
create or replace view public.pp_metrics_sales_monthly
with (security_invoker = true) as
select
  date_trunc('month', created_at)::date as month,
  product,
  count(*)                              as orders,
  count(*) filter (where payment_status = 'paid')    as paid,
  count(*) filter (where payment_status = 'invoice') as invoice_open,
  sum(amount_total_cents) filter (where payment_status = 'paid') / 100.0 as paid_eur
from public.orders
group by 1, 2
order by 1, 2;

comment on view public.pp_metrics_sales_monthly is
  'Bestellungen pro Monat und Produkt (bezahlt vs. Rechnung offen). Zweitmetrik zum North Star: verkaufte Editionen.';

-- Views sind nur für den Operator (SQL-Editor / service_role) gedacht.
revoke all on public.pp_metrics_space_funnel,
              public.pp_metrics_weekly_cohorts,
              public.pp_metrics_north_star,
              public.pp_metrics_moments_monthly,
              public.pp_metrics_activations_monthly,
              public.pp_metrics_sales_monthly
from anon, authenticated;

insert into supabase_migrations.schema_migrations (version, name)
values ('20260814100400', '0019_metrics_views')
on conflict (version) do nothing;
