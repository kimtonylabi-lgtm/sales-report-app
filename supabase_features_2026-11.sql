-- 2026-11 features: activity date, follow-up, last-touch recompute.
-- Adds columns only; existing rows keep their data (activity_at is backfilled from created_at).

begin;

-- 1) reports: when the activity happened (can be in the past) + next contact
alter table public.reports add column if not exists activity_at timestamptz;
update public.reports set activity_at = created_at where activity_at is null;
alter table public.reports alter column activity_at set default now();
alter table public.reports alter column activity_at set not null;
alter table public.reports add column if not exists next_contact_on date;
alter table public.reports add column if not exists next_action text;
create index if not exists reports_activity_idx on public.reports (activity_at desc);
create index if not exists reports_client_activity_idx on public.reports (client_id, activity_at desc);
create index if not exists reports_followup_idx on public.reports (user_id, next_contact_on) where next_contact_on is not null;

-- 2) last touch = latest activity among the client's remaining reports (insert, edit, delete)
create or replace function public.refresh_client_last_visited()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    update clients set last_visited_at = (select max(activity_at) from reports where client_id = old.client_id)
    where id = old.client_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update clients set last_visited_at = (select max(activity_at) from reports where client_id = new.client_id)
    where id = new.client_id;
  end if;
  return null;
end;
$$;

drop trigger if exists on_report_created on public.reports;
drop trigger if exists on_report_changed on public.reports;
create trigger on_report_changed
after insert or update or delete on public.reports
for each row execute function public.refresh_client_last_visited();

-- one-time recompute so existing values match the reports that remain
update public.clients c
set last_visited_at = (select max(r.activity_at) from public.reports r where r.client_id = c.id);

-- 3) dormant list per person: each client's last reporter acts as its owner (no manual input)
create or replace view public.client_touch_summary
with (security_invoker = true) as
select c.id as client_id,
       c.name,
       c.last_visited_at,
       (select count(*) from public.reports r where r.client_id = c.id) as report_count,
       (select r.user_id from public.reports r where r.client_id = c.id order by r.activity_at desc, r.created_at desc limit 1) as last_user_id
from public.clients c
where c.last_visited_at is not null;

grant select on public.client_touch_summary to authenticated;

commit;
