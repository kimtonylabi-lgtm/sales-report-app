-- 2026-11-19 similar-name cleanup from the user's review sheet (고객터치_정리계획.xlsx, sheet 4).
-- Renames to the order-index spelling, two merges into an existing client, two vendors.
-- Guard: the total report count must not change.

begin;
create temp table _b as select count(*) n from public.reports;

-- 1) renames (no client with the target name exists)
update public.clients set name = '엘디아화장품'         where name = '엘디아';
update public.clients set name = '고운세상코스메틱'     where name = '고운세상';
update public.clients set name = '네스필러피케이지'     where name = '네스필러';
update public.clients set name = '메가월드코스메틱'     where name = '메가월드';
update public.clients set name = '메가코스코리아'       where name = '메가코스';
update public.clients set name = '씨앤피코리아'         where name = '씨앤피';
update public.clients set name = '에이치라인컴퍼니'     where name = '에이치라인';
update public.clients set name = '엔에프뷰티그룹코리아' where name = '엔에프뷰티';
update public.clients set name = '와이앤지코스메틱스'   where name = '와이앤지코스메틱';
update public.clients set name = '인터코스코리아'       where name = '인터코스';
update public.clients set name = '제이앤제이코스텍'     where name = '제이앤제이';
update public.clients set name = '코리아나화장품'       where name = '코리아나';
update public.clients set name = '플로르플러스'         where name = '플로르';

-- 2) merge into an existing client (reports move; last touch recomputed by trigger)
create temp table _m (from_name text, to_name text);
insert into _m values ('라비오', '라비오뜨'), ('베로베', '베로베코스메틱');
update public.reports r set client_id = t.id
from _m m join public.clients f on f.name = m.from_name join public.clients t on t.name = m.to_name
where r.client_id = f.id;
delete from public.clients c using _m m where c.name = m.from_name;

-- 3) vendors
update public.clients set kind = 'vendor' where name in ('KT 코스메틱', '로이텍');

do $$
declare missing int;
begin
  if (select count(*) from public.reports) <> (select n from _b) then raise exception 'report count changed — rolled back'; end if;
  select count(*) into missing from unnest(array['엘디아화장품','고운세상코스메틱','네스필러피케이지','메가월드코스메틱','메가코스코리아',
    '씨앤피코리아','에이치라인컴퍼니','엔에프뷰티그룹코리아','와이앤지코스메틱스','인터코스코리아','제이앤제이코스텍','코리아나화장품',
    '플로르플러스','라비오뜨','베로베코스메틱']) n where not exists (select 1 from public.clients c where c.name = n);
  if missing <> 0 then raise exception '% target names missing — rolled back', missing; end if;
  if exists (select 1 from public.clients where name in ('라비오','베로베')) then raise exception 'merge sources still present — rolled back'; end if;
  if (select count(*) from public.clients where name in ('KT 코스메틱','로이텍') and kind = 'vendor') <> 2 then raise exception 'vendor update missed — rolled back'; end if;
end $$;

commit;
