-- V52.5 연차·대휴 잔여일수 '입력값 그대로' 저장
-- 예: 연차 10 입력 -> 10으로 저장, 대휴 2.5 입력 -> 2.5로 저장

create extension if not exists pgcrypto;

-- 기존 동일 이름 함수 전부 제거
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS fn
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public'
      AND p.proname IN ('admin_set_employee_leave_balances','employee_leave_balance_list','admin_leave_adjustment_list')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.fn || ' CASCADE';
  END LOOP;
END $$;

-- 현재 잔여일수 원본 저장 테이블
create table if not exists public.employee_leave_balances (
  employee_id uuid primary key references public.profiles(id) on delete cascade,
  annual_balance numeric(8,2) not null default 0 check (annual_balance >= 0),
  comp_balance numeric(8,2) not null default 0 check (comp_balance >= 0),
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- 변경 이력
create table if not exists public.employee_leave_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  leave_type text not null check (leave_type in ('annual','comp')),
  amount numeric(8,2) not null,
  before_value numeric(8,2),
  after_value numeric(8,2),
  reason text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.employee_leave_adjustments add column if not exists before_value numeric(8,2);
alter table public.employee_leave_adjustments add column if not exists after_value numeric(8,2);

create index if not exists idx_employee_leave_adjustments_employee
on public.employee_leave_adjustments(employee_id,created_at desc);

alter table public.employee_leave_balances enable row level security;
alter table public.employee_leave_adjustments enable row level security;

drop policy if exists employee_leave_balances_read on public.employee_leave_balances;
create policy employee_leave_balances_read
on public.employee_leave_balances for select to authenticated
using (true);

drop policy if exists employee_leave_adjustments_read on public.employee_leave_adjustments;
create policy employee_leave_adjustments_read
on public.employee_leave_adjustments for select to authenticated
using (true);

grant select on public.employee_leave_balances to authenticated;
grant select on public.employee_leave_adjustments to authenticated;

-- 현재값 목록. 아직 직접 저장하지 않은 직원은 기본 부여연차를 반환
create function public.employee_leave_balance_list()
returns table(
  employee_id uuid,
  annual_balance numeric,
  comp_balance numeric
)
language sql
stable
security definer
set search_path=public
as $$
  select
    p.id,
    coalesce(b.annual_balance,p.annual_leave_granted,0)::numeric,
    coalesce(b.comp_balance,0)::numeric
  from public.profiles p
  left join public.employee_leave_balances b on b.employee_id=p.id;
$$;

grant execute on function public.employee_leave_balance_list() to authenticated;

-- 입력한 최종값을 그대로 저장
create function public.admin_set_employee_leave_balances(
  p_employee_id uuid,
  p_annual_target numeric,
  p_comp_target numeric,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_annual numeric:=round(coalesce(p_annual_target,0),2);
  v_comp numeric:=round(coalesce(p_comp_target,0),2);
  v_reason text:=left(trim(coalesce(p_reason,'')),200);
  v_before_annual numeric;
  v_before_comp numeric;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if v_reason='' then raise exception '수정 사유를 입력하세요.'; end if;
  if v_annual<0 or v_comp<0 then raise exception '잔여일수는 0 이상이어야 합니다.'; end if;
  if not exists(select 1 from public.profiles where id=p_employee_id) then
    raise exception '직원을 찾을 수 없습니다.';
  end if;

  select
    coalesce(b.annual_balance,p.annual_leave_granted,0),
    coalesce(b.comp_balance,0)
  into v_before_annual,v_before_comp
  from public.profiles p
  left join public.employee_leave_balances b on b.employee_id=p.id
  where p.id=p_employee_id;

  insert into public.employee_leave_balances(employee_id,annual_balance,comp_balance,updated_by,updated_at)
  values(p_employee_id,v_annual,v_comp,auth.uid(),now())
  on conflict(employee_id) do update set
    annual_balance=excluded.annual_balance,
    comp_balance=excluded.comp_balance,
    updated_by=excluded.updated_by,
    updated_at=excluded.updated_at;

  if v_annual is distinct from v_before_annual then
    insert into public.employee_leave_adjustments(
      employee_id,leave_type,amount,before_value,after_value,reason,created_by
    ) values(
      p_employee_id,'annual',v_annual-v_before_annual,v_before_annual,v_annual,v_reason,auth.uid()
    );
  end if;

  if v_comp is distinct from v_before_comp then
    insert into public.employee_leave_adjustments(
      employee_id,leave_type,amount,before_value,after_value,reason,created_by
    ) values(
      p_employee_id,'comp',v_comp-v_before_comp,v_before_comp,v_comp,v_reason,auth.uid()
    );
  end if;

  return jsonb_build_object(
    'success',true,
    'annual_before',v_before_annual,
    'annual_after',v_annual,
    'comp_before',v_before_comp,
    'comp_after',v_comp
  );
end;
$$;

grant execute on function public.admin_set_employee_leave_balances(uuid,numeric,numeric,text) to authenticated;

create function public.admin_leave_adjustment_list()
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
  select a.id,a.employee_id,a.leave_type,a.amount,a.reason,a.created_by,
         coalesce(p.name,'관리자'),a.created_at
  from public.employee_leave_adjustments a
  left join public.profiles p on p.id=a.created_by
  order by a.created_at desc;
$$;

grant execute on function public.admin_leave_adjustment_list() to authenticated;

notify pgrst,'reload schema';
