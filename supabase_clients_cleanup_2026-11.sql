-- 고객터치 고객사 정리 (2026-11-19). 백업: backup.*_20261119. 한 묶음 실행 — 오류 시 전부 취소됨.
begin;

-- 1) 중복 합치기: 보고서를 남길 고객사로 옮기고, 빈 중복 줄 삭제, 마지막 터치일은 가장 최근 값
update public.reports set client_id = '339e8911-d5fd-4408-a314-997b0d469b42' where client_id in ('1c67972a-29b9-4623-9680-75d362f07f54');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('339e8911-d5fd-4408-a314-997b0d469b42', '1c67972a-29b9-4623-9680-75d362f07f54')) where id = '339e8911-d5fd-4408-a314-997b0d469b42';
delete from public.clients where id in ('1c67972a-29b9-4623-9680-75d362f07f54');
update public.clients set name = '더마펌' where id = '339e8911-d5fd-4408-a314-997b0d469b42';
update public.reports set client_id = '306bd53a-3a9b-4ff0-9b57-e8a6d53cd4d9' where client_id in ('78adf338-efa1-45ff-afd1-5fa9c97b29b1');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('306bd53a-3a9b-4ff0-9b57-e8a6d53cd4d9', '78adf338-efa1-45ff-afd1-5fa9c97b29b1')) where id = '306bd53a-3a9b-4ff0-9b57-e8a6d53cd4d9';
delete from public.clients where id in ('78adf338-efa1-45ff-afd1-5fa9c97b29b1');
update public.clients set name = '데이셀코스메틱' where id = '306bd53a-3a9b-4ff0-9b57-e8a6d53cd4d9';
update public.reports set client_id = '3af0760f-dd7d-4cca-936b-bdf702748b40' where client_id in ('b4474170-17b1-494a-b2be-fc62a6975017');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('3af0760f-dd7d-4cca-936b-bdf702748b40', 'b4474170-17b1-494a-b2be-fc62a6975017')) where id = '3af0760f-dd7d-4cca-936b-bdf702748b40';
delete from public.clients where id in ('b4474170-17b1-494a-b2be-fc62a6975017');
update public.clients set name = '리오라' where id = '3af0760f-dd7d-4cca-936b-bdf702748b40';
update public.reports set client_id = 'd9a8610b-b52b-4b74-ac6c-b5bb5f184605' where client_id in ('0fa73f9f-351f-4253-ba83-091405df3919');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('d9a8610b-b52b-4b74-ac6c-b5bb5f184605', '0fa73f9f-351f-4253-ba83-091405df3919')) where id = 'd9a8610b-b52b-4b74-ac6c-b5bb5f184605';
delete from public.clients where id in ('0fa73f9f-351f-4253-ba83-091405df3919');
update public.clients set name = '몬퓨리엘' where id = 'd9a8610b-b52b-4b74-ac6c-b5bb5f184605';
update public.reports set client_id = '1a5c821a-9bcb-459b-83b2-216098b5977c' where client_id in ('35e39b40-1754-4fae-80b8-9394587191c7');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('1a5c821a-9bcb-459b-83b2-216098b5977c', '35e39b40-1754-4fae-80b8-9394587191c7')) where id = '1a5c821a-9bcb-459b-83b2-216098b5977c';
delete from public.clients where id in ('35e39b40-1754-4fae-80b8-9394587191c7');
update public.clients set name = '미마인' where id = '1a5c821a-9bcb-459b-83b2-216098b5977c';
update public.reports set client_id = 'c60c706c-cc81-42ea-9df7-febab81c71a2' where client_id in ('b98b8ba1-2582-441a-81b9-b7eab3d7ef06');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('c60c706c-cc81-42ea-9df7-febab81c71a2', 'b98b8ba1-2582-441a-81b9-b7eab3d7ef06')) where id = 'c60c706c-cc81-42ea-9df7-febab81c71a2';
delete from public.clients where id in ('b98b8ba1-2582-441a-81b9-b7eab3d7ef06');
update public.clients set name = '바이오에프티' where id = 'c60c706c-cc81-42ea-9df7-febab81c71a2';
update public.reports set client_id = '078a2299-1655-437a-99c3-6364ab1be23e' where client_id in ('8b8237b9-813c-4e0b-8ad0-33bbccb68a3a');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('078a2299-1655-437a-99c3-6364ab1be23e', '8b8237b9-813c-4e0b-8ad0-33bbccb68a3a')) where id = '078a2299-1655-437a-99c3-6364ab1be23e';
delete from public.clients where id in ('8b8237b9-813c-4e0b-8ad0-33bbccb68a3a');
update public.clients set name = '방앗간화장품' where id = '078a2299-1655-437a-99c3-6364ab1be23e';
update public.reports set client_id = '320ab562-1645-4f2d-9a1c-42854b364d1d' where client_id in ('4c34f9ec-aa5c-4064-9c81-a101ee381893');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('320ab562-1645-4f2d-9a1c-42854b364d1d', '4c34f9ec-aa5c-4064-9c81-a101ee381893')) where id = '320ab562-1645-4f2d-9a1c-42854b364d1d';
delete from public.clients where id in ('4c34f9ec-aa5c-4064-9c81-a101ee381893');
update public.clients set name = '보보화장품' where id = '320ab562-1645-4f2d-9a1c-42854b364d1d';
update public.reports set client_id = '8c5f6922-5191-42cf-9ea1-05bb8ef4c946' where client_id in ('894882d4-4382-438c-9623-f497c5bec205');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('8c5f6922-5191-42cf-9ea1-05bb8ef4c946', '894882d4-4382-438c-9623-f497c5bec205')) where id = '8c5f6922-5191-42cf-9ea1-05bb8ef4c946';
delete from public.clients where id in ('894882d4-4382-438c-9623-f497c5bec205');
update public.clients set name = '씨앤비바이오' where id = '8c5f6922-5191-42cf-9ea1-05bb8ef4c946';
update public.reports set client_id = 'f2660cab-1e53-4795-a17d-9b567d84080e' where client_id in ('9242aeb1-cae9-4a1b-98ee-5b06d0f176af');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('f2660cab-1e53-4795-a17d-9b567d84080e', '9242aeb1-cae9-4a1b-98ee-5b06d0f176af')) where id = 'f2660cab-1e53-4795-a17d-9b567d84080e';
delete from public.clients where id in ('9242aeb1-cae9-4a1b-98ee-5b06d0f176af');
update public.clients set name = '씨티케이코스메틱' where id = 'f2660cab-1e53-4795-a17d-9b567d84080e';
update public.reports set client_id = '2d30e176-f831-4e17-b7aa-301f1e046a5d' where client_id in ('4d80cfd3-5a98-418f-a1e7-b9205d7e9542');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('2d30e176-f831-4e17-b7aa-301f1e046a5d', '4d80cfd3-5a98-418f-a1e7-b9205d7e9542')) where id = '2d30e176-f831-4e17-b7aa-301f1e046a5d';
delete from public.clients where id in ('4d80cfd3-5a98-418f-a1e7-b9205d7e9542');
update public.clients set name = '아이소브' where id = '2d30e176-f831-4e17-b7aa-301f1e046a5d';
update public.reports set client_id = 'f8110ec7-fde5-4b3f-ac9e-6185d6a93e7d' where client_id in ('64807bc8-3025-4c52-a14d-04ee22338d0b');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('f8110ec7-fde5-4b3f-ac9e-6185d6a93e7d', '64807bc8-3025-4c52-a14d-04ee22338d0b')) where id = 'f8110ec7-fde5-4b3f-ac9e-6185d6a93e7d';
delete from public.clients where id in ('64807bc8-3025-4c52-a14d-04ee22338d0b');
update public.clients set name = '아트페이스' where id = 'f8110ec7-fde5-4b3f-ac9e-6185d6a93e7d';
update public.reports set client_id = '1f145923-6631-47d1-8409-b22623397cde' where client_id in ('cf9003f3-7e55-4681-9565-c80b75d5aad8');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('1f145923-6631-47d1-8409-b22623397cde', 'cf9003f3-7e55-4681-9565-c80b75d5aad8')) where id = '1f145923-6631-47d1-8409-b22623397cde';
delete from public.clients where id in ('cf9003f3-7e55-4681-9565-c80b75d5aad8');
update public.clients set name = '에이치앤비코스메틱' where id = '1f145923-6631-47d1-8409-b22623397cde';
update public.reports set client_id = '938084cc-011b-4790-9d3b-ab73b17c405a' where client_id in ('157411f6-00f6-4099-87e0-f9fef5d492be');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('938084cc-011b-4790-9d3b-ab73b17c405a', '157411f6-00f6-4099-87e0-f9fef5d492be')) where id = '938084cc-011b-4790-9d3b-ab73b17c405a';
delete from public.clients where id in ('157411f6-00f6-4099-87e0-f9fef5d492be');
update public.clients set name = '엔앤비랩' where id = '938084cc-011b-4790-9d3b-ab73b17c405a';
update public.reports set client_id = '1bb06a36-c7bf-45eb-a25f-d9b34b98a062' where client_id in ('51704431-a1c9-41ca-a380-0a138f19773a');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('1bb06a36-c7bf-45eb-a25f-d9b34b98a062', '51704431-a1c9-41ca-a380-0a138f19773a')) where id = '1bb06a36-c7bf-45eb-a25f-d9b34b98a062';
delete from public.clients where id in ('51704431-a1c9-41ca-a380-0a138f19773a');
update public.clients set name = '엘디아' where id = '1bb06a36-c7bf-45eb-a25f-d9b34b98a062';
update public.reports set client_id = '45864029-b5d1-47e8-bbb4-0b1cc3fc69e7' where client_id in ('57ebc61c-c5d0-4b07-bcd6-ea7fe170ee29');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('45864029-b5d1-47e8-bbb4-0b1cc3fc69e7', '57ebc61c-c5d0-4b07-bcd6-ea7fe170ee29')) where id = '45864029-b5d1-47e8-bbb4-0b1cc3fc69e7';
delete from public.clients where id in ('57ebc61c-c5d0-4b07-bcd6-ea7fe170ee29');
update public.clients set name = '우진화장품' where id = '45864029-b5d1-47e8-bbb4-0b1cc3fc69e7';
update public.reports set client_id = '28aba351-e25b-4daa-80ec-b00bb2e43aad' where client_id in ('2abf7d6c-1be0-4783-bd5c-387fb95891a8', '59f477cc-b333-4f0f-ad26-ffe5ad143743');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('28aba351-e25b-4daa-80ec-b00bb2e43aad', '2abf7d6c-1be0-4783-bd5c-387fb95891a8', '59f477cc-b333-4f0f-ad26-ffe5ad143743')) where id = '28aba351-e25b-4daa-80ec-b00bb2e43aad';
delete from public.clients where id in ('2abf7d6c-1be0-4783-bd5c-387fb95891a8', '59f477cc-b333-4f0f-ad26-ffe5ad143743');
update public.clients set name = '코스맥스' where id = '28aba351-e25b-4daa-80ec-b00bb2e43aad';
update public.reports set client_id = 'fc408c46-7848-4f7e-b714-59b4705c17d0' where client_id in ('a12c86a8-0f01-4630-831e-8a9c787c2766');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('fc408c46-7848-4f7e-b714-59b4705c17d0', 'a12c86a8-0f01-4630-831e-8a9c787c2766')) where id = 'fc408c46-7848-4f7e-b714-59b4705c17d0';
delete from public.clients where id in ('a12c86a8-0f01-4630-831e-8a9c787c2766');
update public.clients set name = '투슬래시포' where id = 'fc408c46-7848-4f7e-b714-59b4705c17d0';
update public.reports set client_id = '7e5a97a5-ddc4-49fa-9f9b-47c8b2588173' where client_id in ('4dc867b7-4de0-443b-b76a-84bbce080109', '826fc4c2-6d09-4af6-8073-71444fba0716');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('7e5a97a5-ddc4-49fa-9f9b-47c8b2588173', '4dc867b7-4de0-443b-b76a-84bbce080109', '826fc4c2-6d09-4af6-8073-71444fba0716')) where id = '7e5a97a5-ddc4-49fa-9f9b-47c8b2588173';
delete from public.clients where id in ('4dc867b7-4de0-443b-b76a-84bbce080109', '826fc4c2-6d09-4af6-8073-71444fba0716');
update public.clients set name = '한국씨앤비' where id = '7e5a97a5-ddc4-49fa-9f9b-47c8b2588173';
update public.reports set client_id = 'eee533ed-549e-44ef-8674-4314ac788265' where client_id in ('c8c23103-51f8-47e5-868a-541f283b9853');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('eee533ed-549e-44ef-8674-4314ac788265', 'c8c23103-51f8-47e5-868a-541f283b9853')) where id = 'eee533ed-549e-44ef-8674-4314ac788265';
delete from public.clients where id in ('c8c23103-51f8-47e5-868a-541f283b9853');
update public.clients set name = 'KT 코스메틱' where id = 'eee533ed-549e-44ef-8674-4314ac788265';
update public.reports set client_id = '7df0d363-8f52-438d-b1eb-768205409c64' where client_id in ('454d8f4d-7a27-4dfa-af76-996073b763f1');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('7df0d363-8f52-438d-b1eb-768205409c64', '454d8f4d-7a27-4dfa-af76-996073b763f1')) where id = '7df0d363-8f52-438d-b1eb-768205409c64';
delete from public.clients where id in ('454d8f4d-7a27-4dfa-af76-996073b763f1');
update public.clients set name = 'LA 전시회' where id = '7df0d363-8f52-438d-b1eb-768205409c64';
update public.reports set client_id = 'ca246698-b9a4-4c15-8ba0-b7cd45a456ad' where client_id in ('e8fe347d-fefc-4ea8-8a65-6e6e3634f471');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('ca246698-b9a4-4c15-8ba0-b7cd45a456ad', 'e8fe347d-fefc-4ea8-8a65-6e6e3634f471')) where id = 'ca246698-b9a4-4c15-8ba0-b7cd45a456ad';
delete from public.clients where id in ('e8fe347d-fefc-4ea8-8a65-6e6e3634f471');
update public.clients set name = 'PAD' where id = 'ca246698-b9a4-4c15-8ba0-b7cd45a456ad';
update public.reports set client_id = 'fa065477-b07c-47aa-aeb9-27a7fc3fd13e' where client_id in ('7bad905d-04bd-4e2a-b5e3-39568230bc11');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('fa065477-b07c-47aa-aeb9-27a7fc3fd13e', '7bad905d-04bd-4e2a-b5e3-39568230bc11')) where id = 'fa065477-b07c-47aa-aeb9-27a7fc3fd13e';
delete from public.clients where id in ('7bad905d-04bd-4e2a-b5e3-39568230bc11');
update public.clients set name = 'SEBE' where id = 'fa065477-b07c-47aa-aeb9-27a7fc3fd13e';
update public.reports set client_id = '9e115bd9-f1cd-4d9b-b5eb-d05db800e46a' where client_id in ('535eee6c-58f2-4d94-8265-8d10393016c3');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('9e115bd9-f1cd-4d9b-b5eb-d05db800e46a', '535eee6c-58f2-4d94-8265-8d10393016c3')) where id = '9e115bd9-f1cd-4d9b-b5eb-d05db800e46a';
delete from public.clients where id in ('535eee6c-58f2-4d94-8265-8d10393016c3');
update public.clients set name = 'sjk' where id = '9e115bd9-f1cd-4d9b-b5eb-d05db800e46a';
update public.reports set client_id = '82d7872f-b4c4-4cc3-85e9-d3d704a19498' where client_id in ('8a54f184-719c-453c-852e-f8b7eb3a6355');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('82d7872f-b4c4-4cc3-85e9-d3d704a19498', '8a54f184-719c-453c-852e-f8b7eb3a6355')) where id = '82d7872f-b4c4-4cc3-85e9-d3d704a19498';
delete from public.clients where id in ('8a54f184-719c-453c-852e-f8b7eb3a6355');
update public.clients set name = '더케이스' where id = '82d7872f-b4c4-4cc3-85e9-d3d704a19498';
update public.reports set client_id = 'd805c96f-adf5-4808-bf68-836db3da3607' where client_id in ('2ca6c9ac-5248-4af9-bf27-5f0619db1b57');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('d805c96f-adf5-4808-bf68-836db3da3607', '2ca6c9ac-5248-4af9-bf27-5f0619db1b57')) where id = 'd805c96f-adf5-4808-bf68-836db3da3607';
delete from public.clients where id in ('2ca6c9ac-5248-4af9-bf27-5f0619db1b57');
update public.clients set name = '딜라이트코스메틱' where id = 'd805c96f-adf5-4808-bf68-836db3da3607';
update public.reports set client_id = '880f2a1c-d4f6-4265-8afd-993655534022' where client_id in ('c7283fc9-5bbe-4cc4-a9dd-38d21b1cd9bb');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('880f2a1c-d4f6-4265-8afd-993655534022', 'c7283fc9-5bbe-4cc4-a9dd-38d21b1cd9bb')) where id = '880f2a1c-d4f6-4265-8afd-993655534022';
delete from public.clients where id in ('c7283fc9-5bbe-4cc4-a9dd-38d21b1cd9bb');
update public.clients set name = '아우딘퓨처스' where id = '880f2a1c-d4f6-4265-8afd-993655534022';
update public.reports set client_id = '06b74202-cbe6-4eab-80f4-b7bed276210f' where client_id in ('df92c692-2e17-42a5-b8cc-71989f11fb6b');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('06b74202-cbe6-4eab-80f4-b7bed276210f', 'df92c692-2e17-42a5-b8cc-71989f11fb6b')) where id = '06b74202-cbe6-4eab-80f4-b7bed276210f';
delete from public.clients where id in ('df92c692-2e17-42a5-b8cc-71989f11fb6b');
update public.clients set name = '정동화장품' where id = '06b74202-cbe6-4eab-80f4-b7bed276210f';
update public.reports set client_id = '5f3694fe-acba-4bd3-829b-f87a31c50859' where client_id in ('8d6c0d2a-6855-4374-972f-2b873c1d3986');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('5f3694fe-acba-4bd3-829b-f87a31c50859', '8d6c0d2a-6855-4374-972f-2b873c1d3986')) where id = '5f3694fe-acba-4bd3-829b-f87a31c50859';
delete from public.clients where id in ('8d6c0d2a-6855-4374-972f-2b873c1d3986');
update public.clients set name = '킴앤림' where id = '5f3694fe-acba-4bd3-829b-f87a31c50859';
update public.reports set client_id = 'e3091f28-9eae-46d0-b3ac-23e64119ec08' where client_id in ('b0546c27-ec35-4298-89c2-8ba8d93005d8');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('e3091f28-9eae-46d0-b3ac-23e64119ec08', 'b0546c27-ec35-4298-89c2-8ba8d93005d8')) where id = 'e3091f28-9eae-46d0-b3ac-23e64119ec08';
delete from public.clients where id in ('b0546c27-ec35-4298-89c2-8ba8d93005d8');
update public.clients set name = '태성산업 군포공장' where id = 'e3091f28-9eae-46d0-b3ac-23e64119ec08';
update public.reports set client_id = '22b924e2-49d0-4ffe-ba03-4fc9fac86cb7' where client_id in ('52fce4d4-4384-4284-8b01-b71c88e45be7');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('22b924e2-49d0-4ffe-ba03-4fc9fac86cb7', '52fce4d4-4384-4284-8b01-b71c88e45be7')) where id = '22b924e2-49d0-4ffe-ba03-4fc9fac86cb7';
delete from public.clients where id in ('52fce4d4-4384-4284-8b01-b71c88e45be7');
update public.clients set name = '피에프네이처' where id = '22b924e2-49d0-4ffe-ba03-4fc9fac86cb7';
update public.reports set client_id = '667038e6-b19f-4bbb-88b2-5d21018680af' where client_id in ('a04d2f97-5bbe-4a91-9959-f49c0a0d2cbf');
update public.clients set last_visited_at = (select max(last_visited_at) from public.clients where id in ('667038e6-b19f-4bbb-88b2-5d21018680af', 'a04d2f97-5bbe-4a91-9959-f49c0a0d2cbf')) where id = '667038e6-b19f-4bbb-88b2-5d21018680af';
delete from public.clients where id in ('a04d2f97-5bbe-4a91-9959-f49c0a0d2cbf');
update public.clients set name = '한울스크린' where id = '667038e6-b19f-4bbb-88b2-5d21018680af';

