-- V22 조직도 수정 저장 안정화
-- RLS 때문에 저장이 막히는 문제를 RPC로 해결합니다.

create or replace function public.save_organization_employee(
  p_emp_no text,
  p_department text,
  p_team text,
  p_position text,
  p_org_level integer,
  p_manager_emp_no text,
  p_sort_order integer,
  p_pending_approval boolean,
  p_move_planned boolean
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_profile_id uuid;
begin
  if not (
    public.is_super_admin()
    or public.has_permission('employees_manage')
  ) then
    raise exception '조직도 수정 권한이 없습니다.';
  end if;

  update public.employee_registry
  set
    department=coalesce(nullif(trim(p_department),''),'물류본부'),
    team=trim(p_team),
    position=coalesce(nullif(trim(p_position),''),'사원'),
    org_level=coalesce(p_org_level,4),
    manager_emp_no=nullif(trim(p_manager_emp_no),''),
    sort_order=coalesce(p_sort_order,999),
    pending_approval=coalesce(p_pending_approval,false),
    move_planned=coalesce(p_move_planned,false)
  where emp_no=trim(p_emp_no);

  select id into v_profile_id
  from public.profiles
  where emp_no=trim(p_emp_no)
  limit 1;

  if v_profile_id is not null then
    update public.profiles
    set
      department=coalesce(nullif(trim(p_department),''),'물류본부'),
      team=trim(p_team),
      position=coalesce(nullif(trim(p_position),''),'사원'),
      org_level=coalesce(p_org_level,4),
      manager_emp_no=nullif(trim(p_manager_emp_no),''),
      sort_order=coalesce(p_sort_order,999),
      pending_approval=coalesce(p_pending_approval,false),
      move_planned=coalesce(p_move_planned,false)
    where id=v_profile_id;
  end if;

  return jsonb_build_object('success',true,'emp_no',p_emp_no);
end;
$$;

grant execute on function public.save_organization_employee(
  text,text,text,text,integer,text,integer,boolean,boolean
) to authenticated;

create or replace function public.manage_organization_team(
  p_action text,
  p_id bigint,
  p_name text,
  p_sort_order integer
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_old_name text;
begin
  if not (
    public.is_super_admin()
    or public.has_permission('employees_manage')
  ) then
    raise exception '팀 관리 권한이 없습니다.';
  end if;

  if p_action='insert' then
    insert into public.organization_teams(name,sort_order)
    values(trim(p_name),coalesce(p_sort_order,99))
    on conflict(name) do update set sort_order=excluded.sort_order;

  elsif p_action='update' then
    select name into v_old_name from public.organization_teams where id=p_id;

    update public.organization_teams
    set name=trim(p_name),sort_order=coalesce(p_sort_order,99)
    where id=p_id;

    if v_old_name is distinct from trim(p_name) then
      update public.employee_registry set team=trim(p_name) where team=v_old_name;
      update public.profiles set team=trim(p_name) where team=v_old_name;
    end if;

  elsif p_action='delete' then
    if exists(select 1 from public.employee_registry where team=p_name)
       or exists(select 1 from public.profiles where team=p_name) then
      raise exception '해당 팀에 직원이 있어 삭제할 수 없습니다.';
    end if;
    delete from public.organization_teams where id=p_id;

  else
    raise exception '지원하지 않는 작업입니다.';
  end if;

  return jsonb_build_object('success',true);
end;
$$;

grant execute on function public.manage_organization_team(
  text,bigint,text,integer
) to authenticated;

notify pgrst, 'reload schema';
