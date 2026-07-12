-- 서린컴퍼니 V42 관리자 연차·대휴 직접 수정 및 이력관리
-- Supabase SQL Editor에서 전체를 한 번 실행하세요.

create extension if not exists pgcrypto;

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
  or public.has_permission('employees_manage')
  or public.has_permission('calendar_manage')
);

revoke insert,update,delete on public.employee_leave_adjustments from authenticated;
grant select on public.employee_leave_adjustments to authenticated;

create or replace function public.admin_adjust_employee_leave(
  p_employee_id uuid,
  p_leave_type text,
  p_amount numeric,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if not (
    public.has_permission('employees_manage')
    or public.has_permission('calendar_manage')
  ) then raise exception '관리자만 연차와 대휴를 수정할 수 있습니다.'; end if;
  if p_leave_type not in ('annual','comp') then raise exception '잘못된 휴가 종류입니다.'; end if;
  if p_amount is null or p_amount=0 then raise exception '변경 일수를 입력하세요.'; end if;
  if nullif(trim(p_reason),'') is null then raise exception '수정 사유를 입력하세요.'; end if;
  if not exists(select 1 from public.profiles where id=p_employee_id) then raise exception '직원을 찾을 수 없습니다.'; end if;

  insert into public.employee_leave_adjustments(employee_id,leave_type,amount,reason,created_by)
  values(p_employee_id,p_leave_type,round(p_amount,2),left(trim(p_reason),200),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.admin_adjust_employee_leave(uuid,text,numeric,text) to authenticated;

create or replace function public.admin_leave_adjustment_list()
returns table(
  id uuid,
  employee_id uuid,
  leave_type text,
  amount numeric,
  reason text,
  created_by uuid,
  created_by_name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path=public
as $$
  select a.id,a.employee_id,a.leave_type,a.amount,a.reason,a.created_by,p.name,a.created_at
  from public.employee_leave_adjustments a
  left join public.profiles p on p.id=a.created_by
  where a.employee_id=auth.uid()
     or public.has_permission('employees_manage')
     or public.has_permission('calendar_manage')
  order by a.created_at desc;
$$;

grant execute on function public.admin_leave_adjustment_list() to authenticated;
