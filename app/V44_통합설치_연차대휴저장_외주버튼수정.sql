-- 서린컴퍼니 V44 통합 설치 SQL
-- 연차·대휴 관리자 저장 정상화 + 변경 이력 + 외주 인력관리
-- Supabase SQL Editor에서 이 파일 전체를 한 번 실행하세요.

create extension if not exists pgcrypto;

-- 1. 연차·대휴 변경 이력
create table if not exists public.employee_leave_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('annual','comp')),
  amount numeric(8,2) not null check (amount <> 0),
  reason text not null check (char_length(trim(reason)) between 1 and 200),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_employee_leave_adjustments_employee
on public.employee_leave_adjustments(employee_id,created_at desc);
alter table public.employee_leave_adjustments enable row level security;

drop policy if exists employee_leave_adjustments_read on public.employee_leave_adjustments;
create policy employee_leave_adjustments_read
on public.employee_leave_adjustments for select to authenticated
using (
  employee_id=auth.uid()
  or coalesce(public.has_permission('employees_manage'),false)
  or coalesce(public.has_permission('calendar_manage'),false)
  or exists(select 1 from public.profiles p where p.id=auth.uid() and coalesce(p.is_super_admin,false))
  or exists(select 1 from public.profiles p where p.id=auth.uid() and lower(coalesce(p.employee_no,''))='emp001')
);

revoke insert,update,delete on public.employee_leave_adjustments from authenticated;
grant select on public.employee_leave_adjustments to authenticated;

create or replace function public.can_manage_employee_leave()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select auth.uid() is not null and (
    coalesce(public.has_permission('employees_manage'),false)
    or coalesce(public.has_permission('calendar_manage'),false)
    or exists(select 1 from public.profiles p where p.id=auth.uid() and coalesce(p.is_super_admin,false))
    or exists(select 1 from public.profiles p where p.id=auth.uid() and lower(coalesce(p.employee_no,''))='emp001')
  );
$$;
grant execute on function public.can_manage_employee_leave() to authenticated;

create or replace function public.admin_set_employee_leave_balances(
  p_employee_id uuid,
  p_annual_delta numeric,
  p_comp_delta numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_annual numeric:=round(coalesce(p_annual_delta,0),2);
  v_comp numeric:=round(coalesce(p_comp_delta,0),2);
  v_reason text:=left(trim(coalesce(p_reason,'')),200);
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not public.can_manage_employee_leave() then raise exception '관리자만 연차와 대휴를 수정할 수 있습니다.'; end if;
  if not exists(select 1 from public.profiles where id=p_employee_id) then raise exception '가입 완료 직원을 찾을 수 없습니다.'; end if;
  if v_reason='' then raise exception '수정 사유를 입력하세요.'; end if;
  if v_annual=0 and v_comp=0 then raise exception '변경된 잔여일수가 없습니다.'; end if;

  if v_annual<>0 then
    insert into public.employee_leave_adjustments(employee_id,leave_type,amount,reason,created_by)
    values(p_employee_id,'annual',v_annual,v_reason,auth.uid());
  end if;
  if v_comp<>0 then
    insert into public.employee_leave_adjustments(employee_id,leave_type,amount,reason,created_by)
    values(p_employee_id,'comp',v_comp,v_reason,auth.uid());
  end if;

  return jsonb_build_object('success',true,'annual_delta',v_annual,'comp_delta',v_comp);
end;
$$;
grant execute on function public.admin_set_employee_leave_balances(uuid,numeric,numeric,text) to authenticated;

-- 이전 버전 호환 함수
create or replace function public.admin_adjust_employee_leave(
  p_employee_id uuid,p_leave_type text,p_amount numeric,p_reason text
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not public.can_manage_employee_leave() then raise exception '관리자만 연차와 대휴를 수정할 수 있습니다.'; end if;
  if p_leave_type not in ('annual','comp') then raise exception '잘못된 휴가 종류입니다.'; end if;
  if coalesce(p_amount,0)=0 then raise exception '변경 일수를 입력하세요.'; end if;
  if nullif(trim(p_reason),'') is null then raise exception '수정 사유를 입력하세요.'; end if;
  insert into public.employee_leave_adjustments(employee_id,leave_type,amount,reason,created_by)
  values(p_employee_id,p_leave_type,round(p_amount,2),left(trim(p_reason),200),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.admin_adjust_employee_leave(uuid,text,numeric,text) to authenticated;

create or replace function public.admin_leave_adjustment_list()
returns table(id uuid,employee_id uuid,leave_type text,amount numeric,reason text,created_by uuid,created_by_name text,created_at timestamptz)
language sql
stable
security definer
set search_path=public
as $$
  select a.id,a.employee_id,a.leave_type,a.amount,a.reason,a.created_by,p.name,a.created_at
  from public.employee_leave_adjustments a
  left join public.profiles p on p.id=a.created_by
  where a.employee_id=auth.uid() or public.can_manage_employee_leave()
  order by a.created_at desc;
$$;
grant execute on function public.admin_leave_adjustment_list() to authenticated;

-- 2. 외주 업체 인력관리
create table if not exists public.contractor_workforce (
  id uuid primary key default gen_random_uuid(),
  work_date date not null,
  company_name text not null,
  work_area text,
  headcount integer not null default 0 check (headcount >= 0),
  meal_count integer not null default 0 check (meal_count >= 0),
  memo text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_contractor_workforce_date on public.contractor_workforce(work_date desc);
alter table public.contractor_workforce enable row level security;

drop policy if exists "contractor workforce authenticated read" on public.contractor_workforce;
create policy "contractor workforce authenticated read" on public.contractor_workforce for select to authenticated using (true);
drop policy if exists "contractor workforce manager insert" on public.contractor_workforce;
create policy "contractor workforce manager insert" on public.contractor_workforce for insert to authenticated
with check (public.can_manage_employee_leave());
drop policy if exists "contractor workforce manager update" on public.contractor_workforce;
create policy "contractor workforce manager update" on public.contractor_workforce for update to authenticated
using (public.can_manage_employee_leave()) with check (public.can_manage_employee_leave());
drop policy if exists "contractor workforce manager delete" on public.contractor_workforce;
create policy "contractor workforce manager delete" on public.contractor_workforce for delete to authenticated
using (public.can_manage_employee_leave());
grant select,insert,update,delete on public.contractor_workforce to authenticated;