-- 1-2) 잘못 입력한 한 글자 고객사 삭제 (군: 보고 2건, 피: 보고 1건) — 사용자 확인: 보고까지 삭제
delete from public.reports where client_id in ('fab34c68-89de-4183-8feb-5740900382e0', '6389eba9-c06d-48a6-b543-641a9a68f7ae');
delete from public.clients where id in ('fab34c68-89de-4183-8feb-5740900382e0', '6389eba9-c06d-48a6-b543-641a9a68f7ae');

-- 2) 이름 정리: (주)·주식회사·끝 공백 제거
update public.clients set name = 'ATG' where id = 'f9c7e32a-21ef-4561-8f58-68297cd44eab';
update public.clients set name = '더샘' where id = '3b6891c2-b328-402b-a6c0-303c28b532cf';
update public.clients set name = '더샘인터내셔날' where id = '8fc287e9-7f0e-40f8-af23-3458ed22b308';
update public.clients set name = '도경' where id = 'ec592b1e-4585-4769-ae36-770338acea86';
update public.clients set name = '레임아카이브' where id = 'b61332fb-c491-421b-a120-7c0ec8d0f806';
update public.clients set name = '리코리스' where id = 'b129ef73-a2e3-49ba-90ac-d9d0bc340a69';
update public.clients set name = '명인화장품' where id = 'a6d61ea1-b79c-40bd-be39-20b0476cbfd5';
update public.clients set name = '모나미' where id = '2cee7dca-724c-4eb5-8efc-987a9033760c';
update public.clients set name = '뷰티인사이드' where id = '0a3eecfd-7e4a-4a41-90d5-6d39b1654054';
update public.clients set name = '비엔' where id = '52313ac8-1a9e-4f50-92f5-2e0d7583ad10';
update public.clients set name = '비엔코스' where id = '991f1c6d-4404-43a4-92cc-60d91b85e8fd';
update public.clients set name = '수본' where id = 'b84fe0da-1c47-4dcc-bf7b-f2a30be325de';
update public.clients set name = '에스크컴퍼니' where id = '4ddfad83-fa8e-48d6-ba8c-4b549ca5d409';
update public.clients set name = '엘앤드에이치컴퍼니' where id = '4f84501f-d15c-46d3-a3ba-2df4e89b9fcd';
update public.clients set name = '울트라브이' where id = '234233de-7f5c-4760-81a6-956793e7158f';
update public.clients set name = '웅진휴캄' where id = 'ce38befb-6408-42b7-a7bc-a80a18748a81';
update public.clients set name = '켈프풋' where id = '65edad4c-4217-467e-a694-6d08f8d76949';
update public.clients set name = '코드랩' where id = '1b682127-50ad-444c-9086-546a94075e50';
update public.clients set name = '코스메카코리아' where id = 'a8b91aa9-8d5a-49ed-a53a-48e4af20589d';
update public.clients set name = '코이즈' where id = 'ae0a4c78-13eb-4480-8d5a-93be08ddd3c5';
update public.clients set name = '티르티르' where id = '30d7e613-b907-48df-a0e4-456644e42b6e';
update public.clients set name = '페이스' where id = '83c11462-00f3-43aa-9130-b07855bef25a';
update public.clients set name = '한솔바이오텍' where id = '3aca5275-4c1a-4c46-bf8d-c217c71d13f9';
update public.clients set name = 'PT CEDEFINDO' where id = 'ebd7f82c-3fef-4d8d-a438-ffe99864e88f';
update public.clients set name = '고웰' where id = '1d9264aa-980b-49c6-9560-d37020bcf4bd';
update public.clients set name = '뉴마인드랩' where id = '18ff4f14-6e80-4a17-b5e5-0023c8df553f';
update public.clients set name = '동안' where id = 'abe8fb58-9918-4f5e-a61a-fb7b099f5b3e';
update public.clients set name = '메가월드' where id = '9b77a4a0-55a0-4024-89ad-c9f1d8d9e320';
update public.clients set name = '바크로' where id = '014b1c94-5ec2-486c-85b6-72d5815332d2';
update public.clients set name = '블레스드' where id = 'f06ef9cb-60e6-4b2f-806e-93cb3277e0fa';
update public.clients set name = '세프라' where id = 'e3ac75c3-343f-4c7f-87de-51c67db1896c';
update public.clients set name = '신규업체' where id = '675e643c-af7e-4011-9940-87ce6577c98d';
update public.clients set name = '정샘물 뷰티' where id = '7cd48ac2-e7f5-415e-90fa-4d482bd9ca55';
update public.clients set name = 'LEEP' where id = '10b31f76-69ed-43bb-a300-8b80243aee52';
update public.clients set name = '카인츠' where id = 'fd86fafa-5cb5-4980-8033-a1a18fa5fc25';
update public.clients set name = '타임리랩스' where id = '9f813bdf-6a02-4f12-8fed-14550d2044ea';
update public.clients set name = '팔색미인' where id = '7111f98b-d077-4c89-b4a2-f65b940079d3';

