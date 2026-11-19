-- 2026-11-19 typo merges found by a jamo-level name scan, approved by the user.
-- Reports move to the kept name; the typo client is removed. Guard: per-pair totals and the overall count.

begin;
create temp table _m (from_name text, to_name text);
insert into _m values
  ('라라래서피', '라라레서피'),          -- already merged earlier today; harmless if absent
  ('온그리언츠', '온그리디언츠'),
  ('에이블씨앤씨', '에이블씨엔씨'),
  ('엘엔씨바이오', '엘앤씨바이오'),
  ('오엔에이', '오앤에이'),
  ('스템엑스원', '스템엑소원'),
  ('정생물뷰티', '정샘물 뷰티'),
  ('sf인터네셔널', 'SF인터내셔널'),
  ('벤텍인터내셔널', '벤텍인터내셔날'),
  ('홍원코스테크', '홍원코스텍'),
  ('제이콤', '제이컴'),
  ('이엔씨', '이앤씨');

create temp table _expect as
select m.to_name,
       (select count(*) from public.reports r join public.clients c on c.id = r.client_id where c.name in (m.from_name, m.to_name)) as n
from _m m;
create temp table _total as select count(*) n from public.reports;

update public.reports r set client_id = t.id
from _m m join public.clients f on f.name = m.from_name join public.clients t on t.name = m.to_name
where r.client_id = f.id;
delete from public.clients c using _m m where c.name = m.from_name
  and exists (select 1 from public.clients t where t.name = m.to_name);

do $$
declare bad int;
begin
  if (select count(*) from public.reports) <> (select n from _total) then raise exception 'total report count changed — rolled back'; end if;
  select count(*) into bad from _expect e
  where e.n <> (select count(*) from public.reports r join public.clients c on c.id = r.client_id where c.name = e.to_name);
  if bad <> 0 then raise exception '% pair totals mismatch — rolled back', bad; end if;
  if exists (select 1 from public.clients c join _m m on c.name = m.from_name) then raise exception 'typo names still present — rolled back'; end if;
  select count(*) into bad from _m m where not exists (select 1 from public.clients c where c.name = m.to_name);
  if bad <> 0 then raise exception '% kept names missing — rolled back', bad; end if;
end $$;

commit;
