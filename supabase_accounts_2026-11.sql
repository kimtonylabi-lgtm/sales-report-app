-- 2026-11-19 account cleanup (applied directly; kept here as a record).
-- 1) 배용열 had two accounts: reports of the second (company e-mail) account (28) moved to the
--    main account, the duplicate profile removed and its login banned (banned_until = infinity, reversible).
-- 2) Inactive staff: profiles.is_active (default true). 손동호 and 손석민 set to false and banned.
--    Their past reports stay; the app lists only active staff in person filters.

alter table public.profiles add column if not exists is_active boolean not null default true;
-- update public.profiles set is_active = false where name in ('손동호', '손석민');
-- update auth.users set banned_until = 'infinity' where id in (select id from public.profiles where not is_active);
-- To restore someone: set is_active = true and banned_until = null for that id.
