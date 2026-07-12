-- V13 조직도 직원명부 즉시 표시
-- 가입 전 직원도 employee_registry 기준으로 조직도에 표시합니다.

create table if not exists public.employee_registry (
  emp_no text primary key,
  name text not null,
  department text default '물류본부',
  team text,
  position text default '사원',
  sort_order integer default 999,
  annual_leave_granted numeric(6,2) default 15,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.employee_registry add column if not exists sort_order integer default 999;
alter table public.employee_registry enable row level security;

drop policy if exists "employee registry organization read" on public.employee_registry;
create policy "employee registry organization read"
on public.employee_registry for select to authenticated
using (
  public.has_permission('organization_view')
  or public.has_permission('employees_manage')
);

drop policy if exists "employee registry admin manage" on public.employee_registry;
create policy "employee registry admin manage"
on public.employee_registry for all to authenticated
using (public.has_permission('employees_manage'))
with check (public.has_permission('employees_manage'));

insert into public.employee_registry
(emp_no,name,department,team,position,sort_order,is_active)
values
('201908011','장수범','물류본부','발주팀','사원',999,true),
('202004013','성경진','물류본부','발주팀','사원',999,true),
('202212261','함다정','물류본부','발주팀','사원',999,true),
('202209011','정영선','물류본부','발주팀','사원',999,true),
('202606081','노우석','물류본부','발주팀','사원',999,true),
('202107291','이찬규','물류본부','국내팀','사원',999,true),
('202210171','구강석','물류본부','국내팀','사원',999,true),
('202310161','신태선','물류본부','국내팀','사원',999,true),
('202304034','오정훈','물류본부','국내팀','사원',999,true),
('202605261','임태희','물류본부','국내팀','사원',999,true),
('202004012','김일신','물류본부','해외팀','사원',999,true),
('202209192','이형기','물류본부','해외팀','사원',999,true),
('202403041','김일호','물류본부','해외팀','사원',999,true),
('202510131','곽규탁','물류본부','해외팀','사원',999,true),
('202406031','김래성','물류본부','해외팀','사원',999,true),
('202308141','엄수현','물류본부','해외팀','사원',999,true),
('202512011','김상기','물류본부','해외팀','사원',999,true),
('202601052','김태균','물류본부','해외팀','사원',999,true),
('202406032','박상원','물류본부','해외팀','사원',999,true),
('201903022','정해림','물류본부','B2C','사원',999,true),
('202303021','여윤태','물류본부','B2C','사원',999,true),
('202303201','김지섭','물류본부','B2C','사원',999,true),
('202107011','이와모토마유미','물류본부','B2C','사원',999,true),
('202605041','김미영','물류본부','B2C','사원',999,true),
('202004011','김상주','물류본부','B2C','사원',999,true),
('202305023','이미옥','물류본부','B2C','사원',999,true),
('202311014','정효선','물류본부','B2C','사원',999,true),
('202605042','지정구','물류본부','B2C','사원',999,true),
('202305022','김헌정','물류본부','물류지원팀','사원',999,true)
on conflict(emp_no) do update set
  name=excluded.name,
  department=excluded.department,
  team=excluded.team,
  position=excluded.position,
  is_active=true;

insert into public.organization_teams(name,sort_order) values
('관리',1),('발주팀',10),('국내팀',20),('해외팀',30),('B2C',40),('물류지원팀',50)
on conflict(name) do update set sort_order=excluded.sort_order;
