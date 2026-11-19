-- 2026-11 client kinds (customer / internal / vendor) + internal-name cleanup. One transaction;
-- the final check aborts everything unless exactly one report (the "신규업체" one) disappears.

begin;

create temp table _before as select count(*) as reports from public.reports;

-- 1) kind column: customer (default) / internal (사내) / vendor (외주업체)
alter table public.clients add column if not exists kind text not null default 'customer';
alter table public.clients drop constraint if exists clients_kind_check;
alter table public.clients add constraint clients_kind_check check (kind in ('customer', 'internal', 'vendor'));

-- 2) merge duplicate internal names (reports move to the kept client; last touch recomputed by trigger)
create temp table _merge (from_name text, to_name text);
insert into _merge values
  ('군포공장', '태성산업 군포공장'),
  ('화성공장', '태성산업 화성공장'),
  ('샘플 조립', '샘플실');
update public.reports r set client_id = t.id
from _merge m
join public.clients f on f.name = m.from_name
join public.clients t on t.name = m.to_name
where r.client_id = f.id;
delete from public.clients c using _merge m where c.name = m.from_name;

-- 3) renames
update public.clients set name = '태성산업 안양본사' where name = '태성산업';
update public.clients set name = '비코빅' where name = '비코빅(신규업체)';

-- 4) deletions requested by the user (backup: backup.*_20261119)
delete from public.reports where client_id in (select id from public.clients where name = '신규업체');
delete from public.clients where name in ('신규업체', '태성산업 군ㅍ', '태성산업 ㅎㆍ');

-- 5) classify
update public.clients set kind = 'internal' where name in (
  '태성산업 군포공장', '태성산업 화성공장', '태성산업 안양본사', '태성본사', '영업부', '샘플실',
  '지원사업', '전시회', '뉴욕 전시회', 'LA 전시회');
update public.clients set kind = 'vendor' where name in (
  '명진금박', '한울스크린', '대진코팅', '세아특수인쇄', '씰앤팩',
  '금마실업', '신성화인켐', '신원칼라', '신창테크', '아로하테크', '에스씨테크', '에이원코스텍', '연기획',
  '우성안료', '유경', '일우기업', '지엘피', '케이테크', '케이티코스메틱', '크로바', '옴니시스템');

-- 6) dormant summary carries the kind so the leader list can show customers only
drop view if exists public.client_touch_summary;
create view public.client_touch_summary
with (security_invoker = true) as
select c.id as client_id,
       c.name,
       c.kind,
       c.last_visited_at,
       (select count(*) from public.reports r where r.client_id = c.id) as report_count,
       (select r.user_id from public.reports r where r.client_id = c.id order by r.activity_at desc, r.created_at desc limit 1) as last_user_id
from public.clients c
where c.last_visited_at is not null;
grant select on public.client_touch_summary to authenticated;

-- 7) safety check: only the one "신규업체" report may disappear; every classified name must exist
do $$
declare lost int; missing int;
begin
  select (select reports from _before) - (select count(*) from public.reports) into lost;
  if lost <> 1 then raise exception 'report count changed by % (expected 1) — rolled back', lost; end if;
  select count(*) into missing from unnest(array[
    '태성산업 군포공장','태성산업 화성공장','태성산업 안양본사','태성본사','영업부','샘플실','지원사업','전시회','뉴욕 전시회','LA 전시회',
    '명진금박','한울스크린','대진코팅','세아특수인쇄','씰앤팩','금마실업','신성화인켐','신원칼라','신창테크','아로하테크','에스씨테크',
    '에이원코스텍','연기획','우성안료','유경','일우기업','지엘피','케이테크','케이티코스메틱','크로바','옴니시스템','비코빅'
  ]) n where not exists (select 1 from public.clients c where c.name = n);
  if missing <> 0 then raise exception '% classified names not found — rolled back', missing; end if;
end $$;

commit;
