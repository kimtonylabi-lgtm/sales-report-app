-- 2026-11 security hardening (run in Supabase SQL Editor; rules only, no data changes)
-- Before: anon could read/insert/update clients and read profiles; users could change their own role.

begin;

-- 1) clients: signed-in users only
drop policy if exists "Clients are viewable by everyone" on public.clients;
drop policy if exists "Clients are insertable by everyone" on public.clients;
drop policy if exists "Clients are updatable by everyone" on public.clients;
create policy "Clients viewable by signed-in users" on public.clients for select to authenticated using (true);
create policy "Clients insertable by signed-in users" on public.clients for insert to authenticated with check (true);
create policy "Clients updatable by signed-in users" on public.clients for update to authenticated using (true) with check (true);

-- 2) profiles: signed-in users only; a user may update only their own name (not role)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles viewable by signed-in users" on public.profiles for select to authenticated using (true);
revoke update on public.profiles from authenticated, anon;
grant update (name) on public.profiles to authenticated;

-- 3) reports: drop duplicates already covered by "owner or leader" policies
drop policy if exists "Reports are deletable by owner" on public.reports;
drop policy if exists "Reports are updatable by owner" on public.reports;

-- 4) anon gets no table access at all (defense in depth)
revoke all on public.clients, public.profiles, public.reports from anon;

commit;

-- Also in the dashboard: Authentication > Sign In / Providers > "Allow new users to sign up" = off.
