-- V36 직원관리 수정 기능 및 연차 변경 안정화
-- Supabase SQL Editor에서 전체 실행하세요.

alter table public.employee_registry
  add column if not exists annual_leave_granted numeric(6,2) default 15,
  add column if not exists sort_order integer default 999,
  add column if not exists org_level integer default 4,
  add column if not exists is_active boolean default true;

create or replace function public.save_employee_registry_admin(
  p_old_emp_no text,
  p_emp_no text,
  p_name text,
  p_department text,
  p_team text,
  p_position text,
  p_annual_leave_granted numeric,
  p_sort_order integer,
  p_is_active boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_row public.employee_registry;
  v_org_level integer;
begin
  if not (public.is_super_admin() or public.has_permission('employees_manage')) then
    raise exception '직원정보 수정 권한이 없습니다.';
  end if;

  select * into v_row from public.employee_registry where emp_no=trim(p_old_emp_no);
  if v_row.emp_no is null then
    raise exception '직원 명부를 찾을 수 없습니다.';
  end if;

  if v_row.auth_user_id is not null then
    raise exception '가입 완료 직원은 직원 프로필 수정 기능을 사용하세요.';
  end if;

  if trim(coalesce(p_emp_no,''))='' or trim(coalesce(p_name,''))='' then
    raise exception '사원번호와 이름은 필수입니다.';
  end if;

  v_org_level := case
    when coalesce(p_position,'') ~ '(대표|사장|이사|본부장|총괄)' then 1
    when coalesce(p_position,'') ~ '(부장|차장|팀장|센터장)' then 2
    when coalesce(p_position,'') ~ '(과장|대리|주임)' then 3
    else 4 end;

  if trim(p_old_emp_no) <> trim(p_emp_no)
     and exists(select 1 from public.employee_registry where emp_no=trim(p_emp_no)) then
    raise exception '변경하려는 사원번호가 이미 존재합니다.';
  end if;

  update public.employee_registry
  set emp_no=trim(p_emp_no),
      name=trim(p_name),
      department=coalesce(nullif(trim(p_department),''),'물류본부'),
      team=nullif(trim(p_team),''),
      position=coalesce(nullif(trim(p_position),''),'사원'),
      annual_leave_granted=coalesce(p_annual_leave_granted,0),
      sort_order=coalesce(p_sort_order,999),
      org_level=v_org_level,
      is_active=coalesce(p_is_active,true)
  where emp_no=trim(p_old_emp_no);

  return jsonb_build_object('success',true,'emp_no',trim(p_emp_no));
end;
$$;

grant execute on function public.save_employee_registry_admin(
  text,text,text,text,text,text,numeric,integer,boolean
) to authenticated;

-- 가입 완료 직원의 연차 수정이 직원명부에도 동일하게 반영되도록 RPC 재설치
-- 기존 V23 함수가 이미 설치되어 있다면 그대로 유지됩니다.
notify pgrst, 'reload schema';
