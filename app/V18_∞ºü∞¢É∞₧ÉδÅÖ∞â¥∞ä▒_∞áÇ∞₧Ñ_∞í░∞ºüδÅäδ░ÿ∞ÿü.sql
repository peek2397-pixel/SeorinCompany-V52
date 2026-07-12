-- V18 직원 자동계정 생성·직원정보 저장·조직도 자동반영
-- SQL Editor에서 전체 실행하세요.

-- 1. 필요한 컬럼 보완
alter table public.profiles
  add column if not exists annual_leave_granted numeric(6,2) default 15,
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_relation text,
  add column if not exists emergency_contact_phone text,
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists sort_order integer default 999,
  add column if not exists is_active boolean default true,
  add column if not exists is_super_admin boolean default false,
  add column if not exists can_receive_private boolean default false;

create table if not exists public.employee_registry (
  emp_no text primary key,
  name text not null,
  department text default '물류본부',
  team text,
  position text default '사원',
  annual_leave_granted numeric(6,2) default 15,
  sort_order integer default 999,
  org_level integer default 4,
  manager_emp_no text,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.employee_registry
  add column if not exists annual_leave_granted numeric(6,2) default 15,
  add column if not exists sort_order integer default 999,
  add column if not exists org_level integer default 4,
  add column if not exists manager_emp_no text,
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null,
  add column if not exists is_active boolean default true;

-- 2. 직원 생성 트리거를 안전한 upsert 방식으로 교체
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  r public.employee_registry;
  v_emp_no text;
  v_name text;
begin
  v_emp_no:=new.raw_user_meta_data->>'emp_no';
  v_name:=new.raw_user_meta_data->>'name';

  select * into r
  from public.employee_registry
  where emp_no=v_emp_no
    and is_active=true
  for update;

  if r.emp_no is null then
    raise exception '등록되지 않은 사원번호입니다.';
  end if;

  insert into public.profiles(
    id,emp_no,name,department,team,position,
    annual_leave_granted,sort_order,org_level,manager_emp_no,
    is_active,is_super_admin,can_receive_private
  )
  values(
    new.id,r.emp_no,r.name,r.department,r.team,r.position,
    r.annual_leave_granted,r.sort_order,r.org_level,r.manager_emp_no,
    true,false,false
  )
  on conflict(id) do update set
    emp_no=excluded.emp_no,
    name=excluded.name,
    department=excluded.department,
    team=excluded.team,
    position=excluded.position,
    annual_leave_granted=excluded.annual_leave_granted,
    sort_order=excluded.sort_order,
    org_level=excluded.org_level,
    manager_emp_no=excluded.manager_emp_no,
    is_active=true;

  insert into public.user_permissions(
    user_id,
    dashboard_view,notices_view,organization_view,
    community_view,private_messages_use,calendar_use
  )
  values(
    new.id,true,true,true,true,true,true
  )
  on conflict(user_id) do nothing;

  update public.employee_registry
  set auth_user_id=new.id
  where emp_no=r.emp_no;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3. 직원관리자가 수정할 수 있도록 RLS 정책 정리
alter table public.profiles enable row level security;
alter table public.employee_registry enable row level security;

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update"
on public.profiles
for update
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('employees_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('employees_manage')
);

drop policy if exists "employee registry organization read" on public.employee_registry;
create policy "employee registry organization read"
on public.employee_registry
for select
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('organization_view')
  or public.has_permission('employees_manage')
  or public.has_permission('permissions_manage')
);

drop policy if exists "employee registry admin insert" on public.employee_registry;
create policy "employee registry admin insert"
on public.employee_registry
for insert
to authenticated
with check (
  public.is_super_admin()
  or public.has_permission('employees_manage')
);

drop policy if exists "employee registry admin update" on public.employee_registry;
create policy "employee registry admin update"
on public.employee_registry
for update
to authenticated
using (
  public.is_super_admin()
  or public.has_permission('employees_manage')
)
with check (
  public.is_super_admin()
  or public.has_permission('employees_manage')
);

-- 4. API 스키마 캐시 갱신
notify pgrst, 'reload schema';
