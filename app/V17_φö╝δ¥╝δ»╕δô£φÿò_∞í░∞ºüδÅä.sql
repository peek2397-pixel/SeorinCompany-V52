-- V17 피라미드형 조직도
-- 부서·팀·직급·조직단계·상위관리자 구조

alter table public.profiles
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text;

alter table public.employee_registry
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text;

-- 기존 관리자 EMP001
update public.profiles
set org_level=1
where emp_no='EMP001';

update public.employee_registry
set org_level=1
where emp_no='EMP001';

-- 직급에 따른 기본 단계 자동 반영
update public.profiles
set org_level=case
  when position ~ '(대표|사장|이사|본부장)' then 1
  when position ~ '(부장|차장|팀장|센터장)' then 2
  when position ~ '(과장|대리|주임)' then 3
  else 4
end
where org_level is null or org_level=4;

update public.employee_registry
set org_level=case
  when position ~ '(대표|사장|이사|본부장)' then 1
  when position ~ '(부장|차장|팀장|센터장)' then 2
  when position ~ '(과장|대리|주임)' then 3
  else 4
end
where org_level is null or org_level=4;

notify pgrst, 'reload schema';
