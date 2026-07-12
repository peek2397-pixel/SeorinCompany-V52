-- V20 팀장 우선 표시 및 조직도 한 화면 배치
-- 지정 팀장: 발주팀 장수범 / 국내팀 이찬규 / 해외팀 김일신 / B2C 정해림

update public.employee_registry
set position='팀장', org_level=2, sort_order=1
where (team='발주팀' and name='장수범')
   or (team='국내팀' and name='이찬규')
   or (team='해외팀' and name='김일신')
   or (team='B2C' and name='정해림');

update public.profiles
set position='팀장', org_level=2, sort_order=1
where (team='발주팀' and name='장수범')
   or (team='국내팀' and name='이찬규')
   or (team='해외팀' and name='김일신')
   or (team='B2C' and name='정해림');

notify pgrst, 'reload schema';
