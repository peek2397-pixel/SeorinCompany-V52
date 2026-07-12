-- V23 직원정보 저장 오류 수정
-- 직원정보 저장을 Security Definer RPC로 처리하여 RLS 저장 오류를 해결합니다.

alter table public.profiles
  add column if not exists phone text,
  add column if not exists annual_leave_granted numeric(6,2) default 15,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_relation text,
  add column if not exists emergency_contact_phone text,
  add column if not exists sort_order integer default 999,
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists is_active boolean default true,
  add column if not exists is_super_admin boolean default false,
  add column if not exists can_receive_private boolean default false;

alter table public.employee_registry
  add column if not exists annual_leave_granted numeric(6,2) default 15,
  add column if not exists sort_order integer default 999,
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists is_active boolean default true;

create or replace function public.save_employee_admin(
  p_user_id uuid,
  p_emp_no text,
  p_name text,
  p_department text,
  p_team text,
  p_position text,
  p_phone text,
  p_annual_leave_granted numeric,
  p_emergency_contact_name text,
  p_emergency_contact_relation text,
  p_emergency_contact_phone text,
  p_sort_order integer,
  p_is_active boolean,
  p_is_super_admin boolean,
  p_can_receive_private boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_old_emp_no text;
  v_org_level integer;
begin
  if not (
    public.is_super_admin()
    or public.has_permission('employees_manage')
  ) then
    raise exception '직원정보 수정 권한이 없습니다.';
  end if;

  select emp_no into v_old_emp_no
  from public.profiles
  where id=p_user_id;

  if v_old_emp_no is null then
    raise exception '직원 프로필을 찾을 수 없습니다.';
  end if;

  v_org_level :=
    case
      when coalesce(p_position,'') ~ '(대표|사장|이사|본부장|총괄)' then 1
      when coalesce(p_position,'') ~ '(부장|차장|팀장|센터장)' then 2
      when coalesce(p_position,'') ~ '(과장|대리|주임)' then 3
      else 4
    end;

  update public.profiles
  set
    emp_no=trim(p_emp_no),
    name=trim(p_name),
    department=coalesce(nullif(trim(p_department),''),'물류본부'),
    team=nullif(trim(p_team),''),
    position=coalesce(nullif(trim(p_position),''),'사원'),
    phone=nullif(trim(p_phone),''),
    annual_leave_granted=coalesce(p_annual_leave_granted,0),
    emergency_contact_name=nullif(trim(p_emergency_contact_name),''),
    emergency_contact_relation=nullif(trim(p_emergency_contact_relation),''),
    emergency_contact_phone=nullif(trim(p_emergency_contact_phone),''),
    sort_order=coalesce(p_sort_order,999),
    org_level=v_org_level,
    is_active=coalesce(p_is_active,true),
    is_super_admin=coalesce(p_is_super_admin,false),
    can_receive_private=coalesce(p_can_receive_private,false)
  where id=p_user_id;

  if v_old_emp_no is distinct from trim(p_emp_no) then
    delete from public.employee_registry
    where emp_no=trim(p_emp_no)
      and auth_user_id is distinct from p_user_id;
  end if;

  insert into public.employee_registry(
    emp_no,
    name,
    department,
    team,
    position,
    annual_leave_granted,
    sort_order,
    org_level,
    manager_emp_no,
    auth_user_id,
    is_active
  )
  values(
    trim(p_emp_no),
    trim(p_name),
    coalesce(nullif(trim(p_department),''),'물류본부'),
    nullif(trim(p_team),''),
    coalesce(nullif(trim(p_position),''),'사원'),
    coalesce(p_annual_leave_granted,0),
    coalesce(p_sort_order,999),
    v_org_level,
    (select manager_emp_no from public.profiles where id=p_user_id),
    p_user_id,
    coalesce(p_is_active,true)
  )
  on conflict(emp_no) do update set
    name=excluded.name,
    department=excluded.department,
    team=excluded.team,
    position=excluded.position,
    annual_leave_granted=excluded.annual_leave_granted,
    sort_order=excluded.sort_order,
    org_level=excluded.org_level,
    auth_user_id=excluded.auth_user_id,
    is_active=excluded.is_active;

  if v_old_emp_no is distinct from trim(p_emp_no) then
    delete from public.employee_registry
    where emp_no=v_old_emp_no
      and auth_user_id=p_user_id;
  end if;

  return jsonb_build_object(
    'success',true,
    'user_id',p_user_id,
    'emp_no',trim(p_emp_no)
  );
end;
$$;

grant execute on function public.save_employee_admin(
  uuid,text,text,text,text,text,text,numeric,text,text,text,integer,boolean,boolean,boolean
) to authenticated;

notify pgrst, 'reload schema';
