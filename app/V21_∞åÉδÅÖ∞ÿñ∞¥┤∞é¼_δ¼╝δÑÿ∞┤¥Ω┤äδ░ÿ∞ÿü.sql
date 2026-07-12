-- V21 물류총괄 이름·직급 반영
-- EMP001 계정의 표시 이름을 손동오, 직급을 이사로 수정합니다.

update public.profiles
set
  name='손동오',
  department='물류본부',
  team='물류팀',
  position='이사',
  org_level=1,
  sort_order=1,
  is_active=true
where emp_no='EMP001';

insert into public.employee_registry(
  emp_no,name,department,team,position,sort_order,org_level,is_active,auth_user_id
)
select
  p.emp_no,
  '손동오',
  '물류본부',
  '물류팀',
  '이사',
  1,
  1,
  true,
  p.id
from public.profiles p
where p.emp_no='EMP001'
on conflict(emp_no) do update set
  name=excluded.name,
  department=excluded.department,
  team=excluded.team,
  position=excluded.position,
  sort_order=excluded.sort_order,
  org_level=excluded.org_level,
  is_active=true,
  auth_user_id=excluded.auth_user_id;

notify pgrst, 'reload schema';