-- 3) 앞으로 같은 회사가 표기만 바꿔 다시 생기지 않게: 비교용 이름(name_key) + 중복 금지
alter table public.clients add column if not exists name_key text generated always as (lower(regexp_replace(regexp_replace(name, '\(주\)|㈜|주식회사|\(유\)', '', 'g'), '[[:space:]_.·,-]', '', 'g'))) stored;
create unique index if not exists clients_name_key_uniq on public.clients (name_key);

-- 4) 통합발주서 Index 거래처 미리 등록 (이미 있는 곳은 건너뜀)
insert into public.clients (name) values
  ('로제'),
  ('코스메카코리아(연구소)'),
  ('한국콜마(HMJ코리아)'),
  ('엘러먼트'),
  ('코스나인'),
  ('키오스킨'),
  ('베스타나(닥터알카이티스)'),
  ('화인코스(참존)'),
  ('서울한라'),
  ('아이씨에이치앤비'),
  ('넥스트플레이어'),
  ('라프레리(스위스)'),
  ('엘앤피코스메틱'),
  ('조인앤조이'),
  ('쏘렉스'),
  ('카미안느'),
  ('케이씨엘컴퍼니'),
  ('헤이네이처'),
  ('GLP코리아'),
  ('라미화장품(엘러먼트)'),
  ('벤텍인터내셔날'),
  ('정코스'),
  ('자민경'),
  ('패키지코아'),
  ('대상라이프사이언스'),
  ('예인코스메틱'),
  ('베르쿠르'),
  ('씨엠컴퍼니글로벌'),
  ('홍원코스텍'),
  ('와우벤처스'),
  ('파마코어랩'),
  ('엘리샤코이'),
  ('러블리뷰티'),
  ('이지피'),
  ('인터워크코리아'),
  ('티엑스컴'),
  ('다미인'),
  ('아이온'),
  ('인코스팜'),
  ('다산씨엔텍'),
  ('AMI'),
  ('알고비탈코리아'),
  ('아트코스메틱'),
  ('베스타나(닥터펠릭스)'),
  ('키메라'),
  ('프로페셔날뷰티시스템'),
  ('델라롬'),
  ('코스웹'),
  ('베스타나(슈라멕)'),
  ('CW파마'),
  ('코스모코스(왓슨)'),
  ('정씨앤디'),
  ('뷰티맥스'),
  ('타르트'),
  ('한국콜마(로제)'),
  ('보뜨레코스메틱'),
  ('아이썸'),
  ('스포메틱스'),
  ('코스메카코리아(헤리즈미)'),
  ('준그룹'),
  ('베스타나(훌카)'),
  ('한국콜마(본쉬즈코리아)'),
  ('큐나인트레이딩'),
  ('코스텍코(아미즈스킨)'),
  ('로렌'),
  ('시너지스킨'),
  ('한국C&B'),
  ('코스맥스(연구경영실)'),
  ('에시오로(뷰티메카)'),
  ('코스모벨'),
  ('코스텍코'),
  ('원엠글로벌'),
  ('오스왈'),
  ('바이플레이'),
  ('베스타나(코스메티카)'),
  ('보노톡스'),
  ('베스타나(바디덤코스메티카)'),
  ('코스앤이펙트'),
  ('오버크'),
  ('쓰리애플즈코스메틱'),
  ('유경디앤씨'),
  ('한중실크로드'),
  ('미호인터내셔널'),
  ('와이에스아이코리아'),
  ('마리아갈란드'),
  ('라메카'),
  ('쓰리랩코리아'),
  ('라이플러스'),
  ('에이치앤제이컴퍼니'),
  ('코디'),
  ('가바온코리아'),
  ('디펜에이지'),
  ('매직플러스'),
  ('베스타나(바이오참)'),
  ('지엠케이'),
  ('엘앤에스코스메틱'),
  ('지에이케이오'),
  ('네오메디컬'),
  ('탈렌트화장품'),
  ('원네이션'),
  ('익성'),
  ('베스타나(안나야케)'),
  ('베스타나(베딕)'),
  ('제이앤지코퍼레이션'),
  ('디티에스엠지'),
  ('코스엠앤엠'),
  ('민디민메디컬그룹'),
  ('워크맨'),
  ('앨리웁'),
  ('셀코스랩'),
  ('자인'),
  ('제뉴원사이언스'),
  ('아이나노'),
  ('베스타나(리디아다이노프)'),
  ('베스타나(인더마)'),
  ('바이테리'),
  ('플래티넘브릿지'),
  ('프리비아스킨랩'),
  ('명원국제무역'),
  ('화진바이오코스메틱'),
  ('세컨드스토리'),
  ('웰코스'),
  ('이엘라이즈'),
  ('키오스킨(라미화장품)'),
  ('유패럿'),
  ('씨비디랩'),
  ('에스투비트레이딩'),
  ('아이코맥스'),
  ('크린스화장품(참존)'),
  ('커먼구즈'),
  ('셀리버리리빙앤헬스'),
  ('PLCC'),
  ('예나'),
  ('로페라코스메틱'),
  ('SEF패키징'),
  ('베스타나(필르로가)'),
  ('씨앤엠'),
  ('에코글로벌'),
  ('제이준코스메틱'),
  ('프리티스킨인터내셔널'),
  ('더한기'),
  ('베스타나(뷰티힐)'),
  ('내추럴룩스트레이딩'),
  ('미립'),
  ('도담에스엘'),
  ('셀랩'),
  ('코스맥스(엔프라니)'),
  ('잉글우드랩코리아'),
  ('한국콜마(리꼬)'),
  ('H&A'),
  ('데이셀화장품'),
  ('제이앤피네이처'),
  ('키포스'),
  ('코스맥스(타르트)'),
  ('베스타나(라코나)'),
  ('OHC'),
  ('지에프씨생명과학'),
  ('네이디'),
  ('베스타나(네오코스메틱)'),
  ('입셀론바이오'),
  ('코스맥스네오'),
  ('테거'),
  ('라프레리(콜마)'),
  ('유로티에스텍'),
  ('알마레이저'),
  ('바디팩'),
  ('필립산업'),
  ('홍원코스테크'),
  ('더마스내추럴'),
  ('라쎄'),
  ('비앤에이치코스메틱'),
  ('뉴랜드올네이처'),
  ('미코'),
  ('아이코맥스(변경:스킨앤스킨)'),
  ('셀프'),
  ('팜스킨'),
  ('아트코리아'),
  ('씨엔에프'),
  ('한생화장품(라미화장품)'),
  ('엘코스'),
  ('웨이리치'),
  ('베스타나(오로라)'),
  ('피에프네이처(에이피코리아)'),
  ('엠도씨'),
  ('에이피코리아'),
  ('HLB생활건강'),
  ('와이코스텍'),
  ('WWP'),
  ('원일코스'),
  ('로렌(키오스킨)'),
  ('팀크레아티보'),
  ('제이인터내셔널'),
  ('제담씨앤디'),
  ('씨에이치하모니'),
  ('베스타나(누코)'),
  ('뷰렌코리아'),
  ('이노피플'),
  ('브리스킨'),
  ('미래씨티'),
  ('사임당화장품(프리티스킨)'),
  ('마하컴퍼니'),
  ('미립(다미인)'),
  ('와이씨유'),
  ('티지코스메틱'),
  ('녹십자수의약품'),
  ('더미래코스메틱'),
  ('스타스테크'),
  ('더굿브릿지'),
  ('클로버스킨'),
  ('아이썸코리아'),
  ('썬코스텍'),
  ('베스타나(르비브레)'),
  ('아네시'),
  ('한국콜마(더샘)'),
  ('이플플러스'),
  ('스킨이데아'),
  ('WWP(밀크)'),
  ('에스와이코스메틱'),
  ('코스맥스(무진)'),
  ('베스타나(잉그리드)'),
  ('로제화장품'),
  ('이즈팩(라미화장품)'),
  ('엘케이에이치코리아'),
  ('코스맥스(슈에무라)'),
  ('이글립스'),
  ('지에이치씨지'),
  ('VIZ.3'),
  ('헬로스킨'),
  ('파란'),
  ('한국콜마(무진)'),
  ('더블유제이홀딩스'),
  ('에스브이이앤티'),
  ('베스타나(CRB)'),
  ('에스피아이'),
  ('씨엔티드림'),
  ('시스켈리'),
  ('포덤코스메슈티컬즈(에프디씨바이오)'),
  ('죠이라이프'),
  ('스킨앤스킨'),
  ('제이인'),
  ('커넥트101'),
  ('에스와이씨에스(구 유패럿)'),
  ('해피엘앤비(이즈팩)'),
  ('아이뻐'),
  ('퓨더마'),
  ('지나앤제이'),
  ('제이뷰티코리아'),
  ('크리니컬레솔루션아시아'),
  ('피에프네이처(이리스)'),
  ('라멜린'),
  ('제이티제이'),
  ('피에프네이처(이즈팩)'),
  ('네이처코스팜'),
  ('길코퍼레이션'),
  ('코스메카코리아(프리티스킨)'),
  ('본느'),
  ('에이빌코리아'),
  ('GTF(뉴놈)'),
  ('한국콜마(더마클래스)'),
  ('씨에이치에이퍼시픽'),
  ('샤르네코리아'),
  ('SF인터내셔널'),
  ('제이나퀸'),
  ('로렌(카르테가)'),
  ('에스와이바자르'),
  ('로렌(체리아노)'),
  ('방영학생활건강'),
  ('베스타나(하모니아)'),
  ('리꼬'),
  ('파우제'),
  ('모노글로트홀딩스'),
  ('네추럴나인'),
  ('본질'),
  ('삼성메디코스'),
  ('레토(한국콜마)'),
  ('써드플로어'),
  ('훈인터내셔널'),
  ('한국콜마(KKST)'),
  ('비브뱅땅코리아'),
  ('비에이치링크'),
  ('코스맥스(뷰블코리아)'),
  ('유스팩토리'),
  ('코드이엔'),
  ('레토(코스메카코리아)'),
  ('롱제비티엔터프라이즈'),
  ('스킨니드'),
  ('미스모아'),
  ('엘케이'),
  ('마이플러피'),
  ('트랜드아이'),
  ('비와이에이치'),
  ('쏠베라'),
  ('레토(피씨엠)'),
  ('벨롱앤아이코스'),
  ('아이비티코리아'),
  ('바이로스팩'),
  ('도도아이엠씨'),
  ('한국콜마(네페코리아)'),
  ('코스맥스(디자인)'),
  ('피씨엠(코스메카코리아)'),
  ('디와이코스메틱'),
  ('마르티나베르토'),
  ('미코팩토리'),
  ('한국콜마(채운패키지)'),
  ('테마포커스'),
  ('메디팹'),
  ('비엠라인'),
  ('벨라네즈'),
  ('메종드파팡'),
  ('태양생활건강'),
  ('아이리스브라이트'),
  ('바이오플러스'),
  ('한국콜마(아실)'),
  ('하밍'),
  ('브이엘코스메틱'),
  ('코스앤피플'),
  ('사임당화장품(더샘)'),
  ('이지비건'),
  ('스토리너스'),
  ('마카리'),
  ('지디케이화장품(더스킨팩토리)'),
  ('나나코스메틱'),
  ('코스메카코리아(토니모리)'),
  ('한국콜마(제론셀베인)'),
  ('리프'),
  ('코코'),
  ('웜서(에피온스)'),
  ('퓨전패키징(써머프라이데이즈)'),
  ('코스존(라미화장품)'),
  ('펩토리'),
  ('이미인(파워플레이어)'),
  ('디알씨에이치(DRCH)'),
  ('장흥넥스트론')
on conflict (name_key) do nothing;

-- 5) 확인
select (select count(*) from public.clients) as clients_after, (select count(*) from public.reports) as reports_after, (select count(*) from public.clients where last_visited_at is null) as never_touched;
commit;
