-- 서린 물류포털 V40 구매물품 사용기간 체크
-- 구매완료 후 김헌정 구매담당자가 실제 사용완료일을 기록하면
-- 구매완료일부터 사용완료일까지의 사용기간을 포털에서 자동 표시합니다.
-- Supabase SQL Editor에서 전체 실행하세요.

begin;

alter table public.purchase_requests
  add column if not exists usage_completed_at timestamptz,
  add column if not exists usage_completed_by uuid references public.profiles(id),
  add column if not exists usage_completed_by_name text,
  add column if not exists usage_note text;

create or replace function public.complete_purchase_usage(
  p_request_id bigint,
  p_usage_date date default current_date,
  p_note text default null
)
returns public.purchase_requests
language plpgsql
security definer
set search_path=public
as $$
declare
  v_row public.purchase_requests%rowtype;
  v_actor public.profiles%rowtype;
  v_allowed boolean;
  v_completed_date date;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.id is null then
    raise exception '로그인 사용자 정보를 찾을 수 없습니다.';
  end if;

  v_allowed := public.has_permission('purchase_approve') or public.is_super_admin();
  if not v_allowed then
    raise exception '사용완료 처리 권한이 없습니다.';
  end if;

  select * into v_row
  from public.purchase_requests
  where id=p_request_id
  for update;

  if v_row.id is null then
    raise exception '구매 신청 건을 찾을 수 없습니다.';
  end if;

  if v_row.status <> 'completed' then
    raise exception '구매완료 상태에서만 사용완료를 기록할 수 있습니다.';
  end if;

  if v_row.completed_at is null then
    raise exception '구매완료일이 기록되어 있지 않습니다.';
  end if;

  if v_row.usage_completed_at is not null then
    raise exception '이미 사용완료 처리된 구매 건입니다.';
  end if;

  v_completed_date := coalesce(p_usage_date,current_date);
  if v_completed_date < v_row.completed_at::date then
    raise exception '사용완료일은 구매완료일보다 빠를 수 없습니다.';
  end if;

  update public.purchase_requests
  set usage_completed_at=v_completed_date::timestamptz,
      usage_completed_by=auth.uid(),
      usage_completed_by_name=v_actor.name,
      usage_note=nullif(trim(coalesce(p_note,'')),''),
      updated_at=now()
  where id=p_request_id
  returning * into v_row;

  insert into public.audit_logs(user_id,action,table_name,record_id,details)
  values(
    auth.uid(),
    'PURCHASE_USAGE_COMPLETE',
    'purchase_requests',
    p_request_id::text,
    jsonb_build_object(
      'usage_completed_at',v_completed_date,
      'usage_days',(v_completed_date-v_row.completed_at::date),
      'note',p_note,
      'actor',v_actor.name
    )
  );

  return v_row;
end;
$$;

grant execute on function public.complete_purchase_usage(bigint,date,text) to authenticated;

commit;

-- 설치 확인
select column_name,data_type
from information_schema.columns
where table_schema='public'
  and table_name='purchase_requests'
  and column_name in ('usage_completed_at','usage_completed_by','usage_completed_by_name','usage_note')
order by column_name;
